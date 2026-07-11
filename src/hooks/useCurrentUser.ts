import {create} from 'zustand';

interface User{
    id : string;
    username : string;
    email : string;
    avatar_url? : string | null;
}

interface currentUserStore {
    user : User | null; //null = pas co
    setUser : (user : User | null) => void,
    setAvatar : (url : string | null) => void,
}

const useCurrentUser = create<currentUserStore>((set)=>({
    user : null,
    setUser : (user) => set({user}),
    setAvatar : (url) => set((state) => ({
        user : state.user ? { ...state.user, avatar_url : url } : null
    })),
}))

export default useCurrentUser;