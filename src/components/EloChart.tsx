'use client'

import { LineChart, Line, XAxis, YAxis, Tooltip,CartesianGrid, ResponsiveContainer} from "recharts"
import {format} from "date-fns"

interface EloPoint{
    date : Date | string;
    elo : number
}

export default function EloChart({data} : {data : EloPoint[]}){
    const chartData = data.map((p)=>({
        label : format(new Date(p.date), "dd,MM"),
        elo : p.elo
    }));
    if (chartData.length < 2){
        return (//TODO a traduire
            <p className="text-sm text-gray-500 font-medium mt-6">
                Pas assez de parties pour afficher le graphique.
            </p>
        );
    }
    return (
            <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 0, left: -15 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2b2925" />
                    <XAxis dataKey="label" stroke="#888" fontSize={11} />          {/* abscisse = temps */}
                    <YAxis domain={['dataMin - 20', 'dataMax + 20']} stroke="#888" fontSize={11} /> {/* ordonnée = elo */}
                    <Tooltip
                        contentStyle={{ background: "#1e1c18", border: "1px solid #2b2925", borderRadius: 8 }}
                        labelStyle={{ color: "#fff" }}
                    />
                    <Line type="monotone" dataKey="elo" stroke="#81b64c" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
            </ResponsiveContainer>
        );
}