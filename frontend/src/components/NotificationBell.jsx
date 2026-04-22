import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  fetchNotifications, markAllRead, markOneRead, removeNotification,
} from '../store/slices/notificationSlice';
import { FiBell, FiCheck, FiTrash2, FiX } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationBell() {
  const dispatch     = useDispatch();
  const navigate     = useNavigate();
  const [open, setOpen] = useState(false);
  const panelRef     = useRef(null);
  const { list, unreadCount } = useSelector((s) => s.notifications);

  useEffect(() => { dispatch(fetchNotifications()); }, [dispatch]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleClick = async (n) => {
    await dispatch(markOneRead(n._id));
    if (n.link) navigate(n.link);
    setOpen(false);
  };

  const typeIcons = {
    enrollment:     '🎓',
    payment:        '💳',
    course_published:'📢',
    new_review:     '⭐',
    new_student:    '👤',
    announcement:   '📣',
    system:         '🔔',
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
        aria-label="Notifications"
      >
        <FiBell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary-600 text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 glass-dark rounded-2xl shadow-card-dark overflow-hidden animate-slide-up z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <h3 className="font-semibold text-white text-sm">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={() => dispatch(markAllRead())}
                  className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1"
                >
                  <FiCheck className="w-3.5 h-3.5" /> Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-white">
                <FiX className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto">
            {list.length === 0 ? (
              <div className="py-10 text-center text-slate-500 text-sm">No notifications yet</div>
            ) : (
              list.map((n) => (
                <div
                  key={n._id}
                  className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-white/5 border-b border-white/5 transition-colors ${
                    !n.isRead ? 'bg-primary-600/5' : ''
                  }`}
                  onClick={() => handleClick(n)}
                >
                  <span className="text-lg">{typeIcons[n.type] || '🔔'}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${!n.isRead ? 'text-white' : 'text-slate-300'} leading-snug`}>
                      {n.title}
                    </p>
                    <p className="text-xs text-slate-500 line-clamp-1">{n.message}</p>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  {!n.isRead && <div className="w-2 h-2 rounded-full bg-primary-500 mt-1.5 shrink-0" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
