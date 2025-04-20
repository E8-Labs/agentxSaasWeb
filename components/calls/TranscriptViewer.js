// components/TranscriptBubble.js
// components/TranscriptBubble.js
// components/TranscriptBubble.js
import { ThumbUpOutlined, ThumbDownOutlined } from "@mui/icons-material";

export function TranscriptBubble({ message, sender }) {
  const isBot = sender === "bot";

  const bubbleClasses = isBot
    ? "rounded-br-2xl rounded-tr-2xl rounded-bl-2xl" // no top-left
    : "rounded-bl-2xl rounded-tl-2xl rounded-br-2xl"; // no top-right

  return (
    <div className={`flex ${isBot ? "justify-start" : "justify-end"} mb-2`}>
      <div>
        <div
          className={`max-w-xs px-4 py-2 shadow text-sm ${bubbleClasses} ${
            isBot ? "text-black" : "text-white"
          }`}
          style={{
            backgroundColor: isBot ? "#F6F7F9" : "#7902DF",
          }}
        >
          {message}
        </div>
        {isBot && (
          <div className="flex gap-2 mt-1 pl-2">
            <button className="text-gray-500 hover:text-black">
              <ThumbUpOutlined fontSize="small" />
            </button>
            <button className="text-gray-500 hover:text-black">
              <ThumbDownOutlined fontSize="small" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// components/TranscriptViewer.js
import { parseTranscript } from "@/utilities/parseTranscript";
// import TranscriptBubble from "./TranscriptBubble";

export function TranscriptViewer({ transcript }) {
  const messages = parseTranscript(transcript || "");

  return (
    <div className="p-4 space-y-1 overflow-y-auto max-h-[80vh] bg-white rounded-lg border">
      {messages.map((msg, index) => (
        <TranscriptBubble
          key={index}
          message={msg.message}
          sender={msg.sender}
        />
      ))}
    </div>
  );
}
