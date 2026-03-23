import { useState } from "react";
import { AudioRecorderView } from "@/components/onboarding/audio-recorder-view";

export default function AudioQuestionScreen() {
  const [key, setKey] = useState(0);
  const [autoStart, setAutoStart] = useState(false);

  function handleRestart(shouldAutoStart = true): void {
    setAutoStart(shouldAutoStart);
    setKey((k) => k + 1);
  }

  return (
    <AudioRecorderView
      key={key}
      autoStart={autoStart}
      onRestart={handleRestart}
      onNextAudio={() => handleRestart(false)}
    />
  );
}
