import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ResumeItem {
  id: string;
  name: string;
  url: string;
  uploadedAt: string;
}

interface ProfileState {
  resumes: ResumeItem[];
  selectedResumeId: string;
  resumePath: string; // Keep this synced for backwards compatibility (holds URL or filename)
  skills: string;
  coverLetter: string;
  setProfileData: (data: { skills: string; coverLetter: string }) => void;
  addResume: (name: string, url?: string) => void;
  selectResume: (id: string) => void;
  deleteResume: (id: string) => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      resumes: [
        { id: '1', name: 'jane_doe_resume_senior_dev.pdf', url: '', uploadedAt: new Date().toLocaleDateString() }
      ],
      selectedResumeId: '1',
      resumePath: 'jane_doe_resume_senior_dev.pdf',
      skills: 'React, Node.js, Express, MongoDB, TypeScript, TailwindCSS',
      coverLetter: 'I am a highly motivated Senior Software Engineer experienced in full stack development. I build clean, maintainable systems and love working on agile teams.',
      setProfileData: (data) => set(data),
      addResume: (name, url) => set((state) => {
        const newItem = {
          id: `resume_${Date.now()}`,
          name,
          url: url || '',
          uploadedAt: new Date().toLocaleDateString()
        };
        return {
          resumes: [...state.resumes, newItem],
          selectedResumeId: newItem.id,
          resumePath: newItem.url || newItem.name, // sync compatibility path to url if available
        };
      }),
      selectResume: (id) => set((state) => {
        const found = state.resumes.find((r) => r.id === id);
        return {
          selectedResumeId: id,
          resumePath: found ? (found.url || found.name) : state.resumePath,
        };
      }),
      deleteResume: (id) => set((state) => {
        const remaining = state.resumes.filter((r) => r.id !== id);
        let nextSelectedId = state.selectedResumeId;
        if (state.selectedResumeId === id) {
          nextSelectedId = remaining[0]?.id || '';
        }
        const found = remaining.find((r) => r.id === nextSelectedId);
        return {
          resumes: remaining,
          selectedResumeId: nextSelectedId,
          resumePath: found ? (found.url || found.name) : '',
        };
      }),
    }),
    {
      name: 'linkedout-profile-details',
    }
  )
);
