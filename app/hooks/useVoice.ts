import { useState, useRef, useEffect } from "react";

/**
 * useVoice - Hook to record audio from microphone and stream to backend via WebSocket.
 * Returns start, stop functions and recording state.
 */
export function useVoice() {
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      wsRef.current?.close();
      mediaRecorderRef.current?.stop();
    };
  }, []);

  const start = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:4000");
      wsRef.current = ws;
      ws.binaryType = "arraybuffer";

      mediaRecorder.ondataavailable = (event) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(event.data);
        }
      };

      ws.onopen = () => {
        mediaRecorder.start(250); // send chunks every 250ms
        setRecording(true);
      };

      ws.onerror = (e) => {
        console.error("WebSocket error", e);
        setError("WebSocket connection error");
      };
    } catch (e: any) {
      console.error(e);
      setError(e.message);
    }
  };

  const stop = () => {
    mediaRecorderRef.current?.stop();
    wsRef.current?.close();
    setRecording(false);
  };

  return { start, stop, recording, error };
}
