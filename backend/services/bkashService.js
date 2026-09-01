


// backend/src/services/bkashService.js
import axios from 'axios';

class BkashService {
  constructor() {
    this.baseURL = process.env.BKASH_BASE_URL || 'https://tokenized.sandbox.bka.sh/v2';
    this.appKey = process.env.BKASH_APP_KEY;
    this.appSecret = process.env.BKASH_APP_SECRET;
    this.username = process.env.BKASH_USERNAME;
    this.password = process.env.BKASH_PASSWORD;
    this.token = null;
    this.tokenExpiry = null;
  }

  // ✅ Get bKash Token
  async getToken() {
    try {
      // Check if token is still valid
      if (this.token && this.tokenExpiry && Date.now() < this.tokenExpiry) {
        return this.token;
      }

      console.log('🔑 Getting bKash token...');

      const response = await axios.post(
        `${this.baseURL}/tokenized/checkout/token/grant`,
        {
          app_key: this.appKey,
          app_secret: this.appSecret
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-APP-Key': this.appKey
          }
        }
      );

      if (response.data && response.data.id_token) {
        this.token = response.data.id_token;
        // Token expires in 3600 seconds (1 hour)
        this.tokenExpiry = Date.now() + (response.data.expires_in || 3600) * 1000;
        console.log('✅ bKash token obtained successfully');
        return this.token;
      } else {
        throw new Error('Failed to get bKash token');
      }
    } catch (error) {
      console.error('❌ bKash token error:', error.response?.data || error.message);
      throw new Error('Unable to authenticate with bKash');
    }
  }

  // ✅ Create bKash Payment
  async createPayment(orderId, amount, customerReference) {
    try {
      const token = await this.getToken();

      const payload = {
        mode: '0011',
        payerReference: customerReference || 'CUSTOMER',
        callbackURL: process.env.BKASH_CALLBACK_URL || 'http://localhost:5000/api/payments/bkash/callback',
        amount: amount.toString(),
        currency: 'BDT',
        intent: 'sale',
        merchantInvoiceNumber: `INV-${orderId.slice(-8)}`
      };

      console.log('📤 Creating bKash payment:', payload);

      const response = await axios.post(
        `${this.baseURL}/tokenized/checkout/create`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': token,
            'X-APP-Key': this.appKey
          }
        }
      );

      if (response.data && response.data.paymentID) {
        console.log('✅ bKash payment created:', response.data.paymentID);
        return {
          success: true,
          paymentID: response.data.paymentID,
          bkashURL: response.data.bkashURL,
          paymentUrl: response.data.bkashURL
        };
      } else {
        throw new Error('Payment creation failed');
      }
    } catch (error) {
      console.error('❌ bKash create payment error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.errorMessage || 'Failed to create bKash payment');
    }
  }

  // ✅ Execute bKash Payment
  async executePayment(paymentID) {
    try {
      const token = await this.getToken();

      const response = await axios.post(
        `${this.baseURL}/tokenized/checkout/execute`,
        {
          paymentID: paymentID
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': token,
            'X-APP-Key': this.appKey
          }
        }
      );

      if (response.data && response.data.transactionStatus === 'Completed') {
        console.log('✅ bKash payment executed:', response.data);
        return {
          success: true,
          transactionId: response.data.trxID,
          paymentId: response.data.paymentID,
          amount: response.data.amount,
          status: response.data.transactionStatus
        };
      } else {
        throw new Error(response.data?.statusMessage || 'Payment execution failed');
      }
    } catch (error) {
      console.error('❌ bKash execute payment error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.errorMessage || 'Failed to execute bKash payment');
    }
  }

  // ✅ Query bKash Payment
  async queryPayment(paymentID) {
    try {
      const token = await this.getToken();

      const response = await axios.post(
        `${this.baseURL}/tokenized/checkout/payment/status`,
        {
          paymentID: paymentID
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': token,
            'X-APP-Key': this.appKey
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('❌ bKash query payment error:', error.response?.data || error.message);
      throw new Error('Failed to query bKash payment');
    }
  }
}

// Export singleton instance
const bkashService = new BkashService();
export default bkashService;