import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useJobDetails } from '../../jobs/hooks/useJobs';
import { useApplyMutation } from '../hooks/useApplications';
import { useCartStore } from '../../../store/cartStore';
import { useProfileStore } from '../../../store/profileStore';
import {
  FileText,
  HelpCircle,
  PenTool,
  CheckCircle,
  ChevronRight,
  Loader2,
  Building2,
  MapPin,
  PartyPopper,
  Eye,
  EyeOff,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../../utils/api';
import toast from 'react-hot-toast';

export const WizardPage: React.FC = () => {
  const { id: jobId } = useParams<{ id: string }>();
  const profileStore = useProfileStore();

  // Queries
  const { data: job, isLoading, isError } = useJobDetails(jobId);
  const applyMutation = useApplyMutation();
  const { removeItem } = useCartStore();

  // Steps: 0: Resume, 1: Questions, 2: Cover Letter, 3: Review, 4: Success
  const [step, setStep] = useState(0);

  // Form states
  const [resumePath, setResumePath] = useState(profileStore.resumePath || 'jane_doe_resume_senior_dev.pdf'); // default mock resume
  const [coverLetter, setCoverLetter] = useState(profileStore.coverLetter || '');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  
  React.useEffect(() => {
    if (job && job.customQuestions) {
      const initialAnswers: Record<string, string> = {};
      job.customQuestions.forEach((q: any) => {
        // Find if this question label exists in profileStore.faqAnswers
        if (profileStore.faqAnswers && profileStore.faqAnswers[q.label]) {
          initialAnswers[q.fieldId] = profileStore.faqAnswers[q.label];
        }
      });
      // Merge with existing answers in case of re-render
      setAnswers((prev) => ({ ...initialAnswers, ...prev }));
    }
  }, [job, profileStore.faqAnswers]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('resume', file);
      setUploading(true);
      try {
        const response = await api.post('/applications/upload-resume', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const { url, name: uploadedName } = response.data.data;
        profileStore.addResume(uploadedName, url);
        setResumePath(url || uploadedName);
        toast.success(`Resume "${uploadedName}" uploaded and saved to Cloudinary!`);
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to upload resume to Cloudinary');
      } finally {
        setUploading(false);
      }
    }
  };

  // Simple mock content generator for resume preview
  const getMockResumePreview = (fileName: string) => {
    const resumeObj = profileStore.resumes.find((r) => r.name === fileName || r.url === fileName || r.name === resumePath || r.url === resumePath);
    const resumeUrl = resumeObj?.url || (fileName.startsWith('http') ? fileName : '');

    return (
      <div className="bg-canvas-subtle p-4 rounded-md border border-border-default text-left font-mono text-xs text-fg-default leading-relaxed space-y-2 mt-3 select-none">
        {resumeUrl ? (
          <div className="w-full h-[400px] border border-border-default rounded-md overflow-hidden bg-white">
            <iframe
              src={`https://docs.google.com/gview?url=${encodeURIComponent(resumeUrl)}&embedded=true`}
              className="w-full h-full border-0"
              title="Resume Viewer"
            />
          </div>
        ) : (
          <>
            <div className="border-b border-border-default pb-2">
              <p className="font-bold text-sm text-center uppercase tracking-wide">Candidate Profile Summary</p>
              <p className="text-center text-[10px] text-fg-muted">File: {fileName}</p>
            </div>
            <div>
              <p className="font-bold text-primary">OBJECTIVE</p>
              <p className="text-fg-muted pl-3">Seeking a challenging Software Development role to leverage advanced technical skills in full-stack web applications.</p>
            </div>
            <div>
              <p className="font-bold text-primary">SKILLS</p>
              <p className="text-fg-muted pl-3">{profileStore.skills || 'React, Node.js, Express, MongoDB, TypeScript, TailwindCSS'}</p>
            </div>
          </>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center">
        <Loader2 className="animate-spin text-primary mb-2" size={36} />
        <p className="text-sm text-fg-muted">Initializing application forms...</p>
      </div>
    );
  }

  if (isError || !job) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h2 className="text-2xl font-semibold text-fg-default mb-2">Unavailable</h2>
        <p className="text-sm text-fg-muted mb-6">This position is no longer accepting submissions.</p>
        <Link to="/jobs" className="btn-primary py-2.5">
          Find Jobs
        </Link>
      </div>
    );
  }

  const customQuestions = job.customQuestions || [];
  const stepsList = [
    { title: 'Resume Upload', icon: FileText },
    ...(customQuestions.length > 0 ? [{ title: 'Screening Form', icon: HelpCircle }] : []),
    { title: 'Cover Letter', icon: PenTool },
    { title: 'Review & Submit', icon: CheckCircle },
  ];

  const handleAnswerChange = (fieldId: string, val: string) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: val }));
  };

  const handleNext = () => {
    // Basic verification
    if (step === 0 && !resumePath) {
      toast.error('Please provide your resume to continue');
      return;
    }
    if (step === 1 && customQuestions.length > 0) {
      // Verify all required questions have answers
      const missing = customQuestions.find((q: any) => q.required && !answers[q.fieldId]);
      if (missing) {
        toast.error(`Please answer the required question: "${missing.label}"`);
        return;
      }
    }
    setStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    setStep((prev) => Math.max(0, prev - 1));
  };

  const handleSubmit = async () => {
    try {
      // Map answers record to schema expected array
      const mappedAnswers = Object.entries(answers).map(([fieldId, value]) => {
        const question = customQuestions.find((q: any) => q.fieldId === fieldId);
        return {
          questionId: fieldId,
          label: question ? question.label : fieldId,
          value,
        };
      });

      await applyMutation.mutateAsync({
        jobId: job._id,
        resume: resumePath,
        coverLetter,
        answers: mappedAnswers,
      });

      // Update global FAQ answers in profile
      const newFaqAnswers: Record<string, string> = {};
      mappedAnswers.forEach((ans) => {
        if (ans.value.trim()) {
          newFaqAnswers[ans.label] = ans.value;
        }
      });
      profileStore.updateFaqAnswers(newFaqAnswers);

      // Clear from Apply Later cart if it was queued
      removeItem(job._id);
      setStep(stepsList.length); // trigger Success step
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit application. Please try again.');
    }
  };

  const isSuccessStep = step === stepsList.length;

  return (
    <div className="mx-auto max-w-2xl px-4 lg:px-6 py-8">
      {/* Job Preview Panel */}
      {!isSuccessStep && (
        <div className="flex items-center gap-3 border border-border-default bg-white p-4 rounded-md mb-8">
          <div className="h-10 w-10 rounded-md bg-canvas-subtle border border-border-default flex items-center justify-center overflow-hidden">
            {job.company?.logo ? (
              <img src={job.company.logo} alt={job.company.name} className="h-full w-full object-cover" />
            ) : (
              <Building2 size={18} className="text-fg-subtle" />
            )}
          </div>
          <div>
            <h2 className="text-sm font-semibold text-fg-default">{job.title}</h2>
            <div className="flex items-center gap-1.5 text-xs text-fg-muted mt-0.5">
              <span>{job.company?.name}</span>
              <span className="h-1 w-1 rounded-full bg-border-default"></span>
              <span className="flex items-center gap-0.5">
                <MapPin size={10} />
                {job.location}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Progress Stepper */}
      {!isSuccessStep && (
        <div className="flex items-center justify-between mb-10 px-2">
          {stepsList.map((s, idx) => {
            const Icon = s.icon;
            const isActive = step === idx;
            const isCompleted = step > idx;
            return (
              <div key={idx} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div
                    className={`h-9 w-9 rounded-full border flex items-center justify-center transition-all ${
                      isActive
                        ? 'border-primary bg-primary text-white'
                        : isCompleted
                        ? 'border-success bg-success text-white'
                        : 'border-border-default text-fg-subtle bg-white'
                    }`}
                  >
                    <Icon size={16} />
                  </div>
                  <span className={`text-[9px] font-semibold mt-2 hidden sm:block ${isActive ? 'text-primary' : 'text-fg-subtle'}`}>
                    {s.title}
                  </span>
                </div>
                {idx < stepsList.length - 1 && (
                  <div className="flex-grow h-0.5 mx-4 bg-border-muted">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: isCompleted ? '100%' : '0%' }}
                    ></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Steps Content Area */}
      <div className="border border-border-default rounded-md bg-white p-6">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step-resume"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-5"
            >
              <h3 className="text-base font-semibold text-fg-default">Submit Your Resume</h3>
              <p className="text-xs text-fg-muted">Choose an active resume from your profile or upload a new one.</p>
              
              {/* Select Resume List */}
              <div className="border border-border-default rounded-md overflow-hidden bg-white divide-y divide-border-default">
                {profileStore.resumes.map((resume) => {
                  const isSelected = resumePath === (resume.url || resume.name) || resumePath === resume.name;
                  return (
                    <div
                      key={resume.id}
                      className={`flex items-center justify-between p-3 transition-colors ${
                        isSelected ? 'bg-primary-light/35' : 'hover:bg-canvas-subtle'
                      }`}
                    >
                      <label className="flex items-center gap-2.5 cursor-pointer flex-grow min-w-0">
                        <input
                          type="radio"
                          name="applyResume"
                          checked={isSelected}
                          onChange={() => {
                            setResumePath(resume.url || resume.name);
                            // Also select it in store so it stays active
                            profileStore.selectResume(resume.id);
                          }}
                          className="accent-primary flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <span className="text-sm font-semibold text-fg-default block truncate">
                            {resume.name}
                          </span>
                          <span className="text-[10px] text-fg-subtle block">
                            Uploaded on: {resume.uploadedAt}
                          </span>
                        </div>
                      </label>
                      
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        isSelected ? 'text-primary bg-primary-light border border-primary/25' : 'text-fg-subtle bg-canvas-subtle'
                      }`}>
                        {isSelected ? 'Selected' : 'Idle'}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Upload New Inline */}
              <div className="flex flex-wrap gap-3 items-center justify-between p-4 border border-border-default bg-canvas-subtle rounded-md">
                {uploading ? (
                  <div className="flex items-center gap-2 py-1 mx-auto">
                    <Loader2 className="animate-spin text-primary" size={16} />
                    <span className="text-xs text-fg-muted font-medium">Uploading document to Cloudinary...</span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <FileText size={18} className="text-fg-subtle" />
                      <span className="text-xs font-semibold text-fg-default">Need another resume?</span>
                    </div>
                    <label className="btn-secondary !py-1.5 !px-3 cursor-pointer text-xs font-semibold">
                      <span>Upload New Resume</span>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </>
                )}
              </div>

              {/* View Resume Option */}
              {resumePath && (
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => setPreviewOpen(!previewOpen)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                  >
                    {previewOpen ? (
                      <>
                        <EyeOff size={14} />
                        <span>Hide Resume Preview</span>
                      </>
                    ) : (
                      <>
                        <Eye size={14} />
                        <span>Preview Selected Resume</span>
                      </>
                    )}
                  </button>
                  {previewOpen && getMockResumePreview(resumePath)}
                </div>
              )}
            </motion.div>
          )}

          {step === 1 && customQuestions.length > 0 && (
            <motion.div
              key="step-questions"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-5"
            >
              <h3 className="text-base font-semibold text-fg-default">Employer Screening Form</h3>
              <p className="text-xs text-fg-muted">Please answer the questions below to match applicant prerequisites.</p>

              <div className="space-y-4">
                {customQuestions.map((q: any) => (
                  <div key={q.fieldId}>
                    <label className="block text-xs font-semibold text-fg-default mb-1.5">
                      {q.label} {q.required && <span className="text-danger">*</span>}
                    </label>
                    <input
                      type="text"
                      placeholder={q.placeholder || 'Your answer...'}
                      value={answers[q.fieldId] || ''}
                      onChange={(e) => handleAnswerChange(q.fieldId, e.target.value)}
                      className="w-full text-sm bg-white border border-border-default rounded-md px-3 py-1.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                    {q.helpText && <p className="text-xs text-fg-muted mt-1">{q.helpText}</p>}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2 (or 1 if no questions): Cover Letter */}
          {((step === 1 && customQuestions.length === 0) || step === 2) && (
            <motion.div
              key="step-cover-letter"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-5"
            >
              <h3 className="text-base font-semibold text-fg-default">Cover Letter</h3>
              <p className="text-xs text-fg-muted">Introduce yourself and summarize why you are a fit for this role.</p>
              
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Pitch your accomplishments and alignment here..."
                rows={6}
                className="w-full text-sm bg-white border border-border-default rounded-md px-3 py-1.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </motion.div>
          )}

          {/* Step 3 (or 2 if no questions): Review */}
          {((step === 2 && customQuestions.length === 0) || step === 3) && (
            <motion.div
              key="step-review"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-5"
            >
              <h3 className="text-base font-semibold text-fg-default">Review Application</h3>
              <p className="text-xs text-fg-muted">Inspect details prior to final submission.</p>
              
              <div className="space-y-4 text-sm">
                <div className="flex justify-between py-2 border-b border-border-default">
                  <span className="font-medium text-fg-muted">Resume File</span>
                  <a href={resumePath} className="font-semibold text-primary hover:underline">
                    {profileStore.resumes.find((r) => r.url === resumePath)?.name || resumePath}
                  </a>
                </div>

                {customQuestions.length > 0 && (
                  <div className="py-2 border-b border-border-default">
                    <span className="font-medium text-fg-muted block mb-2">Screening Answers</span>
                    {customQuestions.map((q: any) => (
                      <div key={q.fieldId} className="flex justify-between mt-1">
                        <span className="text-fg-muted">{q.label}</span>
                        <span className="font-semibold text-fg-default">{answers[q.fieldId] || 'N/A'}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <span className="font-medium text-fg-muted block mb-1">Cover Letter Preview</span>
                  <p className="p-3 bg-canvas-subtle rounded-md text-fg-muted italic whitespace-pre-wrap">
                    {coverLetter || 'No cover letter provided.'}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Success Step */}
          {isSuccessStep && (
            <motion.div
              key="step-success"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-10 space-y-6"
            >
              <div className="mx-auto h-16 w-16 bg-success-light text-success rounded-full flex items-center justify-center">
                <PartyPopper size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-fg-default">Application Submitted!</h3>
                <p className="text-sm text-fg-muted mt-2 max-w-sm mx-auto leading-relaxed">
                  The recruiter has been notified. Track your application status on your candidate dashboard.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-4">
                <Link to="/candidate/dashboard" className="btn-primary py-2 px-6 text-sm">
                  Go to Dashboard
                </Link>
                <Link to="/jobs" className="btn-secondary py-2 px-6 text-sm">
                  Find More Jobs
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Triggers */}
        {!isSuccessStep && (
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border-default">
            <button
              disabled={step === 0}
              onClick={handlePrev}
              type="button"
              className="btn-secondary !py-1.5 disabled:opacity-40 disabled:pointer-events-none"
            >
              Back
            </button>

            {step === stepsList.length - 1 ? (
              <button
                disabled={applyMutation.isPending}
                onClick={handleSubmit}
                type="button"
                className="btn-primary flex items-center gap-1.5 py-1.5 px-6 text-sm font-semibold"
              >
              {applyMutation.isPending ? (
                <Loader2 className="animate-spin" size={14} />
              ) : (
                <>
                  <span>Submit Application</span>
                  <ChevronRight size={14} />
                </>
              )}
              </button>
            ) : (
              <button
                onClick={handleNext}
                type="button"
                className="btn-primary flex items-center gap-1.5 py-1.5 px-6 text-sm font-semibold"
              >
                <span>Continue</span>
                <ChevronRight size={14} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
export default WizardPage;
