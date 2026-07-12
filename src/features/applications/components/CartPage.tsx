import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../../../store/cartStore';
import { useApplyMutation } from '../hooks/useApplications';
import { Trash2, ShoppingBag, Building2, MapPin, Send, CheckSquare, Square, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, removeItem, clearCart } = useCartStore();
  const applyMutation = useApplyMutation();

  // Selection states
  const [selectedJobIds, setSelectedJobIds] = useState<string[]>([]);
  const [batchApplying, setBatchApplying] = useState(false);

  const toggleSelect = (jobId: string) => {
    if (selectedJobIds.includes(jobId)) {
      setSelectedJobIds(selectedJobIds.filter((id) => id !== jobId));
    } else {
      setSelectedJobIds([...selectedJobIds, jobId]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedJobIds.length === items.length) {
      setSelectedJobIds([]);
    } else {
      setSelectedJobIds(items.map((item) => item.jobId));
    }
  };

  const handleBatchApply = async (jobIdsToApply: string[]) => {
    if (jobIdsToApply.length === 0) {
      toast.error('Please select at least one position to apply.');
      return;
    }

    setBatchApplying(true);
    let successCount = 0;
    let failCount = 0;

    for (const jobId of jobIdsToApply) {
      try {
        await applyMutation.mutateAsync({
          jobId,
          resume: 'jane_doe_resume_senior_dev.pdf', // default mock resume path
          coverLetter: 'Quick apply dispatched from Apply Later cart.',
          answers: [],
        });
        successCount++;
        removeItem(jobId);
      } catch (err: any) {
        failCount++;
      }
    }

    setBatchApplying(false);
    setSelectedJobIds([]);

    if (successCount > 0) {
      toast.success(`Successfully applied to ${successCount} position(s)!`);
    }
    if (failCount > 0) {
      toast.error(`Failed to apply to ${failCount} position(s). You may have already applied.`);
    }
  };

  return (
    <div className="mx-auto max-w-[1280px] px-4 lg:px-6 py-8">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-border-default pb-6 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-fg-default mb-1">Apply Later Cart</h1>
          <p className="text-sm text-fg-muted">Manage and batch-apply to queued job openings</p>
        </div>
        {items.length > 0 && (
          <button
            onClick={clearCart}
            type="button"
            className="text-xs font-semibold text-danger hover:underline"
          >
            Clear All
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 bg-white border border-border-default rounded-md">
          <ShoppingBag className="mx-auto text-fg-subtle mb-3" size={44} />
          <h2 className="text-lg font-semibold text-fg-default mb-1">Your cart is empty</h2>
          <p className="text-sm text-fg-muted mb-6">Explore listings and click "Apply Later" to queue positions here.</p>
          <Link to="/jobs" className="btn-primary py-2 px-6 text-sm">
            Find Openings
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Batch Actions Header Bar */}
          <div className="border border-border-default rounded-md bg-canvas-subtle p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleSelectAll}
                className="text-fg-muted hover:text-primary flex items-center gap-1.5 text-xs font-semibold"
              >
                {selectedJobIds.length === items.length ? (
                  <CheckSquare size={18} className="text-primary" />
                ) : (
                  <Square size={18} />
                )}
                <span>Select All ({selectedJobIds.length}/{items.length})</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              {/* Apply Selected */}
              <button
                disabled={selectedJobIds.length === 0 || batchApplying}
                onClick={() => handleBatchApply(selectedJobIds)}
                className="btn-secondary flex items-center gap-1.5 py-1.5 px-4 text-xs disabled:opacity-40"
              >
                {batchApplying ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                <span>Apply to Selected ({selectedJobIds.length})</span>
              </button>

              {/* Apply All */}
              <button
                disabled={batchApplying}
                onClick={() => handleBatchApply(items.map((i) => i.jobId))}
                className="btn-primary flex items-center gap-1.5 py-1.5 px-5 text-xs"
              >
                {batchApplying ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                <span>Apply to All ({items.length})</span>
              </button>
            </div>
          </div>

          {/* Cart list items */}
          <div className="border border-border-default rounded-md overflow-hidden">
            {items.map((item, idx) => {
              const isSelected = selectedJobIds.includes(item.jobId);
              return (
                <motion.div
                  key={item.jobId}
                  layout
                  className={`p-4 flex items-center gap-4 bg-white transition-all hover:bg-canvas-subtle ${
                    isSelected ? 'bg-primary-light/30' : ''
                  } ${idx < items.length - 1 ? 'border-b border-border-default' : ''}`}
                >
                  {/* Select Checkbox */}
                  <button
                    type="button"
                    onClick={() => toggleSelect(item.jobId)}
                    className="text-fg-subtle hover:text-primary transition-colors"
                  >
                    {isSelected ? <CheckSquare size={18} className="text-primary" /> : <Square size={18} />}
                  </button>

                  <div className="flex-grow flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-md bg-canvas-subtle border border-border-default flex items-center justify-center overflow-hidden">
                        {item.companyLogo ? (
                          <img src={item.companyLogo} alt={item.companyName} className="h-full w-full object-cover" />
                        ) : (
                          <Building2 size={18} className="text-fg-subtle" />
                        )}
                      </div>
                      <div>
                        <Link
                          to={`/jobs/${item.jobId}`}
                          className="font-semibold text-sm text-fg-default hover:text-primary transition-colors"
                        >
                          {item.jobTitle}
                        </Link>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-fg-muted">
                          <span>{item.companyName}</span>
                          <span className="h-1 w-1 rounded-full bg-border-default"></span>
                          <span className="flex items-center gap-0.5">
                            <MapPin size={12} />
                            {item.location}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end md:self-auto">
                      {/* Remove */}
                      <button
                        onClick={() => removeItem(item.jobId)}
                        className="p-2 text-fg-subtle hover:text-danger hover:bg-danger-light rounded-md border border-border-default transition-colors"
                        title="Remove from cart"
                      >
                        <Trash2 size={14} />
                      </button>

                      {/* Single Apply */}
                      <button
                        onClick={() => navigate(`/apply/${item.jobId}`)}
                        className="btn-primary flex items-center gap-1.5 py-1.5 px-4 text-xs"
                      >
                        <span>Apply Now</span>
                        <Send size={13} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
export default CartPage;
