# import pandas as pd

# def assess_readiness(df: pd.DataFrame, target_column: str | None = None) -> dict:
#     warnings = []
#     missing_pct = df.isna().sum().sum() / max(df.size, 1) * 100
#     if missing_pct > 5:
#         warnings.append(f"{missing_pct:.1f}% of cells are missing; define a missing-value strategy.")
#     duplicates = int(df.duplicated().sum())
#     if duplicates:
#         warnings.append(f"{duplicates} exact duplicate rows may affect training or evaluation.")
#     if target_column and target_column in df.columns:
#         target = df[target_column]
#         if target.isna().any():
#             warnings.append("The selected target contains missing labels.")
#         counts = target.dropna().value_counts(normalize=True)
#         if len(counts) < 2:
#             warnings.append("The selected target has fewer than two distinct observed values.")
#         elif counts.min() < .10:
#             warnings.append("The selected target may be imbalanced; inspect class counts.")
#     suspicious = [str(c) for c in df.columns if any(x in str(c).lower() for x in ("target_encoded", "label_copy", "leakage"))]
#     if suspicious:
#         warnings.append("Review possible leakage-related columns: " + ", ".join(suspicious))
#     if not warnings:
#         warnings.append("No major issue was flagged by these basic checks; domain-specific review is still needed.")
#     return {"missing_cell_percent": round(float(missing_pct), 2),
#             "duplicate_rows": duplicates, "warnings": warnings,
#             "note": "Basic screening only; this does not guarantee ML readiness."}


import pandas as pd


def assess_readiness(
    df: pd.DataFrame,
    target_column: str | None = None,
) -> dict:
    """Assess basic dataset readiness for machine learning."""

    issues = []
    recommendations = []
    scores = []

    if df.empty:
        return {
            "score": 0,
            "status": "Not Ready",
            "issues": ["The dataset is empty."],
            "recommendations": [
                "Load a dataset containing valid observations."
            ],
            "target_column": target_column,
        }

    row_count, column_count = df.shape

    # 1. Missing data
    missing_percent = float(
        df.isna().sum().sum() / (row_count * column_count) * 100
    ) if column_count else 0.0

    missing_score = max(0, 100 - missing_percent * 2)
    scores.append(missing_score)

    if missing_percent > 0:
        issues.append(
            f"{missing_percent:.1f}% of dataset cells contain missing values."
        )
        recommendations.append(
            "Investigate missingness and choose an appropriate "
            "imputation or exclusion strategy."
        )

    # 2. Duplicate records
    duplicate_count = int(df.duplicated().sum())
    duplicate_percent = duplicate_count / row_count * 100

    duplicate_score = max(0, 100 - duplicate_percent * 2)
    scores.append(duplicate_score)

    if duplicate_count:
        issues.append(
            f"{duplicate_count} exact duplicate row(s) were detected."
        )
        recommendations.append(
            "Determine whether duplicate records are legitimate "
            "before removing them."
        )

    # 3. Target column validation
    if target_column:
        if target_column not in df.columns:
            issues.append(
                f"Target column '{target_column}' was not found."
            )
            recommendations.append(
                "Select an existing column as the prediction target."
            )
            scores.append(0)
        else:
            target = df[target_column]
            target_missing = int(target.isna().sum())

            if target_missing:
                issues.append(
                    f"The target column contains {target_missing} "
                    "missing value(s)."
                )
                recommendations.append(
                    "Resolve missing target labels before model training."
                )

            unique_targets = int(target.nunique(dropna=True))

            if unique_targets < 2:
                issues.append(
                    "The target column has fewer than two distinct "
                    "non-missing values."
                )
                recommendations.append(
                    "Verify that the selected target is suitable "
                    "for the intended prediction task."
                )
                scores.append(0)
            else:
                scores.append(
                    max(
                        0,
                        100 - (target_missing / row_count * 100 * 2),
                    )
                )

                if pd.api.types.is_numeric_dtype(target):
                    recommendations.append(
                        "Confirm whether the target represents a "
                        "regression problem or a numeric classification label."
                    )
                else:
                    recommendations.append(
                        "Inspect target-class frequencies and check "
                        "for class imbalance."
                    )
    else:
        recommendations.append(
            "Select a target column to assess supervised-learning readiness."
        )

    # 4. Constant columns
    constant_columns = [
        str(column)
        for column in df.columns
        if df[column].nunique(dropna=True) <= 1
    ]

    if constant_columns:
        issues.append(
            "Constant or entirely missing columns: "
            + ", ".join(constant_columns)
            + "."
        )
        recommendations.append(
            "Review constant columns; they generally provide little "
            "predictive information."
        )
        scores.append(
            max(0, 100 - len(constant_columns) / column_count * 100)
        )
    else:
        scores.append(100)

    # 5. Dataset size
    if row_count < 100:
        issues.append(
            f"The dataset contains only {row_count} rows; "
            "this may limit model reliability."
        )
        recommendations.append(
            "Collect more representative observations if possible."
        )
        scores.append(min(100, row_count))
    else:
        scores.append(100)

    # This is a heuristic indicator, not a guarantee of model performance.
    score = round(sum(scores) / len(scores)) if scores else 0

    if score >= 80:
        status = "Good"
    elif score >= 60:
        status = "Needs Improvement"
    else:
        status = "Not Ready"

    return {
        "score": score,
        "status": status,
        "issues": issues,
        "recommendations": recommendations,
        "target_column": target_column,
        "row_count": int(row_count),
        "column_count": int(column_count),
        "missing_percent": round(missing_percent, 2),
        "duplicate_rows": duplicate_count,
        "constant_columns": constant_columns,
    }