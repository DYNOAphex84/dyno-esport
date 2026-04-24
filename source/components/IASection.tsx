  export const genererImage = async () => {
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

      // 🛠 DEBUG : Regarde dans la console (F12) ce que ça affiche
      console.log("Réponse API :", data);

      if (res.ok && data.images && data.images[0]) {
        // ✅ On utilise l'URL directement
        const imageUrl = data.images[0].url;
        
        setIaMessages([
          ...newMessages,
          {
            role: "ia" as const,
            content: `![Génération](${imageUrl})`,
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
