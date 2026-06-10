import { NextResponse } from 'next/server';
import sql from '../../lib/db';
import { decodeType, decodeCategory, decodeQuality, decodeSize, decodeSticker } from '../../lib/lookup';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function decodeItem(item) {
  return {
    ...item,
    item_type:     decodeType(item.item_type),
    item_category: decodeCategory(item.item_category),
    item_quality:  decodeQuality(item.item_quality),
    item_size:     decodeSize(item.item_size),
    item_sticker:  decodeSticker(item.item_sticker),
  };
}

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
          item_location    ILIKE ${pattern} OR
          item_title       ILIKE ${pattern} OR
          item_description ILIKE ${pattern}
        )
        ORDER BY item_lastupdated DESC
        LIMIT ${length} OFFSET ${start}
      `;
      countResult = await sql`
        SELECT COUNT(*) as count FROM tbl_items
        WHERE item_status = 'inactive' AND (
          item_name        ILIKE ${pattern} OR
          item_location    ILIKE ${pattern} OR
          item_title       ILIKE ${pattern} OR
          item_description ILIKE ${pattern}
        )
      `;
    } else {
      data = await sql`
        SELECT * FROM tbl_items
        WHERE item_status = 'inactive'
        ORDER BY item_lastupdated DESC
        LIMIT ${length} OFFSET ${start}
      `;
      countResult = await sql`
        SELECT COUNT(*) as count FROM tbl_items WHERE item_status = 'inactive'
      `;
    }

    return NextResponse.json(
      { data: data.map(decodeItem), recordsTotal: parseInt(countResult[0].count) },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
    );
  } catch (error) {
    console.error('GET /api/archived error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch archived items', details: error.message },
      { status: 500 }
    );
  }
}
