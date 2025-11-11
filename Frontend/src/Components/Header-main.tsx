import '../Styles/Headermain.css'
import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'

function Headermain(): ReactElement {

    return (
        <header className="header">
            <div className="logo">MyPlace</div>
            <nav className="settings">
                <div className="matches-navbtn">
                    <Link to="/matches">MATCHES</Link>
                </div>
                <div>
                    <Link to="/login">MESSAGES</Link>
                </div>
                <div>
                    <Link to="/signup">PROFILE</Link>
                </div>
            </nav>
        </header>
    );
}

export default Headermain;