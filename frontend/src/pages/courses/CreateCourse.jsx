import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import courseService from '../../services/courseService';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiUpload, FiPlus, FiX } from 'react-icons/fi';

const CATEGORIES = [
  'Web Development','Mobile Development','Data Science','Machine Learning',
  'DevOps','Cloud Computing','Cybersecurity','Design','Business','Marketing','Other',
];
const LEVELS = ['Beginner','Intermediate','Advanced','All Levels'];

export default function CreateCourse() {
  const navigate = useNavigate();
  const [form, setForm]         = useState({
    title: '', description: '', shortDescription: '', category: '',
    level: 'All Levels', price: 0, language: 'English',
    learningOutcomes: [''], requirements: [''], tags: '',
  });
  const [thumbnail, setThumbnail] = useState(null);
  const [preview,   setPreview]   = useState(null);
  const [saving,    setSaving]    = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleThumb = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setThumbnail(file);
    setPreview(URL.createObjectURL(file));
  };

  const addOutcome = ()   => set('learningOutcomes', [...form.learningOutcomes, '']);
  const addReq     = ()   => set('requirements',     [...form.requirements, '']);
  const removeOutcome = (i) => set('learningOutcomes', form.learningOutcomes.filter((_,idx)=>idx!==i));
  const removeReq     = (i) => set('requirements',     form.requirements.filter((_,idx)=>idx!==i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.category) {
      return toast.error('Please fill in Title, Description, and Category.');
    }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'learningOutcomes' || k === 'requirements') {
          v.forEach((item) => { if (item.trim()) fd.append(k, item.trim()); });
        } else if (k === 'tags') {
          v.split(',').map((t) => t.trim()).filter(Boolean).forEach((t) => fd.append('tags', t));
        } else {
          fd.append(k, v);
        }
      });
      if (thumbnail) fd.append('thumbnail', thumbnail);

      const result = await courseService.createCourse(fd);
      toast.success('Course created! 🎉');
      navigate(`/instructor/courses/${result.course._id}/edit`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create course.');
    } finally { setSaving(false); }
  };

  return (
    <div className="container-lms pt-24 pb-16 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 animate-fade-in">
        <button onClick={() => navigate(-1)} className="btn-secondary p-2.5">
          <FiArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-3xl font-extrabold text-white">Create New <span className="gradient-text">Course</span></h1>
          <p className="text-slate-400 text-sm mt-1">Fill in the details to publish your course</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 animate-slide-up">
        {/* Basic Info */}
        <div className="glass p-6 space-y-5">
          <h2 className="text-lg font-bold text-white border-b border-white/10 pb-3">Basic Information</h2>

          <div>
            <label className="label">Course Title *</label>
            <input value={form.title} onChange={(e) => set('title', e.target.value)}
              placeholder="e.g. Complete React Developer Course" className="input text-lg" />
          </div>

          <div>
            <label className="label">Short Description</label>
            <input value={form.shortDescription} onChange={(e) => set('shortDescription', e.target.value)}
              placeholder="Brief one-liner shown in course cards" className="input" maxLength={300} />
          </div>

          <div>
            <label className="label">Full Description *</label>
            <textarea value={form.description} onChange={(e) => set('description', e.target.value)}
              rows={6} placeholder="Describe what students will learn, who this course is for…"
              className="input resize-y" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="label">Category *</label>
              <select value={form.category} onChange={(e) => set('category', e.target.value)} className="select">
                <option value="">Select…</option>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Level</label>
              <select value={form.level} onChange={(e) => set('level', e.target.value)} className="select">
                {LEVELS.map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Price ($)</label>
              <input type="number" min={0} step={0.01} value={form.price}
                onChange={(e) => set('price', Number(e.target.value))} className="input" />
            </div>
            <div>
              <label className="label">Language</label>
              <input value={form.language} onChange={(e) => set('language', e.target.value)} className="input" />
            </div>
          </div>
        </div>

        {/* Thumbnail */}
        <div className="glass p-6 space-y-4">
          <h2 className="text-lg font-bold text-white border-b border-white/10 pb-3">Course Thumbnail</h2>
          <label htmlFor="thumb-upload"
            className="flex flex-col items-center justify-center border-2 border-dashed border-white/20 rounded-2xl aspect-video max-w-md cursor-pointer hover:border-primary-500/60 transition-colors overflow-hidden">
            {preview
              ? <img src={preview} alt="Thumbnail preview" className="w-full h-full object-cover" />
              : <div className="text-center p-8">
                  <FiUpload className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">Click to upload thumbnail</p>
                  <p className="text-slate-600 text-xs mt-1">Recommended: 1280×720 JPG/PNG</p>
                </div>
            }
          </label>
          <input id="thumb-upload" type="file" accept="image/*" className="hidden" onChange={handleThumb} />
        </div>

        {/* Learning Outcomes */}
        <div className="glass p-6 space-y-4">
          <h2 className="text-lg font-bold text-white border-b border-white/10 pb-3">What Students Will Learn</h2>
          {form.learningOutcomes.map((item, i) => (
            <div key={i} className="flex gap-2">
              <input value={item}
                onChange={(e) => {
                  const arr = [...form.learningOutcomes]; arr[i] = e.target.value;
                  set('learningOutcomes', arr);
                }}
                placeholder={`Outcome ${i + 1}`} className="input flex-1" />
              {form.learningOutcomes.length > 1 && (
                <button type="button" onClick={() => removeOutcome(i)}
                  className="p-2.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                  <FiX className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addOutcome} className="btn-outline text-sm py-2">
            <FiPlus /> Add Outcome
          </button>
        </div>

        {/* Requirements */}
        <div className="glass p-6 space-y-4">
          <h2 className="text-lg font-bold text-white border-b border-white/10 pb-3">Requirements</h2>
          {form.requirements.map((item, i) => (
            <div key={i} className="flex gap-2">
              <input value={item}
                onChange={(e) => {
                  const arr = [...form.requirements]; arr[i] = e.target.value;
                  set('requirements', arr);
                }}
                placeholder={`Requirement ${i + 1}`} className="input flex-1" />
              {form.requirements.length > 1 && (
                <button type="button" onClick={() => removeReq(i)}
                  className="p-2.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                  <FiX className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addReq} className="btn-outline text-sm py-2">
            <FiPlus /> Add Requirement
          </button>
        </div>

        {/* Tags */}
        <div className="glass p-6">
          <label className="label">Tags (comma-separated)</label>
          <input value={form.tags} onChange={(e) => set('tags', e.target.value)}
            placeholder="react, javascript, web development" className="input" />
        </div>

        {/* Submit */}
        <div className="flex gap-4 justify-end">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary px-10">
            {saving ? 'Creating…' : 'Create Course'}
          </button>
        </div>
      </form>
    </div>
  );
}
