import { NextResponse } from 'next/server';
import { writeLog } from '../../../lib/logger';
import sql from '../../../lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// PUT /api/items/[id] — update an item
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();

    const {
      item_name, item_title, item_type, item_description, item_location,
      item_category, item_quality, item_size, item_sticker,
      item_acqprice, item_srp, item_quantity, item_image = 'n/a',
    } = body;

    const result = await sql`
      UPDATE tbl_items SET
        item_name        = ${item_name},
        item_title       = ${item_title || ''},
        item_type        = ${item_type  || ''},
        item_description = ${item_description},
        item_location    = ${item_location},
        item_category    = ${item_category},
        item_quality     = ${item_quality},
        item_size        = ${item_size    || ''},
        item_sticker     = ${item_sticker || ''},
        item_acqprice    = ${item_acqprice || 0},
        item_srp         = ${item_srp      || 0},
        item_quantity    = ${item_quantity},
        item_image       = ${item_image},
        item_lastupdated = CURRENT_TIMESTAMP
      WHERE item_id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // FIXED: properly closed try block
    try {
      await writeLog(`Edited item #${id} — "${item_name}"`);
    } catch (e) {
      console.warn('Log failed:', e);
    }

    return NextResponse.json({ success: true, item: result[0] });

  } catch (error) {
    console.error('PUT /api/items/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to update item', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/items/[id]
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    const result = await sql`
      UPDATE tbl_items
      SET item_status = 'inactive'
      WHERE item_id = ${id} AND item_status = 'active'
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Item not found or already inactive' },
        { status: 404 }
      );
    }

    // FIXED here too
    try {
      await writeLog(`Removed item #${id} — "${result[0].item_name}" (set to inactive)`);
    } catch (e) {
      console.warn('Log failed:', e);
    }

    return NextResponse.json({ success: true, item: result[0] });

  } catch (error) {
    console.error('DELETE /api/items/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to deactivate item', details: error.message },
      { status: 500 }
    );
  }
}