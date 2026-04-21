"use client";

import { useStreaming } from "@/lib/hooks/use-streaming";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  RefreshCw,
  Sparkles,
  AlertCircle,
  TrendingUp,
  Target,
  AlertTriangle,
  Zap,
  Shield,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

const SECTION_TITLES = [
  "Territory Overview",
  "Top Opportunities",
  "At-Risk Accounts",
  "Recommended Actions",
  "Competitive Landscape",
];

const sectionConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  "Territory Overview": {
    icon: <TrendingUp className="w-4 h-4" />,
    color: "text-amber",
  },
  "Top Opportunities": {
    icon: <Target className="w-4 h-4" />,
    color: "text-green-600",
  },
  "At-Risk Accounts": {
    icon: <AlertTriangle className="w-4 h-4" />,
    color: "text-danger",
  },
  "Recommended Actions": {
    icon: <Zap className="w-4 h-4" />,
    color: "text-blue-600",
  },
  "Competitive Landscape": {
    icon: <Shield className="w-4 h-4" />,
    color: "text-purple-600",
  },
};

function parseSections(content: string): { title: string; content: string }[] {
  const sections: { title: string; content: string }[] = [];
  const lines = content.split("\n");
  let currentTitle = "";
  let currentContent: string[] = [];

  for (const line of lines) {
    const heading = SECTION_TITLES.find((t) => line.trim() === `## ${t}`);
    if (heading) {
      if (currentTitle && currentContent.length > 0) {
        sections.push({ title: currentTitle, content: currentContent.join("\n").trim() });
      }
      currentTitle = heading;
      currentContent = [];
    } else if (currentTitle) {
      currentContent.push(line);
    }
  }

  if (currentTitle && currentContent.length > 0) {
    sections.push({ title: currentTitle, content: currentContent.join("\n").trim() });
  }

  return sections;
}

function DigestSection({
  title,
  content,
  defaultOpen = true,
}: {
  title: string;
  content: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const config = sectionConfig[title] ?? { icon: <Sparkles className="w-4 h-4" />, color: "text-muted" };

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

function DigestSkeleton() {
  return (
    <div className="space-y-3">
      {SECTION_TITLES.map((title) => (
        <div key={title} className="border border-border rounded-lg p-4 bg-white">
          <Skeleton className="h-5 w-44 mb-3" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="h-3 w-4/6" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function TerritoryDigest() {
  const { content, isLoading, error, generate } = useStreaming("/api/ai/territory");
  const sections = parseSections(content);
  const hasContent = content.length > 0;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber" />
          <span className="text-sm font-medium text-navy">AI Territory Digest</span>
          {isLoading && (
            <span className="text-xs text-muted animate-pulse">Generating...</span>
          )}
        </div>
        <div className="flex gap-2">
          {hasContent && !isLoading && (
            <Button variant="ghost" size="sm" onClick={() => generate({})} className="gap-1.5 text-xs">
              <RefreshCw className="w-3 h-3" />
              Refresh
            </Button>
          )}
          {!hasContent && !isLoading && (
            <Button variant="primary" size="sm" onClick={() => generate({})} className="gap-1.5">
              <Sparkles className="w-3 h-3" />
              Generate Digest
            </Button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
          <AlertCircle className="w-4 h-4 text-danger flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-danger">Failed to generate digest</p>
            <p className="text-xs text-red-600 mt-1">{error}</p>
            <Button variant="outline" size="sm" onClick={() => generate({})} className="mt-2 text-xs">
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && !hasContent && <DigestSkeleton />}

      {/* Streaming sections */}
      {hasContent && (
        <div className="space-y-3">
          {sections.map((section, i) => (
            <DigestSection
              key={section.title}
              title={section.title}
              content={section.content}
              defaultOpen={i < 3}
            />
          ))}
          {isLoading && sections.length > 0 && (
            <div className="text-xs text-muted flex items-center gap-1 px-1">
              <span className="streaming-cursor" />
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!hasContent && !isLoading && !error && (
        <div className="text-center py-10 border-2 border-dashed border-border rounded-lg">
          <Sparkles className="w-8 h-8 text-muted mx-auto mb-3" />
          <h3 className="text-sm font-medium text-navy mb-1">No digest generated yet</h3>
          <p className="text-xs text-muted mb-4 max-w-xs mx-auto">
            Generate a territory-wide digest that surfaces opportunities, at-risk accounts, and
            this week&apos;s recommended actions.
          </p>
          <Button variant="primary" onClick={() => generate({})} className="gap-2">
            <Sparkles className="w-4 h-4" />
            Generate Digest
          </Button>
        </div>
      )}

      {hasContent && !isLoading && (
        <p className="text-xs text-muted mt-4 px-1">
          Generated from live territory data · {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </p>
      )}
    </div>
  );
}
