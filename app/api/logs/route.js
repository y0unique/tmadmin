import { NextResponse } from 'next/server';
import sql from '../../lib/db';

// GET /api/logs — fetch logs with search and pagination
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
        SELECT * FROM timelogtbl
        WHERE
          log_action ILIKE ${pattern} OR
          log_date::text ILIKE ${pattern} OR
          log_time::text ILIKE ${pattern}
        ORDER BY time_id DESC
        LIMIT ${length} OFFSET ${start}
      `;
      countResult = await sql`
        SELECT COUNT(*) as count FROM timelogtbl
        WHERE
          log_action ILIKE ${pattern} OR
          log_date::text ILIKE ${pattern} OR
          log_time::text ILIKE ${pattern}
      `;
    } else {
      data = await sql`
        SELECT * FROM timelogtbl
        ORDER BY time_id DESC
        LIMIT ${length} OFFSET ${start}
      `;
      countResult = await sql`SELECT COUNT(*) as count FROM timelogtbl`;
    }

    return NextResponse.json({
      data,
      recordsTotal: parseInt(countResult[0].count),
    });
  } catch (error) {
    console.error('GET /api/logs error:', error);
    return NextResponse.json({ error: 'Failed to fetch logs', details: error.message }, { status: 500 });
  }
}
