import '../Styles/Headermain.css';
import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';

function Headermain(): ReactElement {
  return (
    <header className="header">
      <div className="logo">MyPlace</div>
      <nav className="settings">
        <div className="matches-navbtn">
          <Link to="/matches">Matches</Link>
        </div>
        <div>
          <Link to="/messages">Messages</Link>
        </div>
        <div>
          <Link to="/signup">Profile</Link>
        </div>

        <div>
          <Link to="/users">Users</Link> {/* 👈 Change this */}
        </div>
      </nav>
    </header>
  );
}

export default Headermain;
