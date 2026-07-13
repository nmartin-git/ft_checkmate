-- AddExtensionCitext
CREATE EXTENSION IF NOT EXISTS citext;

-- CreateEnum
CREATE TYPE "club_names" AS ENUM ('Assembly', 'Order', 'Federation', 'Alliance');

-- CreateEnum
CREATE TYPE "game_results" AS ENUM ('WHITE', 'BLACK', 'DRAW');

-- CreateEnum
<<<<<<<< HEAD:prisma/migrations/20260710162812_init/migration.sql
CREATE TYPE "follow_status" AS ENUM ('PENDING', 'ACCEPTED', 'REFUSED', 'GAME_REQUESTED');
========
CREATE TYPE "follow_status" AS ENUM ('PENDING', 'ACCEPTED', 'GAME_REQUESTED');
>>>>>>>> origin/front:prisma/migrations/20260627233941_init/migration.sql

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" CITEXT NOT NULL,
    "username" VARCHAR(12) NOT NULL,
    "password" TEXT,
    "birthdate" DATE,
    "avatar_url" TEXT,
    "a2f_enable" BOOLEAN NOT NULL DEFAULT false,
    "a2f_opt_hash" TEXT,
    "a2f_expires_at" TIMESTAMP(3),
    "a2f_log_attemps" INTEGER NOT NULL DEFAULT 0,
    "a2f_recovery_codes" TEXT,
    "chat_enable" BOOLEAN NOT NULL DEFAULT false,
    "club" "club_names" NOT NULL,
    "elo" INTEGER NOT NULL DEFAULT 800,
    "is_online" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "User_email_lenght_check" CHECK (length(email) <= 254)
);

-- CreateTable
CREATE TABLE "Friends" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "friend_id" UUID NOT NULL,
    "status" "follow_status" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "Friends_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "Move" (
    "id" UUID NOT NULL,
    "move_number" INTEGER NOT NULL,
    "initial_position" SMALLINT NOT NULL,
    "new_position" SMALLINT NOT NULL,
    "time_to_move" INTEGER NOT NULL,
    "game_id" UUID NOT NULL,

    CONSTRAINT "Move_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DirectMessage" (
    "id" UUID NOT NULL,
    "message" VARCHAR(140) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read_at" TIMESTAMP(3),
    "sender_id" UUID NOT NULL,
    "receiver_id" UUID NOT NULL,

    CONSTRAINT "DirectMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_elo_idx" ON "User"("elo" DESC);

-- CreateIndex
CREATE INDEX "Friends_user_id_idx" ON "Friends"("user_id");

-- CreateIndex
CREATE INDEX "Friends_friend_id_idx" ON "Friends"("friend_id");

-- CreateIndex
CREATE UNIQUE INDEX "Friends_user_id_friend_id_key" ON "Friends"("user_id", "friend_id");

-- CreateIndex
CREATE INDEX "Game_white_player_id_idx" ON "Game"("white_player_id");

-- CreateIndex
CREATE INDEX "Game_black_player_id_idx" ON "Game"("black_player_id");

-- CreateIndex
CREATE INDEX "Move_game_id_idx" ON "Move"("game_id");

-- CreateIndex
CREATE UNIQUE INDEX "Move_game_id_move_number_key" ON "Move"("game_id", "move_number");

-- CreateIndex
CREATE INDEX "DirectMessage_sender_id_idx" ON "DirectMessage"("sender_id");

-- CreateIndex
CREATE INDEX "DirectMessage_receiver_id_idx" ON "DirectMessage"("receiver_id");

-- CreateIndex
CREATE INDEX "DirectMessage_sender_id_receiver_id_idx" ON "DirectMessage"("sender_id", "receiver_id");

-- AddForeignKey
ALTER TABLE "Friends" ADD CONSTRAINT "Friends_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friends" ADD CONSTRAINT "Friends_friend_id_fkey" FOREIGN KEY ("friend_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_white_player_id_fkey" FOREIGN KEY ("white_player_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_black_player_id_fkey" FOREIGN KEY ("black_player_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Move" ADD CONSTRAINT "Move_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DirectMessage" ADD CONSTRAINT "DirectMessage_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
<<<<<<<< HEAD:prisma/migrations/20260710162812_init/migration.sql

-- AddForeignKey
ALTER TABLE "DirectMessage" ADD CONSTRAINT "DirectMessage_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddChecks

========

-- AddForeignKey
ALTER TABLE "DirectMessage" ADD CONSTRAINT "DirectMessage_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddChecks
>>>>>>>> origin/front:prisma/migrations/20260627233941_init/migration.sql
ALTER TABLE "Friends"
ADD CONSTRAINT "friend_user_not_self"
CHECK ("user_id" != "friend_id");

ALTER TABLE "Game"
ADD CONSTRAINT "white_player_not_black"
CHECK ("white_player_id" != "black_player_id");

ALTER TABLE "DirectMessage"
ADD CONSTRAINT "sender_to_not_self"
<<<<<<<< HEAD:prisma/migrations/20260710162812_init/migration.sql
CHECK ("sender_id" != "receiver_id"); 
========
CHECK ("sender_id" != "receiver_id");
>>>>>>>> origin/front:prisma/migrations/20260627233941_init/migration.sql
