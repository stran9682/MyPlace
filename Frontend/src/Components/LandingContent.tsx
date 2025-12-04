import '../Styles/LandingContent.css'
import type { ReactElement } from 'react'
import { useNavigate } from 'react-router-dom';


function LandingContent(): ReactElement {
    const navigate = useNavigate();

    return (
        <section className="landing-container">
            <div className="landing-text">
                <p>Need help finding a roommate?</p>
                <h1>Let's get you one.</h1>
            </div>
            
            <div className="block1-buttons">
                <button className="signup-btn" onClick={() => navigate('/signup')}>
                    Create account
                </button>
            </div>
        </section>
    );
}

export default LandingContent;