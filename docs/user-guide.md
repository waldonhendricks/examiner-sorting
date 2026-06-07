# Examiner Finder SA — User Guide

## Introduction

**Examiner Finder SA** is a web application designed for postgraduate coordinators and supervisors at South African universities. It helps identify suitable external thesis examiners by analysing the thesis abstract and matching it to researcher profiles at recognised South African institutions.

---

## Getting Started

### 1. Open the Application

Navigate to the application in your web browser:
- Local development: `http://localhost:3000`
- Production: (your deployed URL)

You will see the Examiner Finder SA dashboard with a search form on the left and results area on the right.

---

## Using the Search Form

### Step 1: Enter the Thesis Title
Type the full title of the thesis in the **Thesis Title** field.

> Example: *"A Deep Learning Framework for Early Detection of Diabetic Retinopathy in Fundus Images"*

---

### Step 2: Select the Degree Type
Choose either **Masters** or **PhD** from the dropdown. This affects the ranking — PhD examiners are expected to have higher scholarly output.

---

### Step 3: Enter Supervisor Information (Optional, Recommended)
Providing supervisor details enables **conflict of interest detection**:
- **Supervisor's University**: The university where the supervisor is employed
- **Supervisor's Name**: The supervisor's full name

The system will flag examiners who are from the same university or who have co-authored with the supervisor.

---

### Step 4: Add Keywords (Optional)
Add comma-separated keywords to refine the search:

> Example: *deep learning, retinal imaging, diabetic retinopathy, fundus photography*

Keywords supplement the abstract analysis and help surface researchers who may not use the same terminology but work in the same field.

---

### Step 5: Paste the Thesis Abstract
Paste the **full thesis abstract** in the large text area. The abstract should be at least 100 characters. Longer, more detailed abstracts produce better results.

**Tips for best results:**
- Use the full abstract, not a summary
- Include methodology terms (e.g., "convolutional neural network", "mixed-methods")
- Mention specific datasets or domains

---

### Step 6: Click "Find Examiners"
Click the button to initiate the search. The process takes 5–30 seconds depending on network conditions and the number of researchers found.

---

## Understanding the Results

### Examiner Rankings Table

The results table displays examiners ranked by their **Overall Match Score** (0–100):

| Column | Description |
|--------|-------------|
| **Rank** | Position in the ranked list |
| **Name & University** | Examiner's full name, university, and department |
| **Match Score** | Overall weighted relevance score (0–100) |
| **Topic Similarity** | Semantic similarity between thesis and researcher profile |
| **H-index** | Hirsch index — a measure of research impact |
| **Citations** | Total citation count |
| **Recent Pubs** | Number of publications in the last 5 years |
| **Academic Rank** | Current position (Professor, Associate Professor, etc.) |
| **Conflicts** | Conflict of interest flags |

---

### Score Calculation

The overall score is calculated using weighted criteria:

| Criterion | Weight | Description |
|-----------|--------|-------------|
| **Topic Similarity** | 40% | Cosine similarity between thesis and researcher's publication profile |
| **H-index** | 20% | Normalised against the highest h-index in the result set |
| **Citation Count** | 15% | Normalised against highest citation count in result set |
| **Recent Publications** | 15% | Publications in the last 5 years (normalised) |
| **Academic Rank** | 10% | Score based on rank: Distinguished Professor (100%) → Lecturer (40%) |

**Score colour coding:**
- 🟢 **75–100**: Excellent match — highly recommended
- 🟡 **50–74**: Good match — consider carefully
- 🔴 **0–49**: Weak match — review manually

---

### Conflict of Interest Flags

The system automatically detects the following conflicts:

| Flag | Severity | Description |
|------|----------|-------------|
| **Same University** | 🔴 High | Examiner is at the same institution as the supervisor |
| **Same Department** | 🔴 High | Examiner is in the same department as the supervisor |
| **Co-authorship** | 🔴 High | Examiner has co-authored with the supervisor in the past 5 years |
| **Existing Collaboration** | 🟡 Medium | Evidence of ongoing collaboration with supervisor |

**Note:** A high-severity conflict does not automatically disqualify an examiner — it is a flag for the coordinator to review. Some institutions have specific policies about these situations.

---

### Viewing Examiner Details

Click on any examiner's name or the **View** button to open the detailed profile panel:

- **Full contact information** (email, ORCID, profile URL)
- **Research interests**
- **Score breakdown chart** showing all five criteria
- **Top publications** (most cited and most recent)
- **Conflict analysis** summary

---

## Exporting Reports

### Export to PDF
Click the **Export PDF** button to download a formatted examiner recommendation report containing:
- Thesis details and search parameters
- Full ranked examiner list
- Individual examiner profiles with justification
- Conflict of interest assessment
- Publication metrics

### Export to Excel
Click the **Export Excel** button to download a spreadsheet with:
- Summary sheet with search details
- Examiner data sheet with all metrics
- Publications sheet with top publications per examiner

**Use cases for the Excel export:**
- Further analysis in Excel/Google Sheets
- Submission to higher degrees committees
- Archiving search results

---

## Tips for Best Results

### Writing a Good Abstract
The system performs much better with detailed abstracts. Include:
- **Research problem**: What problem does the thesis address?
- **Methodology**: What methods are used? (qualitative/quantitative, specific techniques)
- **Domain**: What field(s) does the research fall in?
- **Key concepts**: Technical terms, theories, or frameworks used

### Choosing Keywords
- Use **technical terms** your research community would recognise
- Include **synonyms** or alternative terminology
- Add **methodology keywords** (e.g., "systematic review", "grounded theory", "RCT")

### Supervisor Information
Always provide the supervisor's university at minimum. This is the most common source of conflict of interest and is essential for generating a defensible examiner list.

---

## Frequently Asked Questions

**Q: How current is the researcher data?**
A: Researcher profiles are retrieved in real time from OpenAlex, Crossref, and ORCID. Some metrics (h-index, citation counts) may lag behind real-time by a few weeks.

**Q: Why isn't a particular well-known researcher appearing?**
A: The researcher may not have a profile indexed in the APIs we use, or their institutional affiliation may not match our SA university list. You can search by name in the Examiner Database section.

**Q: Can I search for examiners from international universities?**
A: Currently, the system only includes South African universities as per institutional policy. International examiners can be added manually.

**Q: How many examiners are returned per search?**
A: Up to 20 ranked examiners are returned per search. The actual number may be lower if fewer relevant SA researchers are found.

**Q: Is my thesis abstract stored?**
A: Search queries are stored in the search history database for audit and improvement purposes. Abstracts are not shared with third parties.

**Q: What if the system is slow?**
A: The search involves real-time queries to multiple external academic APIs. Response time typically ranges from 5–30 seconds. If the system times out, try again — external APIs may be temporarily slow.

---

## Troubleshooting

| Issue | Solution |
|-------|---------|
| "No examiners found" | Check that the abstract is detailed and in English. Try adding more keywords. |
| Slow response (>30s) | External APIs may be experiencing load. Wait a moment and try again. |
| Error on export | Ensure you have search results before exporting. |
| Conflict flags missing | Ensure supervisor university and name are provided. |

---

## Contact & Support

For technical support or to report issues:
- Create a GitHub issue at the project repository
- Contact the system administrator at your institution

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-01 | Initial release |
