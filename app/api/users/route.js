import { NextResponse } from 'next/server';
import sql from '../../lib/db';
import { writeLog } from '../../lib/logger';
import { sanitizeBackend } from '../../lib/sanitize';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
        SELECT u_id, u_name, u_email, u_type, u_profile, u_status,
               u_created, u_lastseen,
               p_add, p_edit, p_delete, p_import, p_export, p_logs, p_users
        FROM tbl_users
        WHERE u_name ILIKE ${pattern} OR u_email ILIKE ${pattern}
        ORDER BY u_id ASC
        LIMIT ${length} OFFSET ${start}
      `;
      countResult = await sql`
        SELECT COUNT(*) as count FROM tbl_users
        WHERE u_name ILIKE ${pattern} OR u_email ILIKE ${pattern}
      `;
    } else {
      data = await sql`
        SELECT u_id, u_name, u_email, u_type, u_profile, u_status,
               u_created, u_lastseen,
               p_add, p_edit, p_delete, p_import, p_export, p_logs, p_users
        FROM tbl_users
        ORDER BY u_id ASC
        LIMIT ${length} OFFSET ${start}
      `;
      countResult = await sql`SELECT COUNT(*) as count FROM tbl_users`;
    }

    return NextResponse.json(
      { data, recordsTotal: parseInt(countResult[0].count) },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
    );
  } catch (error) {
    console.error('GET /api/users error:', error);
    return NextResponse.json({ error: 'Failed to fetch users', details: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      u_name, u_email, u_type = 5, u_profile = 'n/a',
      p_add, p_edit, p_delete, p_import, p_export, p_logs, p_users,
    } = body;

    const name    = sanitizeBackend(u_name);
    const email   = sanitizeBackend(u_email).toLowerCase();
    const profile = sanitizeBackend(u_profile);
    const type    = parseInt(u_type);

    if (!name || !email)
      return NextResponse.json({ error: 'Name and email are required.' }, { status: 422 });
    if (type === 1)
      return NextResponse.json({ error: 'System Admin cannot be assigned via UI.' }, { status: 403 });

    const result = await sql`
      INSERT INTO tbl_users
        (u_name, u_email, u_type, u_profile, u_status,
         p_add, p_edit, p_delete, p_import, p_export, p_logs, p_users)
      VALUES
        (${name}, ${email}, ${type}, ${profile}, 'active',
         ${p_add ?? null}, ${p_edit ?? null}, ${p_delete ?? null},
         ${p_import ?? null}, ${p_export ?? null}, ${p_logs ?? null}, ${p_users ?? null})
      RETURNING u_id, u_name, u_email, u_type, u_status
    `;

    try { await writeLog(`Added user #${result[0].u_id} — "${name}" (${email})`); } catch(e) { console.error(e); }
    return NextResponse.json({ success: true, user: result[0] }, { status: 201 });
  } catch (error) {
    if (error.message?.includes('unique'))
      return NextResponse.json({ error: 'Email already exists.' }, { status: 409 });
    console.error('POST /api/users error:', error);
    return NextResponse.json({ error: 'Failed to create user', details: error.message }, { status: 500 });
  }
}
