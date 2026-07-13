import { create } from 'zustand';
import { api } from '../utils/api';

export interface ResumeItem {
  id: string;
  name: string;
  url: string;
  uploadedAt: string;
}

export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  currentlyWorking: boolean;
  description: string;
}

interface ProfileState {
  resumes: ResumeItem[];
  selectedResumeId: string;
  resumePath: string; // Keep this synced for backwards compatibility
  skills: string;
  coverLetter: string;
  isFresher: boolean;
  faqAnswers: Record<string, string>;
  experiences: ExperienceItem[];
  
  initialize: (data: any) => void;
  clearProfile: () => void;
  setProfileData: (data: { skills: string; coverLetter: string; isFresher: boolean; experiences: ExperienceItem[] }) => void;
  addResume: (name: string, url?: string) => void;
  selectResume: (id: string) => void;
  deleteResume: (id: string) => void;
  setFaqAnswer: (question: string, answer: string) => void;
  updateFaqAnswers: (answers: Record<string, string>) => void;
  addExperience: (exp: Omit<ExperienceItem, 'id'>) => void;
  updateExperience: (id: string, exp: Partial<ExperienceItem>) => void;
  deleteExperience: (id: string) => void;
}

const syncWithBackend = async (state: ProfileState) => {
  try {
    await api.put('/users/profile', {
      resumes: state.resumes,
      selectedResumeId: state.selectedResumeId,
      skills: state.skills,
      coverLetter: state.coverLetter,
      isFresher: state.isFresher,
      faqAnswers: state.faqAnswers,
      experiences: state.experiences,
    });
  } catch (error) {
    console.error('Failed to sync profile with backend', error);
  }
};

export const useProfileStore = create<ProfileState>((set, get) => ({
  resumes: [],
  selectedResumeId: '',
  resumePath: '',
  skills: '',
  coverLetter: '',
  isFresher: false,
  faqAnswers: {},
  experiences: [],

  initialize: (data) => set({
    resumes: data?.resumes || [],
    selectedResumeId: data?.selectedResumeId || '',
    resumePath: data?.resumes?.find((r: any) => r.id === data?.selectedResumeId)?.url || '',
    skills: data?.skills || '',
    coverLetter: data?.coverLetter || '',
    isFresher: data?.isFresher || false,
    faqAnswers: data?.faqAnswers || {},
    experiences: data?.experiences || [],
  }),

  clearProfile: () => set({
    resumes: [],
    selectedResumeId: '',
    resumePath: '',
    skills: '',
    coverLetter: '',
    isFresher: false,
    faqAnswers: {},
    experiences: [],
  }),

  setProfileData: (data) => {
    set(data);
    syncWithBackend(get());
  },

  addResume: (name, url) => {
    const newItem = {
      id: `resume_${Date.now()}`,
      name,
      url: url || '',
      uploadedAt: new Date().toLocaleDateString()
    };
    set((state) => ({
      resumes: [...state.resumes, newItem],
      selectedResumeId: newItem.id,
      resumePath: newItem.url || newItem.name,
    }));
    syncWithBackend(get());
  },

  selectResume: (id) => {
    set((state) => {
      const found = state.resumes.find((r) => r.id === id);
      return {
        selectedResumeId: id,
        resumePath: found ? (found.url || found.name) : state.resumePath,
      };
    });
    syncWithBackend(get());
  },

  deleteResume: (id) => {
    set((state) => {
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
    });
    syncWithBackend(get());
  },

  setFaqAnswer: (question, answer) => {
    set((state) => ({
      faqAnswers: {
        ...state.faqAnswers,
        [question]: answer,
      }
    }));
    syncWithBackend(get());
  },

  updateFaqAnswers: (answers) => {
    set((state) => ({
      faqAnswers: {
        ...state.faqAnswers,
        ...answers,
      }
    }));
    syncWithBackend(get());
  },

  addExperience: (exp) => {
    const newExp: ExperienceItem = {
      ...exp,
      id: `exp_${Date.now()}`,
    };
    set((state) => ({
      experiences: [...state.experiences, newExp],
    }));
    syncWithBackend(get());
  },

  updateExperience: (id, expUpdate) => {
    set((state) => ({
      experiences: state.experiences.map((e) =>
        e.id === id ? { ...e, ...expUpdate } : e
      ),
    }));
    syncWithBackend(get());
  },

  deleteExperience: (id) => {
    set((state) => ({
      experiences: state.experiences.filter((e) => e.id !== id),
    }));
    syncWithBackend(get());
  },
}));
