import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PageContainer from '../components/common/PageContainer';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import TextField from '../components/common/TextField';
import Alert from '../components/common/Alert';
import { forgotPassword } from '../services/api';
import { KeyRound, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [devToken, setDevToken] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      setLoading(true);
      setError(null);
      const res = await forgotPassword({ email: email.trim() });
      if (res.data.success) {
        setSubmitted(true);
        if (res.data.data?.resetToken) {
          setDevToken(res.data.data.resetToken);
        }
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to request password reset.');
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
              <KeyRound className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Forgot your password?</h1>
            <p className="text-sm text-slate-500 mt-1">
              Enter your account email address and we'll send you instructions to reset your password.
            </p>
          </div>

          {error && (
            <Alert variant="error" className="mb-4">
              {error}
            </Alert>
          )}

          {submitted ? (
            <div className="text-center space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <p className="font-semibold">Reset instructions sent!</p>
                <p className="text-xs text-emerald-700 mt-1">
                  If an account exists for <strong>{email}</strong>, you will receive an email shortly with a secure password reset link.
                </p>
              </div>

              {devToken && (
                <div className="p-3 bg-brand-50 border border-brand-200 rounded-xl text-left text-xs">
                  <div className="font-bold text-brand-900 mb-1">🛠️ Local Dev Shortcut:</div>
                  <p className="text-slate-600 mb-2">A signed reset token was generated for testing:</p>
                  <Link
                    to={`/reset-password?token=${devToken}&email=${encodeURIComponent(email)}`}
                    className="inline-flex items-center gap-1 font-semibold text-brand-600 hover:text-brand-700 underline"
                  >
                    <span>Click here to proceed to Password Reset form &rarr;</span>
                  </Link>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100">
                <Link to="/login" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
                  Return to sign in
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <TextField
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={Mail}
                required
                autoFocus
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                loading={loading}
              >
                Send Reset Instructions
              </Button>

              <div className="text-center pt-3 border-t border-slate-100">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </form>
          )}
        </Card>
      </div>
    </PageContainer>
  );
}
