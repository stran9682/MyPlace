import Matches from '../Components/Matches';
import Headermain from '../Components/Header-main';
import StartChatButton from '../Components/StartChatButton';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export const Matchespage = () => {
  const navigate = useNavigate();

  const token = localStorage.getItem('jwt_token') || '';
  const [matchedUser, setMatchedUser] = useState<{ id: string; name: string } | null>(null);

  // Fetch matched users from your API
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/matches`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          console.error('Failed to fetch matches');
          return;
        }

        const data = await response.json();

        // Assuming data = [{ id, name }, { … }]
        if (data.length > 0) {
          setMatchedUser({
            id: data[0].id,
            name: data[0].name,
          });
        }
      } catch (error) {
        console.error('Error fetching matches:', error);
      }
    };

    if (token) {
      fetchMatches();
    }
  }, [token]);

  const handleChatCreated = (groupId: number, groupName: string) => {
    console.log(`Chat created: ${groupName} (ID: ${groupId})`);
    navigate('/messages');
  };

  return (
    <div className="matches-page">
      <Headermain />
      <Matches />

      {/* Start Chat Button */}
      <div
        style={{
          padding: '20px',
          textAlign: 'center',
          marginTop: '20px',
        }}
      >
        {matchedUser ? (
          <StartChatButton
            otherUserId={matchedUser.id}
            otherUserName={matchedUser.name}
            token={token}
            onChatCreated={handleChatCreated}
          />
        ) : (
          <p>Loading matches...</p>
        )}
      </div>
    </div>
  );
};
