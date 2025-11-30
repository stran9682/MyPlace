import '../Styles/Headermain.css'
import { Link } from 'react-router-dom'

const Headermain = ({handleLogout} : {handleLogout : () => void}) => {

    return (
        <header className="header">
            <Link to="/" className="logo">MyPlace</Link>
            <nav className="nav">
                <div className="matches-navbtn">
                    <Link to="/matches">Matches</Link>
                </div>
                <div>
                    <Link to="/messages">Messages</Link>
                </div>
                <div>
                    <Link to="/signup">Profile</Link>
                </div>

                <div onClick={() => handleLogout()}>Log out</div>
            </nav>
        </header>
    );
}

export default Headermain;