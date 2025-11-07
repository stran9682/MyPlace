import '../Styles/Header.css'
import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'

function Header(): ReactElement {

    return (
        <header className="header">
            <div className="logo">MyPlace</div>
            <nav className="nav">
                <Link to="/login">LOGIN</Link>
                <Link to="/signup">SIGNUP</Link>
                <Link to="/about">ABOUT</Link>
            </nav>
        </header>
    );
}

export default Header;