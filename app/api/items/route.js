import { NextResponse } from 'next/server';
import { writeLog } from '../../lib/logger';
import sql from '../../lib/db';
import { sanitizeBackend } from '../../lib/sanitize';
import {
  encodeType, encodeCategory, encodeQuality, encodeSize, encodeSticker,
  validType, validCategory, validQuality, validSize, validSticker,
  decodeType, decodeCategory, decodeQuality, decodeSize, decodeSticker,
} from '../../lib/lookup';

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
    const search   = searchParams.get('search')   || '';
    const quality  = searchParams.get('quality')  || '';
    const category = searchParams.get('category') || '';
    const type     = searchParams.get('type')     || '';
    const size     = searchParams.get('size')     || '';
    const sticker  = searchParams.get('sticker')  || '';
    const sortBy   = searchParams.get('sort_by')  || '';
    const sortDir  = searchParams.get('sort_dir') || 'ASC';
    const start    = parseInt(searchParams.get('start')  || '0');
    const length   = parseInt(searchParams.get('length') || '10');

    const safeDir = sortDir.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const searchPattern  = search   ? `%${search}%`  : null;
    const qualityFilter  = quality  ? parseInt(quality)  : null;
    const categoryFilter = category ? parseInt(category) : null;
    const typeFilter     = type     ? parseInt(type)     : null;
    const sizeFilter     = size     ? parseInt(size)     : null;
    const stickerFilter  = sticker  ? parseInt(sticker)  : null;

    let data, countResult;

    if (safeDir === 'ASC') {
      data = await sql`
        SELECT * FROM tbl_items
        WHERE item_status = 'active'
          AND (${qualityFilter}::int  IS NULL OR item_quality  = ${qualityFilter})
          AND (${categoryFilter}::int IS NULL OR item_category = ${categoryFilter})
          AND (${typeFilter}::int     IS NULL OR item_type     = ${typeFilter})
          AND (${sizeFilter}::int     IS NULL OR item_size     = ${sizeFilter})
          AND (${stickerFilter}::int  IS NULL OR item_sticker  = ${stickerFilter})
          AND (
            ${searchPattern}::text IS NULL OR
            item_id::text    ILIKE ${searchPattern || ''} OR
            item_name        ILIKE ${searchPattern || ''} OR
            item_description ILIKE ${searchPattern || ''} OR
            item_location    ILIKE ${searchPattern || ''} OR
            item_acqprice::text ILIKE ${searchPattern || ''} OR
            item_srp::text   ILIKE ${searchPattern || ''} OR
            item_quantity::text ILIKE ${searchPattern || ''}
          )
        ORDER BY item_id ASC
        LIMIT ${length} OFFSET ${start}
      `;
    } else {
      data = await sql`
        SELECT * FROM tbl_items
        WHERE item_status = 'active'
          AND (${qualityFilter}::int  IS NULL OR item_quality  = ${qualityFilter})
          AND (${categoryFilter}::int IS NULL OR item_category = ${categoryFilter})
          AND (${typeFilter}::int     IS NULL OR item_type     = ${typeFilter})
          AND (${sizeFilter}::int     IS NULL OR item_size     = ${sizeFilter})
          AND (${stickerFilter}::int  IS NULL OR item_sticker  = ${stickerFilter})
          AND (
            ${searchPattern}::text IS NULL OR
            item_id::text    ILIKE ${searchPattern || ''} OR
            item_name        ILIKE ${searchPattern || ''} OR
            item_description ILIKE ${searchPattern || ''} OR
            item_location    ILIKE ${searchPattern || ''} OR
            item_acqprice::text ILIKE ${searchPattern || ''} OR
            item_srp::text   ILIKE ${searchPattern || ''} OR
            item_quantity::text ILIKE ${searchPattern || ''}
          )
        ORDER BY item_id DESC
        LIMIT ${length} OFFSET ${start}
      `;
    }

    countResult = await sql`
      SELECT COUNT(*) as count FROM tbl_items
      WHERE item_status = 'active'
        AND (${qualityFilter}::int  IS NULL OR item_quality  = ${qualityFilter})
        AND (${categoryFilter}::int IS NULL OR item_category = ${categoryFilter})
        AND (${typeFilter}::int     IS NULL OR item_type     = ${typeFilter})
        AND (${sizeFilter}::int     IS NULL OR item_size     = ${sizeFilter})
        AND (${stickerFilter}::int  IS NULL OR item_sticker  = ${stickerFilter})
        AND (
          ${searchPattern}::text IS NULL OR
          item_id::text    ILIKE ${searchPattern || ''} OR
          item_name        ILIKE ${searchPattern || ''} OR
          item_description ILIKE ${searchPattern || ''} OR
          item_location    ILIKE ${searchPattern || ''} OR
          item_acqprice::text ILIKE ${searchPattern || ''} OR
          item_srp::text   ILIKE ${searchPattern || ''} OR
          item_quantity::text ILIKE ${searchPattern || ''}
        )
    `;

    return NextResponse.json(
      { data: data.map(decodeItem), recordsTotal: parseInt(countResult[0].count) },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
    );
  } catch (error) {
    console.error('GET /api/items error:', error);
    return NextResponse.json({ error: 'Failed to fetch items', details: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      item_name, item_title, item_description, item_location,
      item_acqprice, item_srp, item_quantity, item_image = 'n/a',
    } = body;

    // Sanitize text fields
    const name        = sanitizeBackend(item_name);
    const title       = sanitizeBackend(item_title);
    const description = sanitizeBackend(item_description);
    const location    = sanitizeBackend(item_location);
    const image       = sanitizeBackend(item_image);

    // Encode & validate dropdown fields
    const type     = encodeType(body.item_type);
    const category = encodeCategory(body.item_category);
    const quality  = encodeQuality(body.item_quality);
    const size     = encodeSize(body.item_size);
    const sticker  = encodeSticker(body.item_sticker);

    if (!validType(type) || !validCategory(category) || !validQuality(quality) || !validSize(size) || !validSticker(sticker)) {
      return NextResponse.json({ error: 'Invalid dropdown value detected.' }, { status: 422 });
    }

    const acqprice = parseFloat(acqprice) || 0;
    const srp      = parseFloat(item_srp) || 0;
    const quantity = parseInt(item_quantity) || 0;

    const result = await sql`
      INSERT INTO tbl_items
        (item_name, item_title, item_type, item_description, item_location,
         item_category, item_quality, item_size, item_sticker,
         item_acqprice, item_srp, item_quantity, item_sold, item_image, item_status)
      VALUES
        (${name}, ${title}, ${type}, ${description}, ${location},
         ${category}, ${quality}, ${size}, ${sticker},
         ${parseFloat(item_acqprice) || 0}, ${srp}, ${quantity}, ${parseInt(body.item_sold) || 0}, ${image}, 'active')
      RETURNING *
    `;

    try { await writeLog(`Added item #${result[0].item_id} - "${name}"`); } catch (e) { console.error(e); }

    return NextResponse.json({ success: true, item: decodeItem(result[0]) }, { status: 201 });
  } catch (error) {
    console.error('POST /api/items error:', error);
    return NextResponse.json({ error: 'Failed to create item', details: error.message }, { status: 500 });
  }
}
