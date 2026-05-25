import { NextResponse } from 'next/server';
import sql from '../../../lib/db';
import { writeLog } from '../../../lib/logger';
import { sanitizeBackend } from '../../../lib/sanitize';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const {
      u_name, u_email, u_type, u_profile = 'n/a',
      p_add, p_edit, p_delete, p_import, p_export, p_logs, p_users,
    } = body;

    const name    = sanitizeBackend(u_name);
    const email   = sanitizeBackend(u_email).toLowerCase();
    const profile = sanitizeBackend(u_profile);
    const type    = parseInt(u_type);

    if (!name || !email)
      return NextResponse.json({ error: 'Name and email are required.' }, { status: 422 });
    if (type === 1)
      return NextResponse.json({ error: 'Cannot assign System Admin via UI.' }, { status: 403 });

    const result = await sql`
      UPDATE tbl_users SET
        u_name    = ${name},
        u_email   = ${email},
        u_type    = ${type},
        u_profile = ${profile},
        p_add     = ${p_add     ?? null},
        p_edit    = ${p_edit    ?? null},
        p_delete  = ${p_delete  ?? null},
        p_import  = ${p_import  ?? null},
        p_export  = ${p_export  ?? null},
        p_logs    = ${p_logs    ?? null},
        p_users   = ${p_users   ?? null}
      WHERE u_id = ${id}
      RETURNING u_id, u_name, u_email, u_type, u_status
    `;

    if (result.length === 0)
      return NextResponse.json({ error: 'User not found' }, { status: 404 });

    try { await writeLog(`Edited user #${id} - "${name}"`); } catch(e) { console.error(e); }
    return NextResponse.json({ success: true, user: result[0] });
  } catch (error) {
    if (error.message?.includes('unique'))
      return NextResponse.json({ error: 'Email already exists.' }, { status: 409 });
    console.error('PUT /api/users/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update user', details: error.message }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { u_status } = body;

    if (!['active', 'disabled'].includes(u_status))
      return NextResponse.json({ error: 'Invalid status value.' }, { status: 422 });

    const result = await sql`
      UPDATE tbl_users
      SET u_status = ${u_status},
          u_type   = CASE WHEN ${u_status} = 'disabled' THEN 0 ELSE u_type END
      WHERE u_id = ${id} AND u_type != 1
      RETURNING u_id, u_name, u_email, u_type, u_status
    `;

    if (result.length === 0)
      return NextResponse.json({ error: 'User not found or cannot modify System Admin.' }, { status: 404 });

    const action = u_status === 'active' ? 'Enabled' : 'Disabled';
    try { await writeLog(`${action} user #${id} - "${result[0].u_name}"`); } catch(e) { console.error(e); }
    return NextResponse.json({ success: true, user: result[0] });
  } catch (error) {
    console.error('PATCH /api/users/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update status', details: error.message }, { status: 500 });
  }
}
