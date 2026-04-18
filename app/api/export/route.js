import { NextResponse } from 'next/server';
import sql from '../../lib/db';

async function writeLog(action) {
  try {
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().split(' ')[0];
    const { neon } = await import('@neondatabase/serverless');
    const sql = neon(process.env.DATABASE_URL);
    await sql`INSERT INTO timelogtbl (log_action, log_date, log_time, log_status) VALUES (${action}, ${date}, ${time}, 'active')`;
  } catch (e) { console.error('Log write failed:', e.message); }
}

// GET /api/export — returns CSV of filtered active items
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search    = searchParams.get('search')    || '';
    const quality   = searchParams.get('quality')   || '';
    const sortBy    = searchParams.get('sort_by')   || '"item_dateAdded"';
    const sortDir   = searchParams.get('sort_dir')  || 'ASC';
    const dateFrom  = searchParams.get('date_from') || '';
    const dateTo    = searchParams.get('date_to')   || '';

    const validSortCols = ['"item_dateAdded"', '"item_lastUpdatedd"'];
    const safeSort = validSortCols.includes(sortBy) ? sortBy : '"item_dateAdded"';
    const safeDir  = sortDir.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    // Date range is required for export
    if (!dateFrom || !dateTo) {
      return NextResponse.json({ error: 'Date range is required for export' }, { status: 400 });
    }

    const searchPattern = search ? `%${search}%` : null;
    const qualityFilter = quality || null;

    let data;

    // Build query based on filters — ASC or DESC
    if (safeDir === 'ASC') {
      data = await sql`
        SELECT
          item_id, item_name, item_description, item_location,
          item_category, item_quality, item_srp, item_quantity,
          item_image, item_status, "item_dateAdded", "item_lastUpdatedd"
        FROM tbl_items
        WHERE item_status = 'active'
          AND (${qualityFilter}::text IS NULL OR item_quality = ${qualityFilter})
          AND "item_dateAdded"::date >= ${dateFrom}::date
          AND "item_dateAdded"::date <= ${dateTo}::date
          AND (
            ${searchPattern}::text IS NULL OR
            item_id::text    ILIKE ${searchPattern || ''} OR
            item_name        ILIKE ${searchPattern || ''} OR
            item_description ILIKE ${searchPattern || ''} OR
            item_location    ILIKE ${searchPattern || ''} OR
            item_category    ILIKE ${searchPattern || ''} OR
            item_quality     ILIKE ${searchPattern || ''}
          )
        ORDER BY "item_dateAdded" ASC
      `;
    } else {
      data = await sql`
        SELECT
          item_id, item_name, item_description, item_location,
          item_category, item_quality, item_srp, item_quantity,
          item_image, item_status, "item_dateAdded", "item_lastUpdatedd"
        FROM tbl_items
        WHERE item_status = 'active'
          AND (${qualityFilter}::text IS NULL OR item_quality = ${qualityFilter})
          AND "item_dateAdded"::date >= ${dateFrom}::date
          AND "item_dateAdded"::date <= ${dateTo}::date
          AND (
            ${searchPattern}::text IS NULL OR
            item_id::text    ILIKE ${searchPattern || ''} OR
            item_name        ILIKE ${searchPattern || ''} OR
            item_description ILIKE ${searchPattern || ''} OR
            item_location    ILIKE ${searchPattern || ''} OR
            item_category    ILIKE ${searchPattern || ''} OR
            item_quality     ILIKE ${searchPattern || ''}
          )
        ORDER BY "item_dateAdded" DESC
      `;
    }

    // Build CSV
    const headers = [
      'item_name', 'item_title', 'item_type', 'item_description', 'item_location',
      'item_category', 'item_quality', 'item_size', 'item_sticker',
      'item_acqprice', 'item_srp', 'item_quantity', 'item_image',
    ];

    const escape = (val) => {
      if (val === null || val === undefined) return '';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const formatDate = (d) => d ? new Date(d).toLocaleString('en-PH') : '';

    const rows = data.map(item => [
      item.item_id,
      item.item_name,
      item.item_description,
      item.item_location,
      item.item_category,
      item.item_quality,
      item.item_srp,
      item.item_quantity,
      item.item_image,
      item.item_status,
      formatDate(item.item_dateAdded),
      formatDate(item.item_lastUpdated),
    ].map(escape).join(','));

    const csv = [headers.join(','), ...rows].join('\n');
    const filename = `toymafia_inventory_${dateFrom}_to_${dateTo}.csv`;

    // Log the export
    await writeLog(`CSV Export downloaded: ${data.length} items (${dateFrom} to ${dateTo})${quality ? ' | Quality: ' + quality : ''}`);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error('GET /api/export error:', error);
    return NextResponse.json({ error: 'Failed to export', details: error.message }, { status: 500 });
  }
}
