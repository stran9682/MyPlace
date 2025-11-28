import '../Styles/UserStatus.css';
import type { ReactElement } from 'react'; 

interface UserStatusProps {
    isOnline: boolean;
    lastSeen?: string;
}

// ✅ Helper function
const formatLastSeen = (lastSeen: string): string => {
    const now = new Date();
    const lastSeenDate = new Date(lastSeen);
    const diffInMs = now.getTime() - lastSeenDate.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return lastSeenDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    });
};

function UserStatus({ isOnline, lastSeen }: UserStatusProps): ReactElement { // ✅ ADD RETURN TYPE
    return (
        <div className="user-status">
            <span className={`status-dot ${isOnline ? 'online' : 'offline'}`}></span>
            {!isOnline && lastSeen && (
                <span className="last-seen">Last seen {formatLastSeen(lastSeen)}</span>
            )}
        </div>
    );
}

export default UserStatus;