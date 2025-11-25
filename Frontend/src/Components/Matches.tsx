import '../Styles/Matches.css'
import type { Profile } from '../pages/Matches-page'

const header = import.meta.env.VITE_API_URL
const imageUrl = import.meta.env.VITE_BUCKET_URL

const Matches = ({profile, handleNextProfile} : {profile : Profile, handleNextProfile : () => void}) => {

    const handleAccept = () => {

        const accept = async () => {
            await fetch(header + `/Profile/send-request?receiverId=${profile.id}`, { 
                method: "POST", 
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
                }
            })
        }

        accept()
        handleNextProfile();
    }

    const handleReject = () => {

        const reject = async () => {
            await fetch(header + `/Profile/reject-request?receiverId=${profile.id}`, { 
                method: "POST", 
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
                }
            })
        }

        // TODO find the right enum
        if (profile.suggestionType == "pending"){
            reject();
        }

        handleNextProfile();
    }

    return (
        <>
            <div className="matches-content">
                 <div className='profile-block1'>

                        <div className='block1-photo'>
                            <img src={imageUrl+"/"+profile?.pictures[0].fileName} alt="profile picture"/>
                        </div>

                        <div className='block1-info'>
                            <h1>{profile?.firstName} {profile?.lastName}</h1>
                            {profile?.userName}
                            <hr className='hzr'></hr>
                        </div>
                    </div>

                    <div className='profile-block3'>
                        <p> <b>Bio:</b> {profile?.bio}</p>
                    </div>
                
            </div>
            <div className="matches-buttons">
            <button className="btn-skip" onClick={() => handleReject()}>
                Skip
            </button>
            <button className="btn-match" onClick={() => handleAccept()}>
                Match
            </button>
        </div>
        </>
            
    );
}

export default Matches;