import { useEffect, useState } from "react";
import type { Profile } from "../pages/Matches-page";
import '../Styles/AddFriends.css'
import { FriendPreview } from "./FriendPreview";
import type { Group } from "../pages/Messages-page";

const API_URL = import.meta.env.VITE_API_URL;

export const AddFriendsMenu = ({setOpenAddMenu, group} : {setOpenAddMenu : (menuState : boolean) => void, group : Group}) => {

    const [friends, setFriends] = useState<Profile[]>([])

    const handleOpenAddMenu = async () => {
        try {
            const response = await fetch(API_URL+'/Profile/get-matches', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
                }
            });

            if (!response.ok) {
                throw new Error(`Something went wrong... ${response.status}`)
            } 

            const data = await response.json();

            const union = [...new Set([...data, ...group.profileIds])]

            const results = await Promise.all(
                union.map(async (id : string) => {
                    const profile = await fetch(API_URL+ `/Profile/get-public-profile?userId=${id}`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
                        }
                    });
                    
                    const result = await profile.json();

                    return result
                })
            );

            setFriends(results)




        } catch (err) {
            console.error('Failed to load message history:', err);
        } finally {
            setOpenAddMenu(true)
        }
    }

    const handleAddToGroup = async (userId : string) => {
        await fetch(API_URL+`/Profile/add-to-group?groupId=${group.id}&otherId=${userId}`, {
            method: 'POST',
            headers: {
               'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
            }
        });
    }

    useEffect(() => {
        handleOpenAddMenu()
    }, [])

    return (
         <div className='add-friends'>
            <div className='add-friends-container'>
                <div className="chatbox-header">
                    <h2>Add Friends</h2>
                    <button className="close-btn" onClick={() => setOpenAddMenu(false)}>×</button>
                </div>

                <div className="add-friends-list">
                    {friends.map((friend, index) => (
                        <FriendPreview profile={friend} key={index} addable={!group.profileIds.includes(friend.id)} handleAddToGroup={handleAddToGroup}/>
                    ))}
                </div>
            </div>
        </div>
    )
}