'use client';

import { useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { AdminDashboard } from '@/components/admin-dashboard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Mail, Lock } from 'lucide-react';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (session) {
    return <AdminDashboard />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (result?.error) {
        setError(result.error);
      }
    } catch (err: Error | unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Panel - Blue Background with Logo */}
      <div className="md:w-1/2 bg-[#0066b2] flex flex-col justify-center items-center p-8 text-white">
        <div className="max-w-md text-center">
          <Image
            src="/favicon.png"
            alt="Mazars Logo"
            width={200}
            height={80}
            className="mb-8 mx-auto"
          />
          <h2 className="text-3xl font-bold mb-4">Welcome to Admin Portal</h2>
          <p className="text-lg opacity-90">
            Manage and monitor cybersecurity assessments from a centralized dashboard
          </p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="md:w-1/2 bg-white flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Admin Login</h2>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to access the admin dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Email address"
                  className="pl-10 h-12 border-gray-300 focus:ring-[#0066b2] focus:border-[#0066b2]"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Password"
                  className="pl-10 h-12 border-gray-300 focus:ring-[#0066b2] focus:border-[#0066b2]"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 bg-[#0066b2] hover:bg-[#005291] text-white font-medium rounded-md"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
} 