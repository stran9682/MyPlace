import '../Styles/LandingContent.css'
import roommatesImage from '../assets/images/block1-roommates.webp'
import type { ReactElement } from 'react'
import { useNavigate } from 'react-router-dom';

const header = import.meta.env.VITE_API_URL;

function LandingContent(): ReactElement {
    const navigate = useNavigate();

    fetch(header + "/Profile/getprofile")
    .then(res => res.json())
    .then(data => {
        console.log(data)
    })

    fetch(header + "/AttributeSearch/get-all-users")
    .then(res => res.json())
    .then(data => {
        console.log(data)
    })


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