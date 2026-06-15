const Diet = require('../models/Diet');
const getToken = require('../helpers/get-token');
const getUserByToken = require('../helpers/get-user-by-token');

const { createDiet } = require('../usecases/diet/createDiet');
const { listDiets } = require('../usecases/diet/listDiets');
const { getDietById } = require('../usecases/diet/getDietById');
const { updateDiet } = require('../usecases/diet/updateDiet');
const { deleteDiet } = require('../usecases/diet/deleteDiet');
const { validatePagination } = require('../helpers/validate-diet');

const defaultRepository = {
  create: (data) => new Diet(data).save(),
  findActive: (query = {}) =>
    Diet.find({ ...query, deletedAt: null }).sort('-createdAt'),
  findById: (id) => Diet.findById(id),
  findByName: (name) =>
    Diet.findOne({
      name: new RegExp(`^${escapeRegExp(name)}$`, 'i'),
      deletedAt: null,
    }),
  update: (id, data) => Diet.findByIdAndUpdate(id, data, { new: true }),
};

function escapeRegExp(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

let DietRepository = defaultRepository;

function setRepository(repo) {
  DietRepository = repo || defaultRepository;
}

function resetRepository() {
  DietRepository = defaultRepository;
}

class DietController {
  static async create(req, res) {
    try {
      const token = getToken(req);
      const user = await getUserByToken(token);

      const result = await createDiet({
        data: req.body,
        user,
        DietRepository,
      });

      if (!result.success) {
        return res.status(result.status).json({ message: result.errors[0] });
      }
      return res.status(result.status).json({
        message: 'Dieta criada!',
        data: result.diet,
      });
    } catch (err) {
      return res.status(500).json({ message: 'Erro interno no servidor.' });
    }
  }

  static async list(req, res) {
    try {
      const token = getToken(req);
      const user = await getUserByToken(token);

      const page = req.query.page !== undefined ? Number(req.query.page) : 1;
      const limit = req.query.limit !== undefined ? Number(req.query.limit) : 10;

      const pagination = validatePagination(page, limit);
      if (!pagination.isValid) {
        return res.status(422).json({ message: pagination.errors[0] });
      }

      const result = await listDiets({
        DietRepository,
        filters: { type: req.query.type, userId: user._id, page, limit },
      });

      if (!result.success) {
        return res.status(result.status).json({ message: result.errors[0] });
      }
      return res.status(200).json({
        diets: result.diets,
        total: result.total,
        page: result.page,
        limit: result.limit,
      });
    } catch (err) {
      return res.status(500).json({ message: 'Erro interno no servidor.' });
    }
  }

  static async getById(req, res) {
    try {
      const result = await getDietById({
        id: req.params.id,
        DietRepository,
      });

      if (!result.success) {
        return res.status(result.status).json({ message: result.errors[0] });
      }
      return res.status(200).json({ diet: result.diet });
    } catch (err) {
      return res.status(500).json({ message: 'Erro interno no servidor.' });
    }
  }

  static async update(req, res) {
    try {
      const token = getToken(req);
      const user = await getUserByToken(token);

      const result = await updateDiet({
        id: req.params.id,
        data: req.body,
        user,
        DietRepository,
      });

      if (!result.success) {
        return res.status(result.status).json({ message: result.errors[0] });
      }
      return res.status(200).json({
        message: 'Dieta atualizada!',
        data: result.diet,
      });
    } catch (err) {
      return res.status(500).json({ message: 'Erro interno no servidor.' });
    }
  }

  static async delete(req, res) {
    try {
      const token = getToken(req);
      const user = await getUserByToken(token);

      const result = await deleteDiet({
        id: req.params.id,
        user,
        DietRepository,
      });

      if (!result.success) {
        return res.status(result.status).json({ message: result.errors[0] });
      }
      return res.status(200).json({ message: result.message });
    } catch (err) {
      return res.status(500).json({ message: 'Erro interno no servidor.' });
    }
  }
}

module.exports = DietController;
module.exports.setRepository = setRepository;
module.exports.resetRepository = resetRepository;
