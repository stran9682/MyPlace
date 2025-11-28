import '../Styles/Header.css';
import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';

function Header(): ReactElement {
  return (
    <header className="header">
      <div className="logo">MyPlace</div>
      <nav className="nav">
        <div className="login-btn-container">
          <Link to="/login">Log in</Link>
        </div>
      </nav>
    </header>
  );
}

export default Header;
