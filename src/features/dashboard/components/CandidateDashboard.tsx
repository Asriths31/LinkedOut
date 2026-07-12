import React, { useEffect, useState } from 'react';
import { useCandidateApplications } from '../../applications/hooks/useApplications';
import { useSavedJobsStore } from '../../../store/savedJobsStore';
import { useAuthStore } from '../../../store/authStore';
import { useNotificationStore } from '../../../store/notificationStore';
import { Link } from 'react-router-dom';
import {
  FileText,
  Clock,
  Sparkles,
  Building2,
  Bookmark,
  ExternalLink,
  Loader2,
  FolderHeart,
  Eye,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const CandidateDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { data: applications, isLoading } = useCandidateApplications();
  const { savedJobIds } = useSavedJobsStore();
  const { addNotification } = useNotificationStore();

  const [selectedPreviewApp, setSelectedPreviewApp] = useState<any | null>(null);

  // Status Change Notification Checker
  useEffect(() => {
    if (applications && applications.length > 0) {
      const cacheKey = `linkedout-app-statuses-${user?.id || 'guest'}`;
      const cachedRaw = localStorage.getItem(cacheKey);
      const cached = cachedRaw ? JSON.parse(cachedRaw) : {};
      
      const currentStatuses: Record<string, string> = {};

      applications.forEach((app: any) => {
        currentStatuses[app._id] = app.status;
        
        // If we had a cached status, and it is different from the current fetched status
        if (cached[app._id] && cached[app._id] !== app.status) {
          const jobTitle = app.job?.title || 'Job Opening';
          addNotification(
            `Your application status for "${jobTitle}" has been updated to: ${app.status}`,
            app.status === 'Rejected' ? 'error' : app.status === 'Offer' ? 'success' : 'info'
          );
        }
      });

      // Update localStorage cache with the new status snapshot
      localStorage.setItem(cacheKey, JSON.stringify(currentStatuses));
    }
  }, [applications, user?.id, addNotification]);

  const statusColors: Record<string, string> = {
    Applied: 'bg-blue-100 text-blue-800 border border-blue-200',
    Screening: 'bg-purple-100 text-purple-800 border border-purple-200',
    Interview: 'bg-amber-100 text-amber-800 border border-amber-200',
    Offer: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    Rejected: 'bg-rose-100 text-rose-800 border border-rose-200',
  };

  return (
    <div className="mx-auto max-w-[1280px] px-4 lg:px-6 py-8">
      {/* Page Header */}
      <div className="border-b border-border-default pb-6 mb-6">
        <h1 className="text-2xl font-semibold text-fg-default mb-1">Candidate Workspace</h1>
        <p className="text-sm text-fg-muted">Welcome back, {user?.name || 'Candidate'}</p>
      </div>

      {/* Analytics highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="border border-border-default rounded-md bg-canvas-subtle p-4 flex items-center gap-3">
          <div className="p-2 bg-white border border-border-default rounded-md text-primary">
            <FileText size={18} />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-fg-default">
              {applications?.length || 0}
            </h3>
            <p className="text-xs text-fg-muted">Applied Jobs</p>
          </div>
        </div>

        <div className="border border-border-default rounded-md bg-canvas-subtle p-4 flex items-center gap-3">
          <div className="p-2 bg-white border border-border-default rounded-md text-fg-default">
            <Bookmark size={18} />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-fg-default">
              {savedJobIds.length}
            </h3>
            <p className="text-xs text-fg-muted">Saved Openings</p>
          </div>
        </div>

        <div className="border border-border-default rounded-md bg-canvas-subtle p-4 flex items-center gap-3">
          <div className="p-2 bg-white border border-border-default rounded-md text-fg-default">
            <Sparkles size={18} />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-fg-default">
              {applications?.length ? Math.round(applications.reduce((acc: number, app: any) => acc + app.atsScore, 0) / applications.length) : 0}%
            </h3>
            <p className="text-xs text-fg-muted">Average ATS Score</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Applications List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-base font-semibold text-fg-default mb-2">My Submissions</h2>

          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-primary" />
            </div>
          ) : !applications || applications.length === 0 ? (
            <div className="text-center py-16 bg-white border border-border-default rounded-md">
              <FolderHeart className="mx-auto text-fg-subtle mb-3" size={36} />
              <p className="text-sm font-semibold text-fg-default mb-1">No active submissions found</p>
              <Link to="/jobs" className="text-xs font-semibold text-primary hover:underline">
                Explore Open Positions
              </Link>
            </div>
          ) : (
            <div className="border border-border-default rounded-md overflow-hidden bg-white divide-y divide-border-default">
              {applications.map((app: any) => (
                <div
                  key={app._id}
                  className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white hover:bg-canvas-subtle transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-md bg-canvas-subtle border border-border-default flex items-center justify-center overflow-hidden">
                      {app.job?.company?.logo ? (
                        <img src={app.job.company.logo} alt={app.job.company.name} className="h-full w-full object-cover" />
                      ) : (
                        <Building2 size={18} className="text-fg-subtle" />
                      )}
                    </div>
                    <div>
                      <Link
                        to={`/jobs/${app.job?._id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-sm text-fg-default hover:text-primary flex items-center gap-1.5"
                      >
                        {app.job?.title}
                        <ExternalLink size={12} className="text-fg-subtle" />
                      </Link>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-fg-muted">
                        <span>{app.job?.company?.name}</span>
                        <span className="h-1 w-1 rounded-full bg-border-default"></span>
                        <span className="flex items-center gap-0.5">
                          <Clock size={10} />
                          {new Date(app.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end md:self-auto">
                    {/* ATS indicator */}
                    <div className="text-right">
                      <span className="text-xs font-medium text-fg-subtle block">ATS Fit</span>
                      <span className={`text-xs font-semibold ${app.atsScore >= 80 ? 'text-success' : 'text-fg-default'}`}>
                        {app.atsScore}% Match
                      </span>
                    </div>

                    {/* Status Badge */}
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[app.status]}`}>
                      {app.status}
                    </span>

                    {/* View Resume Option */}
                    <button
                      onClick={() => setSelectedPreviewApp(app)}
                      className="p-1.5 rounded-md border border-border-default text-fg-subtle hover:text-primary hover:bg-white transition-colors duration-150 flex items-center justify-center"
                      title="View Submitted Resume"
                    >
                      <Eye size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Quick Links / Profiles */}
        <div className="lg:col-span-1 space-y-6">
          <div className="border border-border-default rounded-md bg-white p-6">
            <h3 className="text-xs font-semibold text-fg-subtle uppercase tracking-wider mb-4">Workspace Details</h3>
            <div className="space-y-3.5 text-xs text-fg-muted">
              <div className="flex justify-between">
                <span>Account Tier</span>
                <span className="font-semibold text-primary">Standard Candidate</span>
              </div>
              <div className="flex justify-between">
                <span>Verification</span>
                <span className="font-semibold text-success">Active & Approved</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resume Viewer Modal */}
      {selectedPreviewApp && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white border border-border-default rounded-md max-w-lg w-full max-h-[85vh] flex flex-col shadow-xl animate-in fade-in zoom-in-95 duration-150 text-left">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-default bg-canvas-subtle rounded-t-md">
              <div>
                <h3 className="font-semibold text-fg-default text-base">Submitted Resume Details</h3>
                <p className="text-xs text-fg-muted">File/URL: {selectedPreviewApp.resume}</p>
              </div>
              <button
                onClick={() => setSelectedPreviewApp(null)}
                className="text-fg-subtle hover:text-fg-default p-1 hover:bg-[#eaeef2] rounded-md transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 font-mono text-xs text-fg-default leading-relaxed bg-[#fafafa]">
              {selectedPreviewApp.resume?.startsWith('http') ? (
                <div className="space-y-2">
                  <div className="w-full h-[500px] border border-border-default rounded-md overflow-hidden bg-white">
                    <iframe
                      src={
                        selectedPreviewApp.resume.toLowerCase().includes('.pdf')
                          ? selectedPreviewApp.resume
                          : `https://docs.google.com/gview?url=${encodeURIComponent(selectedPreviewApp.resume)}&embedded=true`
                      }
                      className="w-full h-full border-0"
                      title="Submitted Resume Viewer"
                    />
                  </div>
                  <p className="text-[10px] text-fg-subtle text-center">
                    Note: If document preview does not load, you can download the file directly.
                  </p>
                </div>
              ) : (
                <>
                  <div className="text-center border-b border-border-default pb-4">
                    <h2 className="text-lg font-bold text-fg-default uppercase tracking-wider">{user?.name}</h2>
                    <p className="text-fg-muted">{user?.email}</p>
                    <p className="text-[10px] text-fg-subtle mt-1">LinkedIn Verified Professional Candidate</p>
                  </div>

                  <div>
                    <p className="font-bold text-primary text-sm tracking-wide">OBJECTIVE SUMMARY</p>
                    <p className="text-fg-muted pl-3 mt-1">
                      Seeking software development opportunities to deploy clean designs, robust testing suites, and performance optimizations.
                    </p>
                  </div>

                  <div>
                    <p className="font-bold text-primary text-sm tracking-wide">SKILLS PORTFOLIO</p>
                    <p className="text-fg-muted pl-3 mt-1 font-semibold">
                      React, Node.js, Express, MongoDB, TypeScript, TailwindCSS
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-border-default bg-canvas-subtle rounded-b-md flex justify-end gap-2">
              {selectedPreviewApp.resume && (
                <button
                  onClick={() => {
                    if (selectedPreviewApp.resume.startsWith('http')) {
                      window.open(selectedPreviewApp.resume, '_blank');
                    } else {
                      // Trigger mock download
                      const mockContent = `Submitted Resume Document\nCandidate: ${user?.name}\nFile: ${selectedPreviewApp.resume}\nATS Match: ${selectedPreviewApp.atsScore}%`;
                      const blob = new Blob([mockContent], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `${selectedPreviewApp.resume.replace(/\.[^/.]+$/, "")}.txt`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      URL.revokeObjectURL(url);
                      toast.success(`Mock resume file downloaded: ${link.download}`);
                    }
                  }}
                  className="btn-primary !py-1.5 !px-4 text-xs font-semibold flex items-center gap-1.5 bg-primary hover:bg-primary-dark text-white rounded-md transition-colors"
                >
                  <span>Download file</span>
                </button>
              )}
              <button
                onClick={() => setSelectedPreviewApp(null)}
                className="btn-secondary !py-1.5 !px-4 text-xs font-semibold"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default CandidateDashboard;
