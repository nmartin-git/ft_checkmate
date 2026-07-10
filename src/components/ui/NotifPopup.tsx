import { useCallback } from "react";
import {AiOutlineClose} from 'react-icons/ai'


interface NotifPopupProps 
{
    isOpen?:boolean;
    onClose: () => void;
    onSubmit?: ()=>void;
    title?: string;
    body?:React.ReactElement;
    footer?:React.ReactElement;
    disabled?:boolean;
}

const NotifPopup  : React.FC<NotifPopupProps>= ({
    isOpen,
    onClose,
    onSubmit,
    title,
    body,
    footer,
    disabled
}) => {
    const handleClose = useCallback(() =>{
        if(disabled)return;
        onClose();
    }, [disabled,onClose]);
    if (!isOpen)return null;
  return (
    <>
        <div /* FAIT TODO CHANGER LA DA DE NOTFI MODAL POUR ALLER MIEUX AVEC LE SITE */
         className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 
         outline-none focus:outline-none bg-black/70 backdrop-blur-sm p-4">
            <div className=" relative w-full lg:w-3/6 my-6 mx-auto lg:max-w-3xl h-full lg:h-auto">
                {/* CONTENT */}
                <div className="h-full  border-2 border-[#2b2925] rounded-lg shadow-2xl relative flex flex-col w-full 
                        bg-[#1e1c18] outline-none focus:outline-none">
                    {/* HEADER */}
                    <div className="flex items-center justify-between p-10 rounded-t">
                        <h3 className=" text-3xl font-semibold text-white">{title}</h3>
                        <button onClick={handleClose} 
                        className=" p-1 ml-auto border-auto text-white hover:opacity-70 transition">
                            <AiOutlineClose size={20}/>
                        </button>
                    </div>
                    {/* BODY */}
                    <div className="relative p-10 flex-auto">
                        {body}
                    </div>
                    {/* FOOTER */}
                    <div className="flex flex-col gap-2 p-10">
                        {footer}
                    </div>
                </div>
            </div>
        </div>
    </>
  );
}
export default NotifPopup 