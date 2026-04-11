import { NextResponse } from 'next/server';
import sql from '../../lib/db';

// GET /api/items — fetch all items with search, sort, pagination
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const orderColumn = searchParams.get('order_column') || 'item_id';
    const orderDir = searchParams.get('order_dir') || 'ASC';
    const start = parseInt(searchParams.get('start') || '0');
    const length = parseInt(searchParams.get('length') || '20');

    const validColumns = [
      'item_id', 'item_name', 'item_description', 'item_location',
      'item_category', 'item_quality', 'item_price', 'item_quantity',
    ];
    const validDirs = ['ASC', 'DESC'];

    const safeColumn = validColumns.includes(orderColumn) ? orderColumn : 'item_id';
    const safeDir = validDirs.includes(orderDir.toUpperCase()) ? orderDir.toUpperCase() : 'ASC';

    let data;
    let totalResult;

    if (search) {
      const pattern = `%${search}%`;
      data = await sql`
        SELECT * FROM tbl_items
        WHERE
          item_id::text ILIKE ${pattern} OR
          item_name ILIKE ${pattern} OR
          item_description ILIKE ${pattern} OR
          item_location ILIKE ${pattern} OR
          item_category ILIKE ${pattern} OR
          item_quality ILIKE ${pattern} OR
          item_price::text ILIKE ${pattern} OR
          item_quantity::text ILIKE ${pattern}
        ORDER BY ${sql(safeColumn)} ${sql.unsafe(safeDir)}
        LIMIT ${length} OFFSET ${start}
      `;
      totalResult = await sql`
        SELECT COUNT(*) as count FROM tbl_items
        WHERE
          item_id::text ILIKE ${pattern} OR
          item_name ILIKE ${pattern} OR
          item_description ILIKE ${pattern} OR
          item_location ILIKE ${pattern} OR
          item_category ILIKE ${pattern} OR
          item_quality ILIKE ${pattern} OR
          item_price::text ILIKE ${pattern} OR
          item_quantity::text ILIKE ${pattern}
      `;
    } else {
      data = await sql`
        SELECT * FROM tbl_items
        ORDER BY ${sql(safeColumn)} ${sql.unsafe(safeDir)}
        LIMIT ${length} OFFSET ${start}
      `;
      totalResult = await sql`SELECT COUNT(*) as count FROM tbl_items`;
    }

    return NextResponse.json({
      data,
      recordsTotal: parseInt(totalResult[0].count),
    });
  } catch (error) {
    console.error('GET /api/items error:', error);
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
  }
}

// POST /api/items — create a new item
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      item_name, item_description, item_location,
      item_category, item_quality, item_price, item_quantity,
    } = body;

    const result = await sql`
      INSERT INTO tbl_items
        (item_name, item_description, item_location, item_category, item_quality, item_price, item_quantity)
      VALUES
        (${item_name}, ${item_description}, ${item_location}, ${item_category}, ${item_quality}, ${item_price}, ${item_quantity})
      RETURNING *
    `;

    return NextResponse.json({ success: true, item: result[0] }, { status: 201 });
  } catch (error) {
    console.error('POST /api/items error:', error);
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 });
  }
}
