import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useCompanies } from '../hooks/useCompanies';
import { useAuthStore } from '../../../store/authStore';
import { Building2, Star, Briefcase, Loader2, Globe, Users, ArrowRight } from 'lucide-react';

export const CompaniesPage: React.FC = () => {
  const { user } = useAuthStore();
  const { data: companies, isLoading, isError } = useCompanies();

  if (user?.role === 'Employer') {
    return <Navigate to="/employer/dashboard" replace />;
  }

  const companyList = Array.isArray(companies) ? companies : [];

  return (
    <div className="mx-auto max-w-[1280px] px-4 lg:px-6 py-8">
      {/* Page header */}
      <div className="border-b border-border-default pb-6 mb-6">
        <h1 className="text-2xl font-semibold text-fg-default mb-1">Companies</h1>
        <p className="text-sm text-fg-muted">
          Browse verified companies hiring on LinkedOut. Discover cultures, read reviews, and explore open positions.
        </p>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-fg-muted mr-2" size={20} />
          <span className="text-sm text-fg-muted">Loading companies...</span>
        </div>
      ) : isError ? (
        <div className="text-center py-20 border border-border-default rounded-md bg-canvas-subtle">
          <p className="text-sm text-fg-muted">Failed to load companies. Please try again later.</p>
        </div>
      ) : companyList.length === 0 ? (
        <div className="text-center py-20 border border-border-default rounded-md bg-canvas-subtle">
          <Building2 className="mx-auto text-fg-subtle mb-3" size={32} />
          <h2 className="text-base font-semibold text-fg-default mb-1">No companies yet</h2>
          <p className="text-sm text-fg-muted mb-4">Be the first employer to register your company profile.</p>
          <Link to="/register" className="btn-primary">
            Register as Employer
          </Link>
        </div>
      ) : (
        <div className="space-y-0 border border-border-default rounded-md overflow-hidden">
          {companyList.map((company: any, idx: number) => (
            <div
              key={company._id}
              className={`flex items-center gap-4 px-4 py-4 bg-white hover:bg-canvas-subtle transition-colors ${
                idx < companyList.length - 1 ? 'border-b border-border-default' : ''
              }`}
            >
              {/* Company Logo */}
              <div className="h-12 w-12 rounded-md border border-border-default bg-canvas-subtle flex items-center justify-center overflow-hidden flex-shrink-0">
                {company.logo ? (
                  <img src={company.logo} alt={company.name} className="h-full w-full object-cover" />
                ) : (
                  <Building2 size={20} className="text-fg-subtle" />
                )}
              </div>

              {/* Company Info */}
              <div className="flex-grow min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    to={`/companies/${company._id}`}
                    className="text-base font-semibold text-primary hover:underline"
                  >
                    {company.name}
                  </Link>
                  {company.ratings?.count > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs text-fg-muted">
                      <Star size={12} className="text-amber-500 fill-amber-500" />
                      {company.ratings.average.toFixed(1)}
                    </span>
                  )}
                </div>
                <p className="text-sm text-fg-muted line-clamp-1 mt-0.5">{company.bio || 'No description provided.'}</p>

                {/* Meta info */}
                <div className="flex items-center gap-4 mt-1.5 text-xs text-fg-subtle">
                  {company.website && (
                    <a
                      href={company.website}
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 hover:text-primary transition-colors"
                      data-tooltip="Visit website"
                    >
                      <Globe size={12} />
                      <span>Website</span>
                    </a>
                  )}
                  {company.benefits && company.benefits.length > 0 && (
                    <span className="inline-flex items-center gap-1">
                      <Briefcase size={12} />
                      {company.benefits.length} benefits
                    </span>
                  )}
                  {company.ratings?.count > 0 && (
                    <span className="inline-flex items-center gap-1">
                      <Users size={12} />
                      {company.ratings.count} reviews
                    </span>
                  )}
                </div>
              </div>

              {/* CTA */}
              <Link
                to={`/companies/${company._id}`}
                className="flex-shrink-0 btn-secondary !py-1.5 !px-3 !text-xs"
              >
                View profile
                <ArrowRight size={12} />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default CompaniesPage;
