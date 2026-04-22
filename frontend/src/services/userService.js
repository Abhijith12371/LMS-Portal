import api from './api';

const userService = {
  getAllUsers:    (params)    => api.get('/users', { params }).then((r) => r.data),
  getUserById:   (id)        => api.get(`/users/${id}`).then((r) => r.data),
  getInstructors:()          => api.get('/users/instructors').then((r) => r.data),
  updateRole:    (id, role)  => api.patch(`/users/${id}/role`, { role }).then((r) => r.data),
  deleteUser:    (id)        => api.delete(`/users/${id}`).then((r) => r.data),

  // Enrollments
  getMyEnrollments:     ()          => api.get('/enrollments/my').then((r) => r.data),
  getCourseEnrollment:  (courseId)  => api.get(`/enrollments/${courseId}`).then((r) => r.data),
  updateProgress:       (courseId, data) => api.patch(`/enrollments/${courseId}/progress`, data).then((r) => r.data),
  enrollFree:           (courseId) => api.post(`/enrollments/${courseId}`).then((r) => r.data),

  // Reviews
  getCourseReviews: (courseId, params) => api.get(`/reviews/course/${courseId}`, { params }).then((r) => r.data),
  addReview:        (courseId, data)   => api.post(`/reviews/course/${courseId}`, data).then((r) => r.data),
  updateReview:     (id, data)         => api.put(`/reviews/${id}`, data).then((r) => r.data),
  deleteReview:     (id)               => api.delete(`/reviews/${id}`).then((r) => r.data),

  // Analytics
  getAdminAnalytics:      () => api.get('/analytics/admin').then((r) => r.data),
  getInstructorAnalytics: () => api.get('/analytics/instructor').then((r) => r.data),
};

export default userService;
