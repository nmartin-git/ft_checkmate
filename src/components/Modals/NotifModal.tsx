'use client'

import { useState, useCallback } from "react";
import NotifPopup from "@/src/components/ui/NotifPopup";
import useNotifModal from "@/src/hooks/useNotifModal";



const NotifModal= () => {
    const NotifModal = useNotifModal();
    const [isLoading,setIsLoading] = useState(false);

    // const onToggle = useCallback(()=>{
    //     if (isLoading)return;
    //     LoginModal.onClose();
    //     registerModal.onOpen();
    // },[registerModal, LoginModal, isLoading]);

    const bodyContent = (
        <div>
            {/* <div className="flex flex-col gap-4">
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
            </div> */}
        </div>
    )
    // const footerContent = (
    //    <div className="flex flex-row py-2">
    //     <p className="pr-2">Dont have an account ? </p>
    //     <span className="
    //     text-decoration-line: underline
    //     cursor-pointer 
    //     hover:opacity-50
    //     " onClick={onToggle}>Sign</span>
    //    </div>
    // )
    // if(!logged_in) return;
    return (
    <div>
        <NotifPopup
        disabled={isLoading}
        isOpen={NotifModal.isOpen}
        title="Notification"
        onClose={NotifModal.onClose}
        body={bodyContent}

        />
    </div>
    );
}
export default NotifModal