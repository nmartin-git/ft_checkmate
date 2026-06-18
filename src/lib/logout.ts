import { NextResponse } from "next/server";

const handleLogout = async (setUser: (user: any) => void) => {
    try {
        const response = await fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'applications/json'
            }
        });
        if(!response.ok)
            throw new Error('Log out error')
        setUser(null);
        alert("User disconnected !");

    } catch (error : any) {
        return NextResponse.json({
                error:error.message,
                status : 401
            })
    }
}

export default handleLogout;