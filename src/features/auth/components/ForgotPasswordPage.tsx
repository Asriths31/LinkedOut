import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { api } from '../../../utils/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Mail, ShieldAlert, ArrowLeft, Send } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const ForgotPasswordPage: React.FC = () => {
  const [submitting, setSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setSubmitting(true);
    try {
      await api.post('/auth/forgot-password', data);
      toast.success('Recovery link sent! Please check your email.');
      setEmailSent(true);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Unable to send recovery email. Please try again later.';
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
          <h2 className="text-2xl font-semibold text-fg-default mb-2">Reset Password</h2>
          <p className="text-sm text-fg-muted">
            Enter your email below to receive a password recovery link
          </p>
        </div>

        {emailSent ? (
          <div className="text-center py-6">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success-light text-success mb-4">
              <Send size={24} />
            </div>
            <h3 className="text-lg font-semibold text-fg-default mb-2">Check Your Email</h3>
            <p className="text-xs text-fg-muted leading-relaxed mb-6">
              If an account is associated with that email address, a recovery URL has been sent. Follow the link inside to set a new password.
            </p>
            <Link to="/login" className="btn-secondary flex items-center justify-center gap-2 py-2.5">
              <ArrowLeft size={16} />
              <span>Back to Login</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email field */}
            <div>
              <label className="block text-xs font-semibold text-fg-default mb-1.5">
                Email Address <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-fg-subtle">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  placeholder="jane@domain.com"
                  {...register('email')}
                  className={`input-field pl-10 ${
                    errors.email ? 'border-danger focus:ring-danger/20 focus:border-danger' : ''
                  }`}
                />
              </div>
              {errors.email && (
                <span className="flex items-center gap-1 mt-1 text-xs text-danger">
                  <ShieldAlert size={12} />
                  {errors.email.message}
                </span>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full btn-primary flex items-center justify-center gap-2 py-2.5"
            >
              {submitting ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <span>Send Recovery Link</span>
                  <Send size={16} />
                </>
              )}
            </button>

            <Link to="/login" className="flex items-center justify-center gap-2 text-xs font-semibold text-fg-muted hover:text-fg-default pt-2">
              <ArrowLeft size={14} />
              <span>Cancel & Return</span>
            </Link>
          </form>
        )}
      </motion.div>
    </div>
  );
};
export default ForgotPasswordPage;
