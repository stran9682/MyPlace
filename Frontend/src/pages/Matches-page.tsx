import Matches from '../Components/Matches'
import { useEffect, useState } from "react";

const header = import.meta.env.VITE_API_URL

export type Profile = {
    id: string
    bio: string
    firstName: string
    lastName: string
    suggestionType: string
    userName: string
    pictures: [
        { fileName : string, id: number, profileId: string }
    ]
}

export const Matchespage = () => {

    const [index, setIndex] = useState(3);
    const [ids, setIds] = useState<string[]>([])
    const [profileQueue, setProfileQueue] = useState<Profile[]>([])  // just to queue up results
  

    const handleNextProfile = () => {

        if (profileQueue.length < 3) {
            setProfileQueue(prev => [...prev.slice(1)])
            return;
        }

        const getProfile = async (id:string) => {
            const profile = await fetch(header + `/Profile/get-public-profile?userId=${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
                }
            });

            const res =  await profile.json();

            setProfileQueue(prev => [...prev.slice(1), res])
        }

        // TODO check for out of bounds errors
        getProfile(ids[index])
        setIndex(index => index + 1);
    }

    useEffect(() => {
        const headers = { 'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')};

        const getRecs = async () => {
            const response = await fetch(header + "/Profile/get-recommendations", { headers })
            
            const data = await response.json()
            setIds(data)

            const results = await Promise.all(
                data.slice(0, 3).map(async (id : string) => {
                    const profile = await fetch(header + `/Profile/get-public-profile?userId=${id}`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
                        }
                    });
                    return profile.json();
                })
            );

            setProfileQueue(results);
        }

        getRecs();
    }, [])

    return (
        <div className="matches-page">
            {ids.length != 0 ? 
                profileQueue[0] != undefined? 
                    <Matches profile={profileQueue[0]} handleNextProfile={handleNextProfile}/> 
                :
                    <h1>We low-key ran out of profiles for you, maybe try again a little later?</h1>
            : 
                <h1> Still retreiving it dawg</h1>
            }
        </div>
)}