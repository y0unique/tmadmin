import { NextResponse } from 'next/server';
import sql from '../../../lib/db';

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

// PUT /api/items/[id] — update an item
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const {
      item_name, item_description, item_location,
      item_category, item_quality, item_price, item_quantity,
      item_image = 'n/a',
    } = body;

    const result = await sql`
      UPDATE tbl_items SET
        item_name        = ${item_name},
        item_description = ${item_description},
        item_location    = ${item_location},
        item_category    = ${item_category},
        item_quality     = ${item_quality},
        item_price       = ${item_price},
        item_quantity    = ${item_quantity},
        item_image       = ${item_image}
      WHERE item_id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    await writeLog(`Edited item #${id} — "${item_name}"`);
    return NextResponse.json({ success: true, item: result[0] });
  } catch (error) {
    console.error('PUT /api/items/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update item', details: error.message }, { status: 500 });
  }
}

// DELETE /api/items/[id] — soft delete: set status to 'inactive'
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
      return NextResponse.json({ error: 'Item not found or already inactive' }, { status: 404 });
    }

    await writeLog(`Removed item #${id} — "${result[0].item_name}" (set to inactive)`);
    return NextResponse.json({ success: true, item: result[0] });
  } catch (error) {
    console.error('DELETE /api/items/[id] error:', error);
    return NextResponse.json({ error: 'Failed to deactivate item', details: error.message }, { status: 500 });
  }
}
