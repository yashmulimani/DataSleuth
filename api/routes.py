# from __future__ import annotations

# import io
# import json
# import math
# from pathlib import Path

# import numpy as np
# import pandas as pd
# from fastapi import APIRouter, UploadFile, File, HTTPException
# from fastapi.responses import StreamingResponse
# from pydantic import BaseModel, Field

# from ingestion.csv_loader import read_csv_bytes
# from profiling.data_profiler import profile_dataset, detect_issues
# from agents.workflow import analyze_dataset
# from repair.service import apply_approved_repairs

# router = APIRouter()

# # Simple in-memory session for a local demo. Restarting the backend clears it.
# SESSION = {"df": None, "analysis": None, "repair": None, "filename": None}


# class AnalyzeRequest(BaseModel):
#     target_column: str | None = None
#     business_rules: str = ""


# class RepairRequest(BaseModel):
#     actions: list[dict] = Field(default_factory=list)


# def make_json_safe(value):
#     """Recursively convert pandas/NumPy values into strict JSON-safe values."""
#     if value is None or value is pd.NA or value is pd.NaT:
#         return None

#     if isinstance(value, dict):
#         return {str(key): make_json_safe(item) for key, item in value.items()}

#     if isinstance(value, (list, tuple, set)):
#         return [make_json_safe(item) for item in value]

#     # Handle NumPy scalars before ordinary Python scalar checks.
#     if isinstance(value, np.generic):
#         return make_json_safe(value.item())

#     if isinstance(value, np.ndarray):
#         return make_json_safe(value.tolist())

#     if isinstance(value, pd.Series):
#         return make_json_safe(value.tolist())

#     if isinstance(value, pd.DataFrame):
#         return make_json_safe(value.to_dict(orient="records"))

#     if isinstance(value, float):
#         return value if math.isfinite(value) else None

#     if isinstance(value, pd.Timestamp):
#         return value.isoformat()

#     if isinstance(value, Path):
#         return str(value)

#     return value


# def dataset_preview(df: pd.DataFrame, limit: int = 100) -> list[dict]:
#     """Build a preview where missing cells are represented as JSON null."""
#     records = df.head(limit).to_dict(orient="records")
#     return make_json_safe(records)


# @router.post("/upload")
# async def upload_dataset(file: UploadFile = File(...)):
#     if not file.filename or not file.filename.lower().endswith(".csv"):
#         raise HTTPException(400, "Please upload a CSV file.")

#     try:
#         df = read_csv_bytes(await file.read())
#     except Exception as exc:
#         raise HTTPException(400, f"Could not read CSV: {exc}") from exc

#     if df.empty:
#         raise HTTPException(400, "The CSV has no data rows.")

#     SESSION.update(df=df, analysis=None, repair=None, filename=file.filename)
#     return make_json_safe({
#         "filename": file.filename,
#         "profile": profile_dataset(df),
#         "preview": dataset_preview(df),
#     })


# @router.post("/sample")
# def load_sample():
#     sample_path = Path(__file__).resolve().parent.parent / "data" / "sample_sales.csv"
#     try:
#         df = pd.read_csv(sample_path)
#     except Exception as exc:
#         raise HTTPException(500, f"Could not load the sample dataset: {exc}") from exc

#     SESSION.update(df=df, analysis=None, repair=None, filename="sample_sales.csv")
#     return make_json_safe({
#         "filename": "sample_sales.csv",
#         "profile": profile_dataset(df),
#         "preview": dataset_preview(df),
#     })


# @router.get("/dataset")
# def get_dataset():
#     df = SESSION["df"]
#     if df is None:
#         raise HTTPException(404, "Upload a CSV or load the sample dataset first.")

#     return make_json_safe({
#         "filename": SESSION["filename"],
#         "profile": profile_dataset(df),
#         "preview": dataset_preview(df),
#     })


# @router.post("/analyze")
# def analyze(request: AnalyzeRequest):
#     df = SESSION["df"]
#     if df is None:
#         raise HTTPException(400, "Upload a dataset first.")

#     result = analyze_dataset(df, request.business_rules, request.target_column or "")
#     result = make_json_safe(result)
#     SESSION["analysis"] = result
#     SESSION["repair"] = None
#     return result


# @router.post("/repair")
# def repair(request: RepairRequest):
#     df, analysis = SESSION["df"], SESSION["analysis"]
#     if df is None or analysis is None:
#         raise HTTPException(400, "Analyze the dataset before requesting repairs.")

