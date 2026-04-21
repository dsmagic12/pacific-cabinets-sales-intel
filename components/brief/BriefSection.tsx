"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChevronDown, ChevronUp, Zap, MessageSquare, Clock, Package, AlertTriangle, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface BriefSectionProps {
  title: string;
  content: string;
  defaultOpen?: boolean;
}

const sectionConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  "Executive Summary": {
    icon: <Zap className="w-4 h-4" />,
    color: "text-amber",
  },
  "Key Talking Points": {
    icon: <MessageSquare className="w-4 h-4" />,
    color: "text-blue-600",
  },
  "Recent Activity": {
    icon: <Clock className="w-4 h-4" />,
    color: "text-purple-600",
  },
  "Products to Mention": {
    icon: <Package className="w-4 h-4" />,
    color: "text-green-600",
  },
  "Risk Flags": {
    icon: <AlertTriangle className="w-4 h-4" />,
    color: "text-danger",
  },
  "Questions to Ask": {
    icon: <HelpCircle className="w-4 h-4" />,
    color: "text-navy",
  },
};

export default function BriefSection({ title, content, defaultOpen = true }: BriefSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const config = sectionConfig[title] ?? {
    icon: <Zap className="w-4 h-4" />,
    color: "text-muted",
  };

  return (
    <div className="border border-border rounded-lg bg-white overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-cream transition-colors"
      >
        <div className={cn("flex items-center gap-2 font-semibold text-sm", config.color)}>
          {config.icon}
          {title}
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-muted" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted" />
        )}
      </button>

      {open && (
        <div className="px-4 pb-4 prose prose-sm max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ children }) => (
                <p className="text-sm text-navy leading-relaxed mb-2">{children}</p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc pl-4 space-y-1 mb-2">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal pl-4 space-y-1 mb-2">{children}</ol>
              ),
              li: ({ children }) => (
                <li className="text-sm text-navy leading-relaxed">{children}</li>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-navy">{children}</strong>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}
