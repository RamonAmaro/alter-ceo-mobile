import { Path, Rect } from "react-native-svg";

export const MicIcon = (
  <>
    <Path
      d="M69.57 47.65h-.02c-4.75 0-8.6 3.83-8.6 8.56v13.88c0 4.73 3.85 8.56 8.6 8.56h.02c4.75 0 8.6-3.83 8.6-8.56V56.21c0-4.73-3.85-8.56-8.6-8.56Z"
      fill="white"
    />
    <Path
      d="M81.76 66.5c-.77 0-1.39.61-1.39 1.38v2.2c0 5.93-4.86 10.78-10.84 10.78-5.98 0-10.84-4.83-10.84-10.78v-2.2c0-.77-.62-1.38-1.39-1.38-.77 0-1.39.61-1.39 1.38v2.2c0 7 5.37 12.78 12.21 13.46v5.36h-3.59c-.77 0-1.39.61-1.39 1.38v1.38h12.74v-1.38c0-.77-.62-1.38-1.39-1.38h-3.59v-5.36c6.84-.7 12.21-6.47 12.21-13.46v-2.2c0-.77-.62-1.38-1.39-1.38h.04Z"
      fill="white"
    />
  </>
);

export const PauseIcon = (
  <>
    <Rect x="55" y="50" width="10" height="40" rx="3" fill="white" />
    <Rect x="74" y="50" width="10" height="40" rx="3" fill="white" />
  </>
);

export const PlayIcon = (
  <Path d="M58 48 l30 22 l-30 22 Z" fill="white" />
);

export const StopIcon = (
  <Rect x="53" y="53" width="33" height="33" rx="4" fill="white" />
);

export const RestartIcon = (
  <Path
    d="M85 70a16 16 0 1 1-4.7-11.3l-4.3 4.3h12v-12l-4.2 4.2A20 20 0 1 0 89 70h-4Z"
    fill="white"
  />
);

export const CheckIcon = (
  <Path
    d="M52 70 l14 14 l28 -28"
    stroke="white"
    strokeWidth="7"
    strokeLinecap="round"
    strokeLinejoin="round"
    fill="none"
  />
);
