import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { updateAvatar } from "@/src/lib/user";

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'secret-a-changer'
);

interface TokenPayload { id: string; username: string; email: string; }

// Formats autorisés (cahier des charges : PNG, JPG, JPEG, WEBP)
const ALLOWED_MIME = ["image/png", "image/jpeg", "image/webp"];
const MAX_SIZE = 2 * 1024 * 1024; // 2 Mo

// Avatars par défaut fournis avec l'application (public/avatars/)
const DEFAULT_AVATARS = [
    "/avatars/alliance.svg",
    "/avatars/assembly.svg",
    "/avatars/federation.svg",
    "/avatars/order.svg",
    "/avatars/neutral.svg",
];

// Signatures binaires : rejette les fichiers corrompus / renommés
function isRealImage(buf: Buffer): boolean {
    if (buf.length < 12) return false;
    // PNG : 89 50 4E 47
    if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return true;
    // JPEG : FF D8 FF
    if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return true;
    // WEBP : "RIFF" .... "WEBP"
    if (buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") return true;
    return false;
}

export async function POST(request: Request) {
    try {
        // ── Authentification ──
        const cookieStore = await cookies();
        const token = cookieStore.get('auth-token')?.value;
        if (!token) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

        let payload: TokenPayload;
        try {
            const verified = await jwtVerify<TokenPayload>(token, JWT_SECRET);
            payload = verified.payload;
        } catch {
            return NextResponse.json({ error: "invalid_session" }, { status: 401 });
        }

        const data = await request.formData();

        // ── CAS 1 : choix d'un avatar par défaut ──
        const preset = data.get("preset");
        if (typeof preset === "string" && preset.length > 0) {
            if (!DEFAULT_AVATARS.includes(preset)) {
                return NextResponse.json({ error: "invalid_preset" }, { status: 400 });
            }
            await updateAvatar(payload.id, preset);
            return NextResponse.json({ success: true, avatar_url: preset });
        }

        // ── CAS 2 : upload d'un fichier ──
        const file = data.get("avatar");
        if (!file || typeof file === "string") {
            return NextResponse.json({ error: "no_file" }, { status: 400 });
        }

        const blob = file as File;
        if (!ALLOWED_MIME.includes(blob.type)) {
            return NextResponse.json({ error: "invalid_type" }, { status: 400 });
        }
        if (blob.size > MAX_SIZE) {
            return NextResponse.json({ error: "too_large" }, { status: 400 });
        }

        const buffer = Buffer.from(await blob.arrayBuffer());
        if (!isRealImage(buffer)) {
            return NextResponse.json({ error: "corrupted" }, { status: 400 });
        }

        // Écriture dans public/uploads/ sous un nom unique
        const ext = blob.type === "image/png" ? "png" : blob.type === "image/webp" ? "webp" : "jpg";
        const filename = `${payload.id}-${randomUUID()}.${ext}`;
        const uploadDir = join(process.cwd(), "public", "uploads");
        await mkdir(uploadDir, { recursive: true });
        await writeFile(join(uploadDir, filename), buffer);

        const url = `/uploads/${filename}`;
        await updateAvatar(payload.id, url); // supprime l'ancien upload + met à jour la base

        return NextResponse.json({ success: true, avatar_url: url });
    } catch (error) {
        console.error("avatar upload error:", error);
        return NextResponse.json({ error: "server_error" }, { status: 500 });
    }
}
