import { NextResponse } from 'next/server';
import sql from '../../../../lib/db';
import { writeLog } from '../../../../lib/logger';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function PUT(request, { params }) {
  try {
    const { id } = params;

    const result = await sql`
      UPDATE tbl_items
      SET item_status = 'active', item_lastupdated = CURRENT_TIMESTAMP
      WHERE item_id = ${id} AND item_status = 'inactive'
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Item not found or already active' }, { status: 404 });
    }

    try {
      await writeLog(`Restored item #${id} — "${result[0].item_name}" (set back to active)`);
    } catch (logErr) {
      console.error('Log failed:', logErr.message);
    }

    return NextResponse.json(
      { success: true, item: result[0] },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('PUT /api/items/restore/[id] error:', error);
    return NextResponse.json({ error: 'Failed to restore item', details: error.message }, { status: 500 });
  }
}
