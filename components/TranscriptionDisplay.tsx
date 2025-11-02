import React, { useEffect, useRef } from "react";
import type { Transcript } from "../types";

interface TranscriptionDisplayProps {
  transcripts: Transcript[];
  currentUserTranscript: string;
  currentDragonTranscript: string;
}

export const TranscriptionDisplay: React.FC<TranscriptionDisplayProps> = ({
  transcripts,
  currentUserTranscript,
  currentDragonTranscript,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcripts, currentUserTranscript, currentDragonTranscript]);

  return (
    <div className="fixed bottom-0 left-0 right-0 h-1/4 bg-black/70 backdrop-blur-sm p-4 text-lg">
      <div ref={scrollRef} className="h-full w-full overflow-y-auto">
        <div className="flex flex-col gap-2">
          {transcripts.map((t, i) => (
            <React.Fragment key={i}>
              <div>
                <span className="font-bold text-cyan-300">Human: </span>
                <span>{t.user}</span>
              </div>
              <div>
                <span className="font-bold text-fuchsia-400">Dragon: </span>
                <span>{t.dragon}</span>
              </div>
            </React.Fragment>
          ))}
          {currentUserTranscript && (
            <div>
              <span className="font-bold text-cyan-300">Human: </span>
              <span className="text-gray-400">{currentUserTranscript}</span>
            </div>
          )}
          {currentDragonTranscript && (
            <div>
              <span className="font-bold text-fuchsia-400">Dragon: </span>
              <span className="text-gray-400">{currentDragonTranscript}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
