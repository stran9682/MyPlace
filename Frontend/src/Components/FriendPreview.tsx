import { useEffect, useState } from "react";
import type { Profile } from "../pages/Matches-page";
import '../Styles/FriendPreview.css'


const header = import.meta.env.VITE_API_URL
const bucket = import.meta.env.VITE_BUCKET_URL

export const FriendPreview = ({profile, addable, handleAddToGroup} : {profile : Profile, addable : boolean, handleAddToGroup : (userId : string) => void}) => {

    const [pfp, setPfp] = useState("");
    const [added, setAdded] = useState(false) 

    useEffect(() => {
        const loadPfp = async () => {
            const response =  await fetch(header + `/Profile/get-pfp-url/?userId=${profile.id}`)

            if (!response.ok){
                const errorText = await response.text();
                console.error(errorText)
                return;
            }

            const result = await response.text()
            setPfp(`url("${bucket+"/"+result}")`)
        }

        loadPfp()
    }, [])



    return (<div className="container">
        <div className="profile">
            <div className={`pfp`} style={{backgroundImage: pfp, backgroundSize: 'cover' }}>
                {profile.userName.charAt(0).toUpperCase()}
            </div>
        
            <h3>{profile.userName}</h3>
        </div>

        <div>
            {addable ?
                <button type="submit" disabled={added} onClick={() => {handleAddToGroup(profile.id); setAdded(true)}}>
                    {added ? "added!" : "send"}
                </button>
                :

                <button type="submit" disabled={true}>
                    Already In Group
                </button>    
            }
        </div>
    </div>)

}