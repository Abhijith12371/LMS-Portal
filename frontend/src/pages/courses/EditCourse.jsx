import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import courseService from '../../services/courseService';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiUpload, FiPlus, FiX, FiTrash2, FiPlusCircle } from 'react-icons/fi';

export default function EditCourse() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [course,   setCourse]   = useState(null);
  const [saving,   setSaving]   = useState(false);
  const [newSection, setNewSection] = useState('');
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    courseService.getCourseById(id)
      .then((d) => setCourse(d.course))
      .finally(() => setLoading(false));
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData();
    ['title','description','shortDescription','category','level','price','language'].forEach((k) => {
      if (course[k] !== undefined) fd.append(k, course[k]);
    });
    try {
      await courseService.updateCourse(id, fd);
      toast.success('Course updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update course.');
    } finally { setSaving(false); }
  };

  const handlePublish = async () => {
    try {
      const result = await courseService.publishCourse(id);
      setCourse((c) => ({ ...c, isPublished: result.isPublished }));
      toast.success(result.message);
    } catch { toast.error('Failed to toggle publish status.'); }
  };

  const handleAddSection = async () => {
    if (!newSection.trim()) return;
    // In a full implementation, this calls /api/sections
    // For now we show the UI scaffold
    toast.success(`Section "${newSection}" added (connect /api/sections)`);
    setNewSection('');
  };

  if (loading || !course) return (
    <div className="container-lms pt-24 flex items-center justify-center min-h-screen">
      <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="container-lms pt-24 pb-16 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-fade-in">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="btn-secondary p-2.5">
            <FiArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-white">Edit <span className="gradient-text">Course</span></h1>
            <p className="text-slate-500 text-sm line-clamp-1 mt-0.5">{course.title}</p>
          </div>
        </div>
        <button
          onClick={handlePublish}
          className={course.isPublished ? 'btn-secondary border-emerald-500 text-emerald-400' : 'btn-primary'}
        >
          {course.isPublished ? '✓ Published' : 'Publish Course'}
        </button>
      </div>

      <form onSubmit={handleUpdate} className="space-y-6 animate-slide-up">
        {/* Basic Info */}
        <div className="glass p-6 space-y-4">
          <h2 className="text-lg font-bold text-white border-b border-white/10 pb-3">Course Information</h2>
          <div>
            <label className="label">Title</label>
            <input value={course.title} onChange={(e) => setCourse((c) => ({...c, title: e.target.value}))} className="input text-lg" />
          </div>
          <div>
            <label className="label">Short Description</label>
            <input value={course.shortDescription || ''} onChange={(e) => setCourse((c) => ({...c, shortDescription: e.target.value}))} className="input" />
          </div>
          <div>
            <label className="label">Full Description</label>
            <textarea value={course.description} onChange={(e) => setCourse((c) => ({...c, description: e.target.value}))}
              rows={5} className="input resize-y" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Price ($)', key: 'price', type: 'number' },
              { label: 'Language', key: 'language', type: 'text' },
            ].map(({ label, key, type }) => (
              <div key={key}>
                <label className="label">{label}</label>
                <input type={type} value={course[key] || ''} onChange={(e) => setCourse((c) => ({...c, [key]: type==='number'?Number(e.target.value):e.target.value}))} className="input" />
              </div>
            ))}
          </div>
        </div>

        {/* Curriculum */}
        <div className="glass p-6 space-y-4">
          <h2 className="text-lg font-bold text-white border-b border-white/10 pb-3">Course Curriculum</h2>

          {(course.sections || []).map((section) => (
            <div key={section._id} className="glass p-4 rounded-xl">
              <p className="text-white font-semibold mb-3">{section.title}</p>
              <div className="space-y-2 ml-4">
                {(section.lectures || []).map((lecture) => (
                  <div key={lecture._id} className="flex items-center gap-2 text-sm text-slate-400">
                    <span className="w-4 h-4 rounded-full border border-slate-600 shrink-0" />
                    {lecture.title}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Add section */}
          <div className="flex gap-2">
            <input value={newSection} onChange={(e) => setNewSection(e.target.value)}
              placeholder="New section title" className="input flex-1" />
            <button type="button" onClick={handleAddSection} className="btn-outline px-4">
              <FiPlus /> Add
            </button>
          </div>
        </div>

        <div className="flex gap-4 justify-end">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary px-10">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
