import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { useDispatch } from 'react-redux';
import { updateProfile } from '../../store/slices/authSlice';
import authService from '../../services/authService';
import paymentService from '../../services/paymentService';
import Sidebar from '../../components/Sidebar';
import Badge from '../../components/Badge';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import {
  FiUser, FiGrid, FiBook, FiCreditCard, FiLock,
  FiCamera, FiSave, FiMail, FiGlobe, FiTwitter, FiLinkedin,
} from 'react-icons/fi';

const LINKS = [
  { to: '/dashboard', label: 'Dashboard', icon: <FiGrid className="w-4 h-4" /> },
  { to: '/profile',   label: 'Profile',   icon: <FiUser className="w-4 h-4" /> },
  { to: '/courses',   label: 'Courses',   icon: <FiBook className="w-4 h-4" /> },
];

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [tab, setTab]         = useState('profile');
  const [form, setForm]       = useState({
    name: user?.name || '', bio: user?.bio || '',
    website: user?.website || '',
    social: { twitter: user?.social?.twitter || '', linkedin: user?.social?.linkedin || '' },
  });
  const [pwForm, setPwForm]   = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [payments, setPayments] = useState([]);
  const [saving, setSaving]   = useState(false);

  // Load payments when billing tab opens
  const handleTabChange = async (t) => {
    setTab(t);
    if (t === 'billing' && payments.length === 0) {
      paymentService.getMyPayments().then((d) => setPayments(d.payments || []));
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await dispatch(updateProfile(form));
      toast.success('Profile updated successfully!');
    } catch { toast.error('Failed to update profile.'); }
    finally { setSaving(false); }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      await authService.uploadAvatar(formData);
      toast.success('Avatar updated!');
    } catch { toast.error('Failed to upload avatar.'); }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) return toast.error('Passwords do not match.');
    if (pwForm.newPassword.length < 6) return toast.error('Password must be at least 6 characters.');
    setSaving(true);
    try {
      await authService.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed successfully!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to change password.'); }
    finally { setSaving(false); }
  };

  const TABS = [
    { id: 'profile',  label: 'Profile',  icon: <FiUser      /> },
    { id: 'security', label: 'Security', icon: <FiLock      /> },
    { id: 'billing',  label: 'Billing',  icon: <FiCreditCard/> },
  ];

  return (
    <div className="container-lms pt-24 pb-16">
      <div className="flex gap-8 flex-col lg:flex-row">
        <Sidebar links={LINKS} title="Account" />

        <div className="flex-1 min-w-0 space-y-6">
          {/* Header */}
          <div className="glass p-6 flex items-center gap-5 animate-fade-in">
            <div className="relative shrink-0">
              {user?.avatar?.url
                ? <img src={user.avatar.url} alt={user.name} className="w-20 h-20 rounded-2xl object-cover ring-2 ring-primary-500" />
                : <div className="w-20 h-20 rounded-2xl bg-primary-700 flex items-center justify-center text-white text-3xl font-bold">{user?.name?.[0]}</div>
              }
              <label htmlFor="avatar-upload" className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center cursor-pointer hover:bg-primary-500 transition-colors shadow-glow">
                <FiCamera className="w-3.5 h-3.5 text-white" />
              </label>
              <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white">{user?.name}</h1>
              <p className="text-slate-400 text-sm">{user?.email}</p>
              <Badge variant={user?.role === 'admin' ? 'danger' : user?.role === 'instructor' ? 'warning' : 'primary'} className="mt-2">
                {user?.role}
              </Badge>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-white/10 animate-fade-in">
            {TABS.map(({ id, label, icon }) => (
              <button key={id} onClick={() => handleTabChange(id)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-all border-b-2 -mb-px ${
                  tab === id ? 'border-primary-500 text-primary-400' : 'border-transparent text-slate-400 hover:text-white'
                }`}>
                {icon}{label}
              </button>
            ))}
          </div>

          {/* Profile Tab */}
          {tab === 'profile' && (
            <form onSubmit={handleProfileSave} className="glass p-6 space-y-5 animate-slide-up">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="label">Full Name</label>
                  <input value={form.name} onChange={(e) => setForm((f) => ({...f, name: e.target.value}))} className="input" />
                </div>
                <div>
                  <label className="label">Email</label>
                  <div className="relative">
                    <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input value={user?.email} disabled className="input pl-10 opacity-60 cursor-not-allowed" />
                  </div>
                </div>
              </div>
              <div>
                <label className="label">Bio</label>
                <textarea value={form.bio} onChange={(e) => setForm((f) => ({...f, bio: e.target.value}))}
                  rows={3} placeholder="Tell us about yourself…" className="input resize-none" />
              </div>
              <div>
                <label className="label">Website</label>
                <div className="relative">
                  <FiGlobe className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input value={form.website} onChange={(e) => setForm((f) => ({...f, website: e.target.value}))}
                    placeholder="https://yourwebsite.com" className="input pl-10" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="label">Twitter / X</label>
                  <div className="relative">
                    <FiTwitter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input value={form.social.twitter}
                      onChange={(e) => setForm((f) => ({...f, social: {...f.social, twitter: e.target.value}}))}
                      placeholder="@handle" className="input pl-10" />
                  </div>
                </div>
                <div>
                  <label className="label">LinkedIn</label>
                  <div className="relative">
                    <FiLinkedin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input value={form.social.linkedin}
                      onChange={(e) => setForm((f) => ({...f, social: {...f.social, linkedin: e.target.value}}))}
                      placeholder="linkedin.com/in/username" className="input pl-10" />
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <button type="submit" disabled={saving} className="btn-primary">
                  <FiSave /> {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}

          {/* Security Tab */}
          {tab === 'security' && (
            <form onSubmit={handlePasswordSave} className="glass p-6 space-y-5 animate-slide-up">
              <h2 className="text-lg font-bold text-white">Change Password</h2>
              {[
                { label: 'Current Password',  name: 'currentPassword' },
                { label: 'New Password',      name: 'newPassword'     },
                { label: 'Confirm Password',  name: 'confirmPassword' },
              ].map(({ label, name }) => (
                <div key={name}>
                  <label className="label">{label}</label>
                  <input type="password" value={pwForm[name]}
                    onChange={(e) => setPwForm((f) => ({...f, [name]: e.target.value}))}
                    placeholder="••••••••" className="input" />
                </div>
              ))}
              <div className="flex justify-end">
                <button type="submit" disabled={saving} className="btn-primary">
                  <FiLock /> {saving ? 'Updating…' : 'Update Password'}
                </button>
              </div>
            </form>
          )}

          {/* Billing Tab */}
          {tab === 'billing' && (
            <div className="glass overflow-hidden animate-slide-up">
              <div className="px-6 py-4 border-b border-white/10">
                <h2 className="text-lg font-bold text-white">Payment History</h2>
              </div>
              {payments.length === 0 ? (
                <div className="p-12 text-center text-slate-500">No payments yet</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table-lms">
                    <thead><tr><th>Course</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
                    <tbody>
                      {payments.map((p) => (
                        <tr key={p._id}>
                          <td className="text-slate-300 text-sm">{p.course?.title || 'N/A'}</td>
                          <td className="text-white font-semibold">${p.paidAmount?.toFixed(2)}</td>
                          <td><Badge variant={p.status === 'completed' ? 'success' : p.status === 'failed' ? 'danger' : 'warning'}>{p.status}</Badge></td>
                          <td className="text-slate-400 text-sm">{format(new Date(p.createdAt), 'dd MMM yyyy')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
