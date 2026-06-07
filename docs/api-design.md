# Examiner Finder SA - API Design

## Base URL
- Development: `http://localhost:8000`
- Production: `https://api.examiner-finder.ac.za`

## Authentication
Currently open for institutional use. JWT authentication available for admin endpoints.

---

## Endpoints

### Health

#### GET /health
Returns the health status of all services.

**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2024-01-15T10:30:00Z",
  "services": {
    "database": "healthy",
    "redis": "healthy"
  }
}
```

---

### Search

#### POST /api/search
Search for suitable examiners based on a thesis abstract.

**Request Body:**
```json
{
  "thesis_title": "Machine Learning Approaches for Early Detection of Alzheimer's Disease",
  "thesis_abstract": "This study investigates the application of convolutional neural networks and transformer-based models for early detection of Alzheimer's disease using MRI brain scans. We propose a novel multi-modal deep learning architecture...",
  "degree_type": "phd",
  "keywords": ["deep learning", "MRI", "Alzheimer's", "medical imaging"],
  "supervisor_university": "University of Cape Town",
  "supervisor_name": "Prof. John Smith"
}
```

**Field Constraints:**
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `thesis_title` | string | Yes | 5–500 chars |
| `thesis_abstract` | string | Yes | 100–10,000 chars |
| `degree_type` | enum | Yes | `"masters"` or `"phd"` |
| `keywords` | string[] | No | Max 20 items, each ≤100 chars |
| `supervisor_university` | string | No | ≤255 chars |
| `supervisor_name` | string | No | ≤255 chars |

**Response (200 OK):**
```json
{
  "thesis_title": "Machine Learning Approaches for Early Detection of Alzheimer's Disease",
  "thesis_abstract": "...",
  "degree_type": "phd",
  "keywords": ["deep learning", "MRI", "Alzheimer's", "medical imaging"],
  "extracted_keywords": ["convolutional neural networks", "transformer", "Alzheimer's disease", "MRI", "deep learning", "medical imaging", "multi-modal"],
  "research_domains": ["Computer Science", "Medical Imaging", "Neuroscience"],
  "total_found": 12,
  "examiners": [
    {
      "id": 42,
      "rank": 1,
      "name": "Prof. Sarah Johnson",
      "university": "University of Cape Town",
      "department": "Computer Science",
      "email": "s.johnson@uct.ac.za",
      "orcid": "0000-0002-1825-0097",
      "research_interests": ["machine learning", "medical imaging", "deep learning"],
      "h_index": 45,
      "citation_count": 8200,
      "publication_count": 120,
      "recent_publication_count": 18,
      "academic_rank": "Full Professor",
      "profile_url": "https://www.uct.ac.za/...",
      "similarity_score": 87.5,
      "final_score": 82.3,
      "score_breakdown": {
        "topic_similarity": 87.5,
        "h_index_score": 75.0,
        "citation_score": 68.0,
        "recent_pubs_score": 80.0,
        "academic_rank_score": 90.0
      },
      "conflict_flags": [],
      "top_publications": [
        {
          "id": 1001,
          "title": "Deep Learning for Medical Image Analysis: A Survey",
          "year": 2023,
          "journal": "Medical Image Analysis",
          "doi": "10.1016/j.media.2023.01.001",
          "citation_count": 340
        }
      ]
    }
  ]
}
```

**Error Responses:**
- `422 Unprocessable Entity`: Validation error with field details
- `503 Service Unavailable`: External API unavailable

---

#### GET /api/search/history
Retrieve recent search history.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `skip` | integer | 0 | Pagination offset |
| `limit` | integer | 10 | Results per page (max 50) |

**Response (200 OK):**
```json
{
  "items": [
    {
      "id": 1,
      "session_id": "550e8400-e29b-41d4-a716-446655440000",
      "thesis_title": "Machine Learning for Alzheimer's Detection",
      "degree_type": "phd",
      "results_count": 12,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 45,
  "skip": 0,
  "limit": 10
}
```

---

### Examiners

#### GET /api/examiners
List all examiners with pagination and filtering.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `skip` | integer | Pagination offset |
| `limit` | integer | Results per page (max 100) |
| `university` | string | Filter by university name |
| `min_h_index` | integer | Minimum h-index filter |
| `research_area` | string | Filter by research area keyword |

**Response (200 OK):**
```json
{
  "items": [...],
  "total": 250,
  "skip": 0,
  "limit": 20
}
```

---

#### GET /api/examiners/{id}
Get a specific examiner by ID.

**Path Parameters:**
- `id` (integer): Examiner ID

**Response (200 OK):** Full examiner object with publications.

**Response (404 Not Found):**
```json
{"detail": "Examiner not found"}
```

---

#### GET /api/examiners/{id}/publications
Get publications for a specific examiner.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `skip` | integer | 0 | Pagination offset |
| `limit` | integer | 20 | Results per page |
| `min_year` | integer | - | Filter by minimum publication year |

**Response (200 OK):**
```json
{
  "items": [
    {
      "id": 1001,
      "examiner_id": 42,
      "title": "Deep Learning for Medical Image Analysis",
      "abstract": "...",
      "year": 2023,
      "journal": "Medical Image Analysis",
      "doi": "10.1016/j.media.2023.01.001",
      "citation_count": 340,
      "url": "https://doi.org/10.1016/j.media.2023.01.001"
    }
  ],
  "total": 120,
  "skip": 0,
  "limit": 20
}
```

---

#### DELETE /api/examiners/{id}
Delete an examiner record.

**Response (200 OK):**
```json
{"message": "Examiner deleted successfully"}
```

---

### Reports

#### POST /api/reports/pdf
Generate a PDF examiner recommendation report.

**Request Body:**
```json
{
  "request": {
    "thesis_title": "...",
    "thesis_abstract": "...",
    "degree_type": "phd",
    "keywords": [],
    "supervisor_university": "UCT",
    "supervisor_name": "Prof. Smith"
  },
  "examiners": [...]
}
```

**Response (200 OK):**
- Content-Type: `application/pdf`
- Body: Binary PDF data
- Headers: `Content-Disposition: attachment; filename="examiner_report_2024-01-15.pdf"`

---

#### POST /api/reports/excel
Generate an Excel examiner report.

**Request Body:** Same as PDF report.

**Response (200 OK):**
- Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- Body: Binary Excel data
- Headers: `Content-Disposition: attachment; filename="examiner_report_2024-01-15.xlsx"`

---

## Data Models

### ThesisSearchRequest
```typescript
{
  thesis_title: string;         // 5-500 chars
  thesis_abstract: string;      // 100-10,000 chars
  degree_type: "masters" | "phd";
  keywords?: string[];          // Optional, max 20 items
  supervisor_university?: string;
  supervisor_name?: string;
}
```

### ExaminerResponse
```typescript
{
  id: number;
  rank: number;
  name: string;
  university: string;
  department: string;
  email?: string;
  orcid?: string;
  openalex_id?: string;
  research_interests: string[];
  h_index: number;
  citation_count: number;
  publication_count: number;
  recent_publication_count: number;  // last 5 years
  academic_rank?: string;
  profile_url?: string;
  similarity_score: number;          // 0-100
  final_score: number;               // 0-100 weighted
  score_breakdown: {
    topic_similarity: number;        // 0-100
    h_index_score: number;           // 0-100
    citation_score: number;          // 0-100
    recent_pubs_score: number;       // 0-100
    academic_rank_score: number;     // 0-100
  };
  conflict_flags: ConflictFlag[];
  top_publications?: Publication[];
}
```

### ConflictFlag
```typescript
{
  type: string;           // e.g., "SAME_UNIVERSITY"
  description: string;
  severity: "low" | "medium" | "high";
}
```

---

## Error Response Format
All errors follow this format:
```json
{
  "detail": "Error message or validation details"
}
```

Validation errors (422):
```json
{
  "detail": [
    {
      "loc": ["body", "thesis_abstract"],
      "msg": "ensure this value has at least 100 characters",
      "type": "value_error.any_str.min_length"
    }
  ]
}
```

---

## Rate Limiting
- Default: 60 requests per minute per IP
- Search endpoint: 10 requests per minute per IP (due to external API calls)
- Report generation: 20 requests per minute per IP

---

## OpenAPI Documentation
Interactive API documentation available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- OpenAPI JSON: `http://localhost:8000/openapi.json`
