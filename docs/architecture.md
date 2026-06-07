# Examiner Finder SA - System Architecture

## Overview

Examiner Finder SA is a full-stack web application that helps postgraduate coordinators and supervisors at South African universities identify suitable thesis examiners. It combines NLP-based semantic search with researcher profile data from multiple academic APIs.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            CLIENT LAYER                                  │
│                                                                          │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                  Next.js 14 (App Router)                         │   │
│   │         TypeScript · Tailwind CSS · ShadCN UI                   │   │
│   │                                                                  │   │
│   │  ┌──────────────┐  ┌────────────────┐  ┌────────────────────┐  │   │
│   │  │ Search Form  │  │ Examiner Table │  │  Report Generator  │  │   │
│   │  └──────────────┘  └────────────────┘  └────────────────────┘  │   │
│   └─────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────┬──────────────────────────────────────┘
                                   │ HTTPS / REST API
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                            API GATEWAY (Nginx)                           │
└──────────────────────────────────┬──────────────────────────────────────┘
                                   │
        ┌──────────────────────────┼──────────────────────────┐
        ▼                          ▼                          ▼
┌───────────────┐         ┌───────────────┐         ┌───────────────┐
│  /api/*       │         │  /docs        │         │  /health      │
│  FastAPI      │         │  Swagger UI   │         │  Health Check │
└───────┬───────┘         └───────────────┘         └───────────────┘
        │
        ├──────────────────────────────────────────┐
        ▼                                          ▼
┌───────────────────┐                    ┌─────────────────────┐
│   Service Layer   │                    │   Redis Cache        │
│                   │                    │   - Embeddings       │
│ ┌───────────────┐ │                    │   - Search Results   │
│ │  NLP Service  │ │                    │   - Rate Limiting    │
│ │ (Embeddings)  │ │                    └─────────────────────┘
│ └───────────────┘ │
│ ┌───────────────┐ │
│ │  Researcher   │ │
│ │   Service     │ │
│ └───────────────┘ │
│ ┌───────────────┐ │
│ │   Ranking     │ │
│ │   Service     │ │
│ └───────────────┘ │
│ ┌───────────────┐ │
│ │   Report      │ │
│ │   Service     │ │
│ └───────────────┘ │
└────────┬──────────┘
         │
         ├──────────────────────────────────────────┐
         ▼                                          ▼
┌───────────────────┐                    ┌─────────────────────┐
│   PostgreSQL 15   │                    │  External APIs       │
│                   │                    │                      │
│ ┌───────────────┐ │                    │ ┌─────────────────┐  │
│ │  examiners    │ │                    │ │  OpenAlex API   │  │
│ └───────────────┘ │                    │ └─────────────────┘  │
│ ┌───────────────┐ │                    │ ┌─────────────────┐  │
│ │ publications  │ │                    │ │  Crossref API   │  │
│ └───────────────┘ │                    │ └─────────────────┘  │
│ ┌───────────────┐ │                    │ ┌─────────────────┐  │
│ │search_history │ │                    │ │   ORCID API     │  │
│ └───────────────┘ │                    │ └─────────────────┘  │
│ ┌───────────────┐ │                    │ ┌─────────────────┐  │
│ │search_results │ │                    │ │  OpenAI API     │  │
│ └───────────────┘ │                    │ │  (optional)     │  │
└───────────────────┘                    └─────────────────────┘
```

---

## Component Descriptions

### Frontend (Next.js 14)
- **Search Form**: Collects thesis title, abstract, degree type, keywords, and supervisor information
- **Examiner Table**: Displays ranked list with scores, metrics, and conflict flags
- **Examiner Detail Modal**: Full profile with publications, score breakdown, conflicts
- **Report Generator**: Triggers PDF/Excel export via API

### API Gateway (Nginx)
- Routes `/api/*` to FastAPI backend
- Routes all other requests to Next.js frontend
- Handles SSL termination in production

### Backend (FastAPI)
- **Search Router**: Main `/api/search` endpoint orchestrating the full pipeline
- **Examiners Router**: CRUD operations for examiner profiles
- **Reports Router**: PDF and Excel report generation
- **Health Router**: Service health check

### Service Layer
1. **NLP Service**: 
   - Uses `sentence-transformers` (all-MiniLM-L6-v2) for embeddings
   - Keyword extraction using TF-IDF
   - Research domain classification

2. **Researcher Service**:
   - OpenAlex API for researcher profiles and publications
   - Crossref API for publication metadata
   - ORCID API for verified researcher information
   - SA university affiliation filtering

3. **Ranking Service**:
   - Weighted scoring algorithm
   - Conflict of interest detection

4. **Report Service**:
   - PDF generation with ReportLab
   - Excel generation with openpyxl

### Database (PostgreSQL 15)
- Stores examiner profiles, publications, search history, and results
- Uses pgvector-compatible float arrays for embeddings
- Implements caching via search results table

### Redis
- Caches computed embeddings
- Rate limits external API calls
- Celery task queue for async processing

---

## Data Flow

### Search Pipeline

```
User Input (thesis title + abstract + degree + keywords)
    │
    ▼
1. Generate thesis embedding (sentence-transformers)
    │
    ▼
2. Extract keywords and research domains (NLP)
    │
    ▼
3. Search external APIs in parallel:
   ├── OpenAlex: search by keywords + SA institution filter
   ├── Crossref: search by keywords
   └── ORCID: enrich matched profiles
    │
    ▼
4. Filter to SA universities only
    │
    ▼
5. For each researcher:
   ├── Fetch/update profile from database
   ├── Generate researcher embedding from publications
   └── Compute cosine similarity with thesis
    │
    ▼
6. Apply ranking formula:
   - Topic Similarity (40%)
   - H-index normalized (20%)
   - Citation count normalized (15%)
   - Recent publications (15%)
   - Academic rank (10%)
    │
    ▼
7. Detect conflicts of interest
    │
    ▼
8. Return ranked list with scores and conflicts
```

---

## Deployment Architecture

### Development
```
docker-compose up
```
All services run locally with hot reload.

### Production (Azure App Service)
```
Azure Container Registry → Azure App Service (Linux Containers)
├── examiner-backend (Python 3.11)
├── examiner-frontend (Node.js 20)
└── Azure Database for PostgreSQL Flexible Server
    └── Redis Cache for Azure
```

### Environment Variables

| Variable | Service | Description |
|----------|---------|-------------|
| `DATABASE_URL` | Backend | PostgreSQL connection string |
| `REDIS_URL` | Backend | Redis connection string |
| `OPENAI_API_KEY` | Backend | OpenAI API key (optional) |
| `OPENALEX_EMAIL` | Backend | Email for OpenAlex polite pool |
| `SECRET_KEY` | Backend | JWT secret key |
| `NEXT_PUBLIC_API_URL` | Frontend | Backend API URL |

---

## Security Architecture

- All external API keys stored in environment variables
- JWT authentication for admin endpoints
- CORS configured for specific origins in production
- Input validation with Pydantic schemas
- SQL injection protection via SQLAlchemy ORM
- Rate limiting on external API calls

---

## Scalability

- Horizontal scaling: Backend is stateless, multiple instances behind load balancer
- Async processing: Long-running searches offloaded to Celery workers
- Caching: Redis caches embeddings and frequent search results
- Database: Connection pooling with SQLAlchemy
