'use client'

import { HiBell, HiOutlineHome, HiOutlineUserCircle } from "react-icons/hi";
import TopbarItem from "@/src/components/ui/TopbarItem";
import Button from "@/src/components/ui/Button";
import useLoginModal from "@/src/hooks/useLoginModal";
import { useCallback } from "react";
import Notif from "@/src/components/ui/Notif";
import useCurrentUser from "@/src/hooks/useCurrentUser";
import Profile from "@/src/components/ui/Profile";
import { useRouter } from "next/navigation";

const Topbar= () => {
    const loginModal = useLoginModal();
	const {user} = useCurrentUser();
	const router = useRouter();
    const handleLoginClick = useCallback (()=>{
        loginModal.onOpen();
    },[loginModal])
    const items = [
        {
            label:'Home',
            href :'/',
            icon : HiOutlineHome
        }
    ]
  return (
	<nav className="
	flex
	items-center justify-between
	px-6 py-4 bg-black/20 w-full
	">
			<div className="flex items-center gap-5">
				{items.map((item) => (
					<TopbarItem 
					key={item.href}
					href={item.href}
					label={item.label}
					icon={item.icon}
					/>
				))}
				<Profile/>
				<Notif/>
				{user ? (
					<div className="text-2xl text-white font-semibold">
						{user.username}
					</div>) :(<Button
				label="Login"
				onClick={handleLoginClick}
				/>)
				}
			</div>
			<div className="absolute left-1/2 -translate-x-1/2 text-center">
				<h2 className="text-white font-semibold">Jeu de Dames</h2>
				<p className="text-white font-semibold">Player 1 VS Player 2</p>
			</div>
			<div onClick={() => {router.push('/game')}} className="hover:opacity-50 cursor-pointer p-5">
					<p className="text-2xl font-bold
					text-yellow-400">PLAY
					</p>
			</div>
	</nav>
  );
}
export default Topbar