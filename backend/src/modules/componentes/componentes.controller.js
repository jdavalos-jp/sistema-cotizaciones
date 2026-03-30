const { HttpError } = require('../../utils/httpError');
const { validate, CreateComponenteSchema, UpdateComponenteSchema } = require('../../utils/validationSchemas');
const { listComponentes, getComponenteById, createComponente, updateComponente, deleteComponente } = require('./componentes.service');

async function list(req, res) {
  const take = req.query.take ? Number(req.query.take) : 50;
  const skip = req.query.skip ? Number(req.query.skip) : 0;
  const safeTake = Number.isFinite(take) ? Math.min(Math.max(take, 1), 200) : 50;
  const safeSkip = Number.isFinite(skip) && skip >= 0 ? skip : 0;
  const search = req.query.search ? String(req.query.search) : undefined;

  const { data, total } = await listComponentes({ take: safeTake, skip: safeSkip, search });
  res.json({ ok: true, data, total });
}

async function getById(req, res) {
  const componente = await getComponenteById(BigInt(req.params.id));
  res.json({ ok: true, data: componente });
}

async function create(req, res) {
  const validatedData = validate(CreateComponenteSchema, req.body);
  const componente = await createComponente(validatedData);
  res.status(201).json({ ok: true, data: componente });
}

async function update(req, res) {
  const validatedData = validate(UpdateComponenteSchema, req.body);
  const componente = await updateComponente(req.params.id, validatedData);
  res.json({ ok: true, data: componente });
}

async function deleteOne(req, res) {
  const result = await deleteComponente(req.params.id);
  res.json({ ok: true, data: result });
}

module.exports = { list, getById, create, update, deleteOne };
