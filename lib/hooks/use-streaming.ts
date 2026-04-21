"use client";

import { useState, useCallback } from "react";

interface UseStreamingOptions {
  onComplete?: (fullContent: string) => void;
  onError?: (error: Error) => void;
}

export function useStreaming(url: string, options: UseStreamingOptions = {}) {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(
    async (body: object) => {
      setContent("");
      setError(null);
      setIsLoading(true);

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({ error: "Request failed" }));
          throw new Error(err.error || `HTTP ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let full = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          full += chunk;
          setContent(full);
        }

        options.onComplete?.(full);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error.message);
        options.onError?.(error);
      } finally {
        setIsLoading(false);
      }
    },
    [url, options]
  );

  const reset = useCallback(() => {
    setContent("");
    setError(null);
    setIsLoading(false);
  }, []);

  return { content, isLoading, error, generate, reset };
}
