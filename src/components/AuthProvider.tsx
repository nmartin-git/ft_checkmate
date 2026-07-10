'use client'

import { useEffect } from "react";
import useCurrentUser from "@/src/hooks/useCurrentUser";


const  AuthProvider = ({children} : {children : React.ReactNode}) => {
    const {setUser} = useCurrentUser();
    useEffect(() => {
        const checkAuth =async () => {
            try {
                const response = await fetch('/api/auth/me');
                const data = await response.json();
                if (response.ok && data.user){
                    setUser(data.user);
                }
            } catch{
            }
        }
        checkAuth();
    }, []);
    return <>{children}</>
}
export default AuthProvider 