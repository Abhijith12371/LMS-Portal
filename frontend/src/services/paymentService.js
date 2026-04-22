import api from './api';

const paymentService = {
  createCheckout: (data)  => api.post('/payments/checkout', data).then((r) => r.data),
  getMyPayments:  ()      => api.get('/payments/my').then((r) => r.data),
  getAllPayments:  (params) => api.get('/payments', { params }).then((r) => r.data),
};

export default paymentService;
