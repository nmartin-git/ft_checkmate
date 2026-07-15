// Moderation des messages.

export type ModerationResult = {
    allowed: boolean
    reason?: string
    matches?: string[]
}

// Termes interdits.
const BANNED_WORDS: string[] = [
     // FR
    "abruti", "cretin", "debile",
    "ducon", "couillon", "trouduc", "tafiole", "pd", "merde",
    "chiotte", "ta gueule", "ferme ta gueule", "va te faire foutre",
    "nique", "niquer", "fdp", "ntm","abruti", "batard", "bigornette",
    "bite", "bitte", "bloblos", "bordel", "bourré", "bourrée",
    "brackmard", "branlage", "branler", "branlette", "branleur",
    "branleuse", "brouter le cresson", "btrd", "caca", "chatte",
    "chiasse", "chier", "chiottes", "clito", "clitoris", "cnnrd", "cnrd",
    "con", "connard", "connasse", "conne", "couilles", "couillon",
    "cramouille", "cretin", "cul", "debile", "ducon", "enculer",
    "enculeur", "enculeurs", "enculé", "enculée", "enfoire", "enfoiré",
    "enfoirée", "enkule", "fdlp", "fdp", "fdpp", "ferme ta gueule",
    "fille de pute", "fils de pute", "filsdepute", "folle", "foutre","ftg",
    "gerbe", "gerber", "glandu", "gouine", "grande folle", "grogniasse",
    "gueule", "jouir", "la putain de ta mère", "malpt", "merde", "merdeuse",
    "merdeux", "meuf", "mrd", "ménage à trois", "negro", "niktamere",
    "nique ta mère", "nique ta race", "nqtm", "ntc", "ntm", "nègre", "palucher",
    "pd", "pipi", "pisser", "pouffiasse", "pousse-crotte", "ptin", "ptn",
    "putain", "pute", "pédale", "pédé", "péter", "ramoner", "sac à foutre",
    "sac à merde", "salaud", "salope", "slp", "suce", "ta gueule", "tanche",
    "tapette", "teuch", "tg", "tringler", "trique", "troncher", "trou du cul",
    "trouduc", "va te faire foutre", "vtf", "vtff", "zigounette", "zizi",

    // EN
    "2 girls 1 cup", "2g1c", "acrotomophilia", "af", "ah", "alabama hot pocket",
    "alaskan pipeline", "anal", "anilingus", "anus", "apeshit", "arsehole", "ass",
    "asshat", "asshole", "assmunch", "auto erotic", "autoerotic", "babeland",
    "baby batter", "baby juice", "ball gag", "ball gravy", "ball kicking",
    "ball licking", "ball sack", "ball sucking", "bangbros", "bangbus", "bareback",
    "barely legal", "barenaked", "bastard", "bastardo", "bastinado", "bbw", "bdsm",
    "beaner", "beaners", "beastiality", "beaver cleaver", "beaver lips", "bestiality",
    "big black", "big breasts", "big knockers", "big tits", "bimbos", "birdlock",
    "bitch", "bitches", "black cock", "blonde action", "blonde on blonde action",
    "blow job", "blow your load", "blowjob", "blue waffle", "blumpkin", "bollocks",
    "bondage", "boner", "boob", "boobs", "booty call", "brown showers", "brunette action",
    "bs", "bukkake", "bulldyke", "bullet vibe", "bullshit", "bung hole", "bunghole",
    "busty", "butt", "buttcheeks", "butthole", "camel toe", "camgirl", "camslut",
    "camwhore", "carpet muncher", "carpetmuncher", "chocolate rosebuds", "cialis",
    "circlejerk", "cleveland steamer", "clit", "clitoris", "clover clamps", "clusterfuck",
    "cock", "cocks", "coon", "coons", "coprolagnia", "coprophilia", "cornhole", "creampie",
    "cum", "cumming", "cumshot", "cumshots", "cunnilingus", "cunt", "darkie", "date rape",
    "daterape", "deep throat", "deepthroat", "dendrophilia", "dick", "dickhead", "dildo",
    "dingleberries", "dingleberry", "dirty pillows", "dirty sanchez", "dog style",
    "doggie style", "doggiestyle", "doggy style", "doggystyle", "dolcett", "domination",
    "dominatrix", "dommes", "donkey punch", "double dong", "double penetration", "douchebag",
    "dp action", "dry hump", "dumbass", "dumbf", "dumbfuck", "dvda", "eat my ass", "ecchi",
    "ejaculation", "erotic", "erotism", "escort", "eunuch", "fag", "faggot", "fecal", "felch",
    "fellatio", "feltch", "female squirting", "femdom", "ffs", "figging", "fingerbang",
    "fingering", "fisting", "foot fetish", "footjob", "frotting", "fu", "fuck", "fuck buttons",
    "fuckin", "fucking", "fucktards", "fudge packer", "fudgepacker", "futanari", "fys",
    "g-spot", "gang bang", "gangbang", "gay sex", "genitals", "gfy", "giant cock", "girl on",
    "girl on top", "girls gone wild", "goatcx", "goatse", "god damn", "gokkun", "golden shower",
    "goo girl", "goodpoop", "goregasm", "grope", "group sex", "gtfo", "guro", "hand job",
    "handjob", "hard core", "hardcore", "hentai", "homoerotic", "honkey", "hooker", "horny",
    "hot carl", "hot chick", "how to kill", "how to murder", "huge fat", "humping", "incest",
    "intercourse", "jack off", "jackass", "jail bait", "jailbait", "jelly donut", "jerk off",
    "jigaboo", "jiggaboo", "jiggerboo", "jizz", "juggs", "kike", "kinbaku", "kinkster", "kinky",
    "knobbing", "kys", "leather restraint", "leather straight jacket", "lemon party", "livesex",
    "lolita", "lovemaking", "make me come", "male squirting", "masturbate", "masturbating",
    "masturbation", "menage a trois", "mf", "mfer", "milf", "missionary position", "mong", "moron",
    "motherfckr", "motherfucker", "mound of venus", "mr hands", "muff diver", "muffdiving", "nambla",
    "nawashi", "negro", "neonazi", "nig nog", "nigga", "nigger", "nimphomania", "nipple", "nipples",
    "nsfw", "nsfw images", "nude", "nudity", "numbnuts", "nutten", "nympho", "nymphomania",
    "octopussy", "omorashi", "one cup two girls", "one guy one jar", "orgasm", "orgy", "paedophile",
    "paki", "panties", "panty", "pedobear", "pedophile", "pegging", "penis", "phone sex",
    "piece of shit", "pikey", "piss pig", "pissing", "pisspig", "playboy", "pleasure chest",
    "pole smoker", "ponyplay", "poof", "poon", "poontang", "poop chute", "poopchute", "porn",
    "porno", "pornography", "pos", "prince albert piercing", "pthc", "pubes", "punany", "pussy",
    "queaf", "queef", "quim", "raghead", "raging boner", "rape", "raping", "rapist", "rectum",
    "reverse cowgirl", "rimjob", "rimming", "rosy palm", "rosy palm and her 5 sisters", "rusty trombone",
    "s&m", "sadism", "santorum", "scat", "schlong", "scissoring", "scumbag", "semen", "sex", "sexcam",
    "sexo", "sexual", "sexuality", "sexually", "sexy", "shaved beaver", "shaved pussy", "shemale",
    "shibari", "shit", "shitblimp", "shitty", "shota", "shrimping", "skeet", "slanteye", "slut", "smut",
    "snatch", "snowballing", "sob", "sodomize", "sodomy", "spastic", "spic", "splooge", "splooge moose",
    "spooge", "spread legs", "spunk", "stfu", "stfug", "strap on", "strapon", "strappado", "strip club",
    "style doggy", "suck", "sucks", "suicide girls", "sultry women", "swastika", "swinger",
    "tainted love", "taste my", "tea bagging", "threesome", "throating", "thumbzilla", "tied up",
    "tight white", "tit", "tits", "titties", "titty", "tongue in a", "topless", "tosser", "towelhead",
    "tranny", "tribadism", "tub girl", "tubgirl", "tushy", "twat", "twink", "twinkie", "two girls one cup",
    "undressing", "upskirt", "urethra play", "urophilia", "vagina", "venus mound", "viagra", "vibrator",
    "violet wand", "vorarephilia", "voyeur", "voyeurweb", "voyuer", "vulva", "wank", "wet dream", "wetback",
    "white power", "whore", "worldsex", "wrapping men", "wrinkled starfish", "xx", "xxx", "yaoi",
    "yellow showers", "yiffy", "zoophilia"
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
        {
            matches.push(BANNED_WORDS[i])
            break
        }
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