import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface AuthContextType {
    token: string;
    userId: string;
    setAuth: (token: string, userId: string) => void;
    clearAuth: () => void;
}

const AuthContext = createContext<AuthContextType>({
    token: "",
    userId: "",
    setAuth: () => {},
    clearAuth: () => {}
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState("");
    const [userId, setUserId] = useState("");

    // Load from localStorage on mount
    useEffect(() => {
        const storedToken = localStorage.getItem("jwt_token") || "";
        const storedUserId = localStorage.getItem("user_id") || "";

        console.log("AuthContext initialized:");
        console.log("  Token exists:", !!storedToken);
        console.log("  User ID:", storedUserId);

        setToken(storedToken);
        setUserId(storedUserId);
    }, []);

    const setAuth = (newToken: string, newUserId: string) => {
        console.log("✅ Setting auth - User ID:", newUserId);
        localStorage.setItem("jwt_token", newToken);
        localStorage.setItem("user_id", newUserId);
        setToken(newToken);
        setUserId(newUserId);
    };

    const clearAuth = () => {
        console.log("🚪 Clearing auth");
        localStorage.removeItem("jwt_token");
        localStorage.removeItem("user_id");
        setToken("");
        setUserId("");
    };

    return (
        <AuthContext.Provider value={{ token, userId, setAuth, clearAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);

    // Debug log
    console.log("useAuth called - Token exists:", !!context.token);

    return context;
};