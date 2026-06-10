// Moderation des messages.

export type ModerationResult = {
    allowed: boolean
    reason?: string
    matches?: string[]
}

// Termes interdits.
const BANNED_WORDS: string[] = [
    "badword",
    "insulte",
    // ... a completer
]

// Normalise le texte pour limiter les contournements.
function normalize(text: string): string {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "") // retire les accents
        .replace(/[0@]/g, "o") //leetcode
        .replace(/[1!|]/g, "i")
        .replace(/3/g, "e")
        .replace(/4/g, "a")
        .replace(/5/g, "s")
        .replace(/7/g, "t")
        .replace(/[^a-z0-9]+/g, " ") // separateur comme espace (ou autre)
        .replace(/(.)\1{2,}/g, "$1$1") // repetition
        .trim()
}

function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

const BANNED_PATTERNS: RegExp[] = BANNED_WORDS.map((word) => {
    const cleaned = normalize(word).replace(/\s+/g, "")
    const spaced = cleaned.split("").map(escapeRegExp).join("\\s*")
    return new RegExp(`\\b${spaced}\\b`)
})

// Indique si le message est approprie.
export function moderateText(text: string): ModerationResult {
    const normalized = normalize(text)
    const matches: string[] = []
    for (let i = 0; i < BANNED_WORDS.length; i++) {
        if (BANNED_PATTERNS[i].test(normalized))
            matches.push(BANNED_WORDS[i])
    }
    if (matches.length > 0)
        return { allowed: false, reason: "Contenu inapproprie detecte", matches }
    return { allowed: true }
}

export class ModerationError extends Error {
    matches: string[]
    constructor(result: ModerationResult) {
        super(result.reason ?? "Message refuse par la moderation")
        this.name = "ModerationError"
        this.matches = result.matches ?? []
    }
}

export function assertClean(text: string): void {
    const result = moderateText(text)
    if (!result.allowed)
        throw new ModerationError(result)
}
