"use client";

import { useEffect } from "react";
import { useStreaming } from "@/lib/hooks/use-streaming";
import BriefSection from "./BriefSection";
import BriefSkeleton from "./BriefSkeleton";
import { Button } from "@/components/ui/button";
import { RefreshCw, Sparkles, AlertCircle } from "lucide-react";

interface BriefPanelProps {
  customerId: string;
}

const SECTION_TITLES = [
  "Executive Summary",
  "Key Talking Points",
  "Recent Activity",
  "Products to Mention",
  "Risk Flags",
  "Questions to Ask",
];

function parseSections(content: string): { title: string; content: string }[] {
  const sections: { title: string; content: string }[] = [];
  const lines = content.split("\n");
  let currentTitle = "";
  let currentContent: string[] = [];

  for (const line of lines) {
    const heading = SECTION_TITLES.find((t) => line.trim() === `## ${t}`);
    if (heading) {
      if (currentTitle && currentContent.length > 0) {
        sections.push({
          title: currentTitle,
          content: currentContent.join("\n").trim(),
        });
      }
      currentTitle = heading;
      currentContent = [];
    } else if (currentTitle) {
      currentContent.push(line);
    }
  }

  if (currentTitle && currentContent.length > 0) {
    sections.push({
      title: currentTitle,
      content: currentContent.join("\n").trim(),
    });
  }

  return sections;
}

export default function BriefPanel({ customerId }: BriefPanelProps) {
  const { content, isLoading, error, generate } = useStreaming("/api/ai/brief");

  const handleGenerate = () => {
    generate({ customerId });
  };

  const sections = parseSections(content);
  const hasContent = content.length > 0;

  return (
    <div>
      {/* Header bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber" />
          <span className="text-sm font-medium text-navy">AI Pre-Call Brief</span>
          {isLoading && (
            <span className="text-xs text-muted animate-pulse">Generating...</span>
          )}
        </div>
        <div className="flex gap-2">
          {hasContent && !isLoading && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleGenerate}
              className="gap-1.5 text-xs"
            >
              <RefreshCw className="w-3 h-3" />
              Regenerate
            </Button>
          )}
          {!hasContent && !isLoading && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleGenerate}
              className="gap-1.5"
            >
              <Sparkles className="w-3 h-3" />
              Generate Brief
            </Button>
          )}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
          <AlertCircle className="w-4 h-4 text-danger flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-danger">Failed to generate brief</p>
            <p className="text-xs text-red-600 mt-1">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerate}
              className="mt-2 text-xs"
            >
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && !hasContent && <BriefSkeleton />}

      {/* Streaming content — render sections as they become available */}
      {hasContent && (
        <div className="space-y-3">
          {sections.map((section, i) => (
            <BriefSection
              key={section.title}
              title={section.title}
              content={
                section.content +
                (isLoading && i === sections.length - 1 ? "" : "")
              }
              defaultOpen={i < 3}
            />
          ))}
          {/* Show streaming cursor for in-progress last section */}
          {isLoading && sections.length > 0 && (
            <div className="text-xs text-muted flex items-center gap-1 px-1">
              <span className="streaming-cursor"></span>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!hasContent && !isLoading && !error && (
        <div className="text-center py-10 border-2 border-dashed border-border rounded-lg">
          <Sparkles className="w-8 h-8 text-muted mx-auto mb-3" />
          <h3 className="text-sm font-medium text-navy mb-1">No brief generated yet</h3>
          <p className="text-xs text-muted mb-4 max-w-xs mx-auto">
            Generate a personalized pre-call brief that pulls together this customer&apos;s history,
            preferences, and talking points.
          </p>
          <Button variant="primary" onClick={handleGenerate} className="gap-2">
            <Sparkles className="w-4 h-4" />
            Generate Brief
          </Button>
        </div>
      )}

      {/* Source attribution */}
      {hasContent && !isLoading && (
        <p className="text-xs text-muted mt-4 px-1">
          This brief was generated from this customer&apos;s order history, project data, and CRM notes.
          Always verify before the call.
        </p>
      )}
    </div>
  );
}
