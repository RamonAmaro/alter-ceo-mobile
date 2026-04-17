export const NO_WEBSITE_ANSWER = "__no_website__";
export const NO_INSTAGRAM_ANSWER = "__no_instagram__";

export function isWebsiteUnavailableAnswer(value: unknown): boolean {
  return value === NO_WEBSITE_ANSWER;
}

export function isInstagramUnavailableAnswer(value: unknown): boolean {
  return value === NO_INSTAGRAM_ANSWER;
}
