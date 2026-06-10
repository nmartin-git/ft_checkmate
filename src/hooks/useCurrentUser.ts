import {create} from 'zustand';

interface User{
    
    id : string;
    username : string;
    email : string;
}

interface currentUserStore {
    user : User | null; //null = pas co
    setUser : (user : User | null) => void,
}




const useCurrentUser =create<currentUserStore>((set)=>({
    user : null,
    setUser : (user) => set({user})
}))

export default useCurrentUser;