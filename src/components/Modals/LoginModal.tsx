'use client'

import useLoginModal from "@/src/hooks/useLoginModal";
import Input from "../ui/Input";
import { useState, useCallback } from "react";
import Modal from "../ui/Modal";
import useRegisterModal from "@/src/hooks/useRegisterModal";
import useCurrentUser from "@/src/hooks/useCurrentUser";
import { redirectAuthGoogle } from "@/src/lib/google";

const LoginModal= () => {
    const { step, setStep, requires2FA, setRequires2FA, isOpen, onClose } = useLoginModal();
    const registerModal = useRegisterModal();
    const [email,setEmail] = useState('');
    const [password,setPassword] = useState('');
    const [code,setCode] = useState('');
    const [recoveryCode,setRecoveryCode] = useState('');
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
    const onToggleStep1 = useCallback(()=>{
        if (isLoading)return;
        handleClose();
        registerModal.onOpen();
    },[registerModal, handleClose, isLoading]);
    const onToggleStep2 = useCallback(()=>{
        setStep(3);
    },[setStep]);
    const onToggleStep3 = useCallback(()=>{
        setStep(2);
    },[setStep]);
    const onSubmitStep1 =useCallback(async () => {
    try{
        setIsLoading(true);
        const response = await fetch ('/api/auth/login', {
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
        const response = await fetch ('/api/auth/login', {
            method : 'POST',
            headers : {
                'Content-Type' : 'application/json'
            },
            body : JSON.stringify({
                email,
                code
            })
        });
        const data = await response.json();
        if (!response.ok || data.success === false)
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
    }, [currentUser, handleClose, email, code]);
    const onSubmitStep3 =useCallback(async () => {
    try{
        setIsLoading(true);
        const response = await fetch ('/api/auth/login', {
            method : 'POST',
            headers : {
                'Content-Type' : 'application/json'
            },
            body : JSON.stringify({
                email,
                recoveryCode
            })
        });
        const data = await response.json();
        if (!response.ok || data.success === false)
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
    }, [currentUser, handleClose, email, recoveryCode]);
    let currentOnSubmit = onSubmitStep1
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
           <div className="flex flex-col py-2">
                <div className="relative flex py-2 items-center w-full">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink mx-4 text-gray-400 text-sm">ou</span>
                <div className="flex-grow border-t border-gray-300"></div>
                </div>
                <div className="w-full">
                <button className="gsi-material-button w-full"
                        onClick = {() => redirectAuthGoogle()}>
                    <div className="gsi-material-button-state"></div>
                    <div className="gsi-material-button-content-wrapper">
                      <div className="gsi-material-button-icon">
                        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{display: 'block'}}>
                          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                          <path fill="none" d="M0 0h48v48H0z"></path>
                        </svg>
                      </div>
                      <span className="gsi-material-button-contents">Sign in with Google</span>
                      <span style={{display: 'none'}}>Sign in with Google</span>
                    </div>
                </button>
                </div>
                <div className="flex flex-row justify-center w-full pt-2 text-sm">
                <p className="pr-2">Dont have an account ? </p>
                <span className="
                text-decoration-line: underline
                cursor-pointer 
                hover:opacity-50
                " onClick={onToggleStep1}>Sign up</span>
                </div>
           </div>
        )
    }
    else if (step === 2)
    {
        currentOnSubmit = onSubmitStep2
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
            " onClick={onToggleStep2}>Recovery codes</span>
            </div>
        )
    }
    else if (step === 3)
    {
        currentOnSubmit = onSubmitStep3
        bodyContent = (
            <div className="flex flex-col gap-4">
                <Input
                placeholder="recoveryCode"
                onChange={(e)=>setRecoveryCode(e.target.value)}
                value={recoveryCode}
                disabled={isLoading}
                />
            </div>
        )
        footerContent = (
            <div className="flex flex-row py-2">
            <p className="pr-2">Have a problem with recovery codes ? </p>
            <span className="
            text-decoration-line: underline
            cursor-pointer 
            hover:opacity-50
            " onClick={onToggleStep3}>Authentification code (2FA)</span>
            </div>
        )
    }
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