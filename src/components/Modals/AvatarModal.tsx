'use client';

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import Avatar from "@/src/components/ui/Avatar";

const DEFAULT_AVATARS = [
    "/avatars/alliance.svg",
    "/avatars/assembly.svg",
    "/avatars/federation.svg",
    "/avatars/order.svg",
    "/avatars/neutral.svg",
];

const MAX_SIZE = 2 * 1024 * 1024; // 2 Mo
const ALLOWED = ["image/png", "image/jpeg", "image/webp"];

interface AvatarModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentAvatar?: string | null;
    username?: string | null;
    /** Appelé après un changement réussi, avec la nouvelle URL. */
    onChanged: (url: string) => void;
}

export default function AvatarModal({ isOpen, onClose, currentAvatar, username, onChanged }: AvatarModalProps) {
    const t = useTranslations("avatar");
    const fileInput = useRef<HTMLInputElement>(null);

    const [tab, setTab] = useState<"upload" | "gallery">("upload");
    const [preview, setPreview] = useState<string | null>(null);   // aperçu local avant confirmation
    const [file, setFile] = useState<File | null>(null);
    const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
    const [error, setError] = useState<string>("");
    const [isSaving, setIsSaving] = useState(false);

    if (!isOpen) return null;

    function reset() {
        setPreview(null);
        setFile(null);
        setSelectedPreset(null);
        setError("");
        setIsSaving(false);
    }

    function handleClose() {
        reset();
        onClose();
    }

    // ── Sélection d'un fichier : validation + aperçu ──
    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        setError("");
        const f = e.target.files?.[0];
        if (!f) return;

        if (!ALLOWED.includes(f.type)) {
            setError(t("err_type"));
            return;
        }
        if (f.size > MAX_SIZE) {
            setError(t("err_size"));
            return;
        }
        setFile(f);
        setPreview(URL.createObjectURL(f)); // aperçu instantané, sans upload
    }

    // ── Confirmation : envoi au backend (upload OU preset) ──
    async function handleConfirm() {
        setError("");
        setIsSaving(true);
        try {
            const form = new FormData();
            if (tab === "upload") {
                if (!file) { setIsSaving(false); return; }
                form.append("avatar", file);
            } else {
                if (!selectedPreset) { setIsSaving(false); return; }
                form.append("preset", selectedPreset);
            }

            const res = await fetch("/api/avatar", { method: "POST", body: form });
            const data = await res.json();

            if (!res.ok) {
                const map: Record<string, string> = {
                    invalid_type: t("err_type"),
                    too_large: t("err_size"),
                    corrupted: t("err_corrupted"),
                    no_file: t("err_no_file"),
                };
                setError(map[data.error] ?? t("err_generic"));
                setIsSaving(false);
                return;
            }

            onChanged(data.avatar_url); // met à jour l'app entière
            handleClose();
        } catch {
            setError(t("err_network"));
            setIsSaving(false);
        }
    }

    const canConfirm = tab === "upload" ? Boolean(file) : Boolean(selectedPreset);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={handleClose}>
            <div
                className="w-full max-w-lg bg-[#262522] border-2 border-[#2b2925] rounded-lg shadow-2xl p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl font-black text-white uppercase tracking-wide">{t("title")}</h2>
                    <button onClick={handleClose} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
                </div>

                {/* Onglets : les 2 options du cahier des charges */}
                <div className="flex gap-2 mb-5">
                    <button
                        onClick={() => { setTab("upload"); setError(""); }}
                        className={`flex-1 py-2.5 rounded font-bold text-sm transition-colors ${tab === "upload" ? "bg-[#81b64c] text-white" : "bg-[#312e2b] text-gray-400 hover:text-white"}`}
                    >
                        {t("tab_upload")}
                    </button>
                    <button
                        onClick={() => { setTab("gallery"); setError(""); }}
                        className={`flex-1 py-2.5 rounded font-bold text-sm transition-colors ${tab === "gallery" ? "bg-[#81b64c] text-white" : "bg-[#312e2b] text-gray-400 hover:text-white"}`}
                    >
                        {t("tab_gallery")}
                    </button>
                </div>

                {/* ── Option 1 : upload depuis l'ordinateur ── */}
                {tab === "upload" && (
                    <div className="flex flex-col items-center gap-4">
                        <Avatar src={preview ?? currentAvatar} username={username} size={120} />
                        <input
                            ref={fileInput}
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        <button
                            onClick={() => fileInput.current?.click()}
                            className="px-5 py-2.5 bg-[#312e2b] hover:bg-[#3d3a36] text-white font-bold rounded transition-colors"
                        >
                            {t("choose_file")}
                        </button>
                        <p className="text-xs text-gray-500 text-center">{t("formats_hint")}</p>
                    </div>
                )}

                {/* ── Option 2 : galerie des 5 avatars par défaut ── */}
                {tab === "gallery" && (
                    <div className="grid grid-cols-5 gap-3">
                        {DEFAULT_AVATARS.map((url) => {
                            const isSelected = selectedPreset === url;
                            const isCurrent = currentAvatar === url && !selectedPreset;
                            return (
                                <button
                                    key={url}
                                    onClick={() => setSelectedPreset(url)}
                                    className={`rounded-md overflow-hidden transition-all ${
                                        isSelected ? "ring-4 ring-[#81b64c] scale-95"
                                        : isCurrent ? "ring-2 ring-gray-500"
                                        : "hover:ring-2 hover:ring-gray-600"
                                    }`}
                                    title={t("select_avatar")}
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={url} alt="Avatar" className="w-full h-auto block" />
                                </button>
                            );
                        })}
                    </div>
                )}

                {error && (
                    <p className="mt-4 text-sm text-red-400 bg-red-950/30 border border-red-900/50 rounded px-3 py-2">{error}</p>
                )}

                {/* Confirmer / Annuler */}
                <div className="flex gap-3 mt-6">
                    <button
                        onClick={handleConfirm}
                        disabled={!canConfirm || isSaving}
                        className="flex-1 py-3 bg-[#81b64c] hover:bg-[#95ca5f] disabled:opacity-40 disabled:cursor-not-allowed text-white font-black uppercase tracking-wide rounded transition-colors"
                    >
                        {isSaving ? t("saving") : t("confirm")}
                    </button>
                    <button
                        onClick={handleClose}
                        disabled={isSaving}
                        className="flex-1 py-3 bg-[#312e2b] hover:bg-[#3d3a36] text-gray-300 font-black uppercase tracking-wide rounded transition-colors"
                    >
                        {t("cancel")}
                    </button>
                </div>
            </div>
        </div>
    );
}