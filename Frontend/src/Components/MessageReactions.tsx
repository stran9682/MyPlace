import '../Styles/MessageReactions.css'; 
import { useState } from 'react';
import type { Reaction } from "../hooks/useChatConnection";

interface MessageReactionsProps {
    messageId: number;
    reactions: Reaction[];
    onAddReaction: (messageId: number, emoji: string) => void;
    currentUserId: string;
}

const EMOJI_OPTIONS = ['👍', '❤️', '😂', '😮', '😢', '🎉'];

function MessageReactions({ messageId, reactions, onAddReaction, currentUserId }: MessageReactionsProps) {
    const [showPicker, setShowPicker] = useState(false);

    const handleReactionClick = (emoji: string) => {
        onAddReaction(messageId, emoji);
        setShowPicker(false);
    };

    return (
        <div className="message-reactions-container">
            {/* Display existing reactions */}
            <div className="reactions-display">
                {reactions.map((reaction, idx) => (
                    <button
                        key={idx}
                        className={`reaction-bubble ${reaction.userIds.includes(currentUserId) ? 'user-reacted' : ''}`}
                        onClick={() => handleReactionClick(reaction.emoji)}
                    >
                        {reaction.emoji} {reaction.count}
                    </button>
                ))}
            </div>

            {/* Add reaction button */}
            <div className="reaction-picker">
                <button
                    className="add-reaction-btn"
                    onClick={() => setShowPicker(!showPicker)}
                >
                    +
                </button>

                {showPicker && (
                    <div className="emoji-picker">
                        {EMOJI_OPTIONS.map(emoji => (
                            <button
                                key={emoji}
                                onClick={() => handleReactionClick(emoji)}
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default MessageReactions; // ✅ ADD EXPORT