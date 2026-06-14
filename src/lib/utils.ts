import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function hasSuspiciousWords(text: string): boolean {
  if (!text) return false;
  const SUSPICIOUS_WORDS = [
    "extra", "adicional", "agregame", "agrega", "ponle", "doble", "mas", "con"
  ];
  const normalized = text.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Normalize accents

  return SUSPICIOUS_WORDS.some((word) => {
    const regex = new RegExp(`\\b${word}\\b|\\b${word}s\\b`, "i");
    if (word === "agregame" || word === "agrega" || word === "adicional" || word === "extra" || word === "ponle") {
      return normalized.includes(word);
    }
    return regex.test(normalized);
  });
}

export function wrapText(text: string, maxLen: number = 28): string {
  if (!text) return "";
  
  return text.split(/\r?\n/).map(line => {
    const words = line.split(" ");
    const wrappedLines: string[] = [];
    let currentLine = "";

    for (const word of words) {
      if (!word) continue;
      
      if (currentLine === "") {
        currentLine = word;
      } else if (currentLine.length + 1 + word.length <= maxLen) {
        currentLine += " " + word;
      } else {
        wrappedLines.push(currentLine);
        currentLine = word;
      }
    }

    if (currentLine !== "") {
      wrappedLines.push(currentLine);
    }

    return wrappedLines.join("\n");
  }).join("\n");
}
