import '../Styles/LandingContent.css'
import roommatesImage from '../assets/images/block1-roommates.webp'
import type { ReactElement } from 'react'
import { useNavigate } from 'react-router-dom';

const header = import.meta.env.VITE_API_URL;
const searchHeader = import.meta.env.VITE_SEARCH_URL;

function LandingContent(): ReactElement {
    const navigate = useNavigate();

    fetch(header + "/getprofile")
    .then(res => res.json())
    .then(data => {
        console.log(data)
    })

    fetch(searchHeader + "/get-all-users")
    .then(res => res.json())
    .then(data => {
        console.log(data)
    })


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