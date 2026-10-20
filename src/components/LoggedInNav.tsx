import Button from './Button';
import './Navbar.css';

export default function Navbar() {
  return (
    <nav className="navbar" aria-label="Main">
       <a href="/dashboard" className="navbar__logo">
        <img src="/Favicon.png" className="navbar__logo-img"/>
      </a>
      
      <div className="navbar__actions">
        <Button size="sm" href="/sessions">
          My Sessions
        </Button>
        <Button size="sm" href="/">
          Logout
        </Button>
        <Button size="sm" href="/settings">
          Account
        </Button>
      </div>
    </nav>
  );
}