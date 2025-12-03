import '../Styles/Header.css'
import { Link, useLocation } from 'react-router-dom'

const Headermain = ({handleLogout} : {handleLogout : () => void}) => {
        const location = useLocation();

        const getWrapperClass = (path: string): string => {
            if (location.pathname === path) {
                return 'active-nav-btn';
            }
            return 'nav-item';
        };
        
    return (
        <div className="header-bg">
            <header className="header">
                <Link to="/" className="logo">MyPlace</Link>
                <nav className="nav">
                    <div className={getWrapperClass("/matches")}>
                        <Link to="/matches">Matches</Link>
                    </div>
                    <div className={getWrapperClass("/messages")}>
                        <Link to="/messages">Messages</Link>
                    </div>
                    <div className={getWrapperClass("/profile")}>
                        <Link to="/profile">Profile</Link>
                    </div>

                    <div onClick={handleLogout} className="logout-text">Log out</div>
                </nav>
            </header>
        </div>
    );
}

export default Headermain;