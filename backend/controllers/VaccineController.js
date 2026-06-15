const Vaccine = require('../models/Vaccine')
const getToken = require('../helpers/get-token')
const getUserByToken = require('../helpers/get-user-by-token')

const { createVaccine } = require('../usecases/vaccine/createVaccine')
const { listVaccines } = require('../usecases/vaccine/listVaccines')
const { getVaccineById } = require('../usecases/vaccine/getVaccineById')
const { updateVaccine } = require('../usecases/vaccine/updateVaccine')
const { deleteVaccine } = require('../usecases/vaccine/deleteVaccine')

const defaultRepository = {
  create: (data) => new Vaccine(data).save(),
  findActiveByUser: (userId) =>
    Vaccine.find({ 'user._id': userId, deletedAt: null }).sort('-applicationDate'),
  findActiveByPet: (petId) =>
    Vaccine.find({ 'pet._id': petId, deletedAt: null }).sort('-applicationDate'),
  findById: (id) => Vaccine.findById(id),
  update: (id, data) => Vaccine.findByIdAndUpdate(id, data, { new: true }),
}

let VaccineRepository = defaultRepository

function setRepository(repo) {
  VaccineRepository = repo || defaultRepository
}

function resetRepository() {
  VaccineRepository = defaultRepository
}

class VaccineController {
  static async create(req, res) {
    const token = getToken(req)
    const user = await getUserByToken(token)

    const result = await createVaccine({
      data: req.body,
      user,
      VaccineRepository,
    })

    if (!result.success) {
      return res.status(result.status).json({ message: result.errors[0] })
    }
    return res.status(result.status).json({
      message: 'Vacina registrada com sucesso!',
      data: result.vaccine,
    })
  }

  static async list(req, res) {
    const token = getToken(req)
    const user = await getUserByToken(token)
    const { petId } = req.query

    const result = await listVaccines({ user, petId, VaccineRepository })

    if (!result.success) {
      return res.status(result.status).json({ message: result.errors[0] })
    }
    return res.status(200).json({ vaccines: result.vaccines })
  }

  static async getById(req, res) {
    const token = getToken(req)
    const user = await getUserByToken(token)

    const result = await getVaccineById({
      id: req.params.id,
      user,
      VaccineRepository,
    })

    if (!result.success) {
      return res.status(result.status).json({ message: result.errors[0] })
    }
    return res.status(200).json({ vaccine: result.vaccine })
  }

  static async update(req, res) {
    const token = getToken(req)
    const user = await getUserByToken(token)

    const result = await updateVaccine({
      id: req.params.id,
      data: req.body,
      user,
      VaccineRepository,
    })

    if (!result.success) {
      return res.status(result.status).json({ message: result.errors[0] })
    }
    return res.status(200).json({
      message: 'Vacina atualizada com sucesso!',
      data: result.vaccine,
    })
  }

  static async delete(req, res) {
    const token = getToken(req)
    const user = await getUserByToken(token)

    const result = await deleteVaccine({
      id: req.params.id,
      user,
      VaccineRepository,
    })

    if (!result.success) {
      return res.status(result.status).json({ message: result.errors[0] })
    }
    return res.status(200).json({ message: result.message })
  }
}

module.exports = VaccineController
module.exports.setRepository = setRepository
module.exports.resetRepository = resetRepository
