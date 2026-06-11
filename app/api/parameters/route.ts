import { NextResponse } from "next/server"
import { prisma } from "@/src/lib/prisma"
import { writeFile } from "fs/promises"
import { join } from "path"
import { updateChatEnable } from "@/src/lib/user"

export async function POST(request: Request) {
  try {
    const data = await request.formData()
    const chatEnable = data.get("Enabled") === "true"
    if (chatEnable)
      updateChatEnable("", chatEnable)
    //TODO get userId in params
    return NextResponse.json({ success: true, user: null })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}