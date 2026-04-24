import { useState } from "react";

// 👇 LE MOT MAGIQUE EST LÀ
export const IASection = ({ H }: { H: any }) => {
  const [iaQuestion, setIaQuestion] = useState("");
  const [iaMessages, setIaMessages] = useState<
    { role: "user" | "ia"; content: string }[]
  >([]);
  const [iaLoading, setIaLoading] = useState(false);

  const genererImage = async () => {
    if (!iaQuestion.trim()) return;
    const promptUtilisateur = iaQuestion;
    const newMessages = [
      ...iaMessages,
      { role: "user" as const, content: promptUtilisateur },
    ];
    setIaMessages(newMessages);
    setIaQuestion("");
    setIaLoading(true);

    try {
      const res = await fetch("/api/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptUtilisateur }),
      });

      const data = await res.json();

      if (res.ok && data.images && data.images[0]) {
        setIaMessages([
          ...newMessages,
          {
            role: "ia" as const,
            content: `![Génération](${data.images[0].url})`,
          },
        ]);
      } else {
        setIaMessages([
          ...newMessages,
          {
            role: "ia" as const,
            content: `❌ Erreur : ${data.error || "Format image invalide"}`,
          },
        ]);
      }
    } catch (error: any) {
      setIaMessages([
        ...newMessages,
        {
          role: "ia" as const,
          content: `❌ Erreur connexion : ${error.message}`,
        },
      ]);
    } finally {
      setIaLoading(false);
    }
  };

  return (
    <div>
      <H title="IA" icon="🎨" />
      <div className="bg-black/30 rounded-3xl border border-[#D4AF37]/15 overflow-hidden flex flex-col shadow-2xl">
        <div className="p-4 border-b border-[#D4AF37]/10 flex justify-between items-center">
          <div>
            <p className="text-[#D4AF37] font-bold text-sm">DYNO Générateur IA</p>
            <p className="text-gray-600 text-[9px] uppercase">Stable Diffusion</p>
          </div>
          <button
            onClick={() => setIaMessages([])}
            className="text-gray-600 hover:text-red-400 text-[10px] uppercase"
          >
            Effacer
          </button>
        </div>

        <div className="p-4 space-y-4 min-h-[400px] max-h-[600px] overflow-y-auto bg-black/20">
          {iaMessages.length === 0 && (
            <div className="text-center py-16 opacity-40">
              <div className="text-5xl mb-4">🖼️</div>
              <p className="text-white text-xs">
                Décris l'image à créer
              </p>
              <p className="text-gray-600 text-[10px] mt-2">
                Ex: "Un logo de dragon or et noir style esport"
              </p>
            </div>
          )}

          {iaMessages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              } mb-4`}
            >
              <div
                className={`max-w-[90%] px-4 py-3 rounded-2xl ${
                  msg.role === "user"
                    ? "bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-[#D4AF37]"
                    : "bg-[#1a1a1a] text-white w-full"
                }`}
              >
                {msg.content.startsWith("![Génération](") ? (
                  <div>
                    <img
                      src={msg.content.match(/\((.*?)\)/)?.[1] || ""}
                      className="rounded-lg w-full border-2 border-[#D4AF37]/50 shadow-2xl cursor-pointer"
                      onClick={() =>
                        window.open(
                          msg.content.match(/\((.*?)\)/)?.[1] || "",
                          "_blank"
                        )
                      }
                    />
                    <p className="text-[9px] text-gray-600 text-center mt-1">
                      Cliquez pour agrandir
                    </p>
                  </div>
                ) : (
                  <p className="text-xs whitespace-pre-wrap">{msg.content}</p>
                )}
              </div>
            </div>
          ))}

          {iaLoading && (
            <div className="flex flex-col items-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#D4AF37] mb-3"></div>
              <p className="text-[#D4AF37] text-[10px] font-bold uppercase animate-pulse">
                Génération en cours... (30-60 sec)
              </p>
            </div>
          )}
        </div>

        <div className="p-4 bg-black/40 border-t border-white/5 flex gap-2">
          <input
            value={iaQuestion}
            onChange={(e) => setIaQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && genererImage()}
            placeholder="Ex: Un logo DYNO esport futuriste..."
            className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-xs focus:outline-none focus:border-[#D4AF37]/50"
          />
          <button
            onClick={genererImage}
            disabled={iaLoading || !iaQuestion.trim()}
            className={`w-14 rounded-xl font-bold text-xl transition-all ${
              iaLoading || !iaQuestion.trim()
                ? "bg-white/5 text-gray-700 cursor-not-allowed"
                : "bg-gradient-to-br from-[#D4AF37] to-[#FFD700] text-black hover:scale-105 active:scale-95"
            }`}
          >
            🎨
          </button>
        </div>
      </div>
    </div>
  );
};
