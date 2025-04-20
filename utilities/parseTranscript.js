// utils/parseTranscript.js
export function parseTranscript(transcript) {
  const lines = transcript.split("\n").filter(Boolean);
  const result = [];

  lines.forEach((line) => {
    if (line.startsWith("bot:")) {
      result.push({ message: line.replace("bot:", "").trim(), sender: "bot" });
    } else if (line.startsWith("human:")) {
      result.push({
        message: line.replace("human:", "").trim(),
        sender: "human",
      });
    }
  });

  return result;
}
