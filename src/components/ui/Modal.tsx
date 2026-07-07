'use client'

import { useCallback } from "react";
import { AiOutlineClose } from 'react-icons/ai';
import Button from "./Button";

interface ModalProps {
    isOpen?: boolean;
    onClose: () => void;
    onSubmit: () => void;
    title?: string;
    body?: React.ReactElement;
    footer?: React.ReactElement;
    actionLabel: string;
    disabled?: boolean;
}

const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    title,
    body,
    footer,
    actionLabel,
    disabled
}) => {
    const handleClose = useCallback(() => {
        if (disabled) return;
        onClose();
    }, [disabled, onClose]);

    const handleSubmit = useCallback(() => {
        if (disabled) return;
        onSubmit();
    }, [disabled, onSubmit]);

    if (!isOpen) return null;

    return (
        <>
            {/* BACKDROP : Fond flouté sombre façon Chess.com */}
            <div className=" justify-center items-center flex overflow-x-hidden  overflow-y-auto 
                fixed inset-0 z-50 outline-none  focus:outline-none bg-black/70 backdrop-blur-sm p-4">
                <div className="relative w-full md:max-w-md my-6 mx-auto h-auto">
                    {/* CONTENT : Le conteneur principal de la modal */}
                    <div className="h-full  border-2 border-[#2b2925] rounded-lg shadow-2xl relative flex flex-col w-full 
                        bg-[#1e1c18] outline-none focus:outline-none">
                        {/* HEADER */}
                        <div className="
                            flex
                            items-center
                            justify-between
                            px-8
                            pt-8
                            pb-4
                            rounded-t
                        ">
                            <h3 className="
                                text-2xl font-black text-white uppercase tracking-wide
                            ">
                                {title}
                            </h3>
                            <button 
                                onClick={handleClose} 
                                className="
                                    p-2 ml-auto text-gray-400 hover:text-white transition rounded-md hover:bg-[#262522]">
                                <AiOutlineClose size={22}/>
                            </button>
                        </div>

                        {/* BODY */}
                        <div className="relative px-8 py-4 flex-auto text-gray-300">
                            {body}
                        </div>

                        {/* FOOTER : Le gros bouton d'action vert et les liens en dessous */}
                        <div className="flex flex-col gap-4 px-8 pb-8 pt-4">
                            <Button 
                                disabled={disabled}
                                label={actionLabel}
                                /* RETRAIT DE secondary POUR UTILISER LE BOUTON VERT PAR DÉFAUT */
                                fullWidth  
                                large
                                onClick={handleSubmit}
                            />
                            {footer && (
                                <div className="mt-2 text-center text-sm text-gray-400">
                                    {footer}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Modal;