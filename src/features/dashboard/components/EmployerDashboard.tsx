import React from 'react';
import { useJobs, useDeleteJob, useUpdateJobStatus } from '../../jobs/hooks/useJobs';
import { useAuthStore } from '../../../store/authStore';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Briefcase,
  Users,
  Eye,
  Building2,
  Loader2,
  Download,
  ExternalLink,
  Trash2,
  Archive,
  Check,
} from 'lucide-react';
import toast from 'react-hot-toast';

// Utility CSV Export helper
const exportToCSV = (headers: string[], rows: any[][], filename: string) => {
  const content = [
    headers.join(','),
    ...rows.map((row) =>
      row.map((val) => `"${String(val ?? '').replace(/"/g, '""')}"`).join(',')
    ),
  ].join('\n');
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const EmployerDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const recruiterUserId = user?.id;
  const navigate = useNavigate();

  // Queries & Mutations
  const { data: jobsResponse, isLoading: jobsLoading } = useJobs({
    recruiterId: recruiterUserId,
  });
  const deleteJobMutation = useDeleteJob();
  const updateJobStatusMutation = useUpdateJobStatus();

  const jobs = jobsResponse?.data || [];

  // Metrics
  const totalJobs = jobs.length;
  const totalViews = jobs.reduce((acc: number, j: any) => acc + (j.views || 0), 0);
  const totalApplicants = jobs.reduce((acc: number, j: any) => acc + (j.applicantsCount || 0), 0);

  const handleDeleteJob = async (e: React.MouseEvent, jobId: string, jobTitle: string) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete the job opening "${jobTitle}"? This action cannot be undone.`)) {
      try {
        await deleteJobMutation.mutateAsync(jobId);
        toast.success('Job opening deleted successfully');
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to delete job opening');
      }
    }
  };

  const handleToggleStatus = async (e: React.MouseEvent, jobId: string, currentStatus: string) => {
    e.stopPropagation();
    const newStatus = currentStatus === 'Closed' ? 'Active' : 'Closed';
    const actionText = currentStatus === 'Closed' ? 'reopen' : 'close';
    if (window.confirm(`Are you sure you want to ${actionText} this job opening?`)) {
      try {
        await updateJobStatusMutation.mutateAsync({ id: jobId, status: newStatus });
        toast.success(`Job opening status updated to ${newStatus}`);
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to update job status');
      }
    }
  };

  const handleExportJobs = () => {
    if (jobs.length === 0) {
      toast.error('No jobs to export.');
      return;
    }
    const headers = [
      'Job Title',
      'Location',
      'Workplace Type',
      'Commitment Type',
      'Min Salary (USD)',
      'Max Salary (USD)',
      'Views',
      'Applicants Count',
    ];
    const rows = jobs.map((j: any) => [
      j.title,
      j.location,
      j.remoteType,
      j.jobType,
      j.salaryRange?.min || 0,
      j.salaryRange?.max || 0,
      j.views || 0,
      j.applicantsCount || 0,
    ]);
    exportToCSV(headers, rows, 'posted_jobs_report.csv');
    toast.success('Jobs report exported as CSV');
  };

  return (
    <div className="mx-auto max-w-[1280px] px-4 lg:px-6 py-8 bg-white min-h-screen">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border-default">
        <div>
          <h1 className="text-2xl font-semibold text-fg-default mb-1">Employer ATS Workspace</h1>
          <p className="text-sm text-fg-muted">Manage positions, monitor analytics, and review applicants</p>
        </div>
        <Link to="/employer/jobs/create" className="btn-primary">
          <Plus size={14} />
          <span>Publish Position</span>
        </Link>
      </div>

      {/* Analytics highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="border border-border-default rounded-md bg-canvas-subtle p-4 flex items-center gap-3">
          <div className="p-2 bg-white border border-border-default rounded-md text-primary">
            <Briefcase size={18} />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-fg-default">{totalJobs}</h3>
            <p className="text-xs text-fg-muted">Published Jobs</p>
          </div>
        </div>

        <div className="border border-border-default rounded-md bg-canvas-subtle p-4 flex items-center gap-3">
          <div className="p-2 bg-white border border-border-default rounded-md text-fg-default">
            <Eye size={18} />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-fg-default">{totalViews}</h3>
            <p className="text-xs text-fg-muted">Total Page Views</p>
          </div>
        </div>

        <div className="border border-border-default rounded-md bg-canvas-subtle p-4 flex items-center gap-3">
          <div className="p-2 bg-white border border-border-default rounded-md text-fg-default">
            <Users size={18} />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-fg-default">{totalApplicants}</h3>
            <p className="text-xs text-fg-muted">Total Applicants</p>
          </div>
        </div>
      </div>

      {/* Jobs List container */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-fg-default">Active Openings</h2>
          <button
            onClick={handleExportJobs}
            className="btn-secondary !py-1.5 !px-3 !text-xs flex items-center gap-1"
            data-tooltip="Export posted jobs list"
          >
            <Download size={13} />
            Export Jobs Report
          </button>
        </div>

        {jobsLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-fg-muted" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-16 border border-border-default rounded-md bg-canvas-subtle">
            <Building2 className="mx-auto text-fg-subtle mb-2" size={32} />
            <p className="text-sm font-semibold text-fg-default mb-1">No postings published yet</p>
            <Link to="/employer/jobs/create" className="text-sm text-primary hover:underline">
              Create Your First Vacancy Listing
            </Link>
          </div>
        ) : (
          <div className="border border-border-default rounded-md overflow-hidden">
            {jobs.map((job: any) => (
              <div
                key={job._id}
                onClick={() => navigate(`/employer/jobs/${job._id}/applicants`)}
                className="p-4 cursor-pointer transition-colors duration-150 flex items-center justify-between gap-4 bg-white hover:bg-canvas-subtle border-b border-border-default last:border-b-0"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-semibold text-fg-default">{job.title}</h3>
                    <Link
                      to={`/jobs/${job._id}`}
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary-dark"
                      onClick={(e) => e.stopPropagation()}
                      data-tooltip="View public opening details"
                    >
                      <ExternalLink size={12} />
                    </Link>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-fg-muted">
                    <span>{job.location}</span>
                    <span className="h-1 w-1 rounded-full bg-border-default"></span>
                    <span>{job.remoteType}</span>
                    <span className="h-1 w-1 rounded-full bg-border-default"></span>
                    <span>{job.jobType}</span>
                    <span className="h-1 w-1 rounded-full bg-border-default"></span>
                    <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      job.status === 'Closed' ? 'text-danger bg-danger-light' : 'text-success bg-success-light'
                    }`}>
                      {job.status || 'Active'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-4 text-right text-xs">
                    <div>
                      <span className="text-[10px] font-medium text-fg-subtle block">Views</span>
                      <span className="font-semibold text-fg-default">{job.views || 0}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-medium text-fg-subtle block">Applicants</span>
                      <span className="font-semibold text-fg-default text-primary">{job.applicantsCount || 0}</span>
                    </div>
                  </div>

                  {/* Actions column */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => handleToggleStatus(e, job._id, job.status || 'Active')}
                      className="p-1.5 rounded-md border border-border-default text-fg-subtle hover:text-primary hover:bg-canvas-subtle transition-colors duration-150"
                      data-tooltip={job.status === 'Closed' ? 'Reopen vacancy' : 'Close vacancy'}
                    >
                      {job.status === 'Closed' ? <Check size={14} /> : <Archive size={14} />}
                    </button>
                    <button
                      onClick={(e) => handleDeleteJob(e, job._id, job.title)}
                      className="p-1.5 rounded-md border border-border-default text-fg-subtle hover:text-danger hover:bg-danger-light transition-colors duration-150"
                      data-tooltip="Delete vacancy"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployerDashboard;
