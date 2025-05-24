import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { CircularProgress } from "@mui/material";
import Link from "next/link";

const KnowledgeBaseList = ({ kbList, onDelete, onAddKnowledge, isLoading }) => {
  return (
    <div className="">
      <div className="flex flex-row justify-between mb-2">
        <h2
          className=" mb-4"
          style={{ fontSize: 16, fontWeight: "600", color: "#000" }}
        >
          My Knowledge Base
        </h2>
        <button
          className=" outline-none"
          style={{
            backgroundColor: "#7902DF",
            color: "white",
            height: "40px",
            borderRadius: "20px",
            // width: "100%",
            paddingLeft: 20,
            paddingRight: 20,
            fontWeight: 600,
            fontSize: "20",
          }}
          onClick={onAddKnowledge}
        >
          Add knowledge
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {kbList.map((kb, index) => (
          <KBCard key={index} kb={kb} onDelete={() => onDelete(kb)} />
        ))}
      </div>
    </div>
  );
};

const KBCard = ({ kb, onDelete, isLoading }) => {
  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white relative ">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-500">{kb.type}</span>
        {!isLoading === kb.id ? (
          <CircularProgress size={25} />
        ) : (
          <button
            onClick={onDelete}
            className="text-gray-400 hover:text-red-500"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>

      {kb.type === "Document" && <DocumentCard kb={kb} />}
      {kb.type === "Url" && <UrlCard kb={kb} />}
      {kb.type === "Youtube" && <YoutubeCard kb={kb} />}
      {kb.type === "Text" && <TextCard kb={kb} />}
    </div>
  );
};

const DocumentCard = ({ kb }) => {
  return (
    <div>
      <a
        href={kb.documentUrl.trim()}
        target="_blank"
        className="text-purple font-medium "
      >
        {kb.title.trim()}
      </a>
      {/* {kb.uploading && <Progress value={kb.progress} className="mt-2" />} */}
    </div>
  );
};

const UrlCard = ({ kb }) => {
  return (
    <a
      href={kb.webUrl.trim()}
      target="_blank"
      className="text-purple underline"
    >
      {kb.webUrl.trim()}
    </a>
  );
};

const YoutubeCard = ({ kb }) => {
  return (
    <a
      style={{
        flexWrap: "wrap",
        width: "100%",
        wordBreak: "break-word",
        overflowWrap: "break-word",
        whiteSpace: "normal",
      }}
    >
      {kb.webUrl.trim()}
    </a>
  );
};

const TextCard = ({ kb }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <div>
      <h3 className="font-semibold">{kb.title}</h3>
      <p className="text-gray-600">
        {expanded
          ? kb.originalContent.trim()
          : kb.originalContent.trim().substring(0, 100) + "..."}
      </p>
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-purple-600 mt-2"
      >
        {expanded ? "Show Less" : "Show More"}
      </button>
    </div>
  );
};

export default KnowledgeBaseList;
