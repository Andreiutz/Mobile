import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { getLogger } from '../core';
import { login as loginApi } from './authApi';
import { Preferences } from '@capacitor/preferences';

const log = getLogger('AuthProvider');

type LoginFn = (username?: string, password?: string) => void;
type LogoutFn = () => void;
export interface AuthState {
    authenticationError: Error | null;
    isAuthenticated: boolean;
    isAuthenticating: boolean;
    login?: LoginFn;
    logout?: LogoutFn;
    pendingAuthentication?: boolean;
    username?: string;
    password?: string;
    token: string;
    notCheckingStorageForToken: boolean;
}

const initialState: AuthState = {
    isAuthenticated: false,
    isAuthenticating: false,
    authenticationError: null,
    pendingAuthentication: false,
    token: '',
    notCheckingStorageForToken: false,
};

export const AuthContext = React.createContext<AuthState>(initialState);

interface AuthProviderProps {
    children: PropTypes.ReactNodeLike,
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [state,  setState] = useState<AuthState>(initialState);
    const { isAuthenticated, isAuthenticating, authenticationError, pendingAuthentication, token, notCheckingStorageForToken } = state;
    const login = useCallback<LoginFn>(loginCallback, []);
    const logout = useCallback<LogoutFn>(logoutCallback, [])
    useEffect(authenticationEffect, [pendingAuthentication, notCheckingStorageForToken]);
    useEffect(getTokenFromStorageEffect, [notCheckingStorageForToken])
    const value = { isAuthenticated, login, logout, isAuthenticating, authenticationError, token, notCheckingStorageForToken };
    log('render');
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );

    function loginCallback(username?: string, password?: string): void {
        log('login');
        setState({
            ...state,
            pendingAuthentication: true,
            username,
            password
        });
    }

    function logoutCallback(): void {
        log('logout');
        (async () => {
            await Preferences.remove({key: "user"})
            setState( {
                ...state,
                isAuthenticated: false,
                token: "",
                username: undefined,
                password: undefined,
            });
        })()
    }

    function getTokenFromStorageEffect() {
        let canceled = false;
        checking();
        return() => {
            canceled = true;
        }
        async function checking() {
            if (notCheckingStorageForToken) {
                log("checkingStorageForToken, !checkingStorageForToken, return");
                return;
            }
            log("started check for storage token...")
            const result = await Preferences.get({key: "user"})
            log("Got result from storage: ", result)
            if (result.value === null) {
                setState({
                    ...state,
                    notCheckingStorageForToken: true
                })
                return;
            }
            const json = JSON.parse(result.value);
            setState({
                ...state,
                notCheckingStorageForToken: true,
                token: json.token,
                isAuthenticated: true
            })
        }
    }

    function authenticationEffect() {
        let canceled = false;
        authenticate();
        return () => {
            canceled = true;
        }

        async function authenticate() {
            if (!pendingAuthentication) {
                log('authenticate, !pendingAuthentication, return');
                return;
            }
            if (!notCheckingStorageForToken) {
                log("Waiting for the storage to complete the check...")
                return;
            }
            try {
                log('authenticate...');
                setState({
                    ...state,
                    isAuthenticating: true,
                });
                const { username, password } = state;
                const { token } = await loginApi(username, password);
                if (canceled) {
                    return;
                }
                log('authenticate succeeded');
                await Preferences.set({key: "user", value: JSON.stringify({token: token})});
                setState({
                    ...state,
                    token: token,
                    pendingAuthentication: false,
                    isAuthenticated: true,
                    isAuthenticating: false,
                });
            } catch (error) {
                if (canceled) {
                    return;
                }
                log('authenticate failed');
                setState({
                    ...state,
                    authenticationError: error as Error,
                    pendingAuthentication: false,
                    isAuthenticating: false,
                });
            }
        }
    }
};
