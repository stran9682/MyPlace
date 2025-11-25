import { createContext, useContext, useState, useEffect } from "react";

interface AuthContextType {
    token: string;
    userId: string;
}

const AuthContext = createContext<AuthContextType>({
    token: "",
    userId: ""
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [token, setToken] = useState("");
    const [userId, setUserId] = useState("");

    useEffect(() => {
        setToken(localStorage.getItem("jwt_token") || "");
        setUserId(localStorage.getItem("user_id") || "");
    }, []);

    return (
        <AuthContext.Provider value={{ token, userId }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
