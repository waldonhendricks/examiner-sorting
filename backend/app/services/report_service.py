from io import BytesIO
from typing import List

from openpyxl import Workbook
from openpyxl.styles import Alignment, Font
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


class ReportService:
    def generate_pdf_report(self, search_request: dict, examiners: List[dict]) -> bytes:
        buffer = BytesIO()
        document = SimpleDocTemplate(buffer, pagesize=A4, leftMargin=18 * mm, rightMargin=18 * mm)
        styles = getSampleStyleSheet()
        story = [Paragraph("Examiner Finder SA Report", styles["Title"]), Spacer(1, 12)]

        summary_rows = [
            ["Thesis title", search_request.get("thesis_title", "")],
            ["Degree type", search_request.get("degree_type", "")],
            ["Keywords", ", ".join(search_request.get("keywords", []))],
            ["Supervisor university", search_request.get("supervisor_university", "") or "Not supplied"],
            ["Supervisor name", search_request.get("supervisor_name", "") or "Not supplied"],
        ]
        story.append(Table(summary_rows, colWidths=[45 * mm, 120 * mm]))
        story.append(Spacer(1, 12))
        story.append(Paragraph(search_request.get("thesis_abstract", ""), styles["BodyText"]))
        story.append(Spacer(1, 12))

        table_rows = [["Rank", "Examiner", "University", "Score", "Conflicts"]]
        for index, examiner in enumerate(examiners, start=1):
            conflicts = ", ".join(flag.get("type", "") for flag in examiner.get("conflict_flags", [])) or "None"
            table_rows.append(
                [
                    str(index),
                    examiner.get("name", ""),
                    examiner.get("university", ""),
                    f"{examiner.get('final_score', 0):.2f}",
                    conflicts,
                ]
            )

        table = Table(table_rows, repeatRows=1, colWidths=[15 * mm, 45 * mm, 50 * mm, 20 * mm, 45 * mm])
        table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f4c81")),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.whitesmoke, colors.lightgrey]),
                ]
            )
        )
        story.append(table)
        document.build(story)
        return buffer.getvalue()

    def generate_excel_report(self, search_request: dict, examiners: List[dict]) -> bytes:
        workbook = Workbook()
        summary = workbook.active
        summary.title = "Search Summary"
        summary["A1"] = "Examiner Finder SA Report"
        summary["A1"].font = Font(size=14, bold=True)
        summary["A3"] = "Thesis Title"
        summary["B3"] = search_request.get("thesis_title", "")
        summary["A4"] = "Degree Type"
        summary["B4"] = search_request.get("degree_type", "")
        summary["A5"] = "Keywords"
        summary["B5"] = ", ".join(search_request.get("keywords", []))
        summary["A6"] = "Supervisor University"
        summary["B6"] = search_request.get("supervisor_university", "") or "Not supplied"
        summary["A7"] = "Supervisor Name"
        summary["B7"] = search_request.get("supervisor_name", "") or "Not supplied"
        summary["A9"] = "Abstract"
        summary["B9"] = search_request.get("thesis_abstract", "")
        summary["B9"].alignment = Alignment(wrap_text=True, vertical="top")
        summary.column_dimensions["A"].width = 24
        summary.column_dimensions["B"].width = 100

        detail_sheet = workbook.create_sheet("Ranked Examiners")
        headers = [
            "Rank",
            "Name",
            "University",
            "Department",
            "Similarity Score",
            "Final Score",
            "H-index",
            "Citation Count",
            "Recent Publications",
            "Academic Rank",
            "Conflicts",
        ]
        detail_sheet.append(headers)
        for cell in detail_sheet[1]:
            cell.font = Font(bold=True)
        for index, examiner in enumerate(examiners, start=1):
            detail_sheet.append(
                [
                    index,
                    examiner.get("name", ""),
                    examiner.get("university", ""),
                    examiner.get("department", ""),
                    examiner.get("similarity_score", 0),
                    examiner.get("final_score", 0),
                    examiner.get("h_index", 0),
                    examiner.get("citation_count", 0),
                    examiner.get("recent_publication_count", 0),
                    examiner.get("academic_rank", ""),
                    ", ".join(flag.get("type", "") for flag in examiner.get("conflict_flags", [])) or "None",
                ]
            )
        for column in ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"]:
            detail_sheet.column_dimensions[column].width = 22

        buffer = BytesIO()
        workbook.save(buffer)
        return buffer.getvalue()
