import '../styles/Header.css'
import type { ReactElement } from 'react'

function Header(): ReactElement {

    return (
        <header className="header">
            <div className="logo">MyPlace</div>
            <nav className="nav">
                <a href="#">LOGIN</a>
                <a href="#">SIGNUP</a>
                <a href="#">ABOUT</a>
            </nav>
        </header>
    );
}

export default Header;