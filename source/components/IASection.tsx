import { useState } from "react";

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
        headers: {
          "Content-Type": "application/json",
        },
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
          { role: "ia" as const, content: "❌ Erreur génération image" },
        ]);
      }
    } catch (error) {
      setIaMessages([
        ...newMessages,
        { role: "ia" as const, content: "❌ Erreur connexion API" },
      ]);
    } finally {
      setIaLoading(false);
    }
  };

  return (
    <div>
      <H title="IA" icon="🎨" />

      <div className="bg-black/30 rounded-3xl border border-[#D4AF37]/15 overflow-hidden flex flex-col shadow-2xl">
        <div className="p-4 border-b border-[#D4AF37]/10">
          <p className="text-[#D4AF37] font-bold text-sm text-center">
            Générateur d'images DYNO
          </p>
        </div>

        <div className="p-4 space-y-4 min-h-[400px] max-h-[600px] overflow-y-auto bg-black/20">
          {iaMessages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${
                msg.role === "user"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-[90%] px-4 py-3 rounded-2xl ${
                  msg.role === "user"
                    ? "bg-[#D4AF37]/20 text-[#D4AF37]"
                    : "bg-[#1a1a1a] text-white"
                }`}
              >
                {msg.content.startsWith("![Génération](") ? (
                  <img
                    src={msg.content.match(/\((.*?)\)/)?.[1] || ""}
                    className="rounded-lg w-full border border-[#D4AF37]/50 cursor-pointer"
                    onClick={() =>
                      window.open(
                        msg.content.match(/\((.*?)\)/)?.[1] || "",
                        "_blank"
                      )
                    }
                  />
                ) : (
                  <p className="text-xs whitespace-pre-wrap">
                    {msg.content}
                  </p>
                )}
              </div>
            </div>
          ))}

          {iaLoading && (
            <div className="text-center text-[#D4AF37] animate-pulse text-xs">
              Création en cours...
            </div>
          )}
        </div>

        <div className="p-4 border-t border-white/5 flex gap-2">
          <input
            value={iaQuestion}
            onChange={(e) => setIaQuestion(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && genererImage()
            }
            placeholder="Décris l'image..."
            className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-xs focus:outline-none"
          />

          <button
            onClick={genererImage}
            disabled={iaLoading}
            className="w-14 rounded-xl bg-[#D4AF37] text-black font-bold"
          >
            🎨
          </button>
        </div>
      </div>
    </div>
  );
};
