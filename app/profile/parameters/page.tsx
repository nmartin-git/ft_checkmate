'use client'

import { useEffect, useState } from "react"
import Button from "@/src/components/ui/Button"
import Input from "@/src/components/ui/Input"

export default function ParametersPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [chatEnabled, setChatEnabled] = useState(false)
  const [twoFactorAuthEnabled, setTwoFactorAuthEnabled] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [avatar, setAvatar] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

	useEffect(() => {
		const loadParameters = async () => {
			try {
				const response = await fetch ("/api/parameters")
				if (response.ok) {
					const data = await response.json()
					setChatEnabled(data.chatEnable ?? false)
					setTwoFactorAuthEnabled(data.twoFactorAuthEnable ?? false)
				}
			} catch (error) {
				console.error("Error: parameters loading failed:", error)
			} finally {
				setIsFetching(false)
			}
		}
		loadParameters()
	}, [])

  // Gérer l'aperçu de l'image quand l'utilisateur la sélectionne
//   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0]
//     if (file) {
//       setAvatar(file)
//       setPreviewUrl(URL.createObjectURL(file)) // Crée un lien temporaire pour l'afficher
//     }
//   }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // On utilise FormData car il y a un fichier (l'avatar)
    const formData = new FormData()
    formData.append("chatEnable", String(chatEnabled))
    formData.append("twoFactorAuthEnable", String(twoFactorAuthEnabled))
    // if (avatar) {
    //   formData.append("avatar", avatar)
    // }

    try {
      const response = await fetch("/api/parameters", {
        method: "POST",
        body: formData, // Pas de JSON.stringify ici, on envoie le formData brut
      })

      if (response.ok) {
        alert("Paramètres enregistrés !")
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }
  if (isFetching) {
    return <div className="p-6 text-black">Loading settings...</div>
  }
  return (
    <form onSubmit={onSubmit} className="p-6 max-w-md bg-white text-black space-y-4">
      {/* Zone Avatar
      <div className="flex flex-col items-center gap-2">
        {previewUrl && <img src={previewUrl} alt="Aperçu" className="w-20 h-20 rounded-full object-cover" />}
        <input type="file" accept="image/*" onChange={handleImageChange} />
      </div> */}

      {/* Zone Booréen */}
    	<label className="flex items-center gap-2">
        <input type="checkbox" checked={chatEnabled} onChange={(e) => setChatEnabled(e.target.checked)} />
        Enable chat
    	</label>
		<label className="flex items-center gap-2">
        <input type="checkbox" checked={twoFactorAuthEnabled} onChange={(e) => setTwoFactorAuthEnabled(e.target.checked)} />
        Enable two factor authentification (2fa)
    	</label>
        <Button 
		label={isLoading ? "Saving..." : "Save parameters"} 
		onClick={() => {}}
		disabled={isLoading}
        />
    </form>
  )
}