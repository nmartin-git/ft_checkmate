'use client'
import { useSearchParams } from "next/navigation";
import useLoginModal from "@/src/hooks/useLoginModal";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import usePlayModal from "@/src/hooks/usePlayModal";

export default function HomePage() {
  const searchParams = useSearchParams();
  const loginModal = useLoginModal();
  const playModal = usePlayModal();
  const router = useRouter();
  const t = useTranslations();
  const locale = useLocale();

  const decoBoard = Array(8).fill(null).map((_, row) =>
    Array(8).fill(null).map((_, col) => {
      if ((row + col) % 2 === 0 && row < 3) return 1;
      if ((row + col) % 2 === 0 && row > 4) return 2;
      return 0;
    })
  );

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-12 min-h-[calc(100vh-64px)] bg-slate-900 p-6">
      <div className="grid grid-cols-8 border-4 border-slate-950 shadow-2xl rounded-lg overflow-hidden bg-slate-950" style={{ width: "360px", height: "360px" }}>
        {decoBoard.map((rowData, r) =>
          rowData.map((v, c) => {
            const dark = (r + c) % 2 === 0;
            return (
              <div key={`${r}-${c}`} className={`flex justify-center items-center ${dark ? "bg-amber-900" : "bg-amber-100"}`} style={{ width: "45px", height: "45px" }}>
                {v === 1 && <div className="w-7 h-7 rounded-full bg-neutral-900 border-2 border-neutral-700 shadow-lg"></div>}
                {v === 2 && <div className="w-7 h-7 rounded-full bg-neutral-100 border-2 border-neutral-300 shadow-lg"></div>}
              </div>
            );
          })
        )}
      </div>
      <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700 max-w-md w-full">
        <h1 className="text-4xl font-black text-white mb-3 tracking-wide">Jouer aux Dames</h1>
        <p className="text-slate-400 mb-8 text-lg">Lancez une partie de Dames endiablee contre vos amis !</p>
        <button
          onClick={() => playModal.onOpen()}
          className="w-full px-6 py-4 bg-[#81b64c] hover:bg-[#95ca5f] text-white text-2xl font-black tracking-wider rounded-md border-b-4 border-[#537631] active:border-b-0 active:mt-1 transition-all uppercase"
        >
          Jouer
        </button>
      </div>
    </div>
  );
}