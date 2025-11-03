import '../styles/LandingContent.css'
import roommatesImage from '../assets/images/block1-roommates.webp'
import type { ReactElement } from 'react'
import { useNavigate } from 'react-router-dom';


function LandingContent(): ReactElement {
    const navigate = useNavigate();

    return (
        <section className="block1">
            <div className="block1-content">
                <h1>Need a new</h1>
                <h1>roommate?</h1>
                <p>Let's get you one.</p>
                
                <div className="block1-buttons">
                    <button className="btn-primary" onClick={() => navigate('/signup')}>
                        Signup
                    </button>
                    <button className="btn-secondary" onClick={() => navigate('/login')}>
                        Login
                    </button>
                </div>
            </div>

            <div className="block1-image">
                <img src={roommatesImage} alt="Roommates" />
            </div>
        </section>
    );
}

export default LandingContent;