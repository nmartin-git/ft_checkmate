'use client'

import useRegisterModal from "@/src/hooks/useRegisterModal";
import useLoginModal from "@/src/hooks/useLoginModal";
import Input from "@/src/components/ui/Input";
import { useState, useCallback } from "react";
import Modal from "../ui/Modal";


const RegisterModal= () => {
    const RegisterModal = useRegisterModal();
	const LoginModal = useLoginModal();
    const [username,setUsername] = useState('');
    const [email,setEmail] = useState('');
    const [password,setPassword] = useState('');
    const [isLoading,setIsLoading] = useState(false);

    const onSubmit =useCallback(async () =>{
        try{
            setIsLoading(true);
            const response = await fetch('/api/auth/register',{
                method : 'POST',
                headers : {
                    'Content-Type' : 'application/json'
                },
                body : JSON.stringify({
                    email,
                    username,
                    password
                })
            });
            if (!response.ok){
                const text = await response.text();
                console.log("Registor error;", text);
                return;
            }
            console.log("on arrive ici on submite bien")
            // const data = await response.json();
            alert('user creer avec succes');
            RegisterModal.onClose();
            LoginModal.onOpen();
        } catch (error)
        {
			//MESSAGE DERREUR
            console.log(error);
        } finally {
            setIsLoading(false);
        }
        
    }, [RegisterModal, email, username, password]);

     const onToggle = useCallback(()=>{
         if (isLoading)return;
         RegisterModal.onClose();
         LoginModal.onOpen();
     },[RegisterModal, LoginModal, isLoading]);

    const bodyContent = (
        <div className="flex flex-col gap-4">
             <Input
            placeholder="Username"
            onChange={(e)=>setUsername(e.target.value)}
            value={username}
            disabled={isLoading}

            />
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
        <p className="pr-2">You already have an account ? </p>
        <span className="
        text-decoration-line: underline
        cursor-pointer 
        hover:opacity-50
        " onClick={onToggle}>Log in</span>
       </div>
    )
    return (
    <div>
        <Modal
        disabled={isLoading}
        isOpen={RegisterModal.isOpen}
        title="Create an account"
        actionLabel="Register"
        onClose={RegisterModal.onClose}
        onSubmit={onSubmit}
        body={bodyContent}
        footer={footerContent}

        />
    </div>
    );
}
export default RegisterModal