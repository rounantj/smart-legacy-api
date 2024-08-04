const axios = require('axios')
// Importando as variaveis de ambiente
require('dotenv').config()

class ShipayPayment {
  constructor(apiKey) {
    this.apiKey =
      process.env.SHIPAY_ACCESS_KEY
    this.refreshToken = null
    this.apiUrl = process.env.SHIPAY_API_URL
    this.authenticateClient()
    this.maintenanceToken()
  }
  async maintenanceToken() {
    setInterval(async () => {
      await authenticateClient()
    }, 7200000)
  }
  async authenticateClient() {
    const access_key = process.env.SHIPAY_ACCESS_KEY,
      client_id = process.env.SHIPAY_CLIENT_ID,
      secret_key = process.env.SHIPAY_SECRET_KEY
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-order-type': 'e-order',
        },
      }
      const response = await axios.post(
        `${this.apiUrl}/pdvauth`,
        { access_key, client_id, secret_key },
        config
      )
      this.apiKey = response.data.access_token
      this.refreshToken = response.data.refresh_token
      console.log({
        apiKey: this.apiKey,
        refreshToken: this.refreshToken,
      })
    } catch (error) {
      console.log('ERROR PAYMENT :', error)
    }
  }

  async refreshTokenFn() {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      }
      const response = await axios.post(
        `${this.apiUrl}/refresh`,
        { refresh_token: this.refreshToken },
        config
      )
      this.apiKey = response.data.access_token
      this.refreshToken = response.data.refresh_token
      console.log({
        apiKey: this.apiKey,
        refreshToken: this.refreshToken,
      })
    } catch (error) {
      console.log('ERROR PAYMENT :', error)
    }
  }

  async createPayment(order, res) {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'x-shipay-order-type': 'e-order',
        },
      }

      const response = await axios.post(`${this.apiUrl}/order`, order, config)

      res.send(response.data)
    } catch (error) {
      console.log('ERROR PAYMENT :', error)
      res.status(500).json({ errorMsg: 'Exceção interna' })
    }
  }

  async getPayment(id, res) {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      }

      const response = await axios.get(`${this.apiUrl}/order/${id}`, config)

      res.send(response.data)
    } catch (error) {
      console.log('ERROR PAYMENT :', error)
      res.status(500).json({ errorMsg: 'Exceção interna' })
    }
  }

  async cancelPayment(id, res) {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      }

      const response = await axios.delete(`${this.apiUrl}/order/${id}`, config)

      res.send(response.data)
    } catch (error) {
      console.log('ERROR PAYMENT :', error)
      res.status(500).json({ errorMsg: 'Exceção interna' })
    }
  }

  async capturePayment(id, amount, res) {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      }

      const response = await axios.post(
        `${this.apiUrl}/order/${id}/capture`,
        { amount },
        config
      )

      res.send(response.data)
    } catch (error) {
      console.log('ERROR PAYMENT :', error)
      res.status(500).json({ errorMsg: 'Exceção interna' })
    }
  }

  async refundPayment(id, amount, res) {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      }

      const response = await axios.delete(
        `${this.apiUrl}/order/${id}/refund`,
        config,
        { amount }
      )

      res.send(response.data)
    } catch (error) {
      console.log('ERROR PAYMENT :', error)
      res.status(500).json({ errorMsg: 'Exceção interna' })
    }
  }

  async listPaymentsByDate(start_date, end_date, res) {
    let limit = 10,
      offset = 0
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
        params: {
          start_date: start_date,
          end_date: end_date,
          limit: limit,
          offset: offset,
        },
      }

      const response = await axios.get(`${this.apiUrl}/order/list`, config)

      res.send(response.data)
    } catch (error) {
      console.log('ERROR PAYMENT :', error)
      res.status(500).json({ errorMsg: 'Exceção interna' })
    }
  }
}

module.exports = ShipayPayment