#     result = apply_approved_repairs(df, analysis["issues"], request.actions)
#     SESSION["repair"] = result

#     return make_json_safe({
#         "repair_log": result["repair_log"],
#         "verification": result["verification"],
#         "preview": dataset_preview(result["repaired_df"]),
#         "profile": profile_dataset(result["repaired_df"]),
#         "issues_after": detect_issues(result["repaired_df"]),
#     })


# @router.get("/download/repaired")
# def download_repaired():
#     result = SESSION["repair"]
#     if not result:
#         raise HTTPException(404, "Apply a repair before downloading.")

#     stream = io.BytesIO(result["repaired_df"].to_csv(index=False).encode("utf-8"))
#     return StreamingResponse(
#         stream,
#         media_type="text/csv",
#         headers={"Content-Disposition": 'attachment; filename="datasleuth_repaired.csv"'},
#     )


# @router.get("/download/report")
# def download_report():
#     df, analysis, repair_result = SESSION["df"], SESSION["analysis"], SESSION["repair"]
#     if df is None or analysis is None:
#         raise HTTPException(404, "Analyze a dataset before downloading the report.")

#     repaired_df = repair_result["repaired_df"] if repair_result else None
#     report = make_json_safe({
#         "filename": SESSION["filename"],
#         "profile_before": profile_dataset(df),
#         "issues_before": analysis["issues"],
#         "investigation": analysis["investigation"],
#         "retrieved_rules": analysis["retrieved_rules"],
#         "repair_log": repair_result["repair_log"] if repair_result else [],
#         "profile_after": profile_dataset(repaired_df) if repaired_df is not None else None,
#         "issues_after": detect_issues(repaired_df) if repaired_df is not None else None,
#         "ml_readiness": analysis["ml_readiness"],
#     })

#     stream = io.BytesIO(json.dumps(report, indent=2, allow_nan=False).encode("utf-8"))
#     return StreamingResponse(
#         stream,
#         media_type="application/json",
#         headers={"Content-Disposition": 'attachment; filename="datasleuth_report.json"'},
#     )


from __future__ import annotations

import io
import json

import pandas as pd
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from profiling.data_profiler import profile_dataset, detect_issues
from agents.workflow import analyze_dataset
from repair.service import apply_approved_repairs


router = APIRouter()
SESSION = {
    "df": None,
    "filename": None,
    "analysis": None,
    "repair": None,
}


class AnalyzeRequest(BaseModel):
    business_rules: str = ""
    target_column: str | None = None
    selected_issue: dict | None = None


class RepairAction(BaseModel):
    action: str
    column: str
    confirmed: bool = False
    value: object = None


class RepairRequest(BaseModel):
    actions: list[RepairAction] = Field(default_factory=list)


def make_json_safe(value):
    if isinstance(value, dict):
        return {str(k): make_json_safe(v) for k, v in value.items()}
    if isinstance(value, list):
        return [make_json_safe(v) for v in value]
    if isinstance(value, tuple):
        return [make_json_safe(v) for v in value]
    if isinstance(value, pd.DataFrame):
        return make_json_safe(value.to_dict(orient="records"))
    if hasattr(value, "item"):
        try:
            return make_json_safe(value.item())
        except (ValueError, TypeError):
            pass
    if pd.isna(value) if not isinstance(value, (dict, list, tuple)) else False:
        return None
    return value


def dataset_preview(df: pd.DataFrame):
    return make_json_safe(df.head(100).to_dict(orient="records"))


def get_dataframe(payload):
    if isinstance(payload, pd.DataFrame):
        return payload
    if isinstance(payload, dict) and "df" in payload:
        return pd.DataFrame(payload["df"])
    raise ValueError("Could not read the dataset from the analysis result.")


@router.post("/upload")
async def upload_csv(file):
    # Keep your existing upload implementation if it already works.
    from fastapi import UploadFile
    from ingestion.csv_loader import read_csv_bytes

    if not isinstance(file, UploadFile):
        raise HTTPException(400, "Upload a CSV file.")

    try:
        df = read_csv_bytes(await file.read())
    except Exception as exc:
        raise HTTPException(400, f"Could not read CSV: {exc}") from exc

    SESSION.update(
        df=df,
        filename=file.filename or "dataset.csv",
        analysis=None,
        repair=None,
    )
    return make_json_safe({
        "filename": SESSION["filename"],
        "profile": profile_dataset(df),
        "preview": dataset_preview(df),
    })


