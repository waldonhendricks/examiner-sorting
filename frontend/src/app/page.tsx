"use client";

import { useState } from "react";
import { GraduationCap, BookOpen, Search } from "lucide-react";
import { SearchForm } from "@/src/components/search-form";
import { ExaminerTable } from "@/src/components/examiner-table";
import { SearchResponse, ThesisSearchRequest } from "@/src/types";
import { searchExaminers } from "@/src/lib/api";
import { toast } from "sonner";
import { Separator } from "@/src/components/ui/separator";

export default function HomePage() {
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [searchRequest, setSearchRequest] = useState<ThesisSearchRequest | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSearch(request: ThesisSearchRequest) {
    setIsLoading(true);
    try {
      const data = await searchExaminers(request);
      setResults(data);
      setSearchRequest(request);
      if (data.total_found === 0) {
        toast.info("No examiners found. Try broadening your search terms.");
      } else {
        toast.success(
          `Found ${data.total_found} potential examiner${data.total_found !== 1 ? "s" : ""}`
        );
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to search examiners. Is the API running?";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">Examiner Finder SA</h1>
              <p className="text-xs text-muted-foreground leading-tight hidden sm:block">
                Thesis Examiner Discovery for South African Universities
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BookOpen className="h-4 w-4" />
            <span className="hidden md:inline">15 SA Universities</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* How it works banner (shown when no results) */}
        {!results && !isLoading && (
          <div className="mb-6 rounded-lg border bg-white/60 p-4 backdrop-blur-sm">
            <h2 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Search className="h-4 w-4 text-primary" />
              How It Works
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs text-muted-foreground">
              {[
                {
                  step: "1",
                  title: "Enter thesis details",
                  desc: "Provide title, abstract, degree type and optional keywords",
                },
                {
                  step: "2",
                  title: "AI analysis",
                  desc: "Semantic embeddings extract research topics and domains",
                },
                {
                  step: "3",
                  title: "API discovery",
                  desc: "Searches OpenAlex, Crossref & ORCID for SA researchers",
                },
                {
                  step: "4",
                  title: "Ranked results",
                  desc: "Weighted scoring + conflict detection → ranked examiner list",
                },
              ].map(({ step, title, desc }) => (
                <div key={step} className="flex gap-2.5">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                    {step}
                  </span>
                  <div>
                    <div className="font-medium text-foreground">{title}</div>
                    <div>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6">
          {/* Search Form */}
          <div className="lg:sticky lg:top-20 lg:self-start">
            <SearchForm onSearch={handleSearch} isLoading={isLoading} />
          </div>

          {/* Results */}
          <div>
            {results && searchRequest ? (
              <ExaminerTable results={results} searchRequest={searchRequest} />
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-white/40 h-64 text-center gap-3 text-muted-foreground">
                <GraduationCap className="h-10 w-10 opacity-30" />
                <div>
                  <p className="font-medium">No search results yet</p>
                  <p className="text-sm">
                    Fill in the form and click &ldquo;Find Examiners&rdquo; to get started
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t bg-white/60 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 text-center text-xs text-muted-foreground">
          <p>
            Examiner Finder SA · Powered by{" "}
            <a
              href="https://openalex.org"
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              OpenAlex
            </a>
            ,{" "}
            <a
              href="https://www.crossref.org"
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              Crossref
            </a>{" "}
            &amp;{" "}
            <a
              href="https://orcid.org"
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              ORCID
            </a>
          </p>
          <Separator className="my-2" />
          <p>For use by postgraduate coordinators at South African universities</p>
        </div>
      </footer>
    </div>
  );
}
