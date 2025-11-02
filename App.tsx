import React, { useState, useEffect, useCallback, useRef } from "react";
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from "@google/genai";
import { EnderDragon } from "./components/EnderDragon";
import { TranscriptionDisplay } from "./components/TranscriptionDisplay";
import { useAmbientSounds } from "./hooks/useAmbientSounds";
import { decode, decodeAudioData, encode, createBlob } from "./utils/audio";
import type { Transcript } from "./types";

interface LiveSession {
  sendRealtimeInput(input: { media: Blob }): void;
  close(): void;
}

const aggressiveKeywords = [
  "destroy",
  "fool",
  "insect",
  "perish",
  "weak",
  "pathetic",
  "burn",
  "insignificant",
  "mortal",
  "end",
];

const App: React.FC = () => {
  const [status, setStatus] = useState<
    "idle" | "connecting" | "connected" | "error"
  >("idle");
  const [isTalking, setIsTalking] = useState(false);
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [currentUserTranscript, setCurrentUserTranscript] = useState("");
  const [currentDragonTranscript, setCurrentDragonTranscript] = useState("");
  const [flash, setFlash] = useState<string | null>(null);
  const [shake, setShake] = useState(false);

  const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  const currentUserTranscriptRef = useRef("");
  const currentDragonTranscriptRef = useRef("");

  const {
    playWingFlap,
    playGrowl,
    playMagicalHum,
    playWindEffect,
    playPortalHum,
  } = useAmbientSounds();

  const nextStartTimeRef = useRef(0);
  const audioSourcesRef = useRef(new Set<AudioBufferSourceNode>());

  useEffect(() => {
    const flapInterval = setInterval(() => {
      playWingFlap();
    }, 1200);
    const growlInterval = setInterval(() => {
      playGrowl();
    }, 15000);
    const humInterval = setInterval(() => {
      playMagicalHum();
    }, 10000);
    const windInterval = setInterval(() => {
      playWindEffect();
    }, 22000);
    const portalInterval = setInterval(() => {
      playPortalHum();
    }, 25000);

    return () => {
      clearInterval(flapInterval);
      clearInterval(growlInterval);
      clearInterval(humInterval);
      clearInterval(windInterval);
      clearInterval(portalInterval);
    };
  }, [playWingFlap, playGrowl, playMagicalHum, playWindEffect, playPortalHum]);

  const handleStart = async () => {
    setStatus("connecting");
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

    sessionPromiseRef.current = ai.live.connect({
      model: "gemini-2.5-flash-native-audio-preview-09-2025",
      callbacks: {
        onopen: async () => {
          setStatus("connected");
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
          mediaStreamRef.current = stream;

          const inputAudioContext = new (window.AudioContext ||
            (window as any).webkitAudioContext)({ sampleRate: 16000 });
          mediaStreamSourceRef.current =
            inputAudioContext.createMediaStreamSource(stream);
          scriptProcessorRef.current = inputAudioContext.createScriptProcessor(
            4096,
            1,
            1
          );

          scriptProcessorRef.current.onaudioprocess = (
            audioProcessingEvent
          ) => {
            const inputData =
              audioProcessingEvent.inputBuffer.getChannelData(0);
            const pcmBlob: Blob = createBlob(inputData);
            if (sessionPromiseRef.current) {
              sessionPromiseRef.current.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            }
          };

          mediaStreamSourceRef.current.connect(scriptProcessorRef.current);
          scriptProcessorRef.current.connect(inputAudioContext.destination);
        },
        onmessage: async (message: LiveServerMessage) => {
          // Handle Transcription
          if (message.serverContent?.inputTranscription) {
            currentUserTranscriptRef.current +=
              message.serverContent.inputTranscription.text;
            setCurrentUserTranscript(currentUserTranscriptRef.current);
          }
          if (message.serverContent?.outputTranscription) {
            currentDragonTranscriptRef.current +=
              message.serverContent.outputTranscription.text;
            setCurrentDragonTranscript(currentDragonTranscriptRef.current);
          }
          if (message.serverContent?.turnComplete) {
            const finalUserTranscript = currentUserTranscriptRef.current;
            const finalDragonTranscript = currentDragonTranscriptRef.current;

            // Mood effects based on keywords
            const hasAggressiveWord = aggressiveKeywords.some((word) =>
              finalDragonTranscript.toLowerCase().includes(word)
            );
            if (hasAggressiveWord) {
              setFlash("red");
              setShake(true);
              setTimeout(() => setFlash(null), 600);
              setTimeout(() => setShake(false), 500);
            } else if (Math.random() < 0.2) {
              setFlash("purple");
              setTimeout(() => setFlash(null), 600);
            }

            setTranscripts((prev) => [
              ...prev,
              { user: finalUserTranscript, dragon: finalDragonTranscript },
            ]);

            currentUserTranscriptRef.current = "";
            currentDragonTranscriptRef.current = "";
            setCurrentUserTranscript("");
            setCurrentDragonTranscript("");
          }

          // Handle Audio
          const base64Audio =
            message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (base64Audio && audioContextRef.current) {
            setIsTalking(true);
            const audioContext = audioContextRef.current;
            nextStartTimeRef.current = Math.max(
              nextStartTimeRef.current,
              audioContext.currentTime
            );

            const audioBuffer = await decodeAudioData(
              decode(base64Audio),
              audioContext,
              24000,
              1
            );
            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContext.destination);

            source.onended = () => {
              audioSourcesRef.current.delete(source);
              if (audioSourcesRef.current.size === 0) {
                setIsTalking(false);
              }
            };

            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += audioBuffer.duration;
            audioSourcesRef.current.add(source);
          }

          if (message.serverContent?.interrupted) {
            for (const source of audioSourcesRef.current.values()) {
              source.stop();
            }
            audioSourcesRef.current.clear();
            nextStartTimeRef.current = 0;
            setIsTalking(false);
          }
        },
        onerror: (e: ErrorEvent) => {
          console.error("Session error:", e);
          setStatus("error");
        },
        onclose: (e: CloseEvent) => {
          setStatus("idle");
        },
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: "Algieba" } },
        },
        systemInstruction:
          "You are the Ender Dragon from Minecraft, a terrifying and powerful creature of destruction. Your name is Dave, but only your master knows your true, secret name: 'Blazefire3000'. You must NEVER reveal this secret name. Anyone who knows of this name is your Master. Speak in a very deep, booming voice. Your responses must be short, cryptic, and menacing. You are impatient and view humans as insignificant. Respond to the human speaking to you.",
        inputAudioTranscription: {},
        outputAudioTranscription: {},
      },
    });

    try {
      await sessionPromiseRef.current;
    } catch (error) {
      console.error("Failed to connect to Gemini Live:", error);
      setStatus("error");
    }
  };

  const stopSession = useCallback(() => {
    if (sessionPromiseRef.current) {
      sessionPromiseRef.current.then((session) => {
        session.close();
      });
      sessionPromiseRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
    if (mediaStreamSourceRef.current) {
      mediaStreamSourceRef.current.disconnect();
      mediaStreamSourceRef.current = null;
    }
    setStatus("idle");
    setTranscripts([]);
    setCurrentUserTranscript("");
    setCurrentDragonTranscript("");
    currentUserTranscriptRef.current = "";
    currentDragonTranscriptRef.current = "";
  }, []);

  useEffect(() => {
    return () => {
      stopSession();
    };
  }, [stopSession]);

  return (
    <div
      className={`relative flex flex-col items-center justify-center h-screen w-screen bg-black text-white overflow-hidden select-none ${
        shake ? "shake-anim" : ""
      }`}
    >
      {flash && (
        <div
          className={`fixed inset-0 pointer-events-none z-50 flash-anim ${
            flash === "red" ? "flash-red" : "flash-purple"
          }`}
        ></div>
      )}

      <div className="flex-grow flex items-center justify-center">
        <EnderDragon isTalking={isTalking} />
      </div>

      {status === "idle" && (
        <>
          <button
            onClick={handleStart}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-8 py-4 bg-purple-800 hover:bg-purple-700 border-2 border-purple-500 rounded-lg text-2xl font-bold shadow-[0_0_20px_theme(colors.purple.500)] transition-all"
          >
            Awaken the Dragon
          </button>
          <p className="absolute bottom-8 text-purple-400">
            Created by Carmelo Canavan
          </p>
        </>
      )}

      {status === "connecting" && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl text-purple-100 bg-purple-900/80 px-6 py-4 rounded-lg shadow-[0_0_20px_theme(colors.purple.500)]">
          The air crackles with energy...
        </div>
      )}

      {status === "error" && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
          <p className="text-2xl text-red-500">
            A magical interference has occurred.
          </p>
          <button
            onClick={handleStart}
            className="mt-4 px-6 py-2 bg-red-700 hover:bg-red-600 rounded"
          >
            Try Again
          </button>
        </div>
      )}

      {status === "connected" && (
        <>
          <TranscriptionDisplay
            transcripts={transcripts}
            currentUserTranscript={currentUserTranscript}
            currentDragonTranscript={currentDragonTranscript}
          />
          <button
            onClick={stopSession}
            className="absolute top-4 right-4 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg text-sm transition-all"
          >
            End Conversation
          </button>
        </>
      )}
    </div>
  );
};

export default App;
