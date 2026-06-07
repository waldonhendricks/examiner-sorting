# Examiner Finder SA

A modern web application that helps postgraduate coordinators and supervisors at South African universities identify suitable thesis examiners based on semantic analysis of a thesis abstract.

---

## Features

- **NLP-Powered Matching** — Semantic embeddings (Sentence Transformers) compare thesis content to researcher profiles
- **Multi-API Research Discovery** — Searches OpenAlex, Crossref, and ORCID for researcher profiles
- **SA University Filter** — Returns only researchers from the 15 accredited South African universities
- **Weighted Ranking** — Scores examiners on topic similarity (40%), h-index (20%), citations (15%), recent output (15%), and academic rank (10%)
- **Conflict Detection** — Flags same-university, same-department, and co-authorship conflicts
- **Export Reports** — PDF and Excel examiner recommendation reports
- **Interactive Dashboard** — Modern, responsive UI built with Next.js and ShadCN UI

---

## South African Universities Covered

| University | Abbreviation |
|-----------|-------------|
| University of Cape Town | UCT |
| Stellenbosch University | SU |
| University of Pretoria | UP |
| University of Johannesburg | UJ |
| University of the Witwatersrand | Wits |
| North-West University | NWU |
| University of KwaZulu-Natal | UKZN |
| Nelson Mandela University | NMU |
| Rhodes University | RU |
| University of the Western Cape | UWC |
| Cape Peninsula University of Technology | CPUT |
| Tshwane University of Technology | TUT |
| Durban University of Technology | DUT |
| Central University of Technology | CUT |
| Vaal University of Technology | VUT |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14, TypeScript, Tailwind CSS, ShadCN UI |
| **Backend** | Python 3.11, FastAPI, SQLAlchemy |
| **Database** | PostgreSQL 15 |
| **AI / NLP** | Sentence Transformers (all-MiniLM-L6-v2), OpenAI (optional) |
| **Cache / Queue** | Redis, Celery |
| **Reports** | ReportLab (PDF), openpyxl (Excel) |
| **Deployment** | Docker, Docker Compose, Azure App Service |

---

## Project Structure

```
examiner-finder-sa/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/
│   │   │       ├── search.py       # Main search endpoint
│   │   │       ├── examiners.py    # Examiner CRUD
│   │   │       ├── reports.py      # PDF/Excel export
│   │   │       └── health.py       # Health check
│   │   ├── core/
│   │   │   ├── config.py           # App settings
│   │   │   └── database.py         # DB connection
│   │   ├── models/
│   │   │   └── examiner.py         # SQLAlchemy models
│   │   ├── schemas/
│   │   │   └── examiner.py         # Pydantic schemas
│   │   ├── services/
│   │   │   ├── nlp_service.py      # NLP & embeddings
│   │   │   ├── researcher_service.py # API discovery
│   │   │   ├── ranking_service.py   # Scoring & ranking
│   │   │   └── report_service.py    # Report generation
│   │   └── main.py                 # FastAPI app entry point
│   ├── tests/                      # Unit tests
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/                   # Next.js frontend
│   ├── src/
│   │   ├── app/                    # App Router pages
│   │   ├── components/             # React components
│   │   │   └── ui/                 # ShadCN UI components
│   │   ├── lib/                    # Utilities & API client
│   │   └── types/                  # TypeScript types
│   ├── package.json
│   ├── tailwind.config.ts
│   └── Dockerfile
├── database/
│   ├── schema.sql                  # Full DB schema
│   └── sample_data.sql             # Sample examiner data
├── docs/
│   ├── architecture.md             # System architecture
│   ├── api-design.md               # API documentation
│   └── user-guide.md               # End-user guide
├── nginx/
│   └── nginx.conf                  # Nginx reverse proxy config
├── docker-compose.yml              # Full stack orchestration
├── .env.example                    # Environment variables template
└── README.md
```

---

## Installation

### Prerequisites

- [Docker](https://www.docker.com/get-started) 24+
- [Docker Compose](https://docs.docker.com/compose/) v2+
- (Optional) Node.js 20+ and Python 3.11+ for local development

### Quick Start (Docker)

```bash
# 1. Clone the repository
git clone https://github.com/waldonhendricks/examiner-sorting.git
cd examiner-sorting

# 2. Copy and configure environment variables
cp .env.example .env
# Edit .env with your settings (see Environment Variables section)

# 3. Start all services
docker-compose up -d

# 4. Check service health
docker-compose ps

# 5. Open the application
open http://localhost:3000
```

The API documentation is available at: http://localhost:8000/docs

### Local Development

#### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL and other settings

# Run database migrations (ensure PostgreSQL is running)
alembic upgrade head

# Start the development server
uvicorn app.main:app --reload --port 8000
```

#### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Start the development server
npm run dev
```

Open http://localhost:3000 in your browser.

---

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Database
POSTGRES_PASSWORD=your-secure-password

# Backend settings
DATABASE_URL=postgresql://examiner_user:password@localhost:5432/examiner_db
REDIS_URL=redis://localhost:6379
SECRET_KEY=your-long-random-secret-key

# External APIs
OPENALEX_EMAIL=your-email@institution.ac.za   # For OpenAlex polite pool
OPENAI_API_KEY=                                # Optional: for OpenAI embeddings

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Running Tests

### Backend Tests

```bash
cd backend
pytest tests/ -v
```

### Frontend Linting

```bash
cd frontend
npm run lint
```

---

## API Documentation

Interactive API docs are served automatically:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

For the full API design specification, see [docs/api-design.md](docs/api-design.md).

---

## Deployment

### Azure App Service

1. Build and push Docker images to Azure Container Registry:

```bash
az acr login --name yourRegistry
docker-compose build
docker tag examiner_backend yourRegistry.azurecr.io/examiner-backend:latest
docker tag examiner_frontend yourRegistry.azurecr.io/examiner-frontend:latest
docker push yourRegistry.azurecr.io/examiner-backend:latest
docker push yourRegistry.azurecr.io/examiner-frontend:latest
```

2. Deploy using Azure App Service with the Docker Compose file or individual container apps.

3. Configure Azure Database for PostgreSQL Flexible Server and Azure Cache for Redis.

4. Set environment variables in the App Service configuration.

### Environment Variables for Production

| Variable | Description |
|---------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (use Azure DB connection string) |
| `REDIS_URL` | Redis connection string (use Azure Cache connection string) |
| `SECRET_KEY` | Long random string (generate with `openssl rand -hex 32`) |
| `OPENAI_API_KEY` | OpenAI API key (optional, for enhanced embeddings) |
| `OPENALEX_EMAIL` | Your institutional email for OpenAlex polite pool |
| `NEXT_PUBLIC_API_URL` | URL of the deployed backend API |

---

## Documentation

| Document | Description |
|---------|-------------|
| [Architecture](docs/architecture.md) | System design and component diagram |
| [API Design](docs/api-design.md) | Full API specification with examples |
| [User Guide](docs/user-guide.md) | End-user instructions |

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
