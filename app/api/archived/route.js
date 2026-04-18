import { NextResponse } from 'next/server';
import sql from '../../lib/db';

// GET /api/archived — fetch all inactive items with search and pagination
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const start  = parseInt(searchParams.get('start')  || '0');
    const length = parseInt(searchParams.get('length') || '10');

    let data, countResult;

    if (search) {
      const pattern = `%${search}%`;
      data = await sql`
        SELECT * FROM tbl_items
        WHERE item_status = 'inactive' AND (
          item_name        ILIKE ${pattern} OR
          item_type        ILIKE ${pattern} OR
          item_category    ILIKE ${pattern} OR
          item_quality     ILIKE ${pattern} OR
          item_location    ILIKE ${pattern}
        )
        ORDER BY item_lastUpdated DESC
        LIMIT ${length} OFFSET ${start}
      `;
      countResult = await sql`
        SELECT COUNT(*) as count FROM tbl_items
        WHERE item_status = 'inactive' AND (
          item_name        ILIKE ${pattern} OR
          item_type        ILIKE ${pattern} OR
          item_category    ILIKE ${pattern} OR
          item_quality     ILIKE ${pattern} OR
          item_location    ILIKE ${pattern}
        )
      `;
    } else {
      data = await sql`
        SELECT * FROM tbl_items
        WHERE item_status = 'inactive'
        ORDER BY item_lastUpdated DESC
        LIMIT ${length} OFFSET ${start}
      `;
      countResult = await sql`
        SELECT COUNT(*) as count FROM tbl_items WHERE item_status = 'inactive'
      `;
    }

    return NextResponse.json({
      data,
      recordsTotal: parseInt(countResult[0].count),
    });
  } catch (error) {
    console.error('GET /api/archived error:', error);
    return NextResponse.json({ error: 'Failed to fetch archived items', details: error.message }, { status: 500 });
  }
}
