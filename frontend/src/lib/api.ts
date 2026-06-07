import axios from "axios";
import { ThesisSearchRequest, SearchResponse } from "@/src/types";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
  timeout: 60000,
});

export async function searchExaminers(
  request: ThesisSearchRequest
): Promise<SearchResponse> {
  const response = await api.post<SearchResponse>("/api/search", request);
  return response.data;
}

export async function downloadPDFReport(
  request: ThesisSearchRequest,
  examiners: unknown[]
): Promise<Blob> {
  const response = await api.post(
    "/api/reports/pdf",
    { request, examiners },
    { responseType: "blob" }
  );
  return response.data as Blob;
}

export async function downloadExcelReport(
  request: ThesisSearchRequest,
  examiners: unknown[]
): Promise<Blob> {
  const response = await api.post(
    "/api/reports/excel",
    { request, examiners },
    { responseType: "blob" }
  );
  return response.data as Blob;
}

export function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
