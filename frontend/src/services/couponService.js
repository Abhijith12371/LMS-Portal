import api from './api';

const couponService = {
  validate:     (data)   => api.post('/coupons/validate', data).then((r) => r.data),
  getAll:       ()       => api.get('/coupons').then((r) => r.data),
  create:       (data)   => api.post('/coupons', data).then((r) => r.data),
  update:       (id, data) => api.put(`/coupons/${id}`, data).then((r) => r.data),
  deleteCoupon: (id)     => api.delete(`/coupons/${id}`).then((r) => r.data),
};

export default couponService;
