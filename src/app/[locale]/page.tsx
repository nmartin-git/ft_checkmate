'use client';

import { useEffect } from "react";
import { io } from "socket.io-client";
import { initGame, requestRestart } from "@/src/game.js";

const gamePage = () => {
    useEffect(() => {
        const socket = io({ forceNew: true, transports: ["websocket"] });
        initGame(socket);
        return () => {
            socket.disconnect();
        };
    }, []);

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "20px", position: "relative" }}>
            <h1 className="text-center" style={{ fontSize: "1.5rem", fontWeight: "bold" }}>Jeu de Dames</h1>
            <p id="game-info" style={{ margin: "10px 0", fontWeight: "bold" }}>Connexion…</p>
            <div
                id="game-error"
                style={{
                    minHeight: "24px",
                    margin: "4px 0 12px",
                    padding: "6px 14px",
                    background: "#b91c1c",
                    color: "white",
                    borderRadius: "6px",
                    fontWeight: "bold",
                    opacity: 0,
                    transition: "opacity 0.3s",
                }}
            ></div>

            <div style={{ position: "relative" }}>
                <div id="board"></div>

                {/* Panneau de fin de partie (caché par défaut) */}
                <div
                    id="game-over"
                    style={{
                        display: "none",
                        position: "absolute",
                        inset: 0,
                        background: "rgba(0,0,0,0.75)",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "8px",
                        gap: "16px",
                    }}
                >
                    <h2 id="game-over-title" style={{ fontSize: "2.5rem", fontWeight: "bold", margin: 0 }}>Fin</h2>
                    <p id="game-over-sub" style={{ color: "white", fontSize: "1.1rem", margin: 0 }}></p>
                    <button
                        onClick={() => requestRestart()}
                        style={{
                            padding: "12px 28px",
                            fontSize: "1.1rem",
                            fontWeight: "bold",
                            background: "#16a34a",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                        }}
                    >
                        Rejouer
                    </button>
                </div>
            </div>
        </div>
    );
}

export default gamePage;
