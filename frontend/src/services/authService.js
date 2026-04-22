import api from './api';

const authService = {
  register:      (data)       => api.post('/auth/register', data).then((r) => r.data),
  login:         (data)       => api.post('/auth/login',    data).then((r) => r.data),
  getMe:         ()           => api.get('/auth/me').then((r) => r.data),
  forgotPassword:(data)       => api.post('/auth/forgot-password', data).then((r) => r.data),
  resetPassword: (token, data) => api.put(`/auth/reset-password/${token}`, data).then((r) => r.data),
  changePassword:(data)       => api.put('/auth/change-password', data).then((r) => r.data),
  updateProfile: (data)       => api.put('/users/profile', data).then((r) => r.data),
  uploadAvatar:  (formData)   => api.put('/users/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data),
};

export default authService;
