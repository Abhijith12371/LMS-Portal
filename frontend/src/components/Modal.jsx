import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FiX } from 'react-icons/fi';

/**
 * Modal — accessible overlay with Escape key support.
 * Props: isOpen, onClose, title, children, size (sm|md|lg|xl)
 */
export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl',
  };

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className={`glass-dark w-full ${sizeClasses[size]} rounded-2xl shadow-card-dark animate-slide-up overflow-hidden`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
        {/* Body */}
        <div className="px-6 py-5 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
