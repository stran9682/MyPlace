import { useState } from 'react';
import '../Styles/StartChatButton.css';

interface StartChatButtonProps {
    otherUserId: string;
    otherUserName: string;
    token: string;
    onChatCreated?: (groupId: number, groupName: string) => void;
}

const API_URL = import.meta.env.VITE_API_URL;

function StartChatButton({ otherUserId, otherUserName, token, onChatCreated }: StartChatButtonProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleStartChat = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_URL}/Message/create-group`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    otherUserId: otherUserId
                })
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Chat created:', data);

                // Notify parent component
                if (onChatCreated) {
                    onChatCreated(data.id, data.groupName);
                }

                // Show success message
                if (data.alreadyExists) {
                    alert(`Chat with ${otherUserName} already exists! Opening...`);
                } else {
                    alert(`Chat created with ${otherUserName}!`);
                }
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Failed to create chat');
            }
        } catch (err) {
            console.error('Error creating chat:', err);
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="start-chat-container">
            <button
                className="start-chat-btn"
                onClick={handleStartChat}
                disabled={loading}
            >
                {loading ? 'Starting Chat...' : `💬 Chat with ${otherUserName}`}
            </button>
            {error && <p className="error-message">{error}</p>}
        </div>
    );
}

export default StartChatButton;