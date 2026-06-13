
class IPaymentGateway {
  
  async charge({ amount, currency }) {
    throw new Error('Método charge não implementado')
  }
}

module.exports = { IPaymentGateway }