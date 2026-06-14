import { NextResponse } from "next/server";
import useCurrentUser from "../hooks/useCurrentUser";

const handleLogout = async () => {
    try {
        const currentUser = useCurrentUser(); 
        const response = await fetch('/app/auth/logout');
        if(!response.ok)
            throw new Error('Log out error')
        currentUser.setUser(null);
        alert("User disconnected !");
    } catch (error : any) {
        return NextResponse.json({
                error:error.message,
                status : 401
            })
    }
}

export default handleLogout;