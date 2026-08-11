const https = require('https')

const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtbWxqaGtubHV4bHdlY2h2dmV2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjQwODkxNywiZXhwIjoyMTAxOTg0OTE3fQ.ePEanY_OgRGb3LcNjKLn3nH5MU2vuNEt8X0jzs7-XsI'
const PROJECT_REF = 'smmljhknluxlwechvvev'

const SQL = `
-- PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  total_balance DECIMAL(12,2) DEFAULT 0,
  total_deposited DECIMAL(12,2) DEFAULT 0,
  total_earned DECIMAL(12,2) DEFAULT 0,
  withdrawable DECIMAL(12,2) DEFAULT 0,
  referral_income DECIMAL(12,2) DEFAULT 0,
  referral_code TEXT UNIQUE,
  referred_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- USER PLANS TABLE
CREATE TABLE IF NOT EXISTS public.user_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  weekly_min DECIMAL(5,2) DEFAULT 5,
  weekly_max DECIMAL(5,2) DEFAULT 15,
  status TEXT DEFAULT 'active',
  last_week_pct DECIMAL(5,2),
  last_week_earned DECIMAL(10,2),
  next_payout TIMESTAMPTZ,
  purchased_at TIMESTAMPTZ DEFAULT NOW()
);

-- DEPOSITS TABLE
CREATE TABLE IF NOT EXISTS public.deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  np_payment_id TEXT,
  np_order_id TEXT UNIQUE,
  amount_usd DECIMAL(10,2),
  amount_crypto DECIMAL(18,8),
  coin TEXT,
  pay_address TEXT,
  status TEXT DEFAULT 'waiting',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- EARNINGS TABLE
CREATE TABLE IF NOT EXISTS public.earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.user_plans(id),
  week_number INT,
  percentage DECIMAL(5,2),
  amount DECIMAL(10,2),
  credited_at TIMESTAMPTZ DEFAULT NOW()
);

-- WITHDRAWALS TABLE
CREATE TABLE IF NOT EXISTS public.withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  coin TEXT NOT NULL,
  wallet_address TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- REFERRAL COMMISSIONS TABLE
CREATE TABLE IF NOT EXISTS public.referral_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  earner_id UUID REFERENCES public.profiles(id),
  source_id UUID REFERENCES public.profiles(id),
  plan_id UUID REFERENCES public.user_plans(id),
  level INT,
  percentage DECIMAL(6,4),
  amount DECIMAL(10,2),
  earned_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROW LEVEL SECURITY
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_commissions ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='Users see own profile') THEN
    CREATE POLICY "Users see own profile" ON public.profiles FOR ALL USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='user_plans' AND policyname='Users see own plans') THEN
    CREATE POLICY "Users see own plans" ON public.user_plans FOR ALL USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='deposits' AND policyname='Users see own deposits') THEN
    CREATE POLICY "Users see own deposits" ON public.deposits FOR ALL USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='earnings' AND policyname='Users see own earnings') THEN
    CREATE POLICY "Users see own earnings" ON public.earnings FOR ALL USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='withdrawals' AND policyname='Users see own withdrawals') THEN
    CREATE POLICY "Users see own withdrawals" ON public.withdrawals FOR ALL USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='referral_commissions' AND policyname='Users see own commissions') THEN
    CREATE POLICY "Users see own commissions" ON public.referral_commissions FOR ALL USING (auth.uid() = earner_id);
  END IF;
END $$;

-- AUTO PROFILE CREATION TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  ref_code TEXT;
  referrer_id UUID;
BEGIN
  ref_code := UPPER(SUBSTRING(NEW.id::TEXT, 1, 8));
  IF NEW.raw_user_meta_data->>'referral_code' IS NOT NULL 
     AND NEW.raw_user_meta_data->>'referral_code' != '' THEN
    SELECT id INTO referrer_id 
    FROM public.profiles 
    WHERE referral_code = NEW.raw_user_meta_data->>'referral_code';
  END IF;
  INSERT INTO public.profiles (id, full_name, email, referral_code, referred_by)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    ref_code,
    referrer_id
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_user_plans_user_id ON public.user_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_deposits_user_id ON public.deposits(user_id);
CREATE INDEX IF NOT EXISTS idx_earnings_user_id ON public.earnings(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id ON public.withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON public.profiles(referral_code);
`

function runSQL(sql) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query: sql })
    const options = {
      hostname: 'api.supabase.com',
      path: `/v1/projects/${PROJECT_REF}/database/query`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    }
    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(data) }) }
        catch { resolve({ status: res.statusCode, data }) }
      })
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

async function main() {
  console.log('🚀 Creating SageCapital database tables...')
  const result = await runSQL(SQL)
  console.log('Status:', result.status)
  console.log('Response:', JSON.stringify(result.data, null, 2))
  if (result.status === 200 || result.status === 201) {
    console.log('\n✅ ALL TABLES CREATED SUCCESSFULLY!')
    console.log('✅ RLS Policies set')
    console.log('✅ Auto-profile trigger installed')
    console.log('\n🎉 SageCapital database is ready!')
  } else {
    console.log('\n⚠️  Manual SQL needed — see SUPABASE_SCHEMA.md')
  }
}

main().catch(console.error)
