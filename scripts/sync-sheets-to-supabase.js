import { google } from 'googleapis';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

// --- Config ---
const SHEET_ID = process.env.SHEET_ID;
const GCP_SERVICE_ACCOUNT_JSON = process.env.GCP_SERVICE_ACCOUNT_JSON;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SHEET_ID || !GCP_SERVICE_ACCOUNT_JSON) {
  console.error('Missing required environment variables: SHEET_ID, GCP_SERVICE_ACCOUNT_JSON');
  process.exit(1);
}

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing required environment variables: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// --- Main ---
async function main() {
  const serviceAccount = JSON.parse(GCP_SERVICE_ACCOUNT_JSON);
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const sheetsData = await getSheetData(serviceAccount);
  const souvenirs = processSheetData(sheetsData);
  await syncToSupabase(supabase, souvenirs);
}

// --- Supabase ---
async function syncToSupabase(supabase, souvenirs) {
  // Fetch existing documents
  const { data: existingDocs, error: fetchError } = await supabase
    .from('souvenirs')
    .select('doc_id, data_hash');

  if (fetchError) {
    console.error('Error fetching existing souvenirs:', fetchError);
    throw fetchError;
  }

  const existingMap = new Map(
    (existingDocs || []).map(doc => [doc.doc_id, doc.data_hash])
  );

  let upsertCount = 0;
  let errorCount = 0;

  for (const souvenir of souvenirs) {
    const existingHash = existingMap.get(souvenir.doc_id);

    // Only upsert if hash is different or doc doesn't exist
    if (!existingHash || existingHash !== souvenir.data_hash) {
      const { error } = await supabase
        .from('souvenirs')
        .upsert(souvenir, {
          onConflict: 'doc_id',
          ignoreDuplicates: false
        });

      if (error) {
        console.error(`Error upserting doc ${souvenir.doc_id}:`, error);
        errorCount++;
      } else {
        console.log(`✓ Upserted: ${souvenir.doc_id}`);
        upsertCount++;
      }
    }
  }

  console.log('\n=== Sync Complete ===');
  console.log(`Total souvenirs: ${souvenirs.length}`);
  console.log(`Upserted: ${upsertCount}`);
  console.log(`Skipped (no changes): ${souvenirs.length - upsertCount - errorCount}`);
  console.log(`Errors: ${errorCount}`);
}

// --- Google Sheets ---
async function getSheetData(serviceAccount) {
  const auth = new google.auth.GoogleAuth({
    credentials: serviceAccount,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'A:K', // Corresponds to the 11 columns
  });

  return res.data.values || [];
}

// --- Data Processing ---
function processSheetData(rows) {
  const [header, ...dataRows] = rows;

  return dataRows
    .map(row => {
      const souvenir = {
        code: row[1] || null,
        name: row[2] || null,
        price: parseNumber(row[3]),
        last_buy_date: parseDate(row[4]),
        meeting_date: parseDate(row[5]),
        meeting_type: row[6] || null,
        location: row[7] || null,
        souvenir_item: row[8] || null,
        odd_lot: parseBoolean(row[9]),
        source_url: parseUrl(row[10]),
      };

      const doc_id = `${souvenir.code}_${souvenir.meeting_date}`;
      const data_hash = crypto
        .createHash('sha1')
        .update(JSON.stringify(souvenir))
        .digest('hex');

      return {
        ...souvenir,
        doc_id,
        data_hash,
        status: 'active',
      };
    })
    .filter(s => s.code && s.meeting_date);
}

function parseNumber(value) {
  const num = Number(value);
  return isNaN(num) ? null : num;
}

function parseDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return isNaN(date) ? null : date.toISOString().split('T')[0];
}

function parseBoolean(value) {
  if (typeof value === 'boolean') return value;
  if (!value) return false;
  const lower = value.toLowerCase();
  return lower === 'true' || lower === 'y' || lower === '1';
}

function parseUrl(value) {
  if (!value) return null;
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value;
  }
  return null;
}

main().catch(console.error);
