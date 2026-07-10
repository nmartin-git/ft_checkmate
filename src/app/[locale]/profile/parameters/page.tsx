'use client'

import { useEffect, useState } from "react"
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
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
  const t = useTranslations("parameters");
  const locale = useLocale();
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch("/api/auth/delete", { method: "POST" });
      if (res.ok) {
        // rechargement complet (pas router.push) pour vider l'état de connexion en mémoire
        window.location.href = `/${locale}/`;
      } else {
        alert(t("delete_error"));
        setIsDeleting(false);
      }
    } catch {
      alert(t("delete_error"));
      setIsDeleting(false);
    }
  };
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

  //REFAIRE LA DA DE PARAMETERS

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


  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

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


    try {
      const response = await fetch("/api/parameters", {
        method: "POST",
        body: formData,
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
    return <div className="p-6 min-h-[calc(100vh-100px)] bg-[#262522] text-gray-400 font-medium text-sm">Loading settings...</div>
  }
  return (
    <>
    <form onSubmit={onSubmit} className="p-10 max-w-2xl mx-auto my-12 bg-[#1e1c18] border-2 border-[#2b2925] rounded-lg shadow-xl text-white space-y-6">
      {}
      <label className="flex items-center gap-2 text-gray-300 font-black uppercase tracking-wider text-base">
        Date de naissance
      </label>
      <Popover>
        <PopoverTrigger asChild>
          <ShadcnButton
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-sans font-semibold rounded bg-[#262522] border-2 border-[#312e2b] text-white hover:bg-[#312e2b] hover:text-white text-lg py-6",
              !birthdate && "text-gray-500 font-medium"
            )}>
            <CalendarIcon className="mr-2 h-8 w-8 text-[#81b64c]" />
            {birthdate ? (
              format(birthdate, "PPP", { locale: fr })
            ) : (
              <span>{t("choose_date")}</span>
            )}
          </ShadcnButton>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-[#1e1c18] border-2 border-[#2b2925] shadow-xl font-sans" align="start">
          <Calendar
            mode="single"
            selected={birthdate}
            onSelect={(date) => setBirthdate(date)}
            disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
          />
        </PopoverContent>
      </Popover>
      {/* Zone Booréen */}
    	<label className="flex items-center gap-3 text-lg font-bold text-gray-200">
        <input type="checkbox" checked={chatEnabled} onChange={(e) => setChatEnabled(e.target.checked)} className="w-7 h-7 accent-[#81b64c] cursor-pointer" />
        Enable chat
    	</label>
		<label className="flex items-center gap-3 text-lg font-bold text-gray-200">
        <input type="checkbox" checked={twoFactorAuthEnabled} onChange={(e) => setTwoFactorAuthEnabled(e.target.checked)} className="w-7 h-7 accent-[#81b64c] cursor-pointer" />
        Enable two factor authentification (2fa)
    	</label>
        <Button 
		label={isLoading ? t("saving") : t("save")} 
		onClick={() => {}}
		disabled={isLoading}
        />
    </form>
    <div className="mt-10 border-2 border-red-900/50 rounded-lg p-6 bg-red-950/10">
      <h3 className="text-red-400 font-black uppercase tracking-wider text-sm mb-2">{t("danger_zone")}</h3>
      <p className="text-gray-400 text-sm mb-4">{t("delete_warning")}</p>
      {!showDeleteConfirm ? (
        <button
          type="button"
          onClick={() => setShowDeleteConfirm(true)}
          className="px-5 py-2.5 bg-red-700 hover:bg-red-600 text-white font-bold rounded transition-colors"
        >
          {t("delete_account")}
        </button>
      ) : (
        <div className="flex gap-3 items-center">
          <button
            type="button"
            onClick={handleDeleteAccount}
            disabled={isDeleting}
            className="px-5 py-2.5 bg-red-700 hover:bg-red-600 text-white font-bold rounded transition-colors disabled:opacity-50"
          >
            {isDeleting ? t("deleting") : t("delete_confirm")}
          </button>
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(false)}
            disabled={isDeleting}
            className="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded transition-colors"
          >
            {t("delete_cancel")}
          </button>
        </div>
      )}
    </div>
    <ParametersModal />
    </>
  )
}