"use client";

import { useState } from "react";
import type { ComponentType } from "react";
import { ArrowRight, Briefcase, Building2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { ExaminerTable } from "@/components/examiner-table";
import { SearchForm } from "@/components/search-form";
import { Badge } from "@/components/ui/badge";
import { searchExaminers } from "@/lib/api";
import type { SearchResponse, ThesisSearchRequest } from "@/types";

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [searchResponse, setSearchResponse] = useState<SearchResponse | null>(null);
  const [lastRequest, setLastRequest] = useState<ThesisSearchRequest | null>(null);

  const handleSearch = async (request: ThesisSearchRequest) => {
    setIsLoading(true);
    try {
      const response = await searchExaminers(request);
      setSearchResponse(response);
      setLastRequest(request);
      toast.success(`Found ${response.total_found} examiner matches.`);
    } catch (error) {
      console.error(error);
      toast.error("Search failed. Please check the API connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="pb-16">
      <section className="border-b bg-gradient-to-b from-primary/[0.08] via-background to-background">
        <div className="container py-16">
          <div className="max-w-4xl space-y-6">
            <Badge variant="secondary" className="rounded-full px-4 py-1 text-sm">
              Built for postgraduate coordination teams
            </Badge>
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Examiner Finder SA
              </h1>
              <p className="max-w-3xl text-lg text-muted-foreground">
                Identify suitable thesis examiners from South African universities using research-fit scoring,
                academic impact signals, and conflict screening.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <HeroStat
                icon={Building2}
                title="Institutional coverage"
                copy="Review experts across universities and departments."
              />
              <HeroStat
                icon={Sparkles}
                title="Fit-based ranking"
                copy="Topic similarity is blended with citation and career metrics."
              />
              <HeroStat
                icon={Briefcase}
                title="Conflict awareness"
                copy="Supervisor and institutional inputs surface possible risks early."
              />
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border bg-background px-4 py-2 text-sm text-muted-foreground shadow-sm">
              Enter thesis details below
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </section>

      <section className="container space-y-8 py-10">
        <SearchForm isLoading={isLoading} onSubmit={handleSearch} />
        <ExaminerTable
          examiners={searchResponse?.examiners || []}
          request={lastRequest}
          thesisTitle={searchResponse?.thesis_title}
          extractedKeywords={searchResponse?.extracted_keywords}
          researchDomains={searchResponse?.research_domains}
        />
      </section>
    </main>
  );
}

function HeroStat({
  icon: Icon,
  title,
  copy,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  copy: string;
}) {
  return (
    <div className="rounded-2xl border bg-background/80 p-4 shadow-sm backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-primary/10 p-2 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="font-semibold">{title}</p>
          <p className="text-sm text-muted-foreground">{copy}</p>
        </div>
      </div>
    </div>
  );
}
