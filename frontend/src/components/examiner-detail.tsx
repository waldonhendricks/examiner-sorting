"use client";

import type { ComponentType, ReactNode } from "react";
import { BookOpen, Building2, Mail, ShieldAlert, Sparkles, Trophy, UserRound } from "lucide-react";

import { ScoreBreakdown } from "@/components/score-breakdown";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ConflictFlag, Examiner } from "@/types";

interface ExaminerDetailProps {
  examiner: Examiner;
  children: ReactNode;
}

const conflictVariant: Record<ConflictFlag["severity"], "secondary" | "destructive" | "outline"> = {
  low: "outline",
  medium: "secondary",
  high: "destructive",
};

export function ExaminerDetail({ examiner, children }: ExaminerDetailProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <UserRound className="h-5 w-5 text-primary" />
            {examiner.name}
          </DialogTitle>
          <DialogDescription>
            {examiner.department} · {examiner.university}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="publications">Publications</TabsTrigger>
            <TabsTrigger value="conflicts">Conflicts</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MetricCard label="Final score" value={`${Math.round(examiner.final_score)}%`} icon={Sparkles} />
              <MetricCard label="H-index" value={examiner.h_index.toString()} icon={Trophy} />
              <MetricCard label="Citations" value={examiner.citation_count.toLocaleString()} icon={BookOpen} />
              <MetricCard
                label="Recent publications"
                value={examiner.recent_publication_count.toString()}
                icon={Building2}
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
              <div className="space-y-4 rounded-xl border bg-card p-5">
                <div>
                  <h3 className="text-lg font-semibold">Profile summary</h3>
                  <p className="text-sm text-muted-foreground">
                    Research fit, institutional context, and available contact information.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <InfoRow label="University" value={examiner.university} />
                  <InfoRow label="Department" value={examiner.department} />
                  <InfoRow label="Academic rank" value={examiner.academic_rank || "Not provided"} />
                  <InfoRow label="Publication count" value={examiner.publication_count.toString()} />
                  <InfoRow label="Email" value={examiner.email || "Not provided"} icon={Mail} />
                  <InfoRow label="ORCID" value={examiner.orcid || "Not provided"} />
                </div>
                <Separator />
                <div>
                  <h4 className="font-medium">Research interests</h4>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {examiner.research_interests.length > 0 ? (
                      examiner.research_interests.map((interest) => (
                        <Badge key={interest} variant="secondary" className="rounded-md px-3 py-1">
                          {interest}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No research interests available.</p>
                    )}
                  </div>
                </div>
              </div>

              <ScoreBreakdown examiner={examiner} />
            </div>
          </TabsContent>

          <TabsContent value="publications" className="space-y-4">
            <div className="rounded-xl border bg-card p-5">
              <h3 className="text-lg font-semibold">Top publications</h3>
              <p className="text-sm text-muted-foreground">
                Recent and high-impact outputs used to support the match recommendation.
              </p>
              <div className="mt-4 space-y-3">
                {examiner.top_publications?.length ? (
                  examiner.top_publications.map((publication) => (
                    <div key={publication.id} className="rounded-lg border bg-background/80 p-4">
                      <div className="flex flex-col justify-between gap-2 md:flex-row md:items-start">
                        <div>
                          <p className="font-medium">{publication.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {publication.journal} · {publication.year}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            DOI: {publication.doi || "Unavailable"}
                          </p>
                        </div>
                        <Badge variant="outline">{publication.citation_count} citations</Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    No publication details were returned for this examiner.
                  </p>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="conflicts" className="space-y-4">
            <div className="rounded-xl border bg-card p-5">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Conflict analysis</h3>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Potential conflict signals extracted from the current search context.
              </p>
              <div className="mt-4 space-y-3">
                {examiner.conflict_flags.length ? (
                  examiner.conflict_flags.map((flag, index) => (
                    <div key={`${flag.type}-${index}`} className="rounded-lg border bg-background/80 p-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <Badge variant={conflictVariant[flag.severity]}>{flag.severity} severity</Badge>
                        <span className="font-medium">{flag.type}</span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{flag.description}</p>
                    </div>
                  ))
                ) : (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    No conflicts were flagged for this examiner.
                  </p>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function MetricCard({
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
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <p className="mt-3 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function InfoRow({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-lg border bg-background/80 p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="mt-2 flex items-center gap-2 text-sm font-medium">
        {Icon ? <Icon className="h-4 w-4 text-primary" /> : null}
        <span>{value}</span>
      </div>
    </div>
  );
}
