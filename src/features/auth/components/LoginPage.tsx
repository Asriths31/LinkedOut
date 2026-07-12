import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';
import { useNotificationStore } from '../../../store/notificationStore';
import { api } from '../../../utils/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, ArrowRight, ShieldAlert } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth, isLoading, setLoading } = useAuthStore();
  const { addNotification } = useNotificationStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', {
        email: data.email,
        password: data.password,
      });

      const { user, accessToken } = response.data.data;
      setAuth(user, accessToken);
      toast.success(`Welcome back, ${user.name}!`);
      addNotification(`Logged in successfully as ${user.name}`, 'success');

      // Navigate to respective dashboard
      if (user.role === 'Employer') {
        navigate('/employer/dashboard');
      } else if (user.role === 'Admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/candidate/dashboard');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Invalid email or password. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16 min-h-[calc(100vh-4rem)] flex flex-col justify-center">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="border border-border-default rounded-md bg-white shadow-sm p-8"
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-fg-default mb-2">Welcome Back</h2>
          <p className="text-sm text-fg-muted">Log in to search positions and track applications</p>
        </div>

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
                placeholder="you@domain.com"
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

          {/* Password field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-fg-default">
                Password <span className="text-danger">*</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-primary hover:underline hover:text-primary-dark"
              >
                Forgot?
              </Link>
            </div>
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

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary flex items-center justify-center gap-2 py-2.5"
          >
            {isLoading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                <span>Sign In</span>
                <LogIn size={16} />
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-fg-muted">
          Not registered?{' '}
          <Link to="/register" className="font-semibold text-primary hover:underline hover:text-primary-dark inline-flex items-center gap-0.5">
            Create an Account
            <ArrowRight size={12} />
          </Link>
        </p>
      </motion.div>
    </div>
  );
};
export default LoginPage;
