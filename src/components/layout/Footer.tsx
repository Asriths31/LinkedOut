import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border-default bg-canvas-subtle py-10">
      <div className="mx-auto max-w-[1280px] px-4 lg:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 font-semibold text-fg-default text-base mb-3">
            <span className='-mr-2 font-bold'>Linked</span>
              <img 
                src="/LinkedOut_Logo.png" 
                alt="LinkedOut Logo" 
                className="h-6 w-auto object-contain"
              />
              
            </Link>
            <p className="text-sm text-fg-muted leading-relaxed max-w-xs">
              A modern talent platform connecting developers with companies building the future.
            </p>
          </div>

          {/* Browse */}
          <div>
            <h4 className="font-semibold text-sm text-fg-default mb-3">Browse</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/jobs" className="text-sm text-fg-muted hover:text-primary hover:underline transition-colors">
                  Find Jobs
                </Link>
              </li>
              <li>
                <Link to="/companies" className="text-sm text-fg-muted hover:text-primary hover:underline transition-colors">
                  Companies
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-sm text-fg-default mb-3">Resources</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-fg-muted hover:text-primary hover:underline transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-fg-muted hover:text-primary hover:underline transition-colors">
                  API Documentation
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-sm text-fg-default mb-3">Legal</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-fg-muted hover:text-primary hover:underline transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-fg-muted hover:text-primary hover:underline transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border-default pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-fg-muted">
            &copy; {new Date().getFullYear()} LinkedOut Inc. Built with React, TypeScript &amp; MongoDB.
          </p>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
