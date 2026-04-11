import { NextResponse } from 'next/server';
import sql from '../../../lib/db';

// PUT /api/items/[id] — update an item
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const {
      item_name, item_description, item_location,
      item_category, item_quality, item_price, item_quantity,
    } = body;

    const result = await sql`
      UPDATE tbl_items SET
        item_name = ${item_name},
        item_description = ${item_description},
        item_location = ${item_location},
        item_category = ${item_category},
        item_quality = ${item_quality},
        item_price = ${item_price},
        item_quantity = ${item_quantity}
      WHERE item_id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, item: result[0] });
  } catch (error) {
    console.error('PUT /api/items/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
  }
}

// DELETE /api/items/[id] — delete an item
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    const result = await sql`
      DELETE FROM tbl_items WHERE item_id = ${id} RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, deleted: result[0] });
  } catch (error) {
    console.error('DELETE /api/items/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}
