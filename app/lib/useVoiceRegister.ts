import { useState } from "react";

/**
 * Hook to register a user's voice profile.
 * Sends base64 audio to /api/voice/register.
 * Returns loading state, error and the created profile.
 */
export function useVoiceRegister() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);

  async function registerVoice(base64Audio: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/voice/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audio: base64Audio }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to register voice");
      }
      const data = await res.json();
      setProfile(data.profile);
      return data.profile;
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }

  return { loading, error, profile, registerVoice };
}
