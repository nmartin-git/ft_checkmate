'use client'

import useLoginModal from "@/src/hooks/useLoginModal";
import Input from "../ui/Input";
import { useState, useCallback } from "react";
import Modal from "../ui/Modal";
import useRegisterModal from "@/src/hooks/useRegisterModal";
import useCurrentUser from "@/src/hooks/useCurrentUser";

const LoginModal= () => {
    const { step, setStep, requires2FA, setRequires2FA, isOpen, onClose } = useLoginModal();
    const registerModal = useRegisterModal();
    const [email,setEmail] = useState('');
    const [password,setPassword] = useState('');
    const [code,setCode] = useState('');
    const [isLoading,setIsLoading] = useState(false);
    const currentUser = useCurrentUser();
	let bodyContent;
    let footerContent;

    const handleClose = useCallback(() => {
        onClose();
        setStep(1);
        setRequires2FA(false);
        setEmail('');
        setPassword('');
        setCode('');
    }, [onClose, setStep, setRequires2FA]);
    const onToggle = useCallback(()=>{
        if (isLoading)return;
        handleClose();
        registerModal.onOpen();
    },[registerModal, handleClose, isLoading]);
    const onSubmitStep1 =useCallback(async () => {
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
        if (data.twoFactorAuthEnable)
        {
            setRequires2FA(true);
            setStep(2);
            return ;
        }
        currentUser.setUser({
            id : data.user.id,
            username : data.user.username,
            email : data.user.email
        })
        alert('Utilisateur log avec succes!');
        handleClose();
    } catch (error: any)
    {
        console.log(error.message);
    } finally {
        setIsLoading(false);    
    }
    }, [currentUser, handleClose, email, password, setStep, setRequires2FA]);
    const onSubmitStep2 =useCallback(async () => {
    try{
        setIsLoading(true);
        const response = await fetch ('api/auth/login', {
            method : 'POST',
            headers : {
                'Content-Type' : 'application/json'
            },
            body : JSON.stringify({
                code
            })
        });
        const data = await response.json();
        if (!response.ok)
            throw new Error(data.error || 'response pas ok');
        alert('Utilisateur log avec succes!');
        currentUser.setUser({
            id : data.user.id,
            username : data.user.username,
            email : data.user.email
        })
        handleClose();
    } catch (error: any)
    {
        console.log(error.message);
    } finally {
        setIsLoading(false);    
    }
    }, [currentUser, handleClose, code]);
    if (step === 1)
    {

        bodyContent = (
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
        footerContent = (
           <div className="flex flex-row py-2">
            <p className="pr-2">Dont have an account ? </p>
            <span className="
            text-decoration-line: underline
            cursor-pointer 
            hover:opacity-50
            " onClick={onToggle}>Sign</span>
           </div>
        )
    }
    else if (step === 2)
    {
        bodyContent = (
            <div className="flex flex-col gap-4">
                <Input
                placeholder="code"
                onChange={(e)=>setCode(e.target.value)}
                value={code}
                disabled={isLoading}

                />
            </div>
        )
        footerContent = (
            <div className="flex flex-row py-2">
            <p className="pr-2">Have a problem with two factor authentification ? </p>
            <span className="
            text-decoration-line: underline
            cursor-pointer 
            hover:opacity-50
            " onClick={onToggle}>Recovery codes</span>
            </div>
        )
    }
    const currentOnSubmit = step === 1 ? onSubmitStep1 : onSubmitStep2;
    return (
    	<div>
        <Modal
        disabled={isLoading}
        isOpen={isOpen}
        title="Login"
        actionLabel="Sign in"
        onClose={handleClose}
        onSubmit={currentOnSubmit}
        body={bodyContent}
        footer={footerContent}
        />
    	</div>
    );
}

export default LoginModal