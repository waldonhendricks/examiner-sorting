from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from app.schemas.examiner import ReportRequest
from app.services.report_service import ReportService

router = APIRouter(tags=["reports"])
report_service = ReportService()


@router.post("/api/reports/pdf")
async def generate_pdf_report(request: ReportRequest) -> StreamingResponse:
    payload = request.search_request.model_dump()
    payload["keywords"] = payload.get("keywords") or []
    file_bytes = report_service.generate_pdf_report(payload, [examiner.model_dump() for examiner in request.examiners])
    return StreamingResponse(
        iter([file_bytes]),
        media_type="application/pdf",
        headers={"Content-Disposition": 'attachment; filename="examiner-report.pdf"'},
    )


@router.post("/api/reports/excel")
async def generate_excel_report(request: ReportRequest) -> StreamingResponse:
    payload = request.search_request.model_dump()
    payload["keywords"] = payload.get("keywords") or []
    file_bytes = report_service.generate_excel_report(payload, [examiner.model_dump() for examiner in request.examiners])
    return StreamingResponse(
        iter([file_bytes]),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": 'attachment; filename="examiner-report.xlsx"'},
    )
