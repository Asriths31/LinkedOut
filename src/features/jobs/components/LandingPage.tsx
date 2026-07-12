import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useJobs, useAutocomplete } from '../hooks/useJobs';
import { useCompanies } from '../../companies/hooks/useCompanies';
import {
  Search,
  MapPin,
  ArrowRight,
  Code2,
  Palette,
  Megaphone,
  Briefcase,
  Layers,
  Building2,
  DollarSign,
  Loader2,
  Calendar,
} from 'lucide-react';

const CATEGORIES = [
  { id: 'tech', label: 'Engineering', count: '1.2k+ jobs', icon: Code2 },
  { id: 'design', label: 'Design & Creative', count: '850+ jobs', icon: Palette },
  { id: 'marketing', label: 'Marketing', count: '480+ jobs', icon: Megaphone },
  { id: 'product', label: 'Product Management', count: '320+ jobs', icon: Layers },
];

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchVal, setSearchVal] = useState('');
  const [locVal, setLocVal] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { data: jobsData, isLoading: jobsLoading } = useJobs({ limit: 4, sort: '-createdAt' });
  const { data: companies, isLoading: companiesLoading } = useCompanies();
  const { data: suggestions } = useAutocomplete(searchVal);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/jobs?search=${encodeURIComponent(searchVal)}&location=${encodeURIComponent(locVal)}`);
  };

  const handleSuggestionClick = (title: string) => {
    setSearchVal(title);
    setDropdownOpen(false);
    navigate(`/jobs?search=${encodeURIComponent(title)}&location=${encodeURIComponent(locVal)}`);
  };

  const featuredJobs = jobsData?.data || [];
  const topCompanies = companies?.slice(0, 5) || [];

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="border-b border-border-default bg-canvas-subtle">
        <div className="mx-auto max-w-[1280px] px-4 lg:px-6 pt-16 pb-14 text-center">
          <h1 className="max-w-3xl mx-auto text-4xl sm:text-5xl font-bold text-fg-default leading-tight mb-4">
            Find your next role in <span className="text-primary">tech</span>
          </h1>

          <p className="max-w-xl mx-auto text-base text-fg-muted mb-8 leading-relaxed">
            Search verified positions, get ATS compatibility scores, and apply with custom screening questionnaires — all in one place.
          </p>

          {/* Search bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="relative w-full max-w-2xl mx-auto flex flex-col md:flex-row gap-0 border border-border-default rounded-md bg-white shadow-sm overflow-visible"
          >
            <div className="flex-1 flex items-center gap-2 px-3 py-2 border-b md:border-b-0 md:border-r border-border-default">
              <Search className="text-fg-subtle flex-shrink-0" size={16} />
              <input
                type="text"
                value={searchVal}
                onChange={(e) => {
                  setSearchVal(e.target.value);
                  setDropdownOpen(true);
                }}
                onBlur={() => setTimeout(() => setDropdownOpen(false), 200)}
                placeholder="Title, skills, keywords…"
                className="w-full bg-transparent border-0 outline-none text-sm text-fg-default placeholder:text-fg-subtle"
              />
            </div>

            {/* Autocomplete */}
            {dropdownOpen && suggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-border-default rounded-md shadow-lg z-30 text-left overflow-hidden">
                {suggestions.map((suggestion: string, idx: number) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full px-4 py-2.5 text-sm text-fg-default hover:bg-canvas-subtle border-b border-border-muted last:border-b-0 flex items-center gap-2"
                  >
                    <Search size={13} className="text-fg-subtle" />
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            <div className="flex-1 flex items-center gap-2 px-3 py-2">
              <MapPin className="text-fg-subtle flex-shrink-0" size={16} />
              <input
                type="text"
                value={locVal}
                onChange={(e) => setLocVal(e.target.value)}
                placeholder="City or Remote…"
                className="w-full bg-transparent border-0 outline-none text-sm text-fg-default placeholder:text-fg-subtle"
              />
            </div>

            <button type="submit" className="btn-primary rounded-none md:rounded-r-md md:rounded-l-none !rounded-b-md md:!rounded-b-none !border-0">
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-[1280px] px-4 lg:px-6 py-10">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-fg-default mb-1">Popular categories</h2>
          <p className="text-sm text-fg-muted">Explore opportunities across key disciplines</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.id}
                className="flex items-center gap-3 p-4 border border-border-default rounded-md bg-white hover:border-[#afb8c1] hover:shadow-sm transition-all cursor-pointer"
                onClick={() => navigate(`/jobs?search=${cat.label}`)}
              >
                <div className="p-2 rounded-md bg-canvas-subtle border border-border-muted">
                  <Icon size={18} className="text-fg-muted" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-fg-default">{cat.label}</h3>
                  <p className="text-xs text-fg-muted">{cat.count}</p>
                </div>
              </div>
            );
          })}
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

      {/* Featured Jobs */}
      <section className="mx-auto max-w-[1280px] px-4 lg:px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-fg-default mb-1">Recent openings</h2>
            <p className="text-sm text-fg-muted">Fresh listings from verified employers</p>
          </div>
          <Link to="/jobs" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {jobsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-36 rounded-md bg-canvas-subtle border border-border-default animate-pulse" />
            ))}
          </div>
        ) : featuredJobs.length === 0 ? (
          <div className="text-center py-16 border border-border-default rounded-md bg-canvas-subtle">
            <Briefcase className="mx-auto text-fg-subtle mb-2" size={28} />
            <p className="text-sm text-fg-muted">No active listings found.</p>
          </div>
        ) : (
          <div className="border border-border-default rounded-md overflow-hidden">
            {featuredJobs.map((job: any, idx: number) => (
              <div
                key={job._id}
                className={`flex items-center gap-4 px-4 py-4 bg-white hover:bg-canvas-subtle transition-colors ${
                  idx < featuredJobs.length - 1 ? 'border-b border-border-default' : ''
                }`}
              >
                <div className="h-10 w-10 rounded-md bg-canvas-subtle border border-border-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                  {job.company?.logo ? (
                    <img src={job.company.logo} alt={job.company.name} className="h-full w-full object-cover" />
                  ) : (
                    <Building2 size={16} className="text-fg-subtle" />
                  )}
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2">
                    <Link to={`/jobs/${job._id}`} className="text-sm font-semibold text-primary hover:underline truncate">
                      {job.title}
                    </Link>
                    <span className="label-open">{job.remoteType}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-fg-muted">
                    <span>{job.company?.name}</span>
                    <span className="inline-flex items-center gap-1"><MapPin size={11} />{job.location}</span>
                    {job.salaryRange && (
                      <span className="inline-flex items-center gap-1">
                        <DollarSign size={11} />
                        {(job.salaryRange.min / 1000).toFixed(0)}k–{(job.salaryRange.max / 1000).toFixed(0)}k
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1">
                      <Calendar size={11} />
                      {new Date(job.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
                <Link to={`/jobs/${job._id}`} className="flex-shrink-0 btn-secondary !py-1.5 !px-3 !text-xs">
                  View
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
export default LandingPage;
