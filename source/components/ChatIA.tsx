import { useState } from "react";

interface Message {
  role: "user" | "ia";
  content: string;
}

export default function ChatIA() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [chargement, setChargement] = useState(false);

  async function poserQuestion() {
    if (!question.trim()) return;

    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: question }
    ];
    setMessages(newMessages);
    setQuestion("");
    setChargement(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: question }),
      });

      const data = await res.json();
      const reponseIA = data.choices[0].message.content;

      setMessages([...newMessages, { role: "ia", content: reponseIA }]);
    } catch (error) {
      setMessages([
        ...newMessages,
        { role: "ia", content: "❌ Erreur de connexion à l'IA." }
      ]);
    } finally {
      setChargement(false);
    }
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      poserQuestion();
    }
  }

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100%",
      background: "#0a0a0a",
      borderRadius: "16px",
      overflow: "hidden",
      border: "1px solid #222"
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #00ff88, #00cc66)",
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        gap: "10px"
      }}>
        <span style={{ fontSize: "24px" }}>🤖</span>
        <div>
          <h2 style={{ margin: 0, color: "#000", fontSize: "16px", fontWeight: "800" }}>
            Coach IA DYNO
          </h2>
          <p style={{ margin: 0, color: "#005533", fontSize: "12px" }}>
            Propulsé par Groq • Llama 3
          </p>
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        minHeight: "300px",
        maxHeight: "500px"
      }}>
        {messages.length === 0 && (
          <div style={{
            textAlign: "center",
            color: "#444",
            marginTop: "60px"
          }}>
            <p style={{ fontSize: "40px" }}>🎮</p>
            <p>Pose une question à ton Coach IA !</p>
            <p style={{ fontSize: "12px", color: "#333" }}>
              Strats, tips, meta, équipe...
            </p>
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start"
            }}
          >
            <div style={{
              maxWidth: "80%",
              padding: "12px 16px",
              borderRadius: msg.role === "user"
                ? "18px 18px 4px 18px"
                : "18px 18px 18px 4px",
              background: msg.role === "user"
                ? "linear-gradient(135deg, #00ff88, #00cc66)"
                : "#1a1a1a",
              color: msg.role === "user" ? "#000" : "#fff",
              fontSize: "14px",
              lineHeight: "1.6",
              border: msg.role === "ia" ? "1px solid #222" : "none"
            }}>
              {msg.role === "ia" && (
                <strong style={{ color: "#00ff88", fontSize: "12px" }}>
                  🤖 Coach IA
                </strong>
              )}
              <p style={{ margin: msg.role === "ia" ? "6px 0 0 0" : "0" }}>
                {msg.content}
              </p>
            </div>
          </div>
        ))}

        {chargement && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{
              background: "#1a1a1a",
              border: "1px solid #222",
              borderRadius: "18px 18px 18px 4px",
              padding: "12px 16px",
              color: "#00ff88",
              fontSize: "14px"
            }}>
              ⏳ Coach IA réfléchit...
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{
        padding: "16px",
        borderTop: "1px solid #222",
        display: "flex",
        gap: "10px"
      }}>
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Pose ta question esport... (Entrée pour envoyer)"
          style={{
            flex: 1,
            background: "#1a1a1a",
            color: "white",
            border: "1px solid #333",
            borderRadius: "25px",
            padding: "12px 18px",
            fontSize: "14px",
            outline: "none"
          }}
        />
        <button
          onClick={poserQuestion}
          disabled={chargement || !question.trim()}
          style={{
            background: chargement || !question.trim()
              ? "#333"
              : "linear-gradient(135deg, #00ff88, #00cc66)",
            color: chargement || !question.trim() ? "#666" : "#000",
            border: "none",
            borderRadius: "50%",
            width: "46px",
            height: "46px",
            cursor: chargement ? "not-allowed" : "pointer",
            fontSize: "20px",
            fontWeight: "bold"
          }}
        >
          ➤
        </button>
      </div>
    </div>
  );
}