import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../../utils/api';
import {
  ChevronRight,
  Plus,
  Trash2,
  MapPin,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

interface CustomQuestionInput {
  fieldId: string;
  label: string;
  type: string;
  required: boolean;
  placeholder?: string;
  helpText?: string;
}

export const JobCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);

  // Form Fields State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [remoteType, setRemoteType] = useState<'Remote' | 'Hybrid' | 'On-site'>('On-site');
  const [jobType, setJobType] = useState<'Full-time' | 'Part-time' | 'Contract' | 'Internship'>('Full-time');
  const [minSalary, setMinSalary] = useState('80000');
  const [maxSalary, setMaxSalary] = useState('120000');
  const [rawRequirements, setRawRequirements] = useState('');
  const [rawBenefits, setRawBenefits] = useState('');

  // Questionnaire Form Builder State
  const [customQuestions, setCustomQuestions] = useState<CustomQuestionInput[]>([]);

  const handleAddQuestion = () => {
    const fieldId = `question_${Date.now()}`;
    const newQuestion: CustomQuestionInput = {
      fieldId,
      label: 'e.g. How many years of experience do you have in React?',
      type: 'text',
      required: true,
      placeholder: '',
      helpText: '',
    };
    setCustomQuestions((prev) => [...prev, newQuestion]);
  };

  const handleRemoveQuestion = (fieldId: string) => {
    setCustomQuestions((prev) => prev.filter((q) => q.fieldId !== fieldId));
  };

  const handleUpdateQuestion = (fieldId: string, updates: Partial<CustomQuestionInput>) => {
    setCustomQuestions((prev) =>
      prev.map((q) => (q.fieldId === fieldId ? { ...q, ...updates } : q))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !location) {
      toast.error('Please fill in all required fields: Job Title, Description, and Location');
      return;
    }

    setSubmitting(true);
    try {
      const requirements = rawRequirements
        .split('\n')
        .map((r) => r.trim())
        .filter((r) => r.length > 0);

      const benefits = rawBenefits
        .split('\n')
        .map((b) => b.trim())
        .filter((b) => b.length > 0);

      const jobData = {
        title,
        description,
        location,
        remoteType,
        jobType,
        salaryRange: {
          min: parseInt(minSalary, 10),
          max: parseInt(maxSalary, 10),
          currency: 'USD',
        },
        requirements: requirements.length > 0 ? requirements : ['Prerequisite experience listed in job details'],
        benefits,
        customQuestions,
        status: 'Active',
      };

      await api.post('/jobs', jobData);
      toast.success('Job published successfully!');
      
      // Invalidate queries to reload dashboard
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      
      navigate('/employer/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to publish job. Please ensure you have registered a company profile first.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 lg:px-6 py-8">
      <Link
        to="/employer/dashboard"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-fg-muted hover:text-fg-default mb-6 transition-colors"
      >
        <ArrowLeft size={14} />
        Back to Dashboard
      </Link>

      <div className="border-b border-border-default pb-6 mb-6">
        <h1 className="text-2xl font-semibold text-fg-default">Publish Job Position</h1>
        <p className="text-sm text-fg-muted mt-1">Configure vacancy details and construct screening questions</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Specs Card */}
        <div className="border border-border-default rounded-md bg-white">
          <div className="px-4 py-3 border-b border-border-default bg-canvas-subtle rounded-t-md">
            <h2 className="text-sm font-semibold text-fg-default">
              1. Core Position Specifications
            </h2>
          </div>

          <div className="p-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-fg-default mb-1.5">
                Job Position Title <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer"
                className="w-full text-sm bg-white border border-border-default rounded-md px-3 py-1.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-fg-default mb-1.5">
                Location details <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-fg-subtle">
                  <MapPin size={16} />
                </span>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. San Francisco, CA or Remote"
                  className="w-full text-sm bg-white border border-border-default rounded-md pl-10 pr-3 py-1.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-fg-default mb-1.5">
                  Workplace Layout
                </label>
                <select
                  value={remoteType}
                  onChange={(e) => setRemoteType(e.target.value as any)}
                  className="input-field !text-sm"
                >
                  <option value="On-site">On-site</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Remote">Remote</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-fg-default mb-1.5">
                  Commitment Type
                </label>
                <select
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value as any)}
                  className="input-field !text-sm"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-fg-default mb-1.5">
                  Min Base Salary (USD / year)
                </label>
                <input
                  type="number"
                  value={minSalary}
                  onChange={(e) => setMinSalary(e.target.value)}
                  className="w-full text-sm bg-white border border-border-default rounded-md px-3 py-1.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-fg-default mb-1.5">
                  Max Base Salary (USD / year)
                </label>
                <input
                  type="number"
                  value={maxSalary}
                  onChange={(e) => setMaxSalary(e.target.value)}
                  className="w-full text-sm bg-white border border-border-default rounded-md px-3 py-1.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Requirements Card */}
        <div className="border border-border-default rounded-md bg-white">
          <div className="px-4 py-3 border-b border-border-default bg-canvas-subtle rounded-t-md">
            <h2 className="text-sm font-semibold text-fg-default">
              2. Role Requirements & Details
            </h2>
          </div>

          <div className="p-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-fg-default mb-1.5">
                Position Details / Description <span className="text-danger">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Introduce your team culture, details, and stack objectives..."
                rows={8}
                className="w-full text-sm bg-white border border-border-default rounded-md px-3 py-1.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-fg-default mb-1.5">
                Skills / Requirements (One per line)
              </label>
              <textarea
                value={rawRequirements}
                onChange={(e) => setRawRequirements(e.target.value)}
                placeholder={"e.g. 3+ years experience with React\nFamiliarity with REST APIs\nProficient in Git"}
                rows={4}
                className="w-full text-sm bg-white border border-border-default rounded-md px-3 py-1.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-fg-default mb-1.5">
                Benefits & Perks (One per line)
              </label>
              <textarea
                value={rawBenefits}
                onChange={(e) => setRawBenefits(e.target.value)}
                placeholder={"e.g. Fully paid dental/medical\nFlexible workspace setups\nHome internet reimbursement"}
                rows={4}
                className="w-full text-sm bg-white border border-border-default rounded-md px-3 py-1.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Screening Questions Card */}
        <div className="border border-border-default rounded-md bg-white">
          <div className="px-4 py-3 border-b border-border-default bg-canvas-subtle rounded-t-md flex items-center justify-between">
            <h2 className="text-sm font-semibold text-fg-default">
              3. Screening Question Builder
            </h2>
            <button
              onClick={handleAddQuestion}
              type="button"
              className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline"
            >
              <Plus size={14} />
              Add Question
            </button>
          </div>

          <div className="p-4">
            {customQuestions.length === 0 ? (
              <p className="text-xs text-fg-muted italic text-center py-4 bg-canvas-subtle rounded-md">
                No custom questionnaire attached. Candidates will apply with their resume and cover letter only.
              </p>
            ) : (
              <div className="space-y-4">
                {customQuestions.map((q, idx) => (
                  <div key={q.fieldId} className="p-4 border border-border-default rounded-md bg-canvas-subtle relative space-y-3">
                    <button
                      onClick={() => handleRemoveQuestion(q.fieldId)}
                      type="button"
                      className="absolute top-4 right-4 text-fg-subtle hover:text-danger transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-fg-muted">Question #{idx + 1}</span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-fg-default mb-1">Question Text</label>
                      <input
                        type="text"
                        value={q.label}
                        onChange={(e) => handleUpdateQuestion(q.fieldId, { label: e.target.value })}
                        className="w-full text-sm bg-white border border-border-default rounded-md px-3 py-1.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-fg-default mb-1">Required Response</label>
                        <select
                          value={q.required ? 'true' : 'false'}
                          onChange={(e) => handleUpdateQuestion(q.fieldId, { required: e.target.value === 'true' })}
                          className="input-field !text-sm"
                        >
                          <option value="true">Required</option>
                          <option value="false">Optional</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full btn-primary flex items-center justify-center gap-2 py-2.5"
        >
          {submitting ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <>
              <span>Publish Position</span>
              <ChevronRight size={18} />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
export default JobCreatePage;
