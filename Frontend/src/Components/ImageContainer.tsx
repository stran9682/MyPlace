import { useState } from "react"
import '../Styles/ImageContainer.css'

const imageUrl = import.meta.env.VITE_BUCKET_URL

export const ImageContainer = ({pictures} : { pictures : {fileName : string, id: number, profileId: string}[] }) => {

    const [index, setIndex] = useState(0);

    const handleForward = () => {
        setIndex(prev => (prev+1) % pictures.length)
    }

    const handleBackward = () => {
        if (index - 1 == -1){
            setIndex(pictures.length -1)
            return;
        }

        setIndex(prev => prev -1)
    }
    

    return <div className="container">
        <img src={`${imageUrl}/${pictures[index].fileName}`} alt="profile picture"/>

        <div className="buttons">
            <a className="button" onClick={() => handleBackward()}></a>
            <a className="button" onClick={() => handleForward()}></a>
        </div>

        {pictures.length > 1 ? 
            <div className="status">
                <div className="dot-container">
                    {pictures.map((item, i) => <span key={i} className={index === i ? "active-dot" : "dot" }></span>)}
                </div>
            </div> : null
        }


    </div>
}