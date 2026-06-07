"use client";

import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Search } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ThesisSearchRequest } from "@/types";

const searchSchema = z.object({
  thesis_title: z.string().min(5, "Provide a descriptive thesis title."),
  degree_type: z.enum(["masters", "phd"]),
  supervisor_university: z.string().optional(),
  supervisor_name: z.string().optional(),
  keywords_text: z.string().optional(),
  thesis_abstract: z.string().min(100, "The thesis abstract must be at least 100 characters."),
});

type SearchFormValues = z.infer<typeof searchSchema>;

interface SearchFormProps {
  isLoading: boolean;
  onSubmit: (request: ThesisSearchRequest) => Promise<void>;
}

export function SearchForm({ isLoading, onSubmit }: SearchFormProps) {
  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      thesis_title: "",
      degree_type: "phd",
      supervisor_university: "",
      supervisor_name: "",
      keywords_text: "",
      thesis_abstract: "",
    },
  });

  const keywordsText = form.watch("keywords_text") || "";
  const abstractText = form.watch("thesis_abstract") || "";

  const keywordsPreview = useMemo(
    () =>
      keywordsText
        .split(",")
        .map((keyword) => keyword.trim())
        .filter(Boolean),
    [keywordsText],
  );

  const handleSubmit = form.handleSubmit(async (values) => {
    const request: ThesisSearchRequest = {
      thesis_title: values.thesis_title.trim(),
      thesis_abstract: values.thesis_abstract.trim(),
      degree_type: values.degree_type,
      keywords: values.keywords_text
        ?.split(",")
        .map((keyword) => keyword.trim())
        .filter(Boolean),
      supervisor_university: values.supervisor_university?.trim() || undefined,
      supervisor_name: values.supervisor_name?.trim() || undefined,
    };

    await onSubmit(request);
  });

  return (
    <Card className="border-primary/10 shadow-lg shadow-primary/5">
      <CardHeader>
        <CardTitle>Examiner search request</CardTitle>
        <CardDescription>
          Provide thesis details so the platform can rank the best-fit examiners across South African universities.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-8" onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
            <div className="space-y-2">
              <Label htmlFor="thesis_title">Thesis title</Label>
              <Input
                id="thesis_title"
                placeholder="e.g. Machine learning approaches to drought prediction in the Western Cape"
                {...form.register("thesis_title")}
              />
              <FieldError message={form.formState.errors.thesis_title?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="degree_type">Degree type</Label>
              <Controller
                control={form.control}
                name="degree_type"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="degree_type">
                      <SelectValue placeholder="Select degree type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="masters">Masters</SelectItem>
                      <SelectItem value="phd">PhD</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError message={form.formState.errors.degree_type?.message} />
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-2 rounded-xl border bg-muted/20 p-4">
              <div>
                <Label htmlFor="supervisor_university">Supervisor university</Label>
                <p className="mt-1 text-xs text-muted-foreground">
                  Used to highlight institutional conflicts of interest.
                </p>
              </div>
              <Input
                id="supervisor_university"
                placeholder="e.g. Stellenbosch University"
                {...form.register("supervisor_university")}
              />
            </div>
            <div className="space-y-2 rounded-xl border bg-muted/20 p-4">
              <div>
                <Label htmlFor="supervisor_name">Supervisor name</Label>
                <p className="mt-1 text-xs text-muted-foreground">
                  Helps the backend identify prior co-authorship or direct collaborations.
                </p>
              </div>
              <Input
                id="supervisor_name"
                placeholder="e.g. Prof Jane Doe"
                {...form.register("supervisor_name")}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <Label htmlFor="keywords_text">Keywords</Label>
              <p className="mt-1 text-xs text-muted-foreground">
                Optional, comma-separated. Add domain concepts, methods, geographies, or subject terms.
              </p>
            </div>
            <Input
              id="keywords_text"
              placeholder="NLP, distributed systems, public health, South Africa"
              {...form.register("keywords_text")}
            />
            <div className="flex flex-wrap gap-2">
              {keywordsPreview.length > 0 ? (
                keywordsPreview.map((keyword) => (
                  <span
                    key={keyword}
                    className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary"
                  >
                    {keyword}
                  </span>
                ))
              ) : (
                <p className="text-xs text-muted-foreground">
                  Keywords will appear here as tags once entered.
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="thesis_abstract">Thesis abstract</Label>
            <Textarea
              id="thesis_abstract"
              rows={8}
              placeholder="Paste the thesis abstract here. Include the research problem, methods, findings, and disciplinary context."
              {...form.register("thesis_abstract")}
            />
            <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
              <FieldError message={form.formState.errors.thesis_abstract?.message} />
              <span>{abstractText.length} characters</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-xl border bg-secondary/30 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium">Ready to search</p>
              <p className="text-sm text-muted-foreground">
                Examiner recommendations will be ranked by topic fit, impact metrics, and conflict screening.
              </p>
            </div>
            <Button type="submit" size="lg" className="min-w-[180px]" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Find examiners
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-sm font-medium text-destructive">{message}</p>;
}
