import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';
import { useNotificationStore } from '../../../store/notificationStore';
import { api } from '../../../utils/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Mail, Lock, User as UserIcon, ShieldAlert, ArrowLeft, UserPlus, Briefcase, GraduationCap } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must not exceed 50 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  role: z.enum(['Candidate', 'Employer']),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { isLoading, setLoading } = useAuthStore();
  const { addNotification } = useNotificationStore();

  const [selectedRole, setSelectedRole] = useState<'Candidate' | 'Employer'>('Candidate');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'Candidate' },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/signup', data);
      toast.success(response.data.message || 'Registration successful! Please check your email to verify your account.');
      addNotification(`Account created successfully for ${data.name}. Verification pending.`, 'success');
      navigate('/login');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed. Please check your inputs and try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = (role: 'Candidate' | 'Employer') => {
    setSelectedRole(role);
    setValue('role', role);
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16 min-h-[calc(100vh-4rem)] flex flex-col justify-center">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="border border-border-default rounded-md bg-white shadow-sm p-8"
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-fg-default mb-2">Create Account</h2>
          <p className="text-sm text-fg-muted">Join LinkedOut talent marketplace today</p>
        </div>

        {/* Role Toggle Selector */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            type="button"
            onClick={() => handleRoleSelect('Candidate')}
            className={`flex flex-col items-center justify-center p-4 rounded-md border text-center transition-all duration-200 ${
              selectedRole === 'Candidate'
                ? 'border-primary bg-primary-light text-primary'
                : 'border-border-default bg-white text-fg-muted hover:bg-canvas-subtle'
            }`}
          >
            <GraduationCap size={24} className="mb-2" />
            <span className="text-xs font-semibold">Job Seeker</span>
          </button>
          <button
            type="button"
            onClick={() => handleRoleSelect('Employer')}
            className={`flex flex-col items-center justify-center p-4 rounded-md border text-center transition-all duration-200 ${
              selectedRole === 'Employer'
                ? 'border-primary bg-primary-light text-primary'
                : 'border-border-default bg-white text-fg-muted hover:bg-canvas-subtle'
            }`}
          >
            <Briefcase size={24} className="mb-2" />
            <span className="text-xs font-semibold">Employer</span>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name field */}
          <div>
            <label className="block text-xs font-semibold text-fg-default mb-1.5">
              Full Name <span className="text-danger">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-fg-subtle">
                <UserIcon size={16} />
              </span>
              <input
                type="text"
                placeholder="Jane Doe"
                {...register('name')}
                className={`input-field pl-10 ${
                  errors.name ? 'border-danger focus:ring-danger/20 focus:border-danger' : ''
                }`}
              />
            </div>
            {errors.name && (
              <span className="flex items-center gap-1 mt-1 text-xs text-danger">
                <ShieldAlert size={12} />
                {errors.name.message}
              </span>
            )}
          </div>

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

          {/* Password field */}
          <div>
            <label className="block text-xs font-semibold text-fg-default mb-1.5">
              Password <span className="text-danger">*</span>
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

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary flex items-center justify-center gap-2 py-2.5 mt-2"
          >
            {isLoading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                <span>Sign Up</span>
                <UserPlus size={16} />
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-fg-muted">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-primary hover:underline hover:text-primary-dark inline-flex items-center gap-0.5">
            <ArrowLeft size={12} />
            Back to Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
};
export default RegisterPage;
