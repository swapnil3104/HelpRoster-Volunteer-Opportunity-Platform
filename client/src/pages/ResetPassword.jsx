import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import PageContainer from '../components/common/PageContainer';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import TextField from '../components/common/TextField';
import Alert from '../components/common/Alert';
import { resetPassword } from '../services/api';
import { Lock, CheckCircle2, ArrowRight } from 'lucide-react';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const urlToken = searchParams.get('token') || '';
  const urlEmail = searchParams.get('email') || '';

  const [token, setToken] = useState(urlToken);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!token.trim()) {
      setError('A valid password reset token is required.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify both fields.');
      return;
    }

    try {
      setLoading(true);
      const res = await resetPassword({
        token: token.trim(),
        password
      });

      if (res.data.success) {
        setSuccess(true);
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer className="py-12 flex items-center justify-center min-h-[calc(100vh-16rem)]">
      <div className="w-full max-w-md">
        <Card className="p-8 border-slate-200 shadow-lg shadow-slate-100">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-3">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Set New Password</h1>
            <p className="text-sm text-slate-500 mt-1">
              {urlEmail ? `Create a secure new password for ${urlEmail}.` : 'Enter your new password below.'}
            </p>
          </div>

          {error && (
            <Alert variant="error" className="mb-4">
              {error}
            </Alert>
          )}

          {success ? (
            <div className="text-center space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <p className="font-semibold">Password Reset Complete!</p>
                <p className="text-xs text-emerald-700 mt-1">
                  Your credentials have been updated. You can now sign in with your new password.
                </p>
              </div>

              <div className="pt-4">
                <Button
                  variant="primary"
                  className="w-full flex items-center justify-center gap-2"
                  onClick={() => navigate('/login')}
                >
                  <span>Proceed to Log In</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {!urlToken && (
                <TextField
                  label="Reset Token"
                  placeholder="Paste token from your email link..."
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  required
                />
              )}

              <TextField
                label="New Password"
                type="password"
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={Lock}
                required
                autoFocus
              />

              <TextField
                label="Confirm New Password"
                type="password"
                placeholder="Re-enter your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                icon={Lock}
                required
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                loading={loading}
              >
                Update Password
              </Button>

              <div className="text-center pt-3 border-t border-slate-100">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  Cancel and return to sign in
                </Link>
              </div>
            </form>
          )}
        </Card>
      </div>
    </PageContainer>
  );
}
