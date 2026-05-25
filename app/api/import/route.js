import { NextResponse } from 'next/server';
import sql from '../../lib/db';
import { writeLog } from '../../lib/logger';
import { sanitizeBackend } from '../../lib/sanitize';
import { encodeType, encodeCategory, encodeQuality, encodeSize, encodeSticker } from '../../lib/lookup';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const REQUIRED_HEADERS = [
  'item_name', 'item_title', 'item_type', 'item_description',
  'item_location', 'item_category', 'item_quality', 'item_size',
  'item_sticker', 'item_acqprice', 'item_srp', 'item_quantity', 'item_sold', 'item_image',
];

function parseCSV(text) {
  const lines = text.trim().split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) throw new Error('CSV must have a header row and at least one data row.');

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').trim());
  const missing = REQUIRED_HEADERS.filter(h => !headers.includes(h));
  if (missing.length > 0) {
    throw new Error(`Missing required columns: ${missing.join(', ')}`);
  }

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = [];
    let current = '', inQuotes = false;
    for (const char of lines[i]) {
      if (char === '"') { inQuotes = !inQuotes; }
      else if (char === ',' && !inQuotes) { values.push(current.trim()); current = ''; }
      else { current += char; }
    }
    values.push(current.trim());
    const row = {};
    headers.forEach((h, idx) => { row[h] = values[idx] ?? ''; });
    rows.push(row);
  }
  return rows;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { csvText, reset } = body;

    if (!csvText) return NextResponse.json({ error: 'No CSV data provided' }, { status: 400 });

    let rows;
    try { rows = parseCSV(csvText); }
    catch (e) { return NextResponse.json({ error: e.message }, { status: 422 }); }

    if (rows.length === 0) return NextResponse.json({ error: 'CSV has no data rows.' }, { status: 422 });

    let deactivatedIds = [];
    if (reset) {
      const deactivated = await sql`
        UPDATE tbl_items SET item_status = 'inactive'
        WHERE item_status = 'active' RETURNING item_id
      `;
      deactivatedIds = deactivated.map(r => r.item_id);
    }

    const inserted = [], errors = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        const result = await sql`
          INSERT INTO tbl_items
            (item_name, item_title, item_type, item_description, item_location,
             item_category, item_quality, item_size, item_sticker,
             item_acqprice, item_srp, item_quantity, item_sold, item_image, item_status)
          VALUES
            (${sanitizeBackend(row.item_name)},
             ${sanitizeBackend(row.item_title)},
             ${encodeType(row.item_type)},
             ${sanitizeBackend(row.item_description)},
             ${sanitizeBackend(row.item_location)},
             ${encodeCategory(row.item_category)},
             ${encodeQuality(row.item_quality)},
             ${encodeSize(row.item_size)},
             ${encodeSticker(row.item_sticker)},
             ${parseFloat(row.item_acqprice) || 0},
             ${parseFloat(row.item_srp) || 0},
             ${parseInt(row.item_quantity) || 0},
             ${parseInt(row.item_sold) || 0},
             ${sanitizeBackend(row.item_image) || 'n/a'},
             'active')
          RETURNING item_id
        `;
        inserted.push(result[0].item_id);
      } catch (e) {
        errors.push({ row: i + 2, error: e.message });
      }
    }

    const resetNote = reset && deactivatedIds.length > 0
      ? ` | Reset: deactivated IDs [${deactivatedIds.join(', ')}]` : '';
    const logMsg = `CSV Import: ${inserted.length} items added (IDs: ${inserted.join(', ')})${resetNote}`;
    try { await writeLog(logMsg); } catch (e) { console.error(e); }

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
