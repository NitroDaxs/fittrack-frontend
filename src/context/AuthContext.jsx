import {createContext, useCallback, useContext, useMemo, useState} from "react";
import {getToken, setToken} from "../api/client.js";
import {authApi} from "../api/resources.js";

const AuthContext = createContext(null);
const SESSION_KEY = 'fittrack.user.session'

function readStoredSession() {
    try {
        const raw = window.localStorage.getItem(SESSION_KEY)
        const token = getToken()

        if (raw && token) {
            return JSON.parse(raw)
        }
        return null
    } catch (error) {
        return null
    }
}

export function AuthProvider({children}) {
    const [session, setSessionState] = useState(readStoredSession)

    const setSession = useCallback((nextSession) => {
        setSessionState(nextSession)
        try {
            if (nextSession) {
                window.localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession))
            } else {
                window.localStorage.removeItem(SESSION_KEY)
            }
        } catch {
            /* storage unavailable -- session stays in memory */
        }
    }, [])

    const login = useCallback(
        async (credentials) => {
            const data = await authApi.login(credentials)

            const token = data.token || data.access_token
            const user = data.user

            if (token) setToken(token)

            const role = user?.role || 'member'
            const sessionData = {user, role}

            setSession(sessionData)
            return user
        }, [setSession]
    )

    const register = useCallback(
        async (details) => {
            const data = await authApi.register(details)

            const token = data.token || data.access_token
            const user = data.user

            if (token) setToken(token)

            const role = user?.role || 'member'
            const sessionData = {user, role}

            setSession(sessionData)
            return user
        }, [setSession]
    )

    const logout = useCallback(
        async () => {
            try {
                if (authApi.logout) {
                    await authApi.logout().catch(() => {
                    })
                }
            } finally {
                setSession(null)
                setToken(null)
            }
        }
        , [setSession]
    )

    const value = useMemo(
        () => ({
            user: session?.user ?? null,
            role: session?.role ?? 'guest',
            isAuthenticated: Boolean(session && getToken()),
            isMember: session?.role === 'member' || session?.role === 'admin',
            isAdmin: session?.role === 'admin',
            login,
            register,
            logout
        }),
        [session, login, register, logout]
    )

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
