import Button from "@/src/components/ui/Button"
import { useRouter } from "next/router"


export default function ProfilePage() //Si pas connectE lancer LOGIN MODAL
{
	const router = useRouter();
	const handleEditClick = () => {
		router.push('/edit');
	};
    return (    
        <div>
            <div className="flex items-center justify-center w-screen py-10">
                <p className="text-5xl font-bold text-yellow-400">PROFILE PAGE</p>
                {/* il faut une page avec nom username, une photo de profile, un elo et un hitorique ! */}
            </div>
			<Button
				label="Edit"
				onClick={handleEditClick}
				/>
            <div className=" flex gap-4 px-8 pb-8">
                <div className="flex-1 border border-green-500 rounded-2xl min-h-64">
                    <p className="text-center text-yellow-500 font-semibold">Historique</p>
                </div>   
                <div className="flex-1 border border-green-500 rounded-2xl min-h-64">
                    <p className="text-center text-yellow-500 font-semibold">Elo</p>
                </div>
                <div className="flex-1 border border-green-500 rounded-2xl min-h-64">
                    <p className="text-center text-yellow-500 font-semibold">Ami(s)</p>
                </div>
            </div>
        </div>
    )
}