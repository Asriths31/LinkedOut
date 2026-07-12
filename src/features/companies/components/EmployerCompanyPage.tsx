import React, { useState, useEffect } from 'react';
import { useOwnCompany, useCreateCompany } from '../hooks/useCompanies';
import { api } from '../../../utils/api';
import { Building2, Globe, Award, Save, Loader2, Info } from 'lucide-react';
import toast from 'react-hot-toast';

export const EmployerCompanyPage: React.FC = () => {
  const { data: company, isLoading, refetch } = useOwnCompany();
  const createCompanyMutation = useCreateCompany();

  // Form states
  const [name, setName] = useState('');
  const [logo, setLogo] = useState('');
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');
  const [benefitsInput, setBenefitsInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (company) {
      setName(company.name || '');
      setLogo(company.logo || '');
      setBio(company.bio || '');
      setWebsite(company.website || '');
      setBenefitsInput(company.benefits ? company.benefits.join(', ') : '');
    }
  }, [company]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !bio) {
      toast.error('Please fill in all required fields: Company Name and Description');
      return;
    }

    setSubmitting(true);
    const benefits = benefitsInput
      .split(',')
      .map((b) => b.trim())
      .filter((b) => b.length > 0);

    const payload = {
      name,
      logo,
      bio,
      website,
      benefits,
    };

    try {
      if (company) {
        // Update existing profile
        await api.put(`/companies/${company._id}`, payload);
        toast.success('Company profile updated successfully.');
      } else {
        // Create new profile
        await createCompanyMutation.mutateAsync(payload);
        toast.success('Company profile registered successfully!');
      }
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update company profile.');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center gap-2">
        <Loader2 className="animate-spin text-fg-muted" size={20} />
        <span className="text-sm text-fg-muted">Loading your company profile...</span>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1280px] px-4 lg:px-6 py-8">
      {/* Page Header */}
      <div className="border-b border-border-default pb-6 mb-6">
        <h1 className="text-2xl font-semibold text-fg-default mb-1 flex items-center gap-2">
          <Building2 size={22} className="text-fg-subtle" />
          My Company Workspace
        </h1>
        <p className="text-sm text-fg-muted">
          Manage your organization details, logo, website, and employee perks.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info panel */}
        <div className="lg:col-span-1 border border-border-default rounded-md bg-white p-6 self-start space-y-4">
          <h3 className="text-sm font-semibold text-fg-default border-b border-border-default pb-2">Organization Status</h3>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-md border border-border-default bg-canvas-subtle flex items-center justify-center overflow-hidden flex-shrink-0">
              {logo ? (
                <img src={logo} alt="Company logo preview" className="h-full w-full object-cover" />
              ) : (
                <Building2 size={24} className="text-fg-subtle" />
              )}
            </div>
            <div>
              <h2 className="text-base font-semibold text-fg-default">{name || 'New Organization'}</h2>
              <span className={`inline-block mt-1.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
                company ? 'text-success bg-success-light' : 'text-amber-700 bg-amber-100'
              }`}>
                {company ? 'Registered & Verified' : 'Awaiting Registration'}
              </span>
            </div>
          </div>

          <div className="text-xs text-fg-muted flex gap-1.5 p-3 bg-canvas-subtle border border-border-default rounded-md">
            <Info size={14} className="text-fg-subtle flex-shrink-0 mt-0.5" />
            <p>Employers must register their company profile before job openings can be published.</p>
          </div>
        </div>

        {/* Setup Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="border border-border-default rounded-md bg-white">
            <div className="px-4 py-3 border-b border-border-default bg-canvas-subtle rounded-t-md">
              <h2 className="text-sm font-semibold text-fg-default">
                {company ? 'Edit Company Profile' : 'Register New Company'}
              </h2>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-fg-default mb-1.5">
                  Company Name <span className="text-danger">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-fg-subtle">
                    <Building2 size={16} />
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. PixelCraft Studio"
                    className="w-full text-sm bg-white border border-border-default rounded-md pl-10 pr-3 py-1.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-fg-default mb-1.5">
                  Logo Image URL
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-fg-subtle">
                    <Globe size={16} />
                  </span>
                  <input
                    type="text"
                    value={logo}
                    onChange={(e) => setLogo(e.target.value)}
                    placeholder="e.g. https://images.unsplash.com/... or relative path"
                    className="w-full text-sm bg-white border border-border-default rounded-md pl-10 pr-3 py-1.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-fg-default mb-1.5">
                  Website URL
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-fg-subtle">
                    <Globe size={16} />
                  </span>
                  <input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="e.g. https://pixelcraft.dev"
                    className="w-full text-sm bg-white border border-border-default rounded-md pl-10 pr-3 py-1.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-fg-default mb-1.5">
                  Perks & Benefits (Comma separated)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-fg-subtle">
                    <Award size={16} />
                  </span>
                  <input
                    type="text"
                    value={benefitsInput}
                    onChange={(e) => setBenefitsInput(e.target.value)}
                    placeholder="e.g. Fully Remote, Health Insurance, Annual Perks"
                    className="w-full text-sm bg-white border border-border-default rounded-md pl-10 pr-3 py-1.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-fg-default mb-1.5">
                  Company Description / Bio <span className="text-danger">*</span>
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell developers about your stack, culture, and projects..."
                  rows={6}
                  className="w-full text-sm bg-white border border-border-default rounded-md px-3 py-1.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                  required
                />
              </div>
            </div>

            <div className="px-4 py-3 border-t border-border-default bg-canvas-subtle rounded-b-md flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary"
              >
                {submitting ? (
                  <Loader2 className="animate-spin" size={14} />
                ) : (
                  <>
                    <Save size={14} />
                    <span>Save Company Settings</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
export default EmployerCompanyPage;
