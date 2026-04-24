const STYLE_ID = "alter-ceo-web-styles";

const CSS = `
::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background-color: rgba(0, 255, 132, 0.28);
  border-radius: 8px;
  border: 2px solid transparent;
  background-clip: padding-box;
}
::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 255, 132, 0.5);
  background-clip: padding-box;
}
::-webkit-scrollbar-corner {
  background: transparent;
}
* {
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 255, 132, 0.32) transparent;
}
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus,
input:-webkit-autofill:active {
  -webkit-box-shadow: 0 0 0 1000px transparent inset !important;
  -webkit-text-fill-color: #ffffff !important;
  caret-color: #ffffff !important;
  transition: background-color 9999s ease-in-out 0s;
}
`;

export function injectWebStyles(): void {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = CSS;
  document.head.appendChild(style);
}
