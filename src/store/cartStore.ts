import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Priority = 'High' | 'Medium' | 'Low';

export interface CartItem {
  jobId: string;
  jobTitle: string;
  companyName: string;
  companyLogo?: string;
  location: string;
  deadline?: string;
  priority: Priority;
  privateNotes: string;
  selectedResumeId: string | null;
  selectedResumeName: string | null;
  coverLetterText: string;
  estimatedTimeMinutes: number;
  addedAt: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'priority' | 'privateNotes' | 'selectedResumeId' | 'selectedResumeName' | 'coverLetterText' | 'estimatedTimeMinutes' | 'addedAt'>) => void;
  removeItem: (jobId: string) => void;
  updateItem: (jobId: string, updates: Partial<Omit<CartItem, 'jobId'>>) => void;
  clearCart: () => void;
  getReadinessPercentage: (jobId: string) => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const exists = get().items.some((i) => i.jobId === item.jobId);
        if (exists) return;

        const newItem: CartItem = {
          ...item,
          priority: 'Medium',
          privateNotes: '',
          selectedResumeId: null,
          selectedResumeName: null,
          coverLetterText: '',
          estimatedTimeMinutes: 8, // Standard average wizard duration
          addedAt: new Date().toISOString(),
        };

        set({ items: [...get().items, newItem] });
      },
      removeItem: (jobId) => {
        set({ items: get().items.filter((item) => item.jobId !== jobId) });
      },
      updateItem: (jobId, updates) => {
        set({
          items: get().items.map((item) =>
            item.jobId === jobId ? { ...item, ...updates } : item
          ),
        });
      },
      clearCart: () => set({ items: [] }),
      getReadinessPercentage: (jobId) => {
        const item = get().items.find((i) => i.jobId === jobId);
        if (!item) return 0;
        let score = 20; // Added to cart base score
        if (item.selectedResumeId) score += 40;
        if (item.coverLetterText.trim().length > 20) score += 30;
        if (item.priority) score += 10;
        return score;
      },
    }),
    {
      name: 'job-board-cart',
    }
  )
);
