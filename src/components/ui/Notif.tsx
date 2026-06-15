import useNotifModal from "@/src/hooks/useNotifModal";
import { HiBell } from "react-icons/hi";
import useCurrentUser from "@/src/hooks/useCurrentUser";
import useLoginModal from "@/src/hooks/useLoginModal";


const Notif = ()=>{
    const NotifModal = useNotifModal();
    const loginModal = useLoginModal();
    const currentUser = useCurrentUser();
    const handleClick = () =>
    {
        if (currentUser.user)
            NotifModal.onOpen();
        else
            loginModal.onOpen();
    }

   return (
   <div onClick={handleClick} className="flex flex-col items-center
    cursor-pointer hover:opacity-70
        transition ml-10 
        ">
        <HiBell size={30} color="yellow"/>
        <p className="text-white
        font-semibold
        "></p>

    </div>
   );
}
export default Notif