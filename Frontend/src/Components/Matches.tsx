import { useState } from 'react'
import '../Styles/Matches.css'
import type { Profile } from '../pages/Matches-page'
import { ImageContainer } from './ImageContainer'
import { AnimatePresence, motion } from "motion/react"
import accept from '../../src/assets/sounds/ding-36029.mp3'
import deny from '../../src/assets/sounds/crumple-03-40747.mp3'
import useSound from 'use-sound';

const header = import.meta.env.VITE_API_URL


const Matches = ({profile, handleNextProfile} : {profile : Profile, handleNextProfile : () => void}) => {

    const [direction, setDirection] = useState(0);
    const [playAccept] = useSound(accept);
    const [playDeny] = useSound(deny);

    const handleAccept = () => {

        const accept = async () => {
            await fetch(header + `/Profile/send-request?receiverId=${profile.id}`, { 
                method: "POST", 
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
                }
            })
        }

        setDirection(200)
        accept()
        handleNextProfile();
        playAccept()
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

        playDeny()
        setDirection(-200)
        handleNextProfile();
    }

    const pictures = [
        {fileName: "src/assets/images/chris_tinder.png", id: 1, profileId: "1"},
        {fileName: "src/assets/images/profile-picture.png", id: 1, profileId: "1"},
        {fileName: "src/assets/images/IMG_2755.JPG", id: 1, profileId: "1"}
    ]

    return (
        <>  
        <AnimatePresence mode="wait">
            <motion.div 
                initial={{ y: 100, opacity: 0 }} 
                transition={{
                    type: "spring",
                    stiffness: 250,
                    damping: 26
                }} 
                animate={{ y: 0, opacity: 1 }} 
                exit={{ x: direction, opacity: 0 }} 
                className={`matches-content ${profile != undefined && profile.suggestionType === "Suggestion" 
                    ? "suggestion": "pending"}`
                } 
                key={profile.id}
            >
                <div className='profile-block1' >
                    <ImageContainer pictures={pictures}/>

                    <div>
                        <h1>{profile?.firstName} {profile?.lastName}</h1>
                        {profile?.userName}
                        <hr className='hzr'></hr>
                    </div>
                </div>

                <div>
                    <p> <b>Bio:</b> {profile?.bio}</p>
                </div>
            </motion.div>
        </AnimatePresence>
            
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