import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../../../utils/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Lock, ShieldAlert, ArrowLeft, CheckCircle2 } from 'lucide-react';

const resetSchema = z
  .object({
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string().min(1, 'Confirm Password is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetFormValues = z.infer<typeof resetSchema>;

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data: ResetFormValues) => {
    if (!token) {
      toast.error('Recovery token is missing. Please use the link from your email.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/auth/reset-password', {
        token,
        password: data.password,
      });
      toast.success('Password updated successfully!');
      setSuccess(true);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Password reset failed. The link may have expired.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-20 min-h-[calc(100vh-4rem)] flex flex-col justify-center">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="border border-border-default rounded-md bg-white shadow-sm p-8"
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-fg-default mb-2">Set New Password</h2>
          <p className="text-sm text-fg-muted">Establish a secure, strong password for your account</p>
        </div>

        {success ? (
          <div className="text-center py-6">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success-light text-success mb-4">
              <CheckCircle2 size={24} />
            </div>
            <h3 className="text-lg font-semibold text-fg-default mb-2">Password Updated</h3>
            <p className="text-xs text-fg-muted leading-relaxed mb-6">
              Your password has been reset successfully. You can now use your new credentials to log in.
            </p>
            <Link to="/login" className="btn-primary w-full py-2.5 flex items-center justify-center gap-2">
              <span>Sign In</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* New Password */}
            <div>
              <label className="block text-xs font-semibold text-fg-default mb-1.5">
                New Password <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-fg-subtle">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register('password')}
                  className={`input-field pl-10 ${
                    errors.password ? 'border-danger focus:ring-danger/20 focus:border-danger' : ''
                  }`}
                />
              </div>
              {errors.password && (
                <span className="flex items-center gap-1 mt-1 text-xs text-danger">
                  <ShieldAlert size={12} />
                  {errors.password.message}
                </span>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-fg-default mb-1.5">
                Confirm Password <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-fg-subtle">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register('confirmPassword')}
                  className={`input-field pl-10 ${
                    errors.confirmPassword ? 'border-danger focus:ring-danger/20 focus:border-danger' : ''
                  }`}
                />
              </div>
              {errors.confirmPassword && (
                <span className="flex items-center gap-1 mt-1 text-xs text-danger">
                  <ShieldAlert size={12} />
                  {errors.confirmPassword.message}
                </span>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full btn-primary flex items-center justify-center gap-2 py-2.5 mt-2"
            >
              {submitting ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <span>Confirm Password</span>
              )}
            </button>

            <Link to="/login" className="flex items-center justify-center gap-2 text-xs font-semibold text-fg-muted hover:text-fg-default pt-2">
              <ArrowLeft size={14} />
              <span>Back to Login</span>
            </Link>
          </form>
        )}
      </motion.div>
    </div>
  );
};
export default ResetPasswordPage;
