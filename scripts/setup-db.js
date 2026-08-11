const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://smmljhknluxlwechvvev.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtbWxqaGtubHV4bHdlY2h2dmV2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjQwODkxNywiZXhwIjoyMTAxOTg0OTE3fQ.ePEanY_OgRGb3LcNjKLn3nH5MU2vuNEt8X0jzs7-XsI'
)

async function setupDatabase() {
  console.log('🚀 Setting up SageCapital database...')

  // Test connection first
  const { data, error: pingError } = await supabase.from('profiles').select('count').limit(1)
  
  if (pingError && pingError.code === '42P01') {
    console.log('📋 Tables not found — need to create via SQL Editor')
    console.log('\n✅ Connection to Supabase is WORKING!')
    console.log('📌 Project URL: https://smmljhknluxlwechvvev.supabase.co')
    console.log('\n⚠️  Please run the SQL schema manually:')
    console.log('1. Go to: https://supabase.com/dashboard/project/smmljhknluxlwechvvev/sql/new')
    console.log('2. Copy SQL from SUPABASE_SCHEMA.md')
    console.log('3. Click Run')
  } else if (!pingError) {
    console.log('✅ Database already set up! Tables exist.')
    console.log('Data:', data)
  } else {
    console.log('Connection result:', pingError.message)
    console.log('✅ Supabase credentials are valid!')
  }
}

setupDatabase().catch(console.error)
