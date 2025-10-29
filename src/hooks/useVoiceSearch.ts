import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Platform } from "react-native";
import Constants from "expo-constants";

type VoiceModule = typeof import("@react-native-voice/voice").default;

type UseVoiceSearchOptions = {
  language?: string;
  onResult?: (transcript: string) => void;
  onError?: (message: string) => void;
  autoPromptUnavailable?: boolean;
};

type UseVoiceSearchReturn = {
  isSupported: boolean;
  isListening: boolean;
  start: () => Promise<boolean>;
  stop: () => Promise<void>;
  error: string | null;
};

const DEFAULT_LANGUAGE = "en-US";

export default function useVoiceSearch({
  language = DEFAULT_LANGUAGE,
  onResult,
  onError,
  autoPromptUnavailable = true,
}: UseVoiceSearchOptions = {}): UseVoiceSearchReturn {
  const [voiceModule, setVoiceModule] = useState<VoiceModule | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasAttemptedImportRef = useRef(false);

  const isSupported = useMemo(() => {
    if (Platform.OS === "web") {
      return false;
    }

    const ownership = Constants.appOwnership ?? "standalone";
    return ownership !== "expo";
  }, []);

  useEffect(() => {
    if (!isSupported) {
      if (autoPromptUnavailable) {
        setError(
          Platform.OS === "web"
            ? "Voice input is not available on the web yet."
            : "Install a development build to enable voice search."
        );
      }
      return;
    }

    if (hasAttemptedImportRef.current) {
      return;
    }

    let isMounted = true;
    hasAttemptedImportRef.current = true;

    (async () => {
      try {
        const module = (await import("@react-native-voice/voice")).default as VoiceModule;
        if (isMounted) {
          setVoiceModule(module);
          setError(null);
        }
      } catch (importError) {
        console.warn("Failed to load voice module", importError);
        if (isMounted) {
          setError("Voice search is unavailable on this device.");
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [autoPromptUnavailable, isSupported]);

  useEffect(() => {
    if (!voiceModule) {
      return;
    }

    const handleResults = (event: { value?: string[] }) => {
      const [transcript] = event.value ?? [];
      if (transcript) {
        onResult?.(transcript);
      }
      setIsListening(false);
    };

    const handleError = (event: { error?: { message?: string } }) => {
      const message = event.error?.message ?? "We couldn't understand that.";
      setError(message);
      onError?.(message);
      setIsListening(false);
    };

    voiceModule.onSpeechResults = handleResults;
    voiceModule.onSpeechError = handleError;
    voiceModule.onSpeechEnd = () => setIsListening(false);

    return () => {
      voiceModule.destroy().finally(() => voiceModule.removeAllListeners());
    };
  }, [onError, onResult, voiceModule]);

  const start = useCallback(async () => {
    if (!isSupported || !voiceModule) {
      if (autoPromptUnavailable && error) {
        Alert.alert("Voice search", error);
      }
      return false;
    }

    try {
      setError(null);
      setIsListening(true);
      await voiceModule.start(language);
      return true;
    } catch (startError) {
      console.warn("Failed to start voice search", startError);
      const message =
        "We couldn't access the microphone. Check your permissions and try again.";
      setError(message);
      onError?.(message);
      setIsListening(false);
      return false;
    }
  }, [autoPromptUnavailable, error, isSupported, language, onError, voiceModule]);

  const stop = useCallback(async () => {
    if (!voiceModule) {
      setIsListening(false);
      return;
    }

    try {
      await voiceModule.stop();
    } catch (stopError) {
      console.warn("Failed to stop voice search", stopError);
    } finally {
      setIsListening(false);
    }
  }, [voiceModule]);

  return {
    isSupported,
    isListening,
    start,
    stop,
    error,
  };
}