@router.post("/sample")
def load_sample():
    from pathlib import Path

    candidates = [
        Path("sample_sales.csv"),
        Path("data/sample_sales.csv"),
        Path("datasets/sample_sales.csv"),
    ]
    path = next((p for p in candidates if p.exists()), None)

    if path is None:
        raise HTTPException(
            404,
            "Sample CSV not found. Upload a CSV file instead.",
        )

    df = pd.read_csv(path)
    SESSION.update(
        df=df,
        filename=path.name,
        analysis=None,
        repair=None,
    )
    return make_json_safe({
        "filename": SESSION["filename"],
        "profile": profile_dataset(df),
        "preview": dataset_preview(df),
    })


@router.post("/analyze")
def analyze(request: AnalyzeRequest):
    df = SESSION["df"]
    if df is None:
        raise HTTPException(400, "Upload or load a dataset first.")

    try:
        result = analyze_dataset(
            df,
            request.business_rules,
            request.target_column or "",
            request.selected_issue,
        )
    except Exception as exc:
        raise HTTPException(500, f"Analysis failed: {exc}") from exc

    result = make_json_safe(result)
    SESSION["analysis"] = result
    SESSION["repair"] = None
    return result


@router.post("/repair")
def repair(request: RepairRequest):
    df = SESSION["df"]
    analysis = SESSION["analysis"]

    if df is None or analysis is None:
        raise HTTPException(400, "Analyze the dataset before repairing.")

    if not request.actions:
        raise HTTPException(400, "Select at least one repair action.")

    # Manual and destructive actions always require explicit confirmation.
    for item in request.actions:
        action = item.action
        column = item.column

        if not item.confirmed:
            raise HTTPException(
                400,
                f"Confirm the action '{action}' for '{column}' before applying it.",
            )

        if action == "Fill missing with business value":
            if item.value is None:
                raise HTTPException(
                    400,
                    f"Supply a business-defined replacement value for '{column}'.",
                )

    actions = [
        {
            "action": item.action,
            "column": item.column,
            "value": item.value,
            "confirmed": item.confirmed,
        }
        for item in request.actions
    ]

    try:
        result = apply_approved_repairs(df, analysis["issues"], actions)
    except (ValueError, KeyError) as exc:
        raise HTTPException(400, str(exc)) from exc
    except Exception as exc:
        raise HTTPException(500, f"Repair failed: {exc}") from exc

    repaired_df = result["repaired_df"]
    remaining = detect_issues(repaired_df)

    # Keep the original dataset intact; store the repaired copy separately.
    SESSION["repair"] = result

    return make_json_safe({
        "repair_log": result["repair_log"],
        "verification": result["verification"],
        "preview": dataset_preview(repaired_df),
        "profile": profile_dataset(repaired_df),
        "issues_after": remaining,
    })


@router.get("/download/repaired")
def download_repaired():
    result = SESSION["repair"]
    if not result:
        raise HTTPException(404, "Apply a repair before downloading.")

    stream = io.BytesIO(
        result["repaired_df"].to_csv(index=False).encode("utf-8")
    )
    return StreamingResponse(
        stream,
        media_type="text/csv",
        headers={
            "Content-Disposition":
                'attachment; filename="datasleuth_repaired.csv"'
        },
    )


@router.get("/download/report")
def download_report():
    df = SESSION["df"]
    analysis = SESSION["analysis"]
    repair_result = SESSION["repair"]

    if df is None or analysis is None:
        raise HTTPException(404, "Analyze a dataset before downloading the report.")

    repaired_df = repair_result["repaired_df"] if repair_result else None

    report = make_json_safe({
        "filename": SESSION["filename"],
        "profile_before": profile_dataset(df),
        "issues_before": analysis.get("issues", []),
        "investigation": analysis.get("investigation", {}),
        "retrieved_rules": analysis.get("retrieved_rules", []),
        "repair_log": repair_result["repair_log"] if repair_result else [],
        "profile_after": profile_dataset(repaired_df) if repaired_df is not None else None,
        "issues_after": detect_issues(repaired_df) if repaired_df is not None else None,
        "ml_readiness": analysis.get("ml_readiness", {}),
    })

    stream = io.BytesIO(
        json.dumps(report, indent=2, allow_nan=False).encode("utf-8")
    )
    return StreamingResponse(
        stream,
        media_type="application/json",
        headers={
            "Content-Disposition":
                'attachment; filename="datasleuth_report.json"'
        },
    )
