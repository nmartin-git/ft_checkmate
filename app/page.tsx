'use client'

import Image from "next/image";
import DamesImg from "@/public/diagdam1.jpg"
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import useLoginModal from "@/src/hooks/useLoginModal";

export default function Home() {
	const searchParams= useSearchParams();
	const loginModal = useLoginModal();

	useEffect( ()=>{
		if (searchParams.get('auth')==='required')
			loginModal.onOpen();
	},[searchParams,loginModal])

	return (
	<div className="flex justify-center">
		<div className="">
			<div id="board">
			{/* a changer pour que ca soit pas cote client */}
			<Image onClick={()=>{alert("click on board")}}
			className="py-50"
			src={DamesImg}
			alt="jeu de dames"
			width={500}
			height={500}
			/>
			{/* <script src="game.js"></script> */}
			</div>
		</div>
	</div>
	);
}