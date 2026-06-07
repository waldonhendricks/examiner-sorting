"use client";

import { Fragment, useMemo, useState } from "react";
import type { ComponentType } from "react";
import {
  AlertTriangle,
  ArrowDownToLine,
  Award,
  BarChart3,
  BookCopy,
  ChevronDown,
  ChevronUp,
  Eye,
  FileSpreadsheet,
  GraduationCap,
} from "lucide-react";
import { toast } from "sonner";

import { ExaminerDetail } from "@/components/examiner-detail";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { downloadExcelReport, downloadPDFReport } from "@/lib/api";
import { cn, formatScore, getScoreColor } from "@/lib/utils";
import type { ConflictFlag, Examiner, ThesisSearchRequest } from "@/types";

interface ExaminerTableProps {
  examiners: Examiner[];
  request?: ThesisSearchRequest | null;
  thesisTitle?: string;
  extractedKeywords?: string[];
  researchDomains?: string[];
}

const conflictVariant: Record<ConflictFlag["severity"], "secondary" | "destructive" | "outline"> = {
  low: "outline",
  medium: "secondary",
  high: "destructive",
};

export function ExaminerTable({
  examiners,
  request,
  thesisTitle,
  extractedKeywords,
  researchDomains,
}: ExaminerTableProps) {
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [exporting, setExporting] = useState<"pdf" | "excel" | null>(null);

  const rankedExaminers = useMemo(
    () => [...examiners].sort((a, b) => b.final_score - a.final_score),
    [examiners],
  );

  const toggleRow = (id: number) => {
    setExpandedRows((current) =>
      current.includes(id) ? current.filter((rowId) => rowId !== id) : [...current, id],
    );
  };

  const handleDownload = async (format: "pdf" | "excel") => {
    if (!request || rankedExaminers.length === 0) {
      toast.error("Search results are required before exporting a report.");
      return;
    }

    setExporting(format);
    try {
      const blob =
        format === "pdf"
          ? await downloadPDFReport(request, rankedExaminers)
          : await downloadExcelReport(request, rankedExaminers);
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      const slug = (request.thesis_title || "examiner-report")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
        .slice(0, 60);
      anchor.href = url;
      anchor.download = `${slug || "examiner-report"}.${format === "pdf" ? "pdf" : "xlsx"}`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`${format.toUpperCase()} report downloaded.`);
    } catch (error) {
      console.error(error);
      toast.error(`Unable to generate the ${format.toUpperCase()} report right now.`);
    } finally {
      setExporting(null);
    }
  };

  return (
    <Card className="border-primary/10 shadow-lg shadow-primary/5">
      <CardHeader className="gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-xl">
            <GraduationCap className="h-5 w-5 text-primary" />
            Ranked examiner recommendations
          </CardTitle>
          <CardDescription className="mt-2 max-w-3xl">
            Review ranked experts, compare impact metrics, and inspect conflicts before making a final nomination.
          </CardDescription>
          {thesisTitle ? (
            <p className="mt-3 text-sm font-medium text-foreground/80">Search context: {thesisTitle}</p>
          ) : null}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={() => void handleDownload("pdf")}
            disabled={exporting !== null || rankedExaminers.length === 0}
          >
            <ArrowDownToLine className="mr-2 h-4 w-4" />
            {exporting === "pdf" ? "Exporting PDF..." : "Export PDF"}
          </Button>
          <Button
            onClick={() => void handleDownload("excel")}
            disabled={exporting !== null || rankedExaminers.length === 0}
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            {exporting === "excel" ? "Exporting Excel..." : "Export Excel"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <SummaryTile label="Total results" value={rankedExaminers.length.toString()} icon={Award} />
          <SummaryTile
            label="Research domains"
            value={researchDomains?.length ? researchDomains.join(", ") : "Awaiting search results"}
            icon={BarChart3}
          />
          <SummaryTile
            label="Keywords extracted"
            value={extractedKeywords?.length ? extractedKeywords.join(", ") : "Awaiting search results"}
            icon={BookCopy}
          />
        </div>

        {rankedExaminers.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-muted/20 px-6 py-16 text-center">
            <p className="text-lg font-semibold">No results</p>
            <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
              Submit a thesis title and abstract to receive a ranked shortlist of potential external examiners.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Rank</TableHead>
                <TableHead>Name &amp; university</TableHead>
                <TableHead className="min-w-[220px]">Similarity score</TableHead>
                <TableHead>H-index</TableHead>
                <TableHead>Citations</TableHead>
                <TableHead>Recent pubs</TableHead>
                <TableHead>Academic rank</TableHead>
                <TableHead>Conflicts</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rankedExaminers.map((examiner, index) => {
                const isExpanded = expandedRows.includes(examiner.id);
                return (
                  <Fragment key={examiner.id}>
                    <TableRow>
                      <TableCell className="font-semibold">#{index + 1}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-semibold">{examiner.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {examiner.university} · {examiner.department}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className={cn("font-semibold", getScoreColor(examiner.similarity_score))}>
                              {formatScore(examiner.similarity_score)}
                            </span>
                            <span className="text-muted-foreground">Final {formatScore(examiner.final_score)}</span>
                          </div>
                          <Progress value={examiner.similarity_score} className="h-2.5" />
                        </div>
                      </TableCell>
                      <TableCell>{examiner.h_index}</TableCell>
                      <TableCell>{examiner.citation_count.toLocaleString()}</TableCell>
                      <TableCell>{examiner.recent_publication_count}</TableCell>
                      <TableCell>{examiner.academic_rank || "—"}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {examiner.conflict_flags.length > 0 ? (
                            examiner.conflict_flags.slice(0, 2).map((flag, flagIndex) => (
                              <TooltipProvider key={`${flag.type}-${flagIndex}`}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge variant={conflictVariant[flag.severity]}>{flag.type}</Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="max-w-xs">{flag.description}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ))
                          ) : (
                            <Badge variant="outline">None</Badge>
                          )}
                          {examiner.conflict_flags.length > 2 ? (
                            <Badge variant="secondary">+{examiner.conflict_flags.length - 2} more</Badge>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <ExaminerDetail examiner={examiner}>
                            <Button variant="outline" size="sm">
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </Button>
                          </ExaminerDetail>
                          <Button variant="ghost" size="icon" onClick={() => toggleRow(examiner.id)}>
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            <span className="sr-only">Toggle row details</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    {isExpanded ? (
                      <TableRow className="bg-muted/20 hover:bg-muted/20">
                        <TableCell colSpan={9}>
                          <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
                            <div className="space-y-3 rounded-xl border bg-background p-4">
                              <div className="flex items-center gap-2">
                                <BookCopy className="h-4 w-4 text-primary" />
                                <h4 className="font-semibold">Research interests</h4>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {examiner.research_interests.length ? (
                                  examiner.research_interests.map((interest) => (
                                    <Badge key={interest} variant="secondary" className="rounded-md px-3 py-1">
                                      {interest}
                                    </Badge>
                                  ))
                                ) : (
                                  <p className="text-sm text-muted-foreground">No research interests provided.</p>
                                )}
                              </div>
                              <div className="pt-2">
                                <p className="text-sm font-medium">Top publications</p>
                                <div className="mt-2 space-y-2">
                                  {examiner.top_publications && examiner.top_publications.length > 0 ? (
                                    examiner.top_publications.slice(0, 3).map((publication) => (
                                      <div key={publication.id} className="rounded-lg border p-3">
                                        <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                                          <p className="font-medium">{publication.title}</p>
                                          <span className="text-sm text-muted-foreground">
                                            {publication.year} · {publication.citation_count} citations
                                          </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{publication.journal}</p>
                                      </div>
                                    ))
                                  ) : (
                                    <p className="text-sm text-muted-foreground">No publication highlights available.</p>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="space-y-3 rounded-xl border bg-background p-4">
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-primary" />
                                <h4 className="font-semibold">Conflict review</h4>
                              </div>
                              {examiner.conflict_flags.length ? (
                                examiner.conflict_flags.map((flag, flagIndex) => (
                                  <div key={`${flag.type}-${flagIndex}`} className="rounded-lg border p-3">
                                    <div className="flex items-center gap-2">
                                      <Badge variant={conflictVariant[flag.severity]}>{flag.severity}</Badge>
                                      <span className="font-medium">{flag.type}</span>
                                    </div>
                                    <p className="mt-2 text-sm text-muted-foreground">{flag.description}</p>
                                  </div>
                                ))
                              ) : (
                                <p className="text-sm text-muted-foreground">No conflicts flagged for this examiner.</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </Fragment>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function SummaryTile({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{label}</p>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <p className="mt-3 line-clamp-2 text-lg font-semibold">{value}</p>
    </div>
  );
}
