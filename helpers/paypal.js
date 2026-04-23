const { Client, Environment, OrdersController } = require('@paypal/paypal-server-sdk')

const client = new Client({
   clientCredentialsAuthCredentials : {
      oAuthClientId : 'AUl5Q4uG6z1lIzswdrB_RRSSW5rVjSkWSz3M9mQugT9pPDRlpCgbfmwD3T1bzhu4qtf4ykgGFRt4ciVF',
      oAuthClientSecret : 'EK5HmlCYIWl94OIVpuxDLwXIi6IjyhdjkBiGrBkEPZXKb2gi9_EwdwK6u5TYZ1T0MV_NLQh_Yz30sdGD'
   },
   environment : Environment.Sandbox
})

const ordersController = new OrdersController(client)

module.exports = ordersController