'use client'

import { useEffect, useState } from "react"
import Button from "@/src/components/ui/Button"
import { Button as ShadcnButton } from "@/src/components/ui/shadcn/button"
import ParametersModal from "@/src/components/Modals/ParametersModal"
import useParametersModal from "@/src/hooks/useParametersModal"

import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/src/components/ui/shadcn/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/shadcn/popover"
import { cn } from "@/src/lib/utils"

export default function ParametersPage() {
  const parametersModal = useParametersModal()
  const [isLoading, setIsLoading] = useState(false)
  const [chatEnabled, setChatEnabled] = useState(false)
  const [twoFactorAuthEnabled, setTwoFactorAuthEnabled] = useState(false)
  const [birthdate, setBirthdate] = useState<Date | undefined>()
  const [isFetching, setIsFetching] = useState(true)
  const [initialChatEnabled, setInitialChatEnabled] = useState(false)
  const [initialTwoFactorAuthEnabled, setInitialTwoFactorAuthEnabled] = useState(false)
  const [initialBirthdate, setInitialBirthdate] = useState<Date | undefined>()
  // const [avatar, setAvatar] = useState<File | null>(null)
  // const [previewUrl, setPreviewUrl] = useState<string | null>(null)

	useEffect(() => {
		const loadParameters = async () => {
			try {
				const response = await fetch ("/api/parameters")
				if (response.ok) {
					const data = await response.json()
					setChatEnabled(Boolean(data.chatEnable))
					setTwoFactorAuthEnabled(Boolean(data.twoFactorAuthEnable))
          setInitialChatEnabled(Boolean(data.chatEnable))
          setInitialTwoFactorAuthEnabled(Boolean(data.twoFactorAuthEnable))
          if (data.birthdate && data.birthdate !== "null") {
            const parsedDate = new Date(data.birthdate)
            setBirthdate(parsedDate)
            setInitialBirthdate(parsedDate)
          } else {
            setBirthdate(undefined)
            setInitialBirthdate(undefined)
          }
				}
			} catch (error) {
				console.error("Error: parameters loading failed:", error)
			} finally {
				setIsFetching(false)
			}
		}
		loadParameters()
	}, [])

  const openCodesModal = (codes: string[]) => {
    
  }

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
    if (chatEnabled !== initialChatEnabled) {
    formData.append("chatEnable", String(chatEnabled))
    }
    if (twoFactorAuthEnabled !== initialTwoFactorAuthEnabled) {
    formData.append("twoFactorAuthEnable", String(twoFactorAuthEnabled))
    }
    if (birthdate !== initialBirthdate) {
    formData.append("birthdate", String(birthdate))
    }
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
        const data = await response.json()
        setInitialChatEnabled(chatEnabled)
        setInitialTwoFactorAuthEnabled(twoFactorAuthEnabled)
        setInitialBirthdate(birthdate)
        if (data.recoveryCodes)
          parametersModal.onOpen(data.recoveryCodes)
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
    <>
    <form onSubmit={onSubmit} className="p-6 max-w-md bg-white text-black space-y-4">
      {/* Zone Avatar
      <div className="flex flex-col items-center gap-2">
        {previewUrl && <img src={previewUrl} alt="Aperçu" className="w-20 h-20 rounded-full object-cover" />}
        <input type="file" accept="image/*" onChange={handleImageChange} />
      </div> */}
      <label className="flex items-center gap-2">
        Date de naissance
      </label>
      <Popover>
        <PopoverTrigger asChild>
          <ShadcnButton
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-sans font-normal border-gray-300 bg-white text-black hover:bg-gray-50",
              !birthdate && "text-gray-400"
            )}>
            <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
            {birthdate ? (
              format(birthdate, "PPP", { locale: fr })
            ) : (
              <span>Choisir une date</span>
            )}
          </ShadcnButton>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-white border border-gray-200 shadow-md font-sans" align="start">
          <Calendar
            mode="single"
            selected={birthdate}
            onSelect={(date) => setBirthdate(date)}
            disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
          />
        </PopoverContent>
      </Popover>
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
    <ParametersModal />
    </>
  )
}