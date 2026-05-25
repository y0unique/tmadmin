import { NextResponse } from 'next/server';
import { writeLog } from '../../../lib/logger';
import sql from '../../../lib/db';
import { sanitizeBackend } from '../../../lib/sanitize';
import {
  encodeType, encodeCategory, encodeQuality, encodeSize, encodeSticker,
  validType, validCategory, validQuality, validSize, validSticker,
  decodeType, decodeCategory, decodeQuality, decodeSize, decodeSticker,
} from '../../../lib/lookup';

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

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();

    const name        = sanitizeBackend(body.item_name);
    const title       = sanitizeBackend(body.item_title);
    const description = sanitizeBackend(body.item_description);
    const location    = sanitizeBackend(body.item_location);
    const image       = sanitizeBackend(body.item_image || 'n/a');

    const type     = encodeType(body.item_type);
    const category = encodeCategory(body.item_category);
    const quality  = encodeQuality(body.item_quality);
    const size     = encodeSize(body.item_size);
    const sticker  = encodeSticker(body.item_sticker);

    if (!validType(type) || !validCategory(category) || !validQuality(quality) || !validSize(size) || !validSticker(sticker)) {
      return NextResponse.json({ error: 'Invalid dropdown value detected.' }, { status: 422 });
    }

    const result = await sql`
      UPDATE tbl_items SET
        item_name        = ${name},
        item_title       = ${title},
        item_type        = ${type},
        item_description = ${description},
        item_location    = ${location},
        item_category    = ${category},
        item_quality     = ${quality},
        item_size        = ${size},
        item_sticker     = ${sticker},
        item_acqprice    = ${parseFloat(body.item_acqprice) || 0},
        item_srp         = ${parseFloat(body.item_srp) || 0},
        item_quantity    = ${parseInt(body.item_quantity) || 0},
        item_image       = ${image},
        item_sold        = ${parseInt(body.item_sold) || 0},
        item_lastupdated = CURRENT_TIMESTAMP
      WHERE item_id = ${id}
      RETURNING *
    `;

    if (result.length === 0) return NextResponse.json({ error: 'Item not found' }, { status: 404 });

    try { await writeLog(`Edited item #${id} - "${name}"`); } catch (e) { console.error(e); }

    return NextResponse.json({ success: true, item: decodeItem(result[0]) });
  } catch (error) {
    console.error('PUT /api/items/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update item', details: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const result = await sql`
      UPDATE tbl_items SET item_status = 'inactive'
      WHERE item_id = ${id} AND item_status = 'active'
      RETURNING *
    `;
    if (result.length === 0) return NextResponse.json({ error: 'Item not found or already inactive' }, { status: 404 });
    try { await writeLog(`Removed item #${id} - "${result[0].item_name}" (set to inactive)`); } catch (e) { console.error(e); }
    return NextResponse.json({ success: true, item: result[0] });
  } catch (error) {
    console.error('DELETE /api/items/[id] error:', error);
    return NextResponse.json({ error: 'Failed to deactivate item', details: error.message }, { status: 500 });
  }
}
