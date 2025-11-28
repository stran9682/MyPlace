import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface AuthContextType {
    token: string;
    userId: string;
    lastSeen: string;
    setAuth: (token: string, userId: string) => void;
    clearAuth: () => void;
    updateLastSeen: (timestamp: string) => void;
}

const AuthContext = createContext<AuthContextType>({
    token: "",
    userId: "",
    lastSeen: "",
    setAuth: () => {},
    clearAuth: () => {},
    updateLastSeen: () => {}
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState("");
    const [userId, setUserId] = useState("");
    const [lastSeen, setLastSeen] = useState("");
    const API_URL = import.meta.env.VITE_API_UR
    
    // Load from localStorage on mount
    useEffect(() => {
        const storedToken = localStorage.getItem("token") || "";
        const storedUserId = localStorage.getItem("user_id") || "";
        const storedLastSeen = localStorage.getItem("last_seen") || "";

        console.log("AuthContext initialized:");
        console.log("  Token exists:", !!storedToken);
        console.log("  User ID:", storedUserId);

        setToken(storedToken);
        setUserId(storedUserId);
        setLastSeen(storedLastSeen);
    }, []);

    const setAuth = (newToken: string, newUserId: string) => {
        console.log("✅ Setting auth - User ID:", newUserId);
        localStorage.setItem("token", newToken);
        localStorage.setItem("user_id", newUserId);
        setToken(newToken);
        setUserId(newUserId);
    };

    const clearAuth = () => {
        console.log("🚪 Clearing auth");

        // Call logout endpoint
        fetch(`${API_URL}/Profile/logout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).catch(err => console.error('Logout error:', err));

        const timestamp = new Date().toISOString();
        localStorage.setItem("last_seen", timestamp);
        localStorage.removeItem("token");
        localStorage.removeItem("user_id");
        setToken("");
        setUserId("");
        setLastSeen(timestamp);
    };

    const updateLastSeen = (timestamp: string) => {
        localStorage.setItem("last_seen", timestamp);
        setLastSeen(timestamp);
    };

    return (
        <AuthContext.Provider value={{ token, userId, lastSeen, setAuth, clearAuth, updateLastSeen }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    console.log("useAuth called - Token exists:", !!context.token);
    return context;
};