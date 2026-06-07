"use client";

import { useState } from "react";
import {
  FileDown,
  FileSpreadsheet,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  ExternalLink,
  BookOpen,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Progress } from "@/src/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Examiner, SearchResponse, ThesisSearchRequest } from "@/src/types";
import {
  formatScore,
  formatNumber,
  getScoreColor,
  getScoreBgColor,
  getSeverityColor,
  cn,
} from "@/src/lib/utils";
import { downloadPDFReport, downloadExcelReport, triggerDownload } from "@/src/lib/api";
import { toast } from "sonner";

interface ExaminerTableProps {
  results: SearchResponse;
  searchRequest: ThesisSearchRequest;
}

function ScoreBar({ value, className }: { value: number; className?: string }) {
  const color =
    value >= 75 ? "bg-green-500" : value >= 50 ? "bg-yellow-500" : "bg-red-400";
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
      <span className={cn("text-xs font-semibold w-10 text-right", getScoreColor(value))}>
        {formatScore(value)}
      </span>
    </div>
  );
}

function ExaminerRow({
  examiner,
  rank,
}: {
  examiner: Examiner;
  rank: number;
}) {
  const [expanded, setExpanded] = useState(false);

  const conflictCount = examiner.conflict_flags.length;
  const highConflicts = examiner.conflict_flags.filter((f) => f.severity === "high").length;

  return (
    <>
      <TableRow
        className="cursor-pointer hover:bg-muted/50"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Rank */}
        <TableCell className="font-bold text-center w-12">
          <span
            className={cn(
              "inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold",
              rank === 1
                ? "bg-yellow-100 text-yellow-800"
                : rank === 2
                ? "bg-gray-100 text-gray-700"
                : rank === 3
                ? "bg-orange-100 text-orange-700"
                : "bg-muted text-muted-foreground"
            )}
          >
            {rank}
          </span>
        </TableCell>

        {/* Name & University */}
        <TableCell>
          <div className="font-semibold text-sm">{examiner.name}</div>
          <div className="text-xs text-muted-foreground">{examiner.university}</div>
          {examiner.department && (
            <div className="text-xs text-muted-foreground italic">{examiner.department}</div>
          )}
        </TableCell>

        {/* Match Score */}
        <TableCell className="min-w-[140px]">
          <ScoreBar value={examiner.final_score} />
          <div className="text-xs text-muted-foreground mt-1">
            Similarity: {formatScore(examiner.similarity_score)}
          </div>
        </TableCell>

        {/* Metrics */}
        <TableCell className="text-center">
          <span className="font-semibold">{examiner.h_index}</span>
        </TableCell>
        <TableCell className="text-center text-sm">
          {formatNumber(examiner.citation_count)}
        </TableCell>
        <TableCell className="text-center text-sm">
          {examiner.recent_publication_count}
        </TableCell>

        {/* Academic Rank */}
        <TableCell className="text-sm text-muted-foreground hidden lg:table-cell">
          {examiner.academic_rank || "—"}
        </TableCell>

        {/* Conflicts */}
        <TableCell>
          {conflictCount === 0 ? (
            <span className="text-xs text-green-600 font-medium">None</span>
          ) : (
            <span
              className={cn(
                "inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full",
                highConflicts > 0
                  ? "bg-red-100 text-red-700"
                  : "bg-yellow-100 text-yellow-700"
              )}
            >
              <AlertTriangle className="h-3 w-3" />
              {conflictCount} flag{conflictCount !== 1 ? "s" : ""}
            </span>
          )}
        </TableCell>

        {/* Expand */}
        <TableCell className="w-8">
          {expanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </TableCell>
      </TableRow>

      {/* Expanded Details */}
      {expanded && (
        <TableRow>
          <TableCell colSpan={9} className="bg-muted/30 p-0">
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Score Breakdown */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Score Breakdown</h4>
                  <div className="space-y-1.5">
                    {[
                      { label: "Topic Similarity (40%)", value: examiner.score_breakdown.topic_similarity },
                      { label: "H-index (20%)", value: examiner.score_breakdown.h_index_score },
                      { label: "Citations (15%)", value: examiner.score_breakdown.citation_score },
                      { label: "Recent Pubs (15%)", value: examiner.score_breakdown.recent_pubs_score },
                      { label: "Academic Rank (10%)", value: examiner.score_breakdown.academic_rank_score },
                    ].map(({ label, value }) => (
                      <div key={label} className="space-y-0.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">{label}</span>
                          <span className={cn("font-medium", getScoreColor(value))}>
                            {formatScore(value)}
                          </span>
                        </div>
                        <Progress value={value} className="h-1.5" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Research Interests & Contact */}
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-semibold mb-1.5">Research Interests</h4>
                    <div className="flex flex-wrap gap-1">
                      {examiner.research_interests.slice(0, 8).map((interest) => (
                        <span
                          key={interest}
                          className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                  {(examiner.email || examiner.orcid || examiner.profile_url) && (
                    <div>
                      <h4 className="text-sm font-semibold mb-1">Contact</h4>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        {examiner.email && (
                          <div>
                            <a href={`mailto:${examiner.email}`} className="text-primary hover:underline">
                              {examiner.email}
                            </a>
                          </div>
                        )}
                        {examiner.orcid && (
                          <div className="flex items-center gap-1">
                            <span>ORCID:</span>
                            <a
                              href={`https://orcid.org/${examiner.orcid}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary hover:underline flex items-center gap-1"
                            >
                              {examiner.orcid}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Conflicts */}
                <div>
                  <h4 className="text-sm font-semibold mb-1.5">Conflict Assessment</h4>
                  {examiner.conflict_flags.length === 0 ? (
                    <p className="text-xs text-green-600">No conflicts detected.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {examiner.conflict_flags.map((flag, i) => (
                        <div
                          key={i}
                          className={cn(
                            "text-xs rounded-md px-2.5 py-1.5 border",
                            getSeverityColor(flag.severity)
                          )}
                        >
                          <div className="font-medium">{flag.type.replace(/_/g, " ")}</div>
                          <div className="opacity-80">{flag.description}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Top Publications */}
              {examiner.top_publications && examiner.top_publications.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    Top Publications
                  </h4>
                  <div className="space-y-2">
                    {examiner.top_publications.slice(0, 3).map((pub) => (
                      <div key={pub.id} className="text-xs bg-background rounded border p-2.5">
                        <div className="font-medium line-clamp-2">
                          {pub.doi ? (
                            <a
                              href={`https://doi.org/${pub.doi}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary hover:underline"
                            >
                              {pub.title}
                            </a>
                          ) : (
                            pub.title
                          )}
                        </div>
                        <div className="text-muted-foreground mt-0.5">
                          {pub.journal && <span>{pub.journal} · </span>}
                          {pub.year && <span>{pub.year} · </span>}
                          <span>{formatNumber(pub.citation_count)} citations</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

export function ExaminerTable({ results, searchRequest }: ExaminerTableProps) {
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);

  async function handlePdfExport() {
    setExportingPdf(true);
    try {
      const blob = await downloadPDFReport(searchRequest, results.examiners);
      triggerDownload(blob, `examiner_report_${new Date().toISOString().slice(0, 10)}.pdf`);
      toast.success("PDF report downloaded");
    } catch {
      toast.error("Failed to generate PDF report");
    } finally {
      setExportingPdf(false);
    }
  }

  async function handleExcelExport() {
    setExportingExcel(true);
    try {
      const blob = await downloadExcelReport(searchRequest, results.examiners);
      triggerDownload(blob, `examiner_report_${new Date().toISOString().slice(0, 10)}.xlsx`);
      toast.success("Excel report downloaded");
    } catch {
      toast.error("Failed to generate Excel report");
    } finally {
      setExportingExcel(false);
    }
  }

  if (results.examiners.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            No examiners found matching your thesis topic from South African universities.
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Try adding more keywords or broadening your abstract.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <CardTitle>
              {results.total_found} Examiner{results.total_found !== 1 ? "s" : ""} Found
            </CardTitle>
            <CardDescription className="mt-1">
              Ranked by weighted relevance score · Click a row to view details
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePdfExport}
              disabled={exportingPdf}
            >
              <FileDown className="mr-1.5 h-4 w-4" />
              {exportingPdf ? "Generating…" : "Export PDF"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExcelExport}
              disabled={exportingExcel}
            >
              <FileSpreadsheet className="mr-1.5 h-4 w-4" />
              {exportingExcel ? "Generating…" : "Export Excel"}
            </Button>
          </div>
        </div>

        {/* Extracted keywords / domains */}
        {(results.extracted_keywords?.length > 0 || results.research_domains?.length > 0) && (
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2 text-xs text-muted-foreground">
            {results.extracted_keywords?.length > 0 && (
              <span>
                <span className="font-medium text-foreground">Topics: </span>
                {results.extracted_keywords.slice(0, 6).join(", ")}
              </span>
            )}
            {results.research_domains?.length > 0 && (
              <span>
                <span className="font-medium text-foreground">Domains: </span>
                {results.research_domains.join(", ")}
              </span>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 text-center">#</TableHead>
              <TableHead>Examiner</TableHead>
              <TableHead className="min-w-[160px]">Match Score</TableHead>
              <TableHead className="text-center">H-index</TableHead>
              <TableHead className="text-center">Citations</TableHead>
              <TableHead className="text-center">
                <span title="Publications in last 5 years">Recent Pubs</span>
              </TableHead>
              <TableHead className="hidden lg:table-cell">Rank</TableHead>
              <TableHead>Conflicts</TableHead>
              <TableHead className="w-8" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.examiners.map((examiner, idx) => (
              <ExaminerRow key={examiner.id} examiner={examiner} rank={idx + 1} />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
