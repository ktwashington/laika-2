
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import AuthLayout from './AuthLayout';
import Button from '../../components/Button';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirm) {
      setError("Those passwords don't match yet.");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name.trim(),
          },
        },
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (data.session) {
        navigate('/plan/tasks');
      } else {
        setMessage(
          'Your account has been created! Check your email to confirm your account before logging in.'
        );
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Let's get you started"
      subtitle="Create your account and plan your first tiny mission."
      footer={
        <>
          Already have an account? <Link to="/login">Log in</Link>
        </>
      }
    >
      <form className="auth__form" onSubmit={handleSubmit}>
        <label className="auth__field">
          <span>Name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            required
          />
        </label>

        <label className="auth__field">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </label>

        <label className="auth__field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
          />
        </label>

        <label className="auth__field">
          <span>Confirm password</span>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            required
          />
        </label>

        {error && (
          <p className="auth__error" role="alert">
            {error}
          </p>
        )}

        {message && (
          <p className="auth__message" role="status">
            {message}
          </p>
        )}

        <Button type="submit" size="lg" fullWidth disabled={loading}>
          {loading ? 'Creating account...' : 'Sign up'}
        </Button>
      </form>
    </AuthLayout>
  );
}
