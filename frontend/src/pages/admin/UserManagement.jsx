import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import userService from '../../services/userService';
import toast from 'react-hot-toast';
import {
  FiUsers, FiGrid, FiTag, FiBarChart2, FiSearch, FiTrash2,
  FiEdit, FiShield, FiUserX, FiX,
} from 'react-icons/fi';

const LINKS = [
  { to: '/admin/dashboard', label: 'Dashboard',  icon: <FiGrid    className="w-4 h-4" /> },
  { to: '/admin/users',     label: 'Users',      icon: <FiUsers   className="w-4 h-4" /> },
  { to: '/admin/coupons',   label: 'Coupons',    icon: <FiTag     className="w-4 h-4" /> },
  { to: '/admin/analytics', label: 'Analytics',  icon: <FiBarChart2 className="w-4 h-4" /> },
];

const ROLE_COLORS = { admin: 'danger', instructor: 'warning', student: 'primary' };

export default function UserManagement() {
  const [users,    setUsers]    = useState([]);
  const [total,    setTotal]    = useState(0);
  const [search,   setSearch]   = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page,     setPage]     = useState(1);
  const [loading,  setLoading]  = useState(true);
  const [editUser, setEditUser] = useState(null);
  const [newRole,  setNewRole]  = useState('');

  const loadUsers = () => {
    setLoading(true);
    const params = { page, limit: 15 };
    if (search)     params.search = search;
    if (roleFilter) params.role   = roleFilter;
    userService.getAllUsers(params)
      .then((d) => { setUsers(d.users || []); setTotal(d.total || 0); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadUsers(); }, [page, search, roleFilter]);

  const handleRoleUpdate = async () => {
    try {
      await userService.updateRole(editUser._id, newRole);
      toast.success(`Role updated to ${newRole}`);
      setEditUser(null);
      loadUsers();
    } catch { toast.error('Failed to update role'); }
  };

  const handleDeactivate = async (userId, name) => {
    if (!window.confirm(`Deactivate "${name}"?`)) return;
    try {
      await userService.deleteUser(userId);
      toast.success('User deactivated');
      loadUsers();
    } catch { toast.error('Failed to deactivate user'); }
  };

  return (
    <div className="container-lms pt-24 pb-16">
      <div className="flex gap-8 flex-col lg:flex-row">
        <Sidebar links={LINKS} title="Admin Menu" />

        <div className="flex-1 min-w-0 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between animate-fade-in">
            <div>
              <h1 className="text-3xl font-extrabold text-white">User <span className="gradient-text">Management</span></h1>
              <p className="text-slate-400 mt-1">{total} total users</p>
            </div>
          </div>

          {/* Filters */}
          <div className="glass p-4 flex flex-wrap gap-3 animate-slide-up">
            <div className="relative flex-1 min-w-48">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by name or email…" className="input pl-10 py-2.5 text-sm" />
            </div>
            <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }} className="select py-2.5 text-sm w-44">
              <option value="">All Roles</option>
              <option value="student">Students</option>
              <option value="instructor">Instructors</option>
              <option value="admin">Admins</option>
            </select>
            {(search || roleFilter) && (
              <button onClick={() => { setSearch(''); setRoleFilter(''); }} className="btn-secondary py-2.5 text-sm px-4">
                <FiX className="w-4 h-4" /> Clear
              </button>
            )}
          </div>

          {/* Table */}
          <div className="glass overflow-hidden animate-fade-in">
            {loading ? (
              <div className="p-8 space-y-3">
                {Array.from({length:5}).map((_,i) => <div key={i} className="h-12 bg-surface-800 rounded-xl animate-pulse" />)}
              </div>
            ) : users.length === 0 ? (
              <div className="p-12 text-center text-slate-500">No users found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table-lms">
                  <thead><tr>
                    <th>User</th><th>Role</th><th>Joined</th><th>Status</th><th>Actions</th>
                  </tr></thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id}>
                        <td>
                          <div className="flex items-center gap-3">
                            {u.avatar?.url
                              ? <img src={u.avatar.url} alt={u.name} className="w-8 h-8 rounded-full object-cover" />
                              : <div className="w-8 h-8 rounded-full bg-primary-700 flex items-center justify-center text-white text-xs font-bold shrink-0">{u.name?.[0]}</div>
                            }
                            <div>
                              <p className="text-white text-sm font-medium">{u.name}</p>
                              <p className="text-slate-500 text-xs">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td><Badge variant={ROLE_COLORS[u.role] || 'neutral'}>{u.role}</Badge></td>
                        <td className="text-slate-400 text-sm">{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td>
                          <Badge variant={u.isActive !== false ? 'success' : 'danger'}>
                            {u.isActive !== false ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <button onClick={() => { setEditUser(u); setNewRole(u.role); }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors" title="Change Role">
                              <FiShield className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDeactivate(u._id, u.name)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Deactivate">
                              <FiUserX className="w-4 h-4" />
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

      {/* Edit Role Modal */}
      <Modal isOpen={!!editUser} onClose={() => setEditUser(null)} title="Change User Role" size="sm">
        {editUser && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 p-4 glass rounded-xl">
              <div className="w-10 h-10 rounded-full bg-primary-700 flex items-center justify-center text-white font-bold">{editUser.name?.[0]}</div>
              <div>
                <p className="text-white font-medium">{editUser.name}</p>
                <p className="text-slate-500 text-sm">{editUser.email}</p>
              </div>
            </div>
            <div>
              <label className="label">New Role</label>
              <select value={newRole} onChange={(e) => setNewRole(e.target.value)} className="select">
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setEditUser(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleRoleUpdate} className="btn-primary flex-1">Update Role</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
