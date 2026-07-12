import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useJobs } from '../hooks/useJobs';
import { useSavedJobsStore } from '../../../store/savedJobsStore';
import { useCartStore } from '../../../store/cartStore';
import { useAuthStore } from '../../../store/authStore';
import {
  Search,
  MapPin,
  Briefcase,
  SlidersHorizontal,
  Bookmark,
  ShoppingBag,
  Building2,
  Calendar,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  Send,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const JobsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Read URL filters
  const search = searchParams.get('search') || '';
  const location = searchParams.get('location') || '';
  const remoteType = searchParams.get('remoteType') || '';
  const jobType = searchParams.get('jobType') || '';
  const minSalary = searchParams.get('minSalary') || '';
  const sort = searchParams.get('sort') || '-createdAt';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [searchQuery, setSearchQuery] = useState(search);
  const [locationQuery, setLocationQuery] = useState(location);

  const { toggleSaveJob, isSaved } = useSavedJobsStore();
  const { addItem, items: cartItems } = useCartStore();

  const filtersPayload = {
    search,
    location,
    remoteType: remoteType || undefined,
    jobType: jobType || undefined,
    minSalary: minSalary ? parseInt(minSalary, 10) : undefined,
    sort,
    page,
    limit: 10,
    recruiterId: user?.role === 'Employer' ? user.id : undefined,
  };

  const { data: jobsResponse, isLoading } = useJobs(filtersPayload);

  useEffect(() => {
    setSearchQuery(search);
    setLocationQuery(location);
  }, [search, location]);

  const updateFilters = (newFilters: Record<string, string | number | undefined>) => {
    const current = Object.fromEntries(searchParams.entries());
    const updated: Record<string, any> = { ...current, ...newFilters, page: '1' };
    Object.keys(updated).forEach((key) => {
      if (updated[key] === undefined || updated[key] === '') {
        delete updated[key];
      }
    });
    setSearchParams(updated);
  };

  const clearAllFilters = () => {
    setSearchParams({});
    setSearchQuery('');
    setLocationQuery('');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchQuery, location: locationQuery });
  };

  const handlePageChange = (newPage: number) => {
    const current = Object.fromEntries(searchParams.entries());
    setSearchParams({ ...current, page: newPage.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = (job: any) => {
    if (cartItems.some((item) => item.jobId === job._id)) {
      toast.error('This job is already in your Apply Later cart');
      return;
    }
    addItem({
      jobId: job._id,
      jobTitle: job.title,
      companyName: job.company?.name || 'Unknown',
      companyLogo: job.company?.logo,
      location: job.location,
      deadline: job.applicationDeadline,
    });
    toast.success('Job saved to your Apply Later cart successfully');
  };

  const jobs = jobsResponse?.data || [];
  const meta = jobsResponse?.meta || { total: 0, pages: 1 };

  const hasActiveFilters = remoteType || jobType || minSalary || search || location;
  const isEmployer = user?.role === 'Employer';

  return (
    <div className="mx-auto max-w-[1280px] px-4 lg:px-6 py-6">
      {/* Search bar */}
      <form
        onSubmit={handleSearchSubmit}
        className="flex flex-col md:flex-row gap-0 border border-border-default rounded-md bg-white mb-6"
      >
        <div className="flex-1 flex items-center gap-2 px-3 py-2 border-b md:border-b-0 md:border-r border-border-default">
          <Search className="text-fg-subtle flex-shrink-0" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, skill, keyword…"
            className="w-full bg-transparent border-0 outline-none text-sm text-fg-default placeholder:text-fg-subtle"
          />
        </div>
        <div className="flex-1 flex items-center gap-2 px-3 py-2 border-b md:border-b-0 md:border-r border-border-default">
          <MapPin className="text-fg-subtle flex-shrink-0" size={16} />
          <input
            type="text"
            value={locationQuery}
            onChange={(e) => setLocationQuery(e.target.value)}
            placeholder="City or Remote…"
            className="w-full bg-transparent border-0 outline-none text-sm text-fg-default placeholder:text-fg-subtle"
          />
        </div>
        <button type="submit" className="btn-primary !rounded-none md:!rounded-r-md !border-0 !py-2">
          Search
        </button>
      </form>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ── Sidebar Filters ── */}
        <aside className="w-full lg:w-60 flex-shrink-0">
          <div className="border border-border-default rounded-md bg-white sticky top-16">
            <div className="px-4 py-3 border-b border-border-default bg-canvas-subtle rounded-t-md flex items-center justify-between">
              <h3 className="text-sm font-semibold text-fg-default flex items-center gap-1.5">
                <SlidersHorizontal size={14} />
                Filters
              </h3>
              {hasActiveFilters && (
                <button onClick={clearAllFilters} className="text-xs text-primary hover:underline font-medium flex items-center gap-0.5">
                  <X size={12} /> Clear
                </button>
              )}
            </div>

            {/* Workplace Type */}
            <div className="px-4 py-3 border-b border-border-default">
              <h4 className="text-xs font-semibold text-fg-default mb-2">Workplace</h4>
              <div className="space-y-1.5">
                {['Remote', 'Hybrid', 'On-site'].map((type) => (
                  <label
                    key={type}
                    className={`flex items-center gap-2 text-sm cursor-pointer px-2 py-1 rounded-md transition-colors duration-150 ${
                      remoteType === type ? 'bg-primary-light text-primary font-semibold' : 'text-fg-default hover:bg-canvas-subtle'
                    }`}
                    onClick={() => updateFilters({ remoteType: remoteType === type ? '' : type })}
                  >
                    <input
                      type="radio"
                      name="remoteType"
                      checked={remoteType === type}
                      onChange={() => {}}
                      className="accent-primary"
                    />
                    {type}
                  </label>
                ))}
              </div>
            </div>

            {/* Job Type */}
            <div className="px-4 py-3 border-b border-border-default">
              <h4 className="text-xs font-semibold text-fg-default mb-2">Job type</h4>
              <div className="space-y-1.5">
                {['Full-time', 'Part-time', 'Contract', 'Internship'].map((type) => (
                  <label
                    key={type}
                    className={`flex items-center gap-2 text-sm cursor-pointer px-2 py-1 rounded-md transition-colors duration-150 ${
                      jobType === type ? 'bg-primary-light text-primary font-semibold' : 'text-fg-default hover:bg-canvas-subtle'
                    }`}
                    onClick={() => updateFilters({ jobType: jobType === type ? '' : type })}
                  >
                    <input
                      type="radio"
                      name="jobType"
                      checked={jobType === type}
                      onChange={() => {}}
                      className="accent-primary"
                    />
                    {type}
                  </label>
                ))}
              </div>
            </div>

            {/* Salary */}
            <div className="px-4 py-3">
              <h4 className="text-xs font-semibold text-fg-default mb-2">Minimum salary</h4>
              <select
                value={minSalary}
                onChange={(e) => updateFilters({ minSalary: e.target.value })}
                className="input-field !py-1.5 !text-sm"
              >
                <option value="">Any</option>
                <option value="50000">$50k+</option>
                <option value="80000">$80k+</option>
                <option value="100000">$100k+</option>
                <option value="130000">$130k+</option>
                <option value="160000">$160k+</option>
              </select>
            </div>
          </div>
        </aside>

        {/* ── Main Results ── */}
        <main className="flex-grow min-w-0">
          {/* Results header */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-fg-muted">
              <span className="font-semibold text-fg-default">{meta.total}</span> jobs found
            </p>
            <select
              value={sort}
              onChange={(e) => updateFilters({ sort: e.target.value })}
              className="input-field !w-auto !py-1.5 !text-sm !pr-8"
            >
              <option value="-createdAt">Newest first</option>
              <option value="salary_desc">Salary: High → Low</option>
              <option value="salary_asc">Salary: Low → High</option>
              <option value="views">Most viewed</option>
            </select>
          </div>

          {/* Active filter pills */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mb-4">
              {search && (
                <span className="inline-flex items-center gap-1 text-xs font-medium bg-primary-light text-primary px-2.5 py-1 rounded-full">
                  "{search}"
                  <button onClick={() => updateFilters({ search: '' })} className="hover:text-primary-dark"><X size={12} /></button>
                </span>
              )}
              {location && (
                <span className="inline-flex items-center gap-1 text-xs font-medium bg-primary-light text-primary px-2.5 py-1 rounded-full">
                  <MapPin size={11} /> {location}
                  <button onClick={() => updateFilters({ location: '' })} className="hover:text-primary-dark"><X size={12} /></button>
                </span>
              )}
              {remoteType && (
                <span className="inline-flex items-center gap-1 text-xs font-medium bg-primary-light text-primary px-2.5 py-1 rounded-full">
                  {remoteType}
                  <button onClick={() => updateFilters({ remoteType: '' })} className="hover:text-primary-dark"><X size={12} /></button>
                </span>
              )}
              {jobType && (
                <span className="inline-flex items-center gap-1 text-xs font-medium bg-primary-light text-primary px-2.5 py-1 rounded-full">
                  {jobType}
                  <button onClick={() => updateFilters({ jobType: '' })} className="hover:text-primary-dark"><X size={12} /></button>
                </span>
              )}
              {minSalary && (
                <span className="inline-flex items-center gap-1 text-xs font-medium bg-primary-light text-primary px-2.5 py-1 rounded-full">
                  ${(parseInt(minSalary) / 1000)}k+
                  <button onClick={() => updateFilters({ minSalary: '' })} className="hover:text-primary-dark"><X size={12} /></button>
                </span>
              )}
            </div>
          )}

          {/* Job List */}
          <div
            className="border border-border-default rounded-md transition-opacity duration-200"
            style={{ opacity: isLoading ? 0.5 : 1 }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center py-20 bg-white">
                <Loader2 className="animate-spin text-fg-muted mr-2" size={18} />
                <span className="text-sm text-fg-muted">Loading jobs…</span>
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-20 bg-white">
                <Briefcase className="mx-auto text-fg-subtle mb-2" size={28} />
                <p className="text-sm font-semibold text-fg-default mb-1">No jobs found</p>
                <p className="text-sm text-fg-muted">Try adjusting your filters or search terms.</p>
              </div>
            ) : (
              jobs.map((job: any, idx: number) => (
                <div
                  key={job._id}
                  className={`flex items-start gap-4 px-4 py-4 bg-white hover:bg-canvas-subtle transition-colors duration-150 ${
                    idx < jobs.length - 1 ? 'border-b border-border-default' : ''
                  }`}
                >
                  {/* Logo */}
                  <div className="h-10 w-10 rounded-md border border-border-muted bg-canvas-subtle flex items-center justify-center overflow-hidden flex-shrink-0 mt-0.5">
                    {job.company?.logo ? (
                      <img src={job.company.logo} alt={job.company.name} className="h-full w-full object-cover" />
                    ) : (
                      <Building2 size={16} className="text-fg-subtle" />
                    )}
                  </div>

                  {/* Job info */}
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        to={`/jobs/${job._id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-base font-semibold text-primary hover:underline"
                      >
                        {job.title}
                      </Link>
                      <span className="label-open">{job.remoteType}</span>
                      {job.jobType && job.jobType !== 'Full-time' && (
                        <span className="text-xs font-medium text-fg-muted bg-[#e1e4e8] rounded-full px-2 py-0.5">
                          {job.jobType}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 mt-0.5 text-sm text-fg-muted">
                      {job.company && (
                        <Link to={`/companies/${job.company._id || ''}`} className="hover:text-primary hover:underline">
                          {job.company.name}
                        </Link>
                      )}
                    </div>

                    <p className="text-sm text-fg-muted line-clamp-1 mt-1">{job.description}</p>

                    {/* Meta row */}
                    <div className="flex items-center gap-4 mt-2 text-xs text-fg-subtle">
                      <span className="inline-flex items-center gap-1" data-tooltip="Location">
                        <MapPin size={12} /> {job.location}
                      </span>
                      {job.salaryRange && (
                        <span className="inline-flex items-center gap-1" data-tooltip="Salary range">
                          <DollarSign size={12} />
                          ${(job.salaryRange.min / 1000).toFixed(0)}k–${(job.salaryRange.max / 1000).toFixed(0)}k
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1" data-tooltip="Posted date">
                        <Calendar size={12} />
                        {new Date(job.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  {/* Actions — hidden for employers */}
                  {!isEmployer && (
                    <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
                      <button
                        onClick={() => navigate(`/apply/${job._id}`)}
                        className="p-1.5 rounded-md border border-primary bg-primary text-white hover:bg-primary-dark transition-colors duration-150"
                        data-tooltip="Apply now"
                      >
                        <Send size={14} />
                      </button>
                      <button
                        onClick={() => toggleSaveJob(job._id)}
                        className={`p-1.5 rounded-md border transition-colors duration-150 ${
                          isSaved(job._id)
                            ? 'border-primary bg-primary-light text-primary'
                            : 'border-border-default text-fg-subtle hover:text-fg-default hover:bg-canvas-subtle'
                        }`}
                        data-tooltip={isSaved(job._id) ? 'Unsave' : 'Save job'}
                      >
                        <Bookmark size={14} fill={isSaved(job._id) ? 'currentColor' : 'none'} />
                      </button>
                      <button
                        onClick={() => handleAddToCart(job)}
                        className="p-1.5 rounded-md border border-border-default text-fg-subtle hover:text-fg-default hover:bg-canvas-subtle transition-colors duration-150"
                        data-tooltip="Add to cart"
                      >
                        <ShoppingBag size={14} />
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {meta.pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                disabled={page <= 1}
                onClick={() => handlePageChange(page - 1)}
                className="btn-secondary !py-1.5 !px-3 disabled:opacity-40 disabled:pointer-events-none"
                data-tooltip="Previous page"
              >
                <ChevronLeft size={14} />
                Previous
              </button>
              <span className="text-sm text-fg-muted mx-3">
                Page <span className="font-semibold text-fg-default">{page}</span> of {meta.pages}
              </span>
              <button
                disabled={page >= meta.pages}
                onClick={() => handlePageChange(page + 1)}
                className="btn-secondary !py-1.5 !px-3 disabled:opacity-40 disabled:pointer-events-none"
                data-tooltip="Next page"
              >
                Next
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
export default JobsPage;
