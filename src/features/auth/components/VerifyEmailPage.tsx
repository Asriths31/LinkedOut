import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../../../utils/api';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState('');

  const token = searchParams.get('token');

  useEffect(() => {
    const triggerVerification = async () => {
      if (!token) {
        setStatus('error');
        setErrorMessage('Verification token is missing from the URL.');
        return;
      }

      try {
        await api.post('/auth/verify-email', { token });
        setStatus('success');
      } catch (error: any) {
        setStatus('error');
        setErrorMessage(error.response?.data?.message || 'Verification failed. The link may have expired.');
      }
    };

    triggerVerification();
  }, [token]);

  return (
    <div className="mx-auto max-w-md px-4 py-20 min-h-[calc(100vh-4rem)] flex flex-col justify-center">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="border border-border-default rounded-md bg-white shadow-sm p-8 text-center"
      >
        {status === 'verifying' && (
          <div className="py-8 flex flex-col items-center">
            <Loader2 className="animate-spin text-primary mb-4" size={40} />
            <h2 className="text-2xl font-semibold text-fg-default mb-2">Verifying Email</h2>
            <p className="text-sm text-fg-muted">
              Please wait while we confirm your activation code...
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="py-6 flex flex-col items-center">
            <div className="h-14 w-14 rounded-full bg-success-light text-success flex items-center justify-center mb-5">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-2xl font-semibold text-fg-default mb-2">Account Verified!</h2>
            <p className="text-xs text-fg-muted leading-relaxed mb-8 max-w-xs">
              Thank you for verifying your email address. Your account is now active and ready.
            </p>
            <Link to="/login" className="btn-primary w-full flex items-center justify-center gap-2 py-2.5">
              <span>Sign In to Account</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="py-6 flex flex-col items-center">
            <div className="h-14 w-14 rounded-full bg-danger-light text-danger flex items-center justify-center mb-5">
              <XCircle size={32} />
            </div>
            <h2 className="text-2xl font-semibold text-fg-default mb-2">Verification Failed</h2>
            <p className="text-xs text-danger leading-relaxed mb-8 max-w-xs font-medium">
              {errorMessage}
            </p>
            <Link to="/login" className="btn-secondary w-full py-2.5">
              <span>Return to Login</span>
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
};
export default VerifyEmailPage;
