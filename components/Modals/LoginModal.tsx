'use client'

import useLoginModal from "@/app/hooks/useLoginModal";
import Input from "../Input";
import { useState, useCallback } from "react";
import Modal from "../Modal";
import useRegisterModal from "@/app/hooks/useRegisterModal";



const LoginModal= () => {
    const LoginModal = useLoginModal();
    const registerModal = useRegisterModal();
    const [email,setEmail] = useState('');
    const [password,setPassword] = useState('');
    const [isLoading,setIsLoading] = useState(false);

    const onSubmit =useCallback(async () =>{
        try{
            setIsLoading(true);
            const response = await fetch ('api/auth/login', {
                method : 'POST',
                headers : {
                    'Content-Type' : 'application/json'
                },
                body : JSON.stringify({
                    email,
                    password
                })
            });
            const data = await response.json();
            if (!response.ok)
                throw new Error(data.error || 'response pas ok');
            alert('Utilisateur log avec succes!');
        } catch (error: any)
        {
            console.log(error.message);
        } finally {
            setIsLoading(false);    
        }
        
    }, [LoginModal]);

    const onToggle = useCallback(()=>{
        if (isLoading)return;
        LoginModal.onClose();
        registerModal.onOpen();
    },[registerModal, LoginModal, isLoading]);

    const bodyContent = (
        <div className="flex flex-col gap-4">
            <Input
            placeholder="Email"
            onChange={(e)=>setEmail(e.target.value)}
            value={email}
            disabled={isLoading}

            />
            <Input
            placeholder="Password"
            onChange={(e)=>setPassword(e.target.value)}
            value={password}
            disabled={isLoading}

            />
        </div>
    )
    const footerContent = (
       <div className="flex flex-row py-2">
        <p className="pr-2">Dont have an account ? </p>
        <span className="
        text-decoration-line: underline
        cursor-pointer 
        hover:opacity-50
        " onClick={onToggle}>Sign</span>
       </div>
    )
    return (
    <div>
        <Modal
        disabled={isLoading}
        isOpen={LoginModal.isOpen}
        title="Login"
        actionLabel="Sign in"
        onClose={LoginModal.onClose}
        onSubmit={onSubmit}
        body={bodyContent}
        footer={footerContent}

        />
    </div>
    );
}
export default LoginModal