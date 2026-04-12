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

// GET /api/items — only active items, with search/sort/pagination
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search  = searchParams.get('search') || '';
    const orderColumn = searchParams.get('order_column') || 'item_id';
    const orderDir    = searchParams.get('order_dir') || 'ASC';
    const start  = parseInt(searchParams.get('start')  || '0');
    const length = parseInt(searchParams.get('length') || '10');

    const validColumns = [
      'item_id','item_name','item_description','item_location',
      'item_category','item_quality','item_price','item_quantity',
    ];
    const safeColumn = validColumns.includes(orderColumn) ? orderColumn : 'item_id';
    const safeDir    = orderDir.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    let data, countResult;

    if (search) {
      const pattern = `%${search}%`;
      if (safeDir === 'ASC') {
        data = await sql`
          SELECT * FROM tbl_items
          WHERE item_status = 'active' AND (
            item_id::text ILIKE ${pattern} OR
            item_name ILIKE ${pattern} OR
            item_description ILIKE ${pattern} OR
            item_location ILIKE ${pattern} OR
            item_category ILIKE ${pattern} OR
            item_quality ILIKE ${pattern} OR
            item_price::text ILIKE ${pattern} OR
            item_quantity::text ILIKE ${pattern}
          )
          ORDER BY item_id ASC
          LIMIT ${length} OFFSET ${start}
        `;
      } else {
        data = await sql`
          SELECT * FROM tbl_items
          WHERE item_status = 'active' AND (
            item_id::text ILIKE ${pattern} OR
            item_name ILIKE ${pattern} OR
            item_description ILIKE ${pattern} OR
            item_location ILIKE ${pattern} OR
            item_category ILIKE ${pattern} OR
            item_quality ILIKE ${pattern} OR
            item_price::text ILIKE ${pattern} OR
            item_quantity::text ILIKE ${pattern}
          )
          ORDER BY item_id DESC
          LIMIT ${length} OFFSET ${start}
        `;
      }
      const p = `%${search}%`;
      countResult = await sql`
        SELECT COUNT(*) as count FROM tbl_items
        WHERE item_status = 'active' AND (
          item_id::text ILIKE ${p} OR
          item_name ILIKE ${p} OR
          item_description ILIKE ${p} OR
          item_location ILIKE ${p} OR
          item_category ILIKE ${p} OR
          item_quality ILIKE ${p} OR
          item_price::text ILIKE ${p} OR
          item_quantity::text ILIKE ${p}
        )
      `;
    } else {
      if (safeDir === 'ASC') {
        data = await sql`
          SELECT * FROM tbl_items
          WHERE item_status = 'active'
          ORDER BY item_id ASC
          LIMIT ${length} OFFSET ${start}
        `;
      } else {
        data = await sql`
          SELECT * FROM tbl_items
          WHERE item_status = 'active'
          ORDER BY item_id DESC
          LIMIT ${length} OFFSET ${start}
        `;
      }
      countResult = await sql`
        SELECT COUNT(*) as count FROM tbl_items WHERE item_status = 'active'
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
