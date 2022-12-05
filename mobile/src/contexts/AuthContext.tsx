import { createContext, ReactNode, useState, useEffect } from "react";
import * as Google from "expo-auth-session/providers/google";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";

// Ensure the browser redirection
WebBrowser.maybeCompleteAuthSession()

interface UserProps {
    name: string
    avatarUrl: string
}

interface AuthProviderProps {
    children: ReactNode
}

export interface AuthContextDataProps {
    user: UserProps
    isUserLoading: boolean
    signIn: () => Promise<void>
}

export const AuthContext = createContext({} as AuthContextDataProps)

export function AuthContextProvider({ children }) {
    const [user, setUser] = useState<UserProps>({} as UserProps)
    const [isUserLoading, setIsUserLoading] = useState(false)

    const [request, response, promptAsync] = Google.useAuthRequest({
        clientId: "530905519015-a7935ft3rt9oso0k8njeje5oj5i636nc.apps.googleusercontent.com",
        redirectUri: AuthSession.makeRedirectUri({ useProxy: true }),
        scopes: ["profile", "email"]
    })

    async function signIn() {
        try {
            setIsUserLoading(true)
            // Function starts the flow authentication
            await promptAsync()
        } catch (error) {
            throw error
        }
        setIsUserLoading(false)
    }

    function signWithGoogle(access_token: string) {
        console.log(`Authentication token: ${access_token}`)
    }

    // Executa sempre que houver uma resposta de autenticação
    useEffect(() => {
        const haveAccessTokenAndSuccessfully = response?.type === "success" && response?.authentication.accessToken
        if (haveAccessTokenAndSuccessfully) signWithGoogle(response.authentication.accessToken)
    }, [response])

    return (
        <AuthContext.Provider value={{
            signIn,
            isUserLoading,
            user
        }}>
            {children}
        </AuthContext.Provider>
    )
}