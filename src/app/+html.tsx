import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      </head>
      <body>
        <div id="splash-loader" dangerouslySetInnerHTML={{ __html: SPLASH_HTML }} />
        {children}
      </body>
    </html>
  );
}

const SPLASH_HTML = `
  <svg width="46" height="40" viewBox="0 0 39 34" fill="none" xmlns="http://www.w3.org/2000/svg" class="splash-logo">
    <defs>
      <linearGradient id="splashGrad" x1="0" y1="17" x2="39" y2="17" gradientUnits="userSpaceOnUse">
        <stop offset="0.35" stop-color="#00FF7A"/>
        <stop offset="0.62" stop-color="#2CE261"/>
        <stop offset="0.83" stop-color="#48CF50"/>
        <stop offset="0.95" stop-color="#53C94B"/>
      </linearGradient>
    </defs>
    <path d="M20.389 0C20.389 0 20.5718 0.151186 20.6383 0.167984C21.5688 0.487154 22.3664 1.12549 22.7652 2.06621L25.1747 7.74407C27.1023 12.2964 29.3455 16.5968 32.2868 20.5949L32.7022 21.166L38.0528 27.8518C38.7175 28.6917 39.1496 29.7164 38.9668 30.7915C38.6344 32.7233 36.9893 34.2352 34.9787 33.9664L27.069 32.9249C22.0673 32.2698 17.1321 32.2362 12.1304 32.8913L3.97145 33.9664C2.27652 34.1848 0.797614 33.1097 0.21602 31.5642C0.149553 31.3962 0.0830848 31.2619 0 31.1611V29.3972L0.564977 28.2885L6.16489 21.2668C8.84022 17.9071 11.0004 14.2451 12.6954 10.2806L16.2846 1.88142C16.6502 1.0415 17.83 0.335968 18.5611 0H20.4056H20.389Z" fill="url(#splashGrad)"/>
  </svg>
  <div class="splash-bar-track">
    <div class="splash-bar-fill"></div>
  </div>
`;

const STYLES = `
html, body, #root {
  background-color: #09090b;
  margin: 0;
  padding: 0;
  height: 100%;
}

/* Custom scrollbar — WebKit (Chrome, Safari, Edge) */
::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background-color: rgba(0, 255, 132, 0.22);
  border-radius: 8px;
  border: 2px solid transparent;
  background-clip: padding-box;
}

::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 255, 132, 0.45);
  background-clip: padding-box;
}

::-webkit-scrollbar-corner {
  background: transparent;
}

/* Custom scrollbar — Firefox */
* {
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 255, 132, 0.28) transparent;
}

#splash-loader {
  position: fixed;
  inset: 0;
  z-index: 99999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 32px;
  background-color: #09090b;
  transition: opacity 0.4s ease-out;
}

#splash-loader.hidden {
  opacity: 0;
  pointer-events: none;
}

.splash-logo {
  animation: pulse 1.8s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.08); }
}

.splash-bar-track {
  width: 120px;
  height: 3px;
  border-radius: 3px;
  background-color: rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.splash-bar-fill {
  width: 40%;
  height: 100%;
  border-radius: 3px;
  background: linear-gradient(90deg, #00FF7A, #53C94B);
  animation: slide 1.2s ease-in-out infinite;
}

@keyframes slide {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(350%); }
}
`;
