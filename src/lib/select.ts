import { Prisma } from "@prisma/client"

// Champs publics d'un user.
// A mettre dans src/lib
export const PUBLIC_USER_SELECT = {
    id: true,
    username: true,
    avatar_url: true,
    elo: true,
    club: true,
    is_online: true,
} satisfies Prisma.UserSelect
