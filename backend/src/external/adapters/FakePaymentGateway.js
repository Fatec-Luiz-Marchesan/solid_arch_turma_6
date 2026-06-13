
const { IPaymentGateway } = require('../../domain/repositories/IPaymentGateway')


class FakePaymentGateway extends IPaymentGateway {
  async charge({ amount, currency }) {
    if (amount > 0) {
      return {
        approved: true,
        transactionId: `tx-${Date.now()}`,
        currency,
      }
    }
    return { approved: false }
  }
}

module.exports = { FakePaymentGateway }