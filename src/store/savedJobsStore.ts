import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SavedJobsState {
  savedJobIds: string[];
  toggleSaveJob: (jobId: string) => void;
  isSaved: (jobId: string) => boolean;
}

export const useSavedJobsStore = create<SavedJobsState>()(
  persist(
    (set, get) => ({
      savedJobIds: [],
      toggleSaveJob: (jobId) => {
        const ids = get().savedJobIds;
        const exists = ids.includes(jobId);
        if (exists) {
          set({ savedJobIds: ids.filter((id) => id !== jobId) });
        } else {
          set({ savedJobIds: [...ids, jobId] });
        }
      },
      isSaved: (jobId) => get().savedJobIds.includes(jobId),
    }),
    {
      name: 'job-board-saved-jobs',
    }
  )
);
