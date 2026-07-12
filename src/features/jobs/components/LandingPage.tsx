import React from 'react';
import { Link } from 'react-router-dom';
import { useCompanies } from '../../companies/hooks/useCompanies';
import {
  Building2,
  Loader2,
} from 'lucide-react';

const ABOUT_TEXT = `LinkedOut is the next generation platform connecting top-tier technical talent with innovative companies. We streamline the hiring process with smart ATS-scoring, seamless communication, and a beautiful candidate experience.`;

export const LandingPage: React.FC = () => {
  const { data: companies, isLoading: companiesLoading } = useCompanies();

  const topCompanies = companies?.slice(0, 5) || [];

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="border-b border-border-default bg-canvas-subtle">
        <div className="mx-auto max-w-[1280px] px-4 lg:px-6 pt-16 pb-14 text-center">
          <h1 className="max-w-3xl mx-auto text-4xl sm:text-5xl font-bold text-fg-default leading-tight mb-4">
            Find your next role
          </h1>

          <p className="max-w-xl mx-auto text-base text-fg-muted mb-8 leading-relaxed">
            Search verified positions, get ATS compatibility scores, and apply with custom screening questionnaires — all in one place.
          </p>

          <div className="flex justify-center gap-4 mt-8">
            <Link to="/jobs" className="btn-primary py-2.5 px-6">
              Browse Jobs
            </Link>
            <Link to="/register" className="btn-secondary py-2.5 px-6">
              Create an Account
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="mx-auto max-w-[1280px] px-4 lg:px-6 py-16 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-fg-default mb-4">About LinkedOut</h2>
          <p className="text-fg-muted leading-relaxed text-lg">{ABOUT_TEXT}</p>
        </div>
      </section>

      {/* Verified Companies */}
      <section className="border-t border-border-default bg-canvas-subtle">
        <div className="mx-auto max-w-[1280px] px-4 lg:px-6 py-8 text-center">
          <h3 className="text-xs font-semibold text-fg-subtle uppercase tracking-wider mb-6">Verified hiring companies</h3>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {companiesLoading ? (
              <Loader2 className="animate-spin text-fg-muted" size={18} />
            ) : topCompanies.length === 0 ? (
              <p className="text-sm text-fg-muted">Register your company to appear here.</p>
            ) : (
              topCompanies.map((c: any) => (
                <Link
                  key={c._id}
                  to={`/companies/${c._id}`}
                  className="flex items-center gap-2 text-fg-muted hover:text-fg-default transition-colors"
                >
                  <div className="h-7 w-7 rounded-md bg-white border border-border-default flex items-center justify-center overflow-hidden">
                    {c.logo ? (
                      <img src={c.logo} alt={c.name} className="h-full w-full object-cover" />
                    ) : (
                      <Building2 size={14} className="text-fg-subtle" />
                    )}
                  </div>
                  <span className="font-semibold text-sm">{c.name}</span>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>


    </div>
  );
};
export default LandingPage;
