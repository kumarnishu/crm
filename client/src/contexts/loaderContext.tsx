import React, { createContext, useContext, useEffect, useState } from "react";
import { useQuery } from 'react-query'
import { AxiosResponse } from 'axios'
import { UserContext } from "./userContext";
import { BackendError } from "..";
import { UserService } from "../services/UserServices";
import { GetUserDto } from "../dtos/UserDto";

function useRemoteLoading() {
    const { data, isLoading, isError } = useQuery<AxiosResponse<{ user: GetUserDto, token: string }>, BackendError>("profile", new UserService().GetProfile, { refetchOnWindowFocus: true, refetchOnMount: true })
    return { remoteUser: data?.data, remoteLoading: isLoading, isError: isError }
}

// usercontext
type Context = {
    loading: boolean;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>
};
export const LoadingContext = createContext<Context>({
    loading: true,
    setLoading: () => null,
});


// user provider
export function LoadingProvider(props: { children: JSX.Element }) {
    const { remoteUser, remoteLoading, isError } = useRemoteLoading()
    const [loading, setLoading] = useState(remoteLoading);
    const { setUser } = useContext(UserContext)

    useEffect(() => {
        if (remoteUser) {
            setLoading(false)
            setUser(remoteUser.user)
        }
        if (isError) {
            setLoading(false)
            setUser(undefined)
        }
    }, [remoteUser, isError])

    return (
        <LoadingContext.Provider value={{ loading, setLoading }}>
            {props.children}
        </LoadingContext.Provider>
    );
}

