"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Search, Loader2, X } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { ThesisSearchRequest } from "@/src/types";

const schema = z.object({
  thesis_title: z.string().min(5, "Title must be at least 5 characters").max(500),
  thesis_abstract: z
    .string()
    .min(100, "Abstract must be at least 100 characters")
    .max(10000),
  degree_type: z.enum(["masters", "phd"]),
  keywords_raw: z.string().optional(),
  supervisor_university: z.string().optional(),
  supervisor_name: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface SearchFormProps {
  onSearch: (request: ThesisSearchRequest) => Promise<void>;
  isLoading: boolean;
}

export function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [keywordTags, setKeywordTags] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { degree_type: "phd" },
  });

  function addKeyword(value: string) {
    const tags = value
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k.length > 0 && !keywordTags.includes(k));
    if (tags.length > 0) {
      const updated = [...keywordTags, ...tags].slice(0, 20);
      setKeywordTags(updated);
      setKeywordInput("");
    }
  }

  function removeKeyword(kw: string) {
    setKeywordTags(keywordTags.filter((k) => k !== kw));
  }

  function onSubmit(data: FormValues) {
    const request: ThesisSearchRequest = {
      thesis_title: data.thesis_title,
      thesis_abstract: data.thesis_abstract,
      degree_type: data.degree_type,
      keywords: keywordTags.length > 0 ? keywordTags : undefined,
      supervisor_university: data.supervisor_university || undefined,
      supervisor_name: data.supervisor_name || undefined,
    };
    onSearch(request);
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Find Examiners
        </CardTitle>
        <CardDescription>
          Enter your thesis details to discover suitable examiners from South
          African universities.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Thesis Title */}
          <div className="space-y-1.5">
            <Label htmlFor="thesis_title">
              Thesis Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="thesis_title"
              placeholder="e.g. Machine Learning for Early Detection of Alzheimer's Disease"
              {...register("thesis_title")}
            />
            {errors.thesis_title && (
              <p className="text-xs text-destructive">{errors.thesis_title.message}</p>
            )}
          </div>

          {/* Degree Type */}
          <div className="space-y-1.5">
            <Label>
              Degree Type <span className="text-destructive">*</span>
            </Label>
            <Select
              defaultValue="phd"
              onValueChange={(v) => setValue("degree_type", v as "masters" | "phd")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select degree type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="phd">PhD</SelectItem>
                <SelectItem value="masters">Masters</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Supervisor Details */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="supervisor_university">
                Supervisor&apos;s University
                <span className="ml-1 text-xs text-muted-foreground">(for conflict detection)</span>
              </Label>
              <Input
                id="supervisor_university"
                placeholder="e.g. University of Cape Town"
                {...register("supervisor_university")}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="supervisor_name">Supervisor&apos;s Name</Label>
              <Input
                id="supervisor_name"
                placeholder="e.g. Prof. John Smith"
                {...register("supervisor_name")}
              />
            </div>
          </div>

          {/* Keywords */}
          <div className="space-y-1.5">
            <Label htmlFor="keywords">
              Keywords
              <span className="ml-1 text-xs text-muted-foreground">(optional, press Enter or comma to add)</span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="keywords"
                placeholder="e.g. deep learning, MRI, neural networks"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    addKeyword(keywordInput);
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addKeyword(keywordInput)}
              >
                Add
              </Button>
            </div>
            {keywordTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {keywordTags.map((kw) => (
                  <span
                    key={kw}
                    className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                  >
                    {kw}
                    <button
                      type="button"
                      onClick={() => removeKeyword(kw)}
                      className="hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Thesis Abstract */}
          <div className="space-y-1.5">
            <Label htmlFor="thesis_abstract">
              Thesis Abstract <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="thesis_abstract"
              placeholder="Paste your full thesis abstract here (minimum 100 characters). A detailed abstract produces better examiner matches."
              className="min-h-[180px] resize-y"
              {...register("thesis_abstract")}
            />
            {errors.thesis_abstract && (
              <p className="text-xs text-destructive">{errors.thesis_abstract.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching researchers…
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Find Examiners
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
