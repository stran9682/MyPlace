import '../Styles/Header.css'
import { Link } from 'react-router-dom'

function Header() { 
    return (
        <div className="header-bg">
            <header className="header">
                <Link to="/" className="logo">MyPlace</Link>
                <nav className="nav">
                    <div className='active-nav-btn'>
                        <Link to="/login">Log in</Link>
                    </div>
                </nav>
            </header>
        </div>
    );
}

export default Header;