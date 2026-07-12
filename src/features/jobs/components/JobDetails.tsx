import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useJobDetails, useJobs } from '../hooks/useJobs';
import { useSavedJobsStore } from '../../../store/savedJobsStore';
import { useCartStore } from '../../../store/cartStore';
import { useAuthStore } from '../../../store/authStore';
import {
  MapPin,
  Calendar,
  DollarSign,
  Building2,
  Bookmark,
  ShoppingBag,
  Send,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Loader2,
  Clock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export const JobDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Queries
  const { data: job, isLoading, isError } = useJobDetails(id);
  const { data: similarJobsData } = useJobs({
    companyId: job?.company?._id,
    limit: 3,
  });

  // Stores
  const { toggleSaveJob, isSaved } = useSavedJobsStore();
  const { addItem, items: cartItems } = useCartStore();

  // FAQ Accordion State
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(null);

  const handleAddToCart = () => {
    if (!job) return;
    const isAlreadyInCart = cartItems.some((item) => item.jobId === job._id);
    if (isAlreadyInCart) {
      toast.error('This job is already in your Apply Later cart');
      return;
    }

    addItem({
      jobId: job._id,
      jobTitle: job.title,
      companyName: job.company?.name || 'Unknown Company',
      companyLogo: job.company?.logo,
      location: job.location,
      deadline: job.applicationDeadline,
    });
    toast.success('Job saved to your Apply Later cart successfully');
  };

  if (isLoading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center">
        <Loader2 className="animate-spin text-primary mb-2" size={36} />
        <p className="text-sm text-fg-muted">Loading position details...</p>
      </div>
    );
  }

  if (isError || !job) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h2 className="text-2xl font-semibold text-fg-default mb-2">Details Unavailable</h2>
        <p className="text-sm text-fg-muted mb-6">The requested position was not found or has been closed.</p>
        <Link to="/jobs" className="btn-primary py-2.5">
          Back to Listings
        </Link>
      </div>
    );
  }

  const similarJobs = similarJobsData?.data?.filter((j: any) => j._id !== job._id) || [];
  const saved = isSaved(job._id);
  const isEmployer = user?.role === 'Employer';

  return (
    <div className="mx-auto max-w-[1280px] px-4 lg:px-6 py-8">
      <Link to="/jobs" className="inline-flex items-center gap-1.5 text-xs font-semibold text-fg-muted hover:text-fg-default mb-6 transition-colors">
        <ArrowLeft size={14} />
        Back to Listings
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Job details column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="border border-border-default rounded-md bg-white p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-md bg-canvas-subtle border border-border-default flex items-center justify-center overflow-hidden">
                  {job.company?.logo ? (
                    <img src={job.company.logo} alt={job.company.name} className="h-full w-full object-cover" />
                  ) : (
                    <Building2 size={24} className="text-fg-subtle" />
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-fg-default leading-tight">
                    {job.title}
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-medium text-fg-muted">{job.company?.name}</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-border-default"></span>
                    <div className="flex items-center gap-0.5">
                      <MapPin size={12} className="text-fg-subtle" />
                      <span className="text-xs text-fg-muted">{job.location}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="label-open">
                  {job.remoteType}
                </span>
                <span className="text-xs font-medium text-fg-muted bg-canvas-subtle border border-border-default rounded-full px-2.5 py-0.5">
                  {job.jobType}
                </span>
              </div>
            </div>

            {/* Spec Details bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-border-default mt-6 pt-6 text-center">
              <div>
                <p className="text-xs font-semibold text-fg-subtle">Base Salary</p>
                <p className="text-sm font-semibold text-fg-default mt-1 flex items-center justify-center gap-0.5">
                  <DollarSign size={14} className="text-success" />
                  ${(job.salaryRange?.min / 1000).toFixed(0)}k - ${(job.salaryRange?.max / 1000).toFixed(0)}k
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-fg-subtle">Views</p>
                <p className="text-sm font-semibold text-fg-default mt-1">{job.views}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-fg-subtle">Applicants</p>
                <p className="text-sm font-semibold text-fg-default mt-1">{job.applicantsCount}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-fg-subtle">Posted</p>
                <p className="text-sm font-semibold text-fg-default mt-1 flex items-center justify-center gap-1">
                  <Calendar size={14} />
                  {new Date(job.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>
          </div>

          {/* Job Description */}
          <div className="border border-border-default rounded-md bg-white p-6">
            <h2 className="text-base font-semibold text-fg-default mb-4">Job Description</h2>
            <div className="text-sm text-fg-muted leading-relaxed space-y-4 whitespace-pre-line">
              {job.description}
            </div>
          </div>

          {/* Requirements list */}
          <div className="border border-border-default rounded-md bg-white p-6">
            <h2 className="text-base font-semibold text-fg-default mb-4">Core Requirements</h2>
            <ul className="space-y-2.5">
              {job.requirements.map((req: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm text-fg-muted">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary text-xs font-bold">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{req}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* FAQs Accordion */}
          {job.FAQs && job.FAQs.length > 0 && (
            <div className="border border-border-default rounded-md bg-white p-6">
              <h2 className="text-base font-semibold text-fg-default mb-4 flex items-center gap-2">
                <HelpCircle size={18} className="text-primary" />
                Frequently Asked Questions
              </h2>
              <div className="space-y-2">
                {job.FAQs.map((faq: any, idx: number) => {
                  const isOpen = openFaqIdx === idx;
                  return (
                    <div key={idx} className="border border-border-default rounded-md overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                        className="w-full flex items-center justify-between p-4 text-left font-semibold text-sm text-fg-default hover:bg-canvas-subtle transition-colors"
                      >
                        <span>{faq.question}</span>
                        {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      </button>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            className="overflow-hidden"
                          >
                            <p className="p-4 border-t border-border-default text-sm text-fg-muted leading-relaxed bg-canvas-subtle">
                              {faq.answer}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Actions Column */}
        <div className="lg:col-span-1 space-y-6">
          {/* Action Card */}
          {!isEmployer && (
            <div className="border border-border-default rounded-md bg-white p-6 space-y-4">
              <button
                onClick={() => navigate(`/apply/${job._id}`)}
                className="w-full btn-primary flex items-center justify-center gap-2 py-2.5"
              >
                <span>Apply Now</span>
                <Send size={16} />
              </button>

              <div className="grid grid-cols-2 gap-3">
                {/* Bookmark */}
                <button
                  onClick={() => toggleSaveJob(job._id)}
                  className={`w-full py-2 rounded-md border flex items-center justify-center gap-1.5 text-xs font-semibold transition-all duration-200 ${
                    saved
                      ? 'border-primary bg-primary-light text-primary'
                      : 'border-border-default text-fg-muted hover:bg-canvas-subtle'
                  }`}
                >
                  <Bookmark size={14} fill={saved ? 'currentColor' : 'none'} />
                  <span>{saved ? 'Bookmarked' : 'Save Job'}</span>
                </button>

                {/* Apply Later Cart */}
                <button
                  onClick={handleAddToCart}
                  className="w-full py-2 rounded-md border border-border-default text-fg-muted hover:bg-canvas-subtle hover:text-primary transition-all duration-200 flex items-center justify-center gap-1.5 text-xs font-semibold"
                >
                  <ShoppingBag size={14} />
                  <span>Apply Later</span>
                </button>
              </div>

              {/* Deadline status */}
              {job.applicationDeadline && (
                <div className="flex items-center gap-2 justify-center text-xs text-fg-subtle font-medium pt-2">
                  <Clock size={12} />
                  <span>
                    Deadline:{' '}
                    {new Date(job.applicationDeadline).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Recruiter / Company Details Card */}
          <div className="border border-border-default rounded-md bg-white p-6">
            <h3 className="text-xs font-semibold text-fg-subtle uppercase tracking-wider mb-4">Employer Context</h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-md bg-canvas-subtle flex items-center justify-center border border-border-default overflow-hidden">
                {job.company?.logo ? (
                  <img src={job.company.logo} alt={job.company.name} className="h-full w-full object-cover" />
                ) : (
                  <Building2 size={18} className="text-fg-subtle" />
                )}
              </div>
              <div>
                <Link to={`/companies/${job.company?._id}`} className="font-semibold text-sm text-fg-default hover:text-primary">
                  {job.company?.name}
                </Link>
                <p className="text-xs text-fg-muted mt-0.5">Explore open roles</p>
              </div>
            </div>
            <p className="text-xs text-fg-muted leading-relaxed line-clamp-3 mb-4">
              {job.company?.bio}
            </p>
            {job.company?.website && (
              <a
                href={job.company.website}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-primary font-semibold hover:underline"
              >
                Visit website
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Similar Openings */}
      {similarJobs.length > 0 && (
        <div className="mt-12 border-t border-border-default pt-8">
          <h3 className="text-base font-semibold text-fg-default mb-6">
            Other Openings at {job.company?.name}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {similarJobs.map((simJob: any) => (
              <div
                key={simJob._id}
                className="border border-border-default rounded-md bg-white p-5 flex flex-col justify-between hover:border-[#afb8c1] hover:shadow-sm transition-all"
              >
                <div>
                  <h4 className="font-semibold text-sm text-fg-default hover:text-primary">
                    <Link to={`/jobs/${simJob._id}`}>{simJob.title}</Link>
                  </h4>
                  <div className="flex items-center gap-1 mt-1 text-fg-muted">
                    <MapPin size={10} />
                    <span className="text-xs">{simJob.location}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-border-default pt-3 mt-4 text-xs text-fg-muted">
                  <span className="font-semibold text-fg-default">
                    ${(simJob.salaryRange?.min / 1000).toFixed(0)}k - ${(simJob.salaryRange?.max / 1000).toFixed(0)}k
                  </span>
                  <span className="label-open">{simJob.remoteType}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
export default JobDetails;
