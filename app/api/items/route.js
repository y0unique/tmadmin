import { NextResponse } from 'next/server';
import sql from '../../lib/db';

async function writeLog(action) {
  try {
    const now = new Date();
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

// GET /api/items — active items with search, quality filter, sort, pagination
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search   = searchParams.get('search')   || '';
    const quality  = searchParams.get('quality')  || '';   // filter by quality
    const sortBy   = searchParams.get('sort_by')  || '';   // "item_dateAdded" | "item_lastUpdate" | item_id etc
    const sortDir  = searchParams.get('sort_dir') || 'ASC';
    const start    = parseInt(searchParams.get('start')  || '0');
    const length   = parseInt(searchParams.get('length') || '10');

    const validColumns = [
      'item_id', 'item_name', 'item_description', 'item_location',
      'item_category', 'item_quality', 'item_price', 'item_quantity',
      '""item_dateAdded""', '""item_lastUpdate""',
    ];
    const safeColumn = validColumns.includes(sortBy) ? sortBy : 'item_id';
    const safeDir    = sortDir.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const searchPattern = search  ? `%${search}%`  : null;
    const qualityFilter = quality || null;

    let data, countResult;

    if (safeDir === 'ASC') {
      data = await sql`
        SELECT * FROM tbl_items
        WHERE item_status = 'active'
          AND (${qualityFilter}::text IS NULL OR item_quality = ${qualityFilter})
          AND (
            ${searchPattern}::text IS NULL OR
            item_id::text    ILIKE ${searchPattern || ''} OR
            item_name        ILIKE ${searchPattern || ''} OR
            item_description ILIKE ${searchPattern || ''} OR
            item_location    ILIKE ${searchPattern || ''} OR
            item_category    ILIKE ${searchPattern || ''} OR
            item_quality     ILIKE ${searchPattern || ''} OR
            item_price::text ILIKE ${searchPattern || ''} OR
            item_quantity::text ILIKE ${searchPattern || ''}
          )
        ORDER BY item_id ASC
        LIMIT ${length} OFFSET ${start}
      `;
      countResult = await sql`
        SELECT COUNT(*) as count FROM tbl_items
        WHERE item_status = 'active'
          AND (${qualityFilter}::text IS NULL OR item_quality = ${qualityFilter})
          AND (
            ${searchPattern}::text IS NULL OR
            item_id::text    ILIKE ${searchPattern || ''} OR
            item_name        ILIKE ${searchPattern || ''} OR
            item_description ILIKE ${searchPattern || ''} OR
            item_location    ILIKE ${searchPattern || ''} OR
            item_category    ILIKE ${searchPattern || ''} OR
            item_quality     ILIKE ${searchPattern || ''} OR
            item_price::text ILIKE ${searchPattern || ''} OR
            item_quantity::text ILIKE ${searchPattern || ''}
          )
      `;
    } else {
      data = await sql`
        SELECT * FROM tbl_items
        WHERE item_status = 'active'
          AND (${qualityFilter}::text IS NULL OR item_quality = ${qualityFilter})
          AND (
            ${searchPattern}::text IS NULL OR
            item_id::text    ILIKE ${searchPattern || ''} OR
            item_name        ILIKE ${searchPattern || ''} OR
            item_description ILIKE ${searchPattern || ''} OR
            item_location    ILIKE ${searchPattern || ''} OR
            item_category    ILIKE ${searchPattern || ''} OR
            item_quality     ILIKE ${searchPattern || ''} OR
            item_price::text ILIKE ${searchPattern || ''} OR
            item_quantity::text ILIKE ${searchPattern || ''}
          )
        ORDER BY item_id DESC
        LIMIT ${length} OFFSET ${start}
      `;
      countResult = await sql`
        SELECT COUNT(*) as count FROM tbl_items
        WHERE item_status = 'active'
          AND (${qualityFilter}::text IS NULL OR item_quality = ${qualityFilter})
          AND (
            ${searchPattern}::text IS NULL OR
            item_id::text    ILIKE ${searchPattern || ''} OR
            item_name        ILIKE ${searchPattern || ''} OR
            item_description ILIKE ${searchPattern || ''} OR
            item_location    ILIKE ${searchPattern || ''} OR
            item_category    ILIKE ${searchPattern || ''} OR
            item_quality     ILIKE ${searchPattern || ''} OR
            item_price::text ILIKE ${searchPattern || ''} OR
            item_quantity::text ILIKE ${searchPattern || ''}
          )
      `;
    }

    return NextResponse.json({
      data,
      recordsTotal: parseInt(countResult[0].count),
    });
  } catch (error) {
    console.error('GET /api/items error:', error);
    return NextResponse.json({ error: 'Failed to fetch items', details: error.message }, { status: 500 });
  }
}

// POST /api/items — create a new item
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      item_name, item_description, item_location,
      item_category, item_quality, item_price, item_quantity,
      item_image = 'n/a',
    } = body;

    const result = await sql`
      INSERT INTO tbl_items
        (item_name, item_description, item_location, item_category, item_quality, item_price, item_quantity, item_image, item_status)
      VALUES
        (${item_name}, ${item_description}, ${item_location}, ${item_category}, ${item_quality}, ${item_price}, ${item_quantity}, ${item_image}, 'active')
      RETURNING *
    `;

    await writeLog(`Added item #${result[0].item_id} — "${item_name}"`);
    return NextResponse.json({ success: true, item: result[0] }, { status: 201 });
  } catch (error) {
    console.error('POST /api/items error:', error);
    return NextResponse.json({ error: 'Failed to create item', details: error.message }, { status: 500 });
  }
}
