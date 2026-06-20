import useNotifModal from "@/app/hooks/useNotifModal";
import { HiBell } from "react-icons/hi";


const Notif = ()=>{
    const NotifModal = useNotifModal();
    const handleClick = () =>
    {
        NotifModal.onOpen();
    }

   return (
   <div onClick={handleClick} className="flex flex-col items-center
    cursor-pointer hover:opacity-70
        transition ml-10 
        ">
        <HiBell size={30} color="yellow"/>
        <p className="text-white
        font-semibold
        ">Notifications</p>

    </div>
   );
}
export default Notif