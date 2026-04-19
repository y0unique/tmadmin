import { NextResponse } from 'next/server';
import sql from '../../lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const REQUIRED_HEADERS = [
  'item_name', 'item_title', 'item_type', 'item_description',
  'item_location', 'item_category', 'item_quality', 'item_size',
  'item_sticker', 'item_acqprice', 'item_srp', 'item_quantity', 'item_image',
];

// These must match exactly (order doesn't matter, all must be present)
const HEADER_DISPLAY = 'item_name | item_title | item_type | item_description | item_location | item_category | item_quality | item_size | item_sticker | item_acqprice | item_srp | item_quantity | item_image';

async function writeLog(action) {
  try {
    const now  = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().split(' ')[0];
    await sql`
      INSERT INTO timelogtbl (log_action, log_date, log_time, log_status)
      VALUES (${action}, ${date}, ${time}, 'active')
    `;
  } catch (e) {
    console.error('Log write failed:', e.message);
  }
}

function parseCSV(text) {
  const lines = text.trim().split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) throw new Error('CSV must have a header row and at least one data row.');

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').trim());

  const missing = REQUIRED_HEADERS.filter(h => !headers.includes(h));
  if (missing.length > 0) {
    throw new Error(`Missing required columns: ${missing.join(', ')}. Expected: ${REQUIRED_HEADERS.join(', ')}`);
  }

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = [];
    let current  = '';
    let inQuotes = false;

    for (const char of lines[i]) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    const row = {};
    headers.forEach((h, idx) => { row[h] = values[idx] ?? ''; });
    rows.push(row);
  }

  return rows;
}

// POST /api/import
export async function POST(request) {
  try {
    const body = await request.json();
    const { csvText, reset } = body;

    if (!csvText) {
      return NextResponse.json({ error: 'No CSV data provided' }, { status: 400 });
    }

    let rows;
    try {
      rows = parseCSV(csvText);
    } catch (e) {
      return NextResponse.json({ error: e.message }, { status: 422 });
    }

    if (rows.length === 0) {
      return NextResponse.json({ error: 'CSV has no data rows.' }, { status: 422 });
    }

    let deactivatedIds = [];

    if (reset) {
      const deactivated = await sql`
        UPDATE tbl_items
        SET item_status = 'inactive'
        WHERE item_status = 'active'
        RETURNING item_id
      `;
      deactivatedIds = deactivated.map(r => r.item_id);
    }

    const inserted = [];
    const errors   = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        const acqprice = parseFloat(row.item_acqprice) || 0;
        const srp      = parseFloat(row.item_srp)      || 0;
        const quantity = parseInt(row.item_quantity)   || 0;
        const image    = row.item_image || 'n/a';

        const result = await sql`
          INSERT INTO tbl_items
            (item_name, item_title, item_type, item_description, item_location,
             item_category, item_quality, item_size, item_sticker,
             item_acqprice, item_srp, item_quantity, item_image, item_status)
          VALUES
            (${row.item_name}, ${row.item_title || ''}, ${row.item_type || ''},
             ${row.item_description}, ${row.item_location}, ${row.item_category},
             ${row.item_quality}, ${row.item_size || ''}, ${row.item_sticker || ''},
             ${acqprice}, ${srp}, ${quantity}, ${image}, 'active')
          RETURNING item_id
        `;
        inserted.push(result[0].item_id);
      } catch (e) {
        errors.push({ row: i + 2, error: e.message });
      }
    }

    const resetNote = reset && deactivatedIds.length > 0
      ? ` | Reset: deactivated IDs [${deactivatedIds.join(', ')}]`
      : '';
    const logMsg = `CSV Import: ${inserted.length} items added (IDs: ${inserted.join(', ')})${resetNote}`;
    await writeLog(logMsg);

    return NextResponse.json({
      success: true,
      inserted: inserted.length,
      insertedIds: inserted,
      deactivated: deactivatedIds.length,
      deactivatedIds,
      errors,
    });

  } catch (error) {
    console.error('POST /api/import error:', error);
    return NextResponse.json({ error: 'Import failed', details: error.message }, { status: 500 });
  }
}
