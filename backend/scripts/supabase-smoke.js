require('dotenv').config();

const { supabaseAdmin } = require('../supabaseAdmin');

async function main() {
  const { data, error } = await supabaseAdmin.storage.listBuckets();

  if (error) {
    console.error('Supabase connection failed:', error);
    process.exitCode = 1;
    return;
  }

  console.log('Supabase connection OK. Buckets:', data?.map((b) => b.name) ?? []);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
