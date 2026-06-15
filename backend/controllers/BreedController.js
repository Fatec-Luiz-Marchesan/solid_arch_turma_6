const Breed = require('../models/Breed');
const getToken = require('../helpers/get-token');
const getUserByToken = require('../helpers/get-user-by-token');

const { createBreed } = require('../usecases/breed/createBreed');
const { listBreeds } = require('../usecases/breed/listBreeds');
const { getBreedById } = require('../usecases/breed/getBreedById');
const { updateBreed } = require('../usecases/breed/updateBreed');
const { deleteBreed } = require('../usecases/breed/deleteBreed');

// Default repository: the only place that touches Mongoose directly.
const defaultRepository = {
  create: (data) => new Breed(data).save(),
  findActive: (query = {}, options = {}) => {
    const { skip = 0, limit, sortBy = 'createdAt', sortOrder = 'desc' } = options;
    const sortValue = sortOrder === 'asc' ? 1 : -1;
    let q = Breed.find({ ...query, deletedAt: null }).sort({ [sortBy]: sortValue });
    if (skip) q = q.skip(skip);
    if (limit) q = q.limit(limit);
    return q;
  },
  countActive: (query = {}) => Breed.countDocuments({ ...query, deletedAt: null }),
  findById: (id) => Breed.findById(id),
  // Case-insensitive, active-only name lookup for uniqueness checks
  findByName: (name) =>
    Breed.findOne({
      name: new RegExp(`^${escapeRegExp(name)}$`, 'i'),
      deletedAt: null,
    }),
  update: (id, data) => Breed.findByIdAndUpdate(id, data, { new: true }),
};

function escapeRegExp(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

let BreedRepository = defaultRepository;

function setRepository(repo) {
  BreedRepository = repo || defaultRepository;
}

function resetRepository() {
  BreedRepository = defaultRepository;
}

class BreedController {
  static async create(req, res) {
    const token = getToken(req);
    const user = await getUserByToken(token);

    const result = await createBreed({
      data: req.body,
      user,
      BreedRepository,
    });

    if (!result.success) {
      return res.status(result.status).json({ message: result.errors[0] });
    }
    return res.status(result.status).json({
      message: 'Raça criada!',
      data: result.breed,
    });
  }

  static async list(req, res) {
    const { species, page, limit, sortBy, sortOrder } = req.query;
    const result = await listBreeds({
      BreedRepository,
      filters: { species },
      pagination: { page, limit, sortBy, sortOrder },
    });

    if (!result.success) {
      return res.status(result.status).json({ message: result.errors[0] });
    }
    return res.status(200).json({
      breeds: result.breeds,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    });
  }

  static async getById(req, res) {
    const result = await getBreedById({
      id: req.params.id,
      BreedRepository,
    });

    if (!result.success) {
      return res.status(result.status).json({ message: result.errors[0] });
    }
    return res.status(200).json({ breed: result.breed });
  }

  static async update(req, res) {
    const token = getToken(req);
    const user = await getUserByToken(token);

    const result = await updateBreed({
      id: req.params.id,
      data: req.body,
      user,
      BreedRepository,
    });

    if (!result.success) {
      return res.status(result.status).json({ message: result.errors[0] });
    }
    return res.status(200).json({
      message: 'Raça atualizada!',
      data: result.breed,
    });
  }

  static async delete(req, res) {
    const token = getToken(req);
    const user = await getUserByToken(token);

    const result = await deleteBreed({
      id: req.params.id,
      user,
      BreedRepository,
    });

    if (!result.success) {
      return res.status(result.status).json({ message: result.errors[0] });
    }
    return res.status(200).json({ message: result.message });
  }
}

module.exports = BreedController;
module.exports.setRepository = setRepository;
module.exports.resetRepository = resetRepository;