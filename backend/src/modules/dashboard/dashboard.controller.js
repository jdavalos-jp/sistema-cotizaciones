const { getDashboardSummary } = require('./dashboard.service');

async function summary(_req, res) {
  const data = await getDashboardSummary();
  res.json({ ok: true, data });
}

module.exports = { summary };
