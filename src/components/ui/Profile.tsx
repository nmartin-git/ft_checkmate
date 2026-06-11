'use client'

import useCurrentUser from "@/src/hooks/useCurrentUser";
import useLoginModal from "@/src/hooks/useLoginModal";
import Button from "./Button";
import { useRouter } from "next/navigation";

const Profile = ()=>{
	const {user} = useCurrentUser();
	const LoginModal = useLoginModal();
	const router = useRouter();
	const handleClick = () =>
	{
		if (user){
			router.push('/profile');
		}
		else{
			LoginModal.onOpen();
		}
	}

  return <Button label="Profile" onClick={handleClick}/>
}

export default Profile;