const Message = require('../models/Message');
const getToken = require('../helpers/get-token');
const getUserByToken = require('../helpers/get-user-by-token');

const { createMessage } = require('../usecases/message/createMessage');
const { listMessages } = require('../usecases/message/listMessages');
const { getMessageById } = require('../usecases/message/getMessageById');
const { updateMessage } = require('../usecases/message/updateMessage');
const { deleteMessage } = require('../usecases/message/deleteMessage');

const MessageRepository = {
  create: (data) => new Message(data).save(),
  findByUser: (userId) =>
    Message.find({
      $or: [{ 'sender._id': userId }, { 'receiver._id': userId }],
    }).sort('-createdAt'),
  findActiveByUser: (userId) =>
    Message.find({
      deletedAt: null,
      $or: [{ 'sender._id': userId }, { 'receiver._id': userId }],
    }).sort('-createdAt'),
  findById: (id) => Message.findById(id),
  update: (id, data) => Message.findByIdAndUpdate(id, data, { new: true }),
  delete: (id) => Message.findByIdAndDelete(id),
};

module.exports = class MessageController {
  static async create(req, res) {
    const token = getToken(req);
    const sender = await getUserByToken(token);

    const result = await createMessage({
      data: req.body,
      sender,
      MessageRepository,
    });

    if (!result.success) {
      return res.status(result.status).json({ message: result.errors[0] });
    }
    return res.status(result.status).json({
      message: 'Mensagem enviada!',
      data: result.message,
    });
  }

  static async list(req, res) {
    const token = getToken(req);
    const user = await getUserByToken(token);

    const result = await listMessages({ user, MessageRepository });
    if (!result.success) {
      return res.status(result.status).json({ message: result.errors[0] });
    }
    return res.status(200).json({ messages: result.messages });
  }

  static async getById(req, res) {
    const token = getToken(req);
    const user = await getUserByToken(token);

    const result = await getMessageById({
      id: req.params.id,
      user,
      MessageRepository,
    });
    if (!result.success) {
      return res.status(result.status).json({ message: result.errors[0] });
    }
    return res.status(200).json({ message: result.message });
  }

  static async update(req, res) {
    const token = getToken(req);
    const user = await getUserByToken(token);

    const result = await updateMessage({
      id: req.params.id,
      data: req.body,
      user,
      MessageRepository,
    });
    if (!result.success) {
      return res.status(result.status).json({ message: result.errors[0] });
    }
    return res.status(200).json({
      message: 'Mensagem atualizada!',
      data: result.message,
    });
  }

  static async delete(req, res) {
    const token = getToken(req);
    const user = await getUserByToken(token);

    const result = await deleteMessage({
      id: req.params.id,
      user,
      MessageRepository,
    });
    if (!result.success) {
      return res.status(result.status).json({ message: result.errors[0] });
    }
    return res.status(200).json({ message: result.message });
  }
};