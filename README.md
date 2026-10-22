# DataSleuth — Simplified Full Project

A compact full-stack implementation with:
- React + Tailwind CSS dashboard
- FastAPI backend
- LangGraph workflow nodes
- Optional Gemini investigation with a local fallback
- Lightweight local business-rule retrieval
- Human-approved repair planning, execution, verification, and rollback
- ML-readiness checks and CSV/JSON downloads

## Backend setup (PowerShell from project root)

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn main:app --reload
```

Backend: http://127.0.0.1:8000  
API docs: http://127.0.0.1:8000/docs

To enable Gemini, add your key to `.env` as `GEMINI_API_KEY=...`. Without it, analysis still runs with a transparent local fallback.

## Frontend setup (second terminal)

```powershell
cd frontend
npm install
npm run dev
```

Open http://127.0.0.1:5173.

## Demo flow
1. Load sample data or upload CSV.
2. Analyze dataset.
3. Review findings and investigation/rules.
4. Select safe repairs and approve.
5. Inspect verification and download repaired CSV/report.
6. Review ML-readiness warnings.

## Deliberate simplifications
- Single-user in-memory dataset session; backend restart clears the active dataset.
- Rule retrieval is local keyword matching, not embedding-based vector RAG.
- Only whitespace trimming and exact duplicate removal are automatic.
- Missing values, negative measures, and repeated identifiers require human review.
- No elaborate audit framework, background job queue, database, or deployment stack.
- This is a local demo starter, not a production multi-user deployment.
