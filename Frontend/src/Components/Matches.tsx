import '../styles/Matches.css'
import profilepicture from '../assets/images/profile-picture.png'
import petfriendly from '../assets/images/dog.png'
import nomusic from '../assets/images/nomusic.png'
import apartment from '../assets/images/apartment.png'
import type { ReactElement } from 'react'
import { useNavigate } from 'react-router-dom';


function Matches(): ReactElement {
    const navigate = useNavigate();

    return (
        <>
            <div className="matches-content">
                 <div className='profile-block1'>
                        <div className='block1-photo'>
                            <img src={profilepicture} alt="profile picture" />
                        </div>

                        <div className='block1-info'>
                            <h1>Chris Ross</h1>
                            <p>He/Him - 23 years old</p>
                            <p>Budget: $550/mo</p>
                            <hr className='hzr'></hr>
                        </div>
                    </div>

                    <div className='profile-block2'>
                        <div className='block2-item1'>
                            <img src={apartment} />   
                            <p>Apartment</p>
                        </div>
                        <div className='block2-item2'>
                            <img src={nomusic} />
                            <p>Quiet</p>
                        </div>
                        <div className='block2-item3'>
                            <img src={petfriendly} />
                            <p>Pet-friendly</p>
                        </div>
                    </div>
                    <div className='profile-block3'>
                        <p> <b>Bio:</b> Lorem ipsum dolor sit amet consectetur adipisicing elit. Omnis ducimus nisi culpa, aperiam in ipsa at excepturi quia! Ipsa consequuntur dolorum sunt praesentium molestiae ratione eaque veritatis. Quae, enim quo.</p>
                    </div>
                
            </div>
            <div className="matches-buttons">
            <button className="btn-skip" onClick={() => navigate('/signup')}>
                Skip
            </button>
            <button className="btn-match" onClick={() => navigate('/login')}>
                Match
            </button>
        </div>
        </>
            
    );
}

export default Matches;