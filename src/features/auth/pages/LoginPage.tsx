import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../../../store/authStore';
import { authService } from '../api/authService';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useState } from 'react';

export const LoginPage = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state:any) => state.login);
  const [apiError, setApiError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm();
  
  const mutation = useMutation({
    mutationFn: authService.signIn,
    onSuccess: ({ user, token }) => {
      login(user, token);
      navigate('/');
    },
    onError: (error: Error) => {
      setApiError(error.message);
    }
  });

  const onSubmit = (data: any) => {
    setApiError(null);
    mutation.mutate(data);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-blue-600">Pactle Login</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            id="email"
            label="Email"
            type="email"
            error={errors.email?.message as string}
            {...register('email', { required: 'Email is required' })}
          />
          <Input
            id="password"
            label="Password"
            type="password"
            error={errors.password?.message as string}
            {...register('password', { required: 'Password is required' })}
          />
          
          {apiError && <p className="text-sm text-red-600">{apiError}</p>}
          
          <Button type="submit" isLoading={mutation.isPending} className="w-full">
            Sign In
          </Button>
        </form>
        <p className="text-sm text-center text-gray-600">
          Don't have an account?{' '}
          <Link to="/signup" className="font-medium text-blue-600 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};