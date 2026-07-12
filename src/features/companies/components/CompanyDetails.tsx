import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCompanyDetails, useAddReview } from '../hooks/useCompanies';
import { useJobs } from '../../jobs/hooks/useJobs';
import { useAuthStore } from '../../../store/authStore';
import {
  Building2,
  Globe,
  Star,
  Award,
  Send,
  Loader2,
  ArrowLeft,
  Briefcase,
  MapPin,
  Users,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const CompanyDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuthStore();

  const { data: company, isLoading, isError } = useCompanyDetails(id);
  const { data: jobsResponse } = useJobs({ companyId: id });
  const addReviewMutation = useAddReview();

  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    if (reviewText.length < 5) {
      toast.error('Review text must be at least 5 characters.');
      return;
    }
    setSubmittingReview(true);
    try {
      await addReviewMutation.mutateAsync({ companyId: id, rating, text: reviewText });
      toast.success('Review posted!');
      setReviewText('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center gap-2">
        <Loader2 className="animate-spin text-fg-muted" size={20} />
        <span className="text-sm text-fg-muted">Loading company…</span>
      </div>
    );
  }

  if (isError || !company) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h2 className="text-xl font-semibold text-fg-default mb-2">Company not found</h2>
        <p className="text-sm text-fg-muted mb-6">This company profile doesn't exist or is under review.</p>
        <Link to="/companies" className="btn-primary">Browse Companies</Link>
      </div>
    );
  }

  const jobs = jobsResponse?.data || [];
  const reviews = company.reviews || [];
  const ratings = company.ratings || { average: 0, count: 0 };

  return (
    <div className="mx-auto max-w-[1280px] px-4 lg:px-6 py-8">
      <Link to="/companies" className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-6">
        <ArrowLeft size={14} />
        Companies
      </Link>

      {/* Profile Header */}
      <div className="border border-border-default rounded-md bg-white p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-md border border-border-default bg-canvas-subtle flex items-center justify-center overflow-hidden flex-shrink-0">
              {company.logo ? (
                <img src={company.logo} alt={company.name} className="h-full w-full object-cover" />
              ) : (
                <Building2 size={28} className="text-fg-subtle" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-fg-default">{company.name}</h1>
              <div className="flex items-center gap-3 mt-1 text-sm text-fg-muted">
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                    data-tooltip="Visit website"
                  >
                    <Globe size={14} />
                    Website
                  </a>
                )}
                {ratings.count > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <Star size={14} className="text-amber-500 fill-amber-500" />
                    <span className="font-semibold text-fg-default">{ratings.average.toFixed(1)}</span>
                    <span>({ratings.count} reviews)</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* About */}
          <div className="border border-border-default rounded-md bg-white">
            <div className="px-4 py-3 border-b border-border-default bg-canvas-subtle rounded-t-md">
              <h2 className="text-sm font-semibold text-fg-default">About</h2>
            </div>
            <div className="px-4 py-4">
              <p className="text-sm text-fg-default leading-relaxed whitespace-pre-line">
                {company.bio || 'No company description provided.'}
              </p>
            </div>
          </div>

          {/* Benefits */}
          {company.benefits && company.benefits.length > 0 && (
            <div className="border border-border-default rounded-md bg-white">
              <div className="px-4 py-3 border-b border-border-default bg-canvas-subtle rounded-t-md">
                <h2 className="text-sm font-semibold text-fg-default">Perks & Benefits</h2>
              </div>
              <div className="px-4 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {company.benefits.map((benefit: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-fg-default">
                      <Award size={14} className="text-success flex-shrink-0" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Open Positions */}
          <div className="border border-border-default rounded-md bg-white">
            <div className="px-4 py-3 border-b border-border-default bg-canvas-subtle rounded-t-md flex items-center justify-between">
              <h2 className="text-sm font-semibold text-fg-default">
                Open Positions
                <span className="ml-2 text-xs font-normal text-fg-muted bg-[#e1e4e8] rounded-full px-2 py-0.5">
                  {jobs.length}
                </span>
              </h2>
            </div>
            {jobs.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <Briefcase className="mx-auto text-fg-subtle mb-2" size={24} />
                <p className="text-sm text-fg-muted">No open positions right now.</p>
              </div>
            ) : (
              <div>
                {jobs.map((job: any, idx: number) => (
                  <div
                    key={job._id}
                    className={`flex items-center justify-between px-4 py-3 hover:bg-canvas-subtle transition-colors ${
                      idx < jobs.length - 1 ? 'border-b border-border-default' : ''
                    }`}
                  >
                    <div>
                      <Link to={`/jobs/${job._id}`} className="text-sm font-semibold text-primary hover:underline">
                        {job.title}
                      </Link>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-fg-muted">
                        <span className="inline-flex items-center gap-1">
                          <MapPin size={11} />
                          {job.location}
                        </span>
                        <span>{job.remoteType}</span>
                        <span>{job.jobType}</span>
                      </div>
                    </div>
                    <Link to={`/jobs/${job._id}`} className="btn-secondary !py-1 !px-3 !text-xs">
                      View
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Reviews */}
        <div className="lg:col-span-1 space-y-6">
          {/* Write a Review */}
          {isAuthenticated && user?.role === 'Candidate' && (
            <div className="border border-border-default rounded-md bg-white">
              <div className="px-4 py-3 border-b border-border-default bg-canvas-subtle rounded-t-md">
                <h3 className="text-sm font-semibold text-fg-default">Write a review</h3>
              </div>
              <form onSubmit={handleReviewSubmit} className="px-4 py-4 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-fg-default mb-1">Rating</label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(parseInt(e.target.value, 10))}
                    className="input-field !py-1.5"
                  >
                    <option value="5">★★★★★ Excellent</option>
                    <option value="4">★★★★☆ Good</option>
                    <option value="3">★★★☆☆ Average</option>
                    <option value="2">★★☆☆☆ Poor</option>
                    <option value="1">★☆☆☆☆ Terrible</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-fg-default mb-1">Review</label>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Share your experience..."
                    rows={3}
                    className="input-field resize-none"
                    required
                  />
                </div>
                <button type="submit" disabled={submittingReview} className="w-full btn-primary">
                  {submittingReview ? <Loader2 className="animate-spin" size={14} /> : <><Send size={13} /> Submit review</>}
                </button>
              </form>
            </div>
          )}

          {/* Reviews list */}
          <div className="border border-border-default rounded-md bg-white">
            <div className="px-4 py-3 border-b border-border-default bg-canvas-subtle rounded-t-md flex items-center gap-2">
              <Users size={14} className="text-fg-muted" />
              <h3 className="text-sm font-semibold text-fg-default">
                Reviews
                <span className="ml-2 text-xs font-normal text-fg-muted bg-[#e1e4e8] rounded-full px-2 py-0.5">
                  {reviews.length}
                </span>
              </h3>
            </div>
            {reviews.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <p className="text-sm text-fg-muted">No reviews yet.</p>
              </div>
            ) : (
              <div className="max-h-[420px] overflow-y-auto">
                {reviews.map((rev: any, idx: number) => (
                  <div
                    key={idx}
                    className={`px-4 py-3 ${idx < reviews.length - 1 ? 'border-b border-border-default' : ''}`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="inline-flex items-center gap-1 text-amber-600 font-semibold">
                        <Star size={11} className="fill-amber-500 text-amber-500" />
                        {rev.rating}/5
                      </span>
                      <span className="text-fg-subtle">
                        {new Date(rev.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-sm text-fg-default leading-relaxed">"{rev.text}"</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default CompanyDetails;
