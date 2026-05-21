-- AddExtensionCitext
CREATE EXTENSION IF NOT EXISTS citext;

-- CreateEnum
CREATE TYPE "club_names" AS ENUM ('N', 'Y', 'J', 'B', 'M');

-- CreateEnum
CREATE TYPE "game_results" AS ENUM ('WHITE', 'BLACK', 'DRAW');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" CITEXT NOT NULL,
    "username" VARCHAR(12) NOT NULL,
    "password" TEXT,
    "birthdate" DATE,
    "a2f_enable" BOOLEAN NOT NULL DEFAULT false,
    "a2f_secret" VARCHAR(64),
    "a2f_recovery_codes" TEXT,
    "chat_enable" BOOLEAN NOT NULL DEFAULT false,
    "club" "club_names" NOT NULL,
    "is_premium" BOOLEAN NOT NULL DEFAULT false,
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "elo" INTEGER NOT NULL DEFAULT 800,
    "is_online" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
    CONSTRAINT "User_email_lenght_check" CHECK (length(email) <= 254) 
);

-- CreateTable
CREATE TABLE "Auth" (
    "id" UUID NOT NULL,
    "auth_type" TEXT NOT NULL,
    "auth_id" TEXT,
    "user_id" UUID NOT NULL,

    CONSTRAINT "Auth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Follow" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "friend_id" UUID NOT NULL,

    CONSTRAINT "Follow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Game" (
    "id" UUID NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "white_player_elo" INTEGER NOT NULL,
    "black_player_elo" INTEGER NOT NULL,
    "white_player_id" UUID NOT NULL,
    "black_player_id" UUID NOT NULL,
    "result" "game_results",

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chat" (
    "id" UUID NOT NULL,
    "message" VARCHAR(140) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "author_user_id" UUID NOT NULL,
    "game_id" UUID NOT NULL,

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Move" (
    "id" UUID NOT NULL,
    "move_number" INTEGER NOT NULL,
    "initial_position" SMALLINT NOT NULL,
    "new_position" SMALLINT NOT NULL,
    "time_to_move" TIMESTAMP(3) NOT NULL,
    "game_id" UUID NOT NULL,

    CONSTRAINT "Move_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Auth_user_id_auth_type_key" ON "Auth"("user_id", "auth_type");

-- CreateIndex
CREATE INDEX "Follow_user_id_idx" ON "Follow"("user_id");

-- CreateIndex
CREATE INDEX "Follow_friend_id_idx" ON "Follow"("friend_id");

-- CreateIndex
CREATE UNIQUE INDEX "Follow_user_id_friend_id_key" ON "Follow"("user_id", "friend_id");

-- CreateIndex
CREATE INDEX "Game_white_player_id_idx" ON "Game"("white_player_id");

-- CreateIndex
CREATE INDEX "Game_black_player_id_idx" ON "Game"("black_player_id");

-- CreateIndex
CREATE INDEX "Chat_author_user_id_idx" ON "Chat"("author_user_id");

-- CreateIndex
CREATE INDEX "Chat_game_id_idx" ON "Chat"("game_id");

-- CreateIndex
CREATE INDEX "Move_game_id_idx" ON "Move"("game_id");

-- CreateIndex
CREATE UNIQUE INDEX "Move_game_id_move_number_key" ON "Move"("game_id", "move_number");

-- AddForeignKey
ALTER TABLE "Auth" ADD CONSTRAINT "Auth_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_friend_id_fkey" FOREIGN KEY ("friend_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_white_player_id_fkey" FOREIGN KEY ("white_player_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_black_player_id_fkey" FOREIGN KEY ("black_player_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_author_user_id_fkey" FOREIGN KEY ("author_user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Move" ADD CONSTRAINT "Move_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddChecks

ALTER TABLE "Follow"
ADD CONSTRAINT "follow_user_not_self"
CHECK ("user_id" != "friend_id");

ALTER TABLE "Game"
ADD CONSTRAINT "white_player_not_black"
CHECK ("white_player_id" != "black_player_id");
