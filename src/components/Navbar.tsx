import Button from './Button';
import './Navbar.css';

export default function Navbar() {
  return (
    <nav className="navbar" aria-label="Main">
      <a href="/" className="navbar__logo">
        <img src="/Favicon.png" className="navbar__logo-img"/>
      </a>

      <div className="navbar__actions">
        <Button size="sm" href="/login">
          Log in
        </Button>
        <Button size="sm" href="/signup">
          Sign up
        </Button>
      </div>
    </nav>
  );
}