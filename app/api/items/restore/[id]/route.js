import { NextResponse } from 'next/server';
import sql from '../../../../lib/db';

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

// PUT /api/items/restore/[id] — restore inactive item to active
export async function PUT(request, { params }) {
  try {
    const { id } = params;

    const result = await sql`
      UPDATE tbl_items
      SET item_status = 'active', "item_lastUpdated" = CURRENT_TIMESTAMP
      WHERE item_id = ${id} AND item_status = 'inactive'
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Item not found or already active' }, { status: 404 });
    }

    await writeLog(`Restored item #${id} — "${result[0].item_name}" (set back to active)`);
    return NextResponse.json({ success: true, item: result[0] });
  } catch (error) {
    console.error('PUT /api/items/restore/[id] error:', error);
    return NextResponse.json({ error: 'Failed to restore item', details: error.message }, { status: 500 });
  }
}
