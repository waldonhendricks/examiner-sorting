import axios from "axios";

import type { Examiner, SearchResponse, ThesisSearchRequest } from "@/types";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/backend",
  headers: { "Content-Type": "application/json" },
});

export async function searchExaminers(
  request: ThesisSearchRequest,
): Promise<SearchResponse> {
  const response = await api.post<SearchResponse>("/api/search", request);
  return response.data;
}

export async function downloadPDFReport(
  request: ThesisSearchRequest,
  examiners: Examiner[],
): Promise<Blob> {
  const response = await api.post(
    "/api/reports/pdf",
    { request, examiners },
    { responseType: "blob" },
  );
  return response.data;
}

export async function downloadExcelReport(
  request: ThesisSearchRequest,
  examiners: Examiner[],
): Promise<Blob> {
  const response = await api.post(
    "/api/reports/excel",
    { request, examiners },
    { responseType: "blob" },
  );
  return response.data;
}
