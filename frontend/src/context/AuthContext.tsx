import {createContext, useContext, useState, type ReactNode} from "react";
import {login as apiLogin} from "../api";
import {clearToken, getToken, saveToken, userFromToken, type AuthUser} from "../auth";

interface AuthContextValue {
    user: AuthUser | null;
    login: (email: string, password: string) => Promise<void>
    logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function loadUser(): AuthUser | null {
    const token = getToken();
    return token ? userFromToken(token): null;
}

export function AuthProvider({children}: {children: ReactNode}) {
    const [user, setUser] = useState<AuthUser | null>(loadUser);

    async function login(email: string, password: string) {
        const {token} = await apiLogin(email, password);
        saveToken(token);
        setUser(userFromToken(token));
    }
    function logout() {
        clearToken();
        setUser(null);
    }
    
    return (
        <AuthContext.Provider value={{ user, login, logout}}>
            {children}
        </AuthContext.Provider>
    );    
}

export function useAuth() {
        const ctx = useContext(AuthContext);
        if(!ctx) throw new Error("useAuth mora da se koristi unutar AuthProvider-a");
        return ctx;
    }