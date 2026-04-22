import api from './api';

const courseService = {
  getCourses:        (params) => api.get('/courses', { params }).then((r) => r.data),
  getCourseById:     (id)     => api.get(`/courses/${id}`).then((r) => r.data),
  getFeaturedCourses:()       => api.get('/courses/featured').then((r) => r.data),
  getCategories:     ()       => api.get('/courses/categories').then((r) => r.data),
  getInstructorCourses:(id)   => api.get(`/courses/instructor/${id}`).then((r) => r.data),

  createCourse: (formData)    => api.post('/courses', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data),

  updateCourse: (id, formData) => api.put(`/courses/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data),

  deleteCourse:  (id)         => api.delete(`/courses/${id}`).then((r) => r.data),
  publishCourse: (id)         => api.patch(`/courses/${id}/publish`).then((r) => r.data),

  // Sections
  createSection: (data)       => api.post('/sections', data).then((r) => r.data),
  updateSection: (id, data)   => api.put(`/sections/${id}`, data).then((r) => r.data),
  deleteSection: (id)         => api.delete(`/sections/${id}`).then((r) => r.data),

  // Lectures
  createLecture: (formData)   => api.post('/lectures', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data),
  updateLecture: (id, formData) => api.put(`/lectures/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data),
  deleteLecture: (id)         => api.delete(`/lectures/${id}`).then((r) => r.data),
};

export default courseService;
