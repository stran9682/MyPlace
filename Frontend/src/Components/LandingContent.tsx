import '../styles/LandingContent.css'
import roommatesImage from '../assets/images/block1-roommates.webp'
import type { ReactElement } from 'react'

function LandingContent(): ReactElement {
    const handleSignup = (): void => {
        // Function to navigate to signup page
    };

    const handleLogin = (): void => {
        // Function to navigate to login page
    };
    return (
        <section className="block1">
            <div className="block1-content">
                <h1>Need a new</h1>
                <h1>roommate?</h1>
                <p>Let's get you one.</p>
                
                <div className="block1-buttons">
                    <button className="btn-primary"
                    onClick={handleSignup}>
                        Signup
                        </button>
                    <button className="btn-secondary"
                    onClick={handleLogin}>
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