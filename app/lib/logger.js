import sql from './db';

export async function writeLog(action) {
  const now  = new Date();
  const date = now.toISOString().split('T')[0];
  const time = now.toTimeString().split(' ')[0];
  // Not wrapped in try/catch — let caller decide if log failure should throw
  await sql`
    INSERT INTO timelogtbl (log_action, log_date, log_time, log_status)
    VALUES (${action}, ${date}, ${time}, 'active')
  `;
}
