import React from 'react';
import { Link } from 'react-router-dom';
import { FiBook, FiTwitter, FiLinkedin, FiGithub, FiMail } from 'react-icons/fi';

const footerLinks = {
  Platform: [
    { label: 'Browse Courses', to: '/courses' },
    { label: 'Become Instructor', to: '/register' },
    { label: 'Pricing', to: '/courses' },
  ],
  Company: [
    { label: 'About Us', to: '/' },
    { label: 'Blog', to: '/' },
    { label: 'Careers', to: '/' },
  ],
  Support: [
    { label: 'Help Center', to: '/' },
    { label: 'Contact Us', to: '/' },
    { label: 'Privacy Policy', to: '/' },
    { label: 'Terms of Service', to: '/' },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-surface-900 mt-auto">
      <div className="container-lms py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-lg bg-primary-600">
                <FiBook className="text-white w-5 h-5" />
              </div>
              <span className="font-extrabold text-white text-xl">
                LMS<span className="text-primary-400">Portal</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              Empowering learners worldwide with expert-led courses. Build skills that matter, at your own pace.
            </p>
            <div className="flex items-center gap-3 mt-5">
              {[FiTwitter, FiLinkedin, FiGithub, FiMail].map((Icon, i) => (
                <a key={i} href="#" className="p-2 rounded-lg bg-white/5 hover:bg-primary-600/20 hover:text-primary-400 text-slate-400 transition-all duration-200">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-white font-semibold text-sm mb-4">{section}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-slate-400 hover:text-white text-sm transition-colors duration-150">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="divider mt-10 mb-6" />
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} LMS Portal. All rights reserved.</p>
          <p>Built with <span className="text-primary-400">♥</span> using MERN Stack</p>
        </div>
      </div>
    </footer>
  );
}
