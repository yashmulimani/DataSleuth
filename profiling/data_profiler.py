# import pandas as pd

# def profile_dataset(df: pd.DataFrame) -> dict:
#     return {
#         "rows": int(len(df)),
#         "columns": int(len(df.columns)),
#         "missing_cells": int(df.isna().sum().sum()),
#         "duplicate_rows": int(df.duplicated().sum()),
#         "missing_by_column": {str(c): int(n) for c, n in df.isna().sum().items()},
#         "column_profile": [
#             {"column": str(c), "dtype": str(df[c].dtype),
#              "missing": int(df[c].isna().sum()),
#              "unique": int(df[c].nunique(dropna=True))}
#             for c in df.columns
#         ],
#     }

# def detect_issues(df: pd.DataFrame) -> list[dict]:
#     issues = []
#     row_count = max(len(df), 1)
#     for col in df.columns:
#         count = int(df[col].isna().sum())
#         if count:
#             issues.append({
#                 "issue": "Missing values", "column": str(col), "count": count,
#                 "severity": "High" if count / row_count >= .2 else "Medium",
#                 "evidence": f"{count}/{len(df)} rows are missing ({count / row_count:.1%}).",
#             })
#         if pd.api.types.is_object_dtype(df[col]) or pd.api.types.is_string_dtype(df[col]):
#             values = df[col].dropna().astype(str)
#             spaces = int(values.str.strip().ne(values).sum())
#             if spaces:
#                 issues.append({
#                     "issue": "Whitespace inconsistency", "column": str(col), "count": spaces,
#                     "severity": "Low", "evidence": f"{spaces} text value(s) have leading/trailing spaces.",
#                 })
#     duplicates = int(df.duplicated().sum())
#     if duplicates:
#         issues.append({
#             "issue": "Exact duplicate rows", "column": "All columns", "count": duplicates,
#             "severity": "Medium", "evidence": f"{duplicates} exact duplicate row(s) found.",
#         })
#     hints = ("sales", "amount", "price", "quantity", "qty", "age", "revenue", "total")
#     for col in df.columns:
#         if any(word in str(col).lower() for word in hints) and pd.api.types.is_numeric_dtype(df[col]):
#             count = int((df[col] < 0).sum())
#             if count:
#                 issues.append({
#                     "issue": "Potentially negative measure", "column": str(col), "count": count,
#                     "severity": "High", "evidence": f"{count} negative value(s) found; confirm business meaning.",
#                 })
#     for col in df.columns:
#         if any(word in str(col).lower() for word in ("id", "key", "code")):
#             repeated = int(df[col].dropna().duplicated().sum())
#             if repeated:
#                 issues.append({
#                     "issue": "Repeated identifier values", "column": str(col), "count": repeated,
#                     "severity": "Medium", "evidence": f"{repeated} repeated value(s) in a likely identifier column.",
#                 })
#     return issues


import pandas as pd


def profile_dataset(df: pd.DataFrame) -> dict:
    """Generate a JSON-safe summary of the dataset."""

    missing_by_column = {
        str(column): int(count)
        for column, count in df.isna().sum().items()
    }

    column_profile = []

    for column in df.columns:
        series = df[column]

        column_profile.append({
            "column": str(column),
            "dtype": str(series.dtype),
            "missing": int(series.isna().sum()),
            "unique": int(series.nunique(dropna=True)),
            "missing_percent": round(
                float(series.isna().mean() * 100), 2
            ) if len(df) else 0.0,
        })

    return {
        "rows": int(len(df)),
        "columns": int(len(df.columns)),
        "missing_cells": int(df.isna().sum().sum()),
        "duplicate_rows": int(df.duplicated().sum()),
        "missing_by_column": missing_by_column,
        "column_profile": column_profile,
    }


def detect_issues(df: pd.DataFrame) -> list[dict]:
    """Detect data-quality issues without modifying the dataset."""

    issues = []
    row_count = len(df)

    if row_count == 0:
        return [{
            "issue": "Empty dataset",
            "column": "All columns",
            "count": 0,
            "severity": "High",
            "evidence": "The dataset contains no rows.",
        }]

    # 1. Missing values
    for column in df.columns:
        missing_count = int(df[column].isna().sum())

        if missing_count:
            missing_percent = missing_count / row_count * 100

            issues.append({
                "issue": "Missing values",
                "column": str(column),
                "count": missing_count,
                "severity": (
                    "High" if missing_percent >= 20 else "Medium"
                ),
                "evidence": (
                    f"{missing_count}/{row_count} rows are missing "
                    f"({missing_percent:.1f}%)."
                ),
            })

    # 2. Whitespace inconsistencies in text columns
    for column in df.columns:
        series = df[column]

        if (
            pd.api.types.is_object_dtype(series)
            or pd.api.types.is_string_dtype(series)
        ):
            text_values = series.dropna().astype(str)
            whitespace_count = int(
                text_values.str.strip().ne(text_values).sum()
            )

            if whitespace_count:
                issues.append({
                    "issue": "Whitespace inconsistency",
                    "column": str(column),
                    "count": whitespace_count,
                    "severity": "Low",
                    "evidence": (
                        f"{whitespace_count} text value(s) contain "
                        "leading or trailing whitespace."
                    ),
                })

    # 3. Exact duplicate rows
    duplicate_count = int(df.duplicated().sum())

    if duplicate_count:
        issues.append({
            "issue": "Exact duplicate rows",
            "column": "All columns",
            "count": duplicate_count,
            "severity": "Medium",
            "evidence": (
                f"{duplicate_count} exact duplicate row(s) found."
            ),
        })

    # 4. Potentially negative business measures
    measure_hints = (
        "sales", "amount", "price", "quantity", "qty",
        "age", "revenue", "total", "cost", "profit",
    )

    for column in df.columns:
        name = str(column).lower()
        series = df[column]

        if (
            any(hint in name for hint in measure_hints)
            and pd.api.types.is_numeric_dtype(series)
        ):
            negative_count = int((series.dropna() < 0).sum())

            if negative_count:
                issues.append({
                    "issue": "Potentially negative measure",
                    "column": str(column),
                    "count": negative_count,
                    "severity": "High",
                    "evidence": (
                        f"{negative_count} negative value(s) found. "
                        "Confirm whether these represent valid refunds, "
                        "reversals, adjustments, or data errors."
                    ),
                })

    # 5. Repeated values in likely identifier columns
    identifier_hints = ("id", "key", "code")

    for column in df.columns:
        name = str(column).lower()

        if any(hint in name for hint in identifier_hints):
            values = df[column].dropna()
            repeated_count = int(values.duplicated().sum())

            if repeated_count:
                issues.append({
                    "issue": "Repeated identifier values",
                    "column": str(column),
                    "count": repeated_count,
                    "severity": "Medium",
                    "evidence": (
                        f"{repeated_count} repeated value(s) found "
                        "in a possible identifier column. Confirm "
                        "whether uniqueness is required."
                    ),
                })

    return issues