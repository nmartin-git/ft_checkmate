'use client'

import Button from "@/src/components/ui/Button"
import { useRouter } from "next/navigation"
import useLoginModal from "@/src/hooks/useLoginModal"    // Pour pouvoir ouvrir le login si besoin
import useCurrentUser from "@/src/hooks/useCurrentUser" // On importe ton hook !
import { useEffect, useState } from "react"
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
} from "recharts"

const CHART = {
    card: "#1e1c18",
    border: "#2b2925",
    green: "#81b64c",
    red: "#c44d4d",
    gray: "#6f6b66",
    textMuted: "#a3a09b",
}
export default  function ProfilePage() 
{
    const router = useRouter();
    const [stats, setStats] = useState<{ winrate : number; wins: number; losses: number; draws: number } | null>(null);
    const [eloHistory, setEloHistory] = useState([]);
    const { user } = useCurrentUser(); // On récupère l'utilisateur connecté
    const loginModal = useLoginModal();
    const handleEditClick = () => {
        router.push('/profile/parameters');
    };
    
    useEffect(() => { 
        if (!user)return;
        const fetchStats = async ()=>{
            const response = await fetch('/api/stats/${user.id}');
            if (!response.ok)console.log("error in stats api");
            const data = await response.json();
            setStats(data.stats);
            setEloHistory(data.eloHistory)
        }
        fetchStats();
    },[user]);
    // Sécurité : Si l'utilisateur n'est pas connecté
    // if (!user) {
    //     return (
    //         <div className="flex flex-col items-center justify-center w-screen h-96 gap-4">
    //             <p className="text-xl text-white">Vous devez être connecté pour voir votre profil.</p>
    //             <Button 
    //                 label="Se connecter" 
    //                 onClick={() => loginModal.onOpen()} 
    //             />
    //         </div>
    //     );
    // }
    if (!user)
    {
        router.push('/');
        return (null);
    }
    
    const camembertData = stats ? [
        {name : "Victories", value : stats.wins, color: CHART.green},
        {name : "Losses", value : stats.losses, color: CHART.red},
        {name : "Victories", value : stats.draws, color: CHART.gray}
    ] : [];

    const total = stats ? stats.wins + stats.losses + stats.draws : 0;
    const winrate = stats ? stats.winrate : 0;
    const currentElo = eloHistory.length  ? eloHistory[eloHistory.length - 1].elo : 1000;
    const shortDate = (d) => new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });


    const tooltipStyle = {
    backgroundColor: CHART.card,
    border: `1px solid ${CHART.border}`,
    borderRadius: 6,
    color: "#fff",
  };

  return (
    <div className="min-h-[calc(100vh-100px)] bg-[#262522] text-white p-6 md:p-10 select-none">

      {/* Header (inchangé) */}
      <div className="max-w-6xl mx-auto bg-[#1e1c18] border-2 border-[#2b2925] rounded-lg p-8 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left w-full">
          <div className="w-24 h-24 bg-[#312e2b] border-2 border-[#45423f] rounded-md flex items-center justify-center text-[#81b64c] text-4xl font-black uppercase shadow-inner">
            {user.username?.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-3">
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">{user.username}</h1>
              <span className="bg-[#81b64c] text-white text-xs font-black px-2 py-0.5 rounded uppercase tracking-wider">Player</span>
            </div>
            <p className="text-gray-400 font-medium text-sm md:text-base">{user.email}</p>
          </div>
        </div>
        <div className="w-full md:w-auto flex justify-center md:justify-end">
          <Button label="Parameters" secondary onClick={handleEditClick} />
        </div>
      </div>

      {/* Zone graphiques */}
      {!stats ? (
        <p className="max-w-6xl mx-auto text-gray-400">Chargement des statistiques…</p>
      ) : (
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ─── CAMEMBERT ─── */}
          <div className="bg-[#1e1c18] border-2 border-[#2b2925] rounded-lg p-6 shadow-xl">
            <p className="text-gray-300 font-black uppercase tracking-wider text-sm mb-1">🥧 Répartition</p>
            <p className="text-sm text-gray-500 mb-4">
              Winrate : <span className="text-[#81b64c] font-black">{winrate}%</span> sur {total} parties
            </p>

            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%" cy="50%"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={2}
                  stroke={CHART.card}
                  strokeWidth={3}
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>

            {/* Légende en Tailwind */}
            <div className="flex justify-center gap-5 mt-2">
              {pieData.map((e) => (
                <div key={e.name} className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: e.color }} />
                  <span className="text-xs text-gray-400">{e.name} ({e.value})</span>
                </div>
              ))}
            </div>
          </div>

          {/* ─── COURBE ELO ─── */}
          <div className="bg-[#1e1c18] border-2 border-[#2b2925] rounded-lg p-6 shadow-xl">
            <p className="text-gray-300 font-black uppercase tracking-wider text-sm mb-1">📈 Évolution ELO</p>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-black text-white">{currentElo}</span>
              <span className="text-[#81b64c] font-black text-sm uppercase">ELO</span>
            </div>

            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={eloHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART.border} />
                <XAxis dataKey="date" tickFormatter={shortDate} stroke={CHART.textMuted} fontSize={12} />
                <YAxis stroke={CHART.textMuted} fontSize={12} domain={["dataMin - 20", "dataMax + 20"]} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelFormatter={(d) => `Le ${shortDate(d)}`}
                  formatter={(value) => [value, "ELO"]}
                />
                <Line type="monotone" dataKey="elo" stroke={CHART.green} strokeWidth={3}
                  dot={{ r: 3, fill: CHART.green }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

        </div>
      )}
    </div>
  )
}