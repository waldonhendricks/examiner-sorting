import { Progress } from "@/components/ui/progress";
import { formatScore } from "@/lib/utils";
import type { Examiner } from "@/types";

interface ScoreBreakdownProps {
  examiner: Examiner;
}

interface BreakdownItem {
  label: string;
  weightLabel: string;
  value: number;
}

function normalize(value: number, max: number) {
  if (max <= 0) return 0;
  return Math.max(0, Math.min(100, (value / max) * 100));
}

export function ScoreBreakdown({ examiner }: ScoreBreakdownProps) {
  const items: BreakdownItem[] = [
    { label: "Topic similarity", weightLabel: "40%", value: examiner.similarity_score },
    { label: "H-index score", weightLabel: "20%", value: normalize(examiner.h_index, 50) },
    { label: "Citation score", weightLabel: "15%", value: normalize(examiner.citation_count, 5000) },
    {
      label: "Recent publications",
      weightLabel: "15%",
      value: normalize(examiner.recent_publication_count, 25),
    },
    {
      label: "Academic rank",
      weightLabel: "10%",
      value: examiner.academic_rank?.toLowerCase().includes("prof")
        ? 100
        : examiner.academic_rank?.toLowerCase().includes("associate")
          ? 85
          : examiner.academic_rank?.toLowerCase().includes("senior")
            ? 70
            : examiner.academic_rank
              ? 55
              : 40,
    },
  ];

  return (
    <div className="space-y-5 rounded-xl border bg-background/70 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold">Scoring breakdown</h4>
          <p className="text-sm text-muted-foreground">
            Weighted signals used to produce the final recommendation score.
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Final score</p>
          <p className="text-2xl font-bold">{formatScore(examiner.final_score)}</p>
        </div>
      </div>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.label} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{item.label}</span>
              <span className="text-muted-foreground">
                {formatScore(item.value)} · Weight {item.weightLabel}
              </span>
            </div>
            <Progress value={item.value} />
          </div>
        ))}
      </div>
    </div>
  );
}
