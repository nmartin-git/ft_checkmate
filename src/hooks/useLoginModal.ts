import {create} from 'zustand';

interface LoginModalStore{
    
    isOpen:boolean;
    onOpen:()=>void;
    onClose:()=>void;
    step: number;
    setStep: (step: number) => void;
    requires2FA: boolean;
    setRequires2FA: (requires2FA: boolean) => void;
}

const useLoginModal =create<LoginModalStore>((set)=>({
    isOpen:false,
    onOpen: ()=>set({isOpen:true}),
    onClose:() => set({isOpen:false}),
    step: 1,
    setStep: (index) => set({step: index}),
    requires2FA: false,
    setRequires2FA: (enable2FA) => set({requires2FA: enable2FA})
}))

export default useLoginModal;