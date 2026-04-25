import { useState, useRef, useEffect } from "react";

export const IASection = ({ H }: { H: any }) => {
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([
    {
      role: "assistant",
      content: "Salut ! Je suis l'IA de DYNO Esport 🎮 Je peux discuter et générer des images ! Tape 'image:' suivi de ta description pour créer une image.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const isImage = input.toLowerCase().startsWith("image:") ||
      input.toLowerCase().includes("génère") ||
      input.toLowerCase().includes("genere") ||
      input.toLowerCase().includes("dessine") ||
      input.toLowerCase().includes("logo") ||
      input.toLowerCase().includes("miniature");

    const userMessage = { role: "user" as const, content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      if (isImage) {
        // ✅ MODE IMAGE
        const res = await fetch("/api/image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: input }),
        });

        const text = await res.text();

        if (!text) {
          throw new Error("Réponse vide du serveur");
        }

        let data;
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error("Réponse invalide : " + text.slice(0, 100));
        }

        if (data.images && data.images[0]) {
          setMessages([
            ...newMessages,
            {
              role: "assistant" as const,
              content: `![Génération](${data.images[0].url})`,
            },
          ]);
        } else {
          throw new Error(data.error || "Image non valide");
        }

      } else {
        // ✅ MODE CHAT (Groq)
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: newMessages }),
        });

        const text = await res.text();

        if (!text) {
          throw new Error("Réponse vide du serveur");
        }

        let data;
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error("Réponse invalide : " + text.slice(0, 100));
        }

        if (data.content) {
          setMessages([
            ...newMessages,
            { role: "assistant" as const, content: data.content },
          ]);
        } else {
          throw new Error(data.error || "Erreur inconnue");
        }
      }

    } catch (error: any) {
      setMessages([
        ...newMessages,
        {
          role: "assistant" as const,
          content: "❌ " + error.message,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <H title="IA" icon="🤖" />

      <div className="bg-black/30 rounded-3xl border border-[#D4AF37]/15 overflow-hidden flex flex-col shadow-2xl">

        {/* Header */}
        <div className="bg-gradient-to-r from-[#D4AF37]/20 to-transparent p-4 border-b border-[#D4AF37]/10 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <p className="text-[#D4AF37] font-bold text-sm">DYNO IA</p>
            <p className="text-gray-600 text-[9px] uppercase">Chat + Images</p>
          </div>
          <button
            onClick={() => setMessages([{
              role: "assistant",
              content: "Salut ! Je suis l'IA de DYNO Esport 🎮 Je peux discuter et générer des images !",
            }])}
            className="text-gray-600 hover:text-red-400 text-[10px] uppercase"
          >
            Effacer
          </button>
        </div>

        {/* Messages */}
        <div className="p-4 space-y-3 min-h-[400px] max-h-[500px] overflow-y-auto bg-black/20">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-6 h-6 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/30 flex items-center justify-center text-[10px] mr-2 mt-1 flex-shrink-0">
                  🤖
                </div>
              )}
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl text-xs leading-relaxed ${
                  msg.role === "user"
                    ? "bg-gradient-to-br from-[#D4AF37] to-[#FFD700] text-black font-medium rounded-br-none"
                    : "bg-[#1a1a1a] text-gray-200 border border-white/5 rounded-bl-none"
                }`}
              >
                {msg.content.startsWith("![Génération](") ? (
                  <div>
                    <img
                      src={msg.content.match(/\((.*?)\)/)?.[1] || ""}
                      alt="Image générée"
                      className="rounded-lg w-full border border-[#D4AF37]/30 cursor-pointer"
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
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="w-6 h-6 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/30 flex items-center justify-center text-[10px] mr-2 mt-1">
                🤖
              </div>
              <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl rounded-bl-none px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        <div className="px-4 py-2 border-t border-white/5 flex gap-2 overflow-x-auto">
          {[
            "Stratégie de base",
            "Tips communication",
            "génère un logo DYNO noir et or",
            "Plan d'entraînement",
          ].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => setInput(suggestion)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] text-[9px] font-bold hover:bg-[#D4AF37]/20 transition-all uppercase whitespace-nowrap"
            >
              {suggestion}
            </button>
          ))}
        </div>

        {/* Info */}
        <div className="px-4 py-2 bg-black/20">
          <p className="text-[8px] text-gray-700 text-center">
            💬 Chat normal → Groq IA • 🎨 Commence par "génère" → Image
          </p>
        </div>

        {/* Input */}
        <div className="p-4 bg-black/40 border-t border-white/5 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Chat ou 'génère un logo...'"
            className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-xs focus:outline-none focus:border-[#D4AF37]/50 placeholder:text-gray-700"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className={`w-12 h-12 rounded-xl font-bold text-lg transition-all ${
              loading || !input.trim()
                ? "bg-white/5 text-gray-700 cursor-not-allowed"
                : "bg-gradient-to-br from-[#D4AF37] to-[#FFD700] text-black hover:scale-105 active:scale-95"
            }`}
          >
            {loading ? "⏳" : "➤"}
          </button>
        </div>
      </div>
    </div>
  );
};