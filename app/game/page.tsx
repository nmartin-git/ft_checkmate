'use client';

import { useEffect } from "react";
import {drawboard} from "@/src/game.js";

const gamePage  = () => {
    useEffect(()=>{
        drawboard();
    },[]);
    return (
        <div>
            <h1>Jeu de dames</h1>
            <body>
                <h1 className="text-center">Jeu de Dames</h1>
                <p className="text-center">Player 1 VS Player 2</p>
                <div id="board" ></div>
            </body>
        </div>
    );
}

export default gamePage 