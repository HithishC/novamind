import { useState } from "react";

/**
 * Hook to identify voice (transcribe) using /api/voice/identify.
 * Returns loading state, error, and result { transcript, language }.
 */
export function useVoiceIdentify() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ transcript: string; language: string } | null>(null);

  async function identifyVoice(base64Audio: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/voice/identify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audio: base64Audio }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Voice identify failed");
      }
      const data = await res.json();
      setResult({ transcript: data.transcript, language: data.language });
      return data;
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }

  return { loading, error, result, identifyVoice };
}
