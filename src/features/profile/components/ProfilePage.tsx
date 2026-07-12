import React, { useState } from 'react';
import { useAuthStore } from '../../../store/authStore';
import { useProfileStore } from '../../../store/profileStore';
import { User as UserIcon, Mail, Save, Loader2, FileText, Settings, Award, Eye, Download, X, Trash2 } from 'lucide-react';
import { api } from '../../../utils/api';
import toast from 'react-hot-toast';

export const ProfilePage: React.FC = () => {
  const { user } = useAuthStore();
  const profileStore = useProfileStore();

  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Preview State
  const [previewResumeName, setPreviewResumeName] = useState<string | null>(null);

  // Candidate Extra Fields
  const [skills, setSkills] = useState(profileStore.skills);
  const [coverLetter, setCoverLetter] = useState(profileStore.coverLetter);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      
      // Save candidate specific fields to store
      if (user?.role === 'Candidate') {
        profileStore.setProfileData({
          skills,
          coverLetter,
        });
      }
      
      toast.success('Profile details updated successfully');
    }, 800);
  };

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
        toast.success(`Resume "${uploadedName}" uploaded and saved to Cloudinary!`);
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to upload resume to Cloudinary');
      } finally {
        setUploading(false);
      }
    }
  };

  const getMockResumePreview = (fileName: string) => {
    const resumeObj = profileStore.resumes.find((r) => r.name === fileName || r.url === fileName);
    const resumeUrl = resumeObj?.url || (fileName.startsWith('http') ? fileName : '');

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white border border-border-default rounded-md max-w-lg w-full max-h-[85vh] flex flex-col shadow-xl animate-in fade-in zoom-in-95 duration-150 text-left">
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border-default bg-canvas-subtle rounded-t-md">
            <div>
              <h3 className="font-semibold text-fg-default text-base">Resume Document Viewer</h3>
              <p className="text-xs text-fg-muted">File: {resumeObj?.name || fileName}</p>
            </div>
            <button
              onClick={() => setPreviewResumeName(null)}
              className="text-fg-subtle hover:text-fg-default p-1 hover:bg-[#eaeef2] rounded-md transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto space-y-4 font-mono text-xs text-fg-default leading-relaxed bg-[#fafafa]">
            {resumeUrl ? (
              <div className="w-full h-[500px] border border-border-default rounded-md overflow-hidden bg-white">
                <iframe
                  src={`https://docs.google.com/gview?url=${encodeURIComponent(resumeUrl)}&embedded=true`}
                  className="w-full h-full border-0"
                  title="Resume Viewer"
                />
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
                    Detail-oriented software engineer seeking fullstack development opportunities to deploy robust system design, modern libraries, and high quality testing environments.
                  </p>
                </div>

                <div>
                  <p className="font-bold text-primary text-sm tracking-wide">SKILLS PORTFOLIO</p>
                  <p className="text-fg-muted pl-3 mt-1 font-semibold">
                    {profileStore.skills || 'React, Node.js, Express, MongoDB, TypeScript, TailwindCSS'}
                  </p>
                </div>

                <div>
                  <p className="font-bold text-primary text-sm tracking-wide">WORK EXPERIENCE</p>
                  <div className="pl-3 mt-1.5 space-y-2">
                    <div>
                      <p className="font-semibold text-fg-default">Software Engineer | PixelCraft Studio (Present)</p>
                      <p className="text-fg-muted">• Collaborated with design and backend groups to execute modern web portals.</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 border-t border-border-default bg-canvas-subtle rounded-b-md flex justify-end gap-2">
            {resumeUrl && (
              <a
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary !py-1.5 !px-4 text-xs font-semibold flex items-center gap-1"
              >
                <Download size={12} />
                <span>Download file</span>
              </a>
            )}
            <button
              onClick={() => setPreviewResumeName(null)}
              className="btn-secondary !py-1.5 !px-4 text-xs font-semibold"
            >
              Close Viewer
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-[1280px] px-4 lg:px-6 py-8">
      {/* Page Header */}
      <div className="border-b border-border-default pb-6 mb-6">
        <h1 className="text-2xl font-semibold text-fg-default mb-1 flex items-center gap-2">
          <Settings size={22} className="text-fg-subtle" />
          Profile Settings
        </h1>
        <p className="text-sm text-fg-muted">
          Manage your credentials, default resume, and cover letters.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Card Card */}
        <div className="lg:col-span-1 border border-border-default rounded-md bg-white p-6 self-start space-y-4">
          <div className="flex flex-col items-center text-center">
            <div className="h-20 w-20 rounded-full bg-[#dbeafe] border border-border-default flex items-center justify-center text-2xl font-semibold text-primary overflow-hidden mb-3">
              {user?.profilePhoto ? (
                <img src={user.profilePhoto} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                user?.name ? user.name.charAt(0).toUpperCase() : 'U'
              )}
            </div>
            <h2 className="text-lg font-semibold text-fg-default">{user?.name}</h2>
            <p className="text-xs text-fg-muted mt-0.5">{user?.email}</p>
            <span className="inline-block mt-3 text-xs font-medium text-primary bg-primary-light px-2.5 py-0.5 rounded-full">
              {user?.role} Profile
            </span>
          </div>
        </div>

        {/* Edit fields Column */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="border border-border-default rounded-md bg-white">
            <div className="px-4 py-3 border-b border-border-default bg-canvas-subtle rounded-t-md">
              <h2 className="text-sm font-semibold text-fg-default">Account details</h2>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-fg-default mb-1.5">
                  Display name <span className="text-danger">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-fg-subtle">
                    <UserIcon size={16} />
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-sm bg-white border border-border-default rounded-md pl-10 pr-3 py-1.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-fg-default mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-fg-subtle">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full text-sm bg-canvas-subtle border border-border-default rounded-md pl-10 pr-3 py-1.5 text-fg-subtle cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Candidate fields for resume and cover letter */}
              {user?.role === 'Candidate' && (
                <div className="border-t border-border-default pt-4 mt-4 space-y-4">
                  <h3 className="text-sm font-semibold text-fg-default mb-2 flex items-center gap-1.5">
                    <FileText size={16} className="text-fg-subtle" />
                    LinkedOut Job Application profile
                  </h3>

                  <div className="space-y-3">
                    <label className="block text-xs font-semibold text-fg-default mb-1">
                      Resumes Portfolio
                    </label>

                    {/* Resumes List */}
                    <div className="border border-border-default rounded-md overflow-hidden bg-white divide-y divide-border-default">
                      {profileStore.resumes.map((resume) => {
                        const isSelected = profileStore.selectedResumeId === resume.id;
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
                                name="activeResume"
                                checked={isSelected}
                                onChange={() => profileStore.selectResume(resume.id)}
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
                            
                            <div className="flex items-center gap-3">
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                isSelected ? 'text-primary bg-primary-light border border-primary/25' : 'text-fg-subtle bg-canvas-subtle'
                              }`}>
                                {isSelected ? 'Active' : 'Idle'}
                              </span>

                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setPreviewResumeName(resume.name);
                                  }}
                                  className="p-1 rounded-md border border-border-default text-fg-subtle hover:text-primary hover:bg-canvas-subtle transition-colors"
                                  title="Preview Resume"
                                >
                                  <Eye size={12} />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    toast.success(`Downloading resume: ${resume.name}`);
                                  }}
                                  className="p-1 rounded-md border border-border-default text-fg-subtle hover:text-primary hover:bg-canvas-subtle transition-colors"
                                  title="Download Resume"
                                >
                                  <Download size={12} />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    profileStore.deleteResume(resume.id);
                                    toast.success(`Resume "${resume.name}" deleted successfully!`);
                                  }}
                                  className="p-1 rounded-md border border-border-default text-fg-subtle hover:text-danger hover:bg-canvas-subtle transition-colors"
                                  title="Delete Resume"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* File Uploader */}
                    <div className="p-4 border border-dashed border-border-default rounded-md bg-canvas-subtle flex flex-col items-center justify-center text-center">
                      {uploading ? (
                        <div className="space-y-2 py-2">
                          <Loader2 className="animate-spin text-primary mx-auto" size={24} />
                          <span className="text-xs text-fg-muted font-medium">Uploading document to Cloudinary...</span>
                        </div>
                      ) : (
                        <>
                          <FileText className="text-fg-subtle mb-2" size={24} />
                          <label className="btn-secondary !py-1.5 !px-3 cursor-pointer text-xs font-semibold">
                            <span>Upload New Resume</span>
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx"
                              onChange={handleFileUpload}
                              className="hidden"
                            />
                          </label>
                          <p className="text-[10px] text-fg-subtle mt-1.5">
                            Accepts PDF, DOC, DOCX files up to 10MB
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-fg-default mb-1.5">
                      Skills (Comma separated)
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-fg-subtle">
                        <Award size={16} />
                      </span>
                      <input
                        type="text"
                        value={skills}
                        onChange={(e) => setSkills(e.target.value)}
                        placeholder="e.g. React, Node.js, TypeScript"
                        className="w-full text-sm bg-white border border-border-default rounded-md pl-10 pr-3 py-1.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-fg-default mb-1.5">
                      Default Cover Letter
                    </label>
                    <textarea
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      placeholder="Write your default pitch details here..."
                      rows={5}
                      className="w-full text-sm bg-white border border-border-default rounded-md px-3 py-1.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="px-4 py-3 border-t border-border-default bg-canvas-subtle rounded-b-md flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary"
              >
                {saving ? (
                  <Loader2 className="animate-spin" size={14} />
                ) : (
                  <>
                    <Save size={14} />
                    <span>Save changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      {previewResumeName && getMockResumePreview(previewResumeName)}
    </div>
  );
};
export default ProfilePage;
