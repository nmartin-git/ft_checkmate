'use client';

interface AvatarProps {
    /** URL de l'avatar (upload ou avatar par défaut). Null => initiale du pseudo. */
    src?: string | null;
    /** Pseudo, sert au fallback (initiale) et au texte alternatif. */
    username?: string | null;
    /** Taille en pixels (carré). Par défaut 96 (w-24). */
    size?: number;
    /** Classes supplémentaires (bordure de club, etc.). */
    className?: string;
}

/**
 * Avatar réutilisable, affiché partout où l'utilisateur apparaît
 * (profil, topbar, amis, classement, plateau, notifications...).
 * Une seule source de vérité : si l'avatar change, il change partout.
 */
export default function Avatar({ src, username, size = 96, className = "" }: AvatarProps) {
    const initial = username?.charAt(0).toUpperCase() ?? "?";

    return (
        <div
            className={`bg-[#312e2b] border-2 border-[#45423f] rounded-md flex items-center justify-center overflow-hidden shadow-inner shrink-0 ${className}`}
            style={{ width: size, height: size }}
        >
            {src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={src}
                    alt={username ? `Avatar ${username}` : "Avatar"}
                    className="w-full h-full object-cover"
                />
            ) : (
                <span
                    className="text-[#81b64c] font-black uppercase"
                    style={{ fontSize: Math.max(12, size * 0.42) }}
                >
                    {initial}
                </span>
            )}
        </div>
    );
}
