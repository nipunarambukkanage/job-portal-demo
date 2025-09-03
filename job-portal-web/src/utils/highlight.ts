import { getHighlighter } from "shiki";

let highlighterPromise: Promise<any> | null = null;
export async function highlight(code: string, lang: string) {
  if (!highlighterPromise) {
    highlighterPromise = getHighlighter({ themes: ["github-light"] });
  }
  const highlighter = await highlighterPromise;
  try {
    // try to load missing languages on the fly:
    await (highlighter as any).loadLanguage(lang);
  } catch {}
  return highlighter.codeToHtml(code, { lang, theme: "github-light" });
}
