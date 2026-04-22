import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import couponService from '../../services/couponService';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import {
  FiUsers, FiGrid, FiTag, FiBarChart2, FiPlus, FiTrash2,
  FiEdit, FiToggleLeft, FiToggleRight,
} from 'react-icons/fi';

const LINKS = [
  { to: '/admin/dashboard', label: 'Dashboard',  icon: <FiGrid    className="w-4 h-4" /> },
  { to: '/admin/users',     label: 'Users',      icon: <FiUsers   className="w-4 h-4" /> },
  { to: '/admin/coupons',   label: 'Coupons',    icon: <FiTag     className="w-4 h-4" /> },
  { to: '/admin/analytics', label: 'Analytics',  icon: <FiBarChart2 className="w-4 h-4" /> },
];

const EMPTY = {
  code: '', discountType: 'percentage', discountValue: '', expiresAt: '',
  usageLimit: 100, minOrderValue: 0, isActive: true,
};

export default function CouponManagement() {
  const [coupons,  setCoupons]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing,  setEditing]  = useState(null);
  const [form,     setForm]     = useState(EMPTY);
  const [saving,   setSaving]   = useState(false);

  const loadCoupons = () => {
    setLoading(true);
    couponService.getAll().then((d) => setCoupons(d.coupons || [])).finally(() => setLoading(false));
  };

  useEffect(() => { loadCoupons(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setShowModal(true); };
  const openEdit   = (c) => {
    setEditing(c);
    setForm({
      code: c.code, discountType: c.discountType, discountValue: c.discountValue,
      expiresAt: format(new Date(c.expiresAt), "yyyy-MM-dd'T'HH:mm"),
      usageLimit: c.usageLimit, minOrderValue: c.minOrderValue, isActive: c.isActive,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.code || !form.discountValue || !form.expiresAt) {
      return toast.error('Please fill all required fields.');
    }
    setSaving(true);
    try {
      if (editing) {
        await couponService.update(editing._id, form);
        toast.success('Coupon updated!');
      } else {
        await couponService.create(form);
        toast.success('Coupon created!');
      }
      setShowModal(false);
      loadCoupons();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save coupon.');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Delete coupon "${code}"?`)) return;
    try {
      await couponService.deleteCoupon(id);
      toast.success('Coupon deleted');
      loadCoupons();
    } catch { toast.error('Failed to delete coupon'); }
  };

  const toggleActive = async (c) => {
    try {
      await couponService.update(c._id, { isActive: !c.isActive });
      loadCoupons();
    } catch { toast.error('Failed to update coupon'); }
  };

  return (
    <div className="container-lms pt-24 pb-16">
      <div className="flex gap-8 flex-col lg:flex-row">
        <Sidebar links={LINKS} title="Admin Menu" />

        <div className="flex-1 min-w-0 space-y-6">
          <div className="flex items-center justify-between animate-fade-in">
            <div>
              <h1 className="text-3xl font-extrabold text-white">Coupon <span className="gradient-text">Management</span></h1>
              <p className="text-slate-400 mt-1">{coupons.length} coupons</p>
            </div>
            <button onClick={openCreate} className="btn-primary">
              <FiPlus /> New Coupon
            </button>
          </div>

          <div className="glass overflow-hidden animate-fade-in">
            {loading ? (
              <div className="p-8 space-y-3">
                {Array.from({length:4}).map((_,i) => <div key={i} className="h-12 bg-surface-800 rounded-xl animate-pulse" />)}
              </div>
            ) : coupons.length === 0 ? (
              <div className="p-12 text-center">
                <FiTag className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 mb-4">No coupons yet. Create your first one!</p>
                <button onClick={openCreate} className="btn-primary">Create Coupon</button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table-lms">
                  <thead><tr>
                    <th>Code</th><th>Discount</th><th>Usage</th><th>Expires</th><th>Status</th><th>Actions</th>
                  </tr></thead>
                  <tbody>
                    {coupons.map((c) => (
                      <tr key={c._id}>
                        <td><span className="font-mono text-primary-400 font-semibold text-sm">{c.code}</span></td>
                        <td className="text-slate-300">
                          {c.discountType === 'percentage' ? `${c.discountValue}%` : `$${c.discountValue}`} off
                        </td>
                        <td className="text-slate-400 text-sm">{c.usedCount} / {c.usageLimit}</td>
                        <td className="text-slate-400 text-sm">{format(new Date(c.expiresAt), 'dd MMM yyyy')}</td>
                        <td>
                          <Badge variant={c.isValid ? 'success' : 'neutral'}>
                            {c.isValid ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <button onClick={() => openEdit(c)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
                              <FiEdit className="w-4 h-4" />
                            </button>
                            <button onClick={() => toggleActive(c)}
                              className={`p-1.5 rounded-lg transition-colors ${c.isActive ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-slate-400 hover:bg-white/10'}`}>
                              {c.isActive ? <FiToggleRight className="w-4 h-4" /> : <FiToggleLeft className="w-4 h-4" />}
                            </button>
                            <button onClick={() => handleDelete(c._id, c.code)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Coupon' : 'Create Coupon'} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Code *</label>
              <input value={form.code} onChange={(e) => setForm((f) => ({...f, code: e.target.value.toUpperCase()}))}
                placeholder="SAVE20" className="input uppercase font-mono tracking-widest" disabled={!!editing} />
            </div>
            <div>
              <label className="label">Discount Type *</label>
              <select value={form.discountType} onChange={(e) => setForm((f) => ({...f, discountType: e.target.value}))} className="select">
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed ($)</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Discount Value *</label>
              <input type="number" value={form.discountValue} onChange={(e) => setForm((f) => ({...f, discountValue: e.target.value}))}
                placeholder={form.discountType === 'percentage' ? '20' : '10'} className="input" />
            </div>
            <div>
              <label className="label">Usage Limit</label>
              <input type="number" value={form.usageLimit} onChange={(e) => setForm((f) => ({...f, usageLimit: Number(e.target.value)}))}
                className="input" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Expires At *</label>
              <input type="datetime-local" value={form.expiresAt} onChange={(e) => setForm((f) => ({...f, expiresAt: e.target.value}))}
                className="input" />
            </div>
            <div>
              <label className="label">Min Order ($)</label>
              <input type="number" value={form.minOrderValue} onChange={(e) => setForm((f) => ({...f, minOrderValue: Number(e.target.value)}))}
                className="input" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
              {saving ? 'Saving…' : editing ? 'Update Coupon' : 'Create Coupon'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
