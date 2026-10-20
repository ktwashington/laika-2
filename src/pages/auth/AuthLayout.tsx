import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import './Auth.css';

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
};

export default function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <main className="auth">
      <Link to="/" className="auth__logo">
        Laika
      </Link>

      <section className="auth__card">
        <h1 className="auth__title">{title}</h1>
        <p className="auth__subtitle">{subtitle}</p>
        {children}
        <p className="auth__footer">{footer}</p>
      </section>
    </main>
  );
}