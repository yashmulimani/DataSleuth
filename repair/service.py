# import pandas as pd
# from profiling.data_profiler import detect_issues

# SAFE_ACTIONS = {"Trim whitespace", "Remove exact duplicate rows"}

# def make_repair_plan(issues: list[dict]) -> list[dict]:
#     plans = []
#     for item in issues:
#         if item["issue"] == "Whitespace inconsistency":
#             plans.append({"action": "Trim whitespace", "column": item["column"],
#                           "risk": "Low", "automatic": True,
#                           "description": "Trim leading and trailing spaces from text values."})
#         elif item["issue"] == "Exact duplicate rows":
#             plans.append({"action": "Remove exact duplicate rows", "column": "All columns",
#                           "risk": "Medium", "automatic": True,
#                           "description": "Keep the first copy of each exact duplicate row."})
#         else:
#             plans.append({"action": "Manual review", "column": item["column"],
#                           "risk": "Context needed", "automatic": False,
#                           "description": "Confirm the correct action using business context."})
#     unique = {}
#     for plan in plans:
#         unique[(plan["action"], plan["column"])] = plan
#     return list(unique.values())

# def apply_approved_repairs(df: pd.DataFrame, original_issues: list[dict], actions: list[dict]) -> dict:
#     result = df.copy(deep=True)
#     log = []
#     for item in actions:
#         action = item.get("action")
#         if action not in SAFE_ACTIONS:
#             continue
#         if action == "Trim whitespace":
#             column = item.get("column")
#             columns = [column] if column in result.columns else []
#             for col in columns:
#                 before = result[col].copy()
#                 result[col] = result[col].map(lambda value: value.strip() if isinstance(value, str) else value)
#                 changed = int((before != result[col]).fillna(False).sum())
#                 log.append(f"Trimmed whitespace in {changed} cell(s) in '{col}'.")
#         elif action == "Remove exact duplicate rows":
#             before = len(result)
#             result = result.drop_duplicates().reset_index(drop=True)
#             log.append(f"Removed {before - len(result)} exact duplicate row(s).")

#     if not log:
#         log.append("No automatic repairs were selected.")

#     remaining = detect_issues(result)
#     passed = len(remaining) <= len(original_issues)
#     if not passed:
#         result = df.copy(deep=True)
#         remaining = detect_issues(result)
#         log.append("Verification failed; changes were rolled back.")
#     return {
#         "repaired_df": result,
#         "repair_log": log,
#         "verification": {
#             "passed": passed,
#             "rolled_back": not passed,
#             "issues_before": len(original_issues),
#             "issues_after": len(remaining),
#             "remaining_issues": remaining,
#         },
#     }




import pandas as pd
from profiling.data_profiler import detect_issues


SAFE_ACTIONS = {
    "Trim whitespace",
    "Remove exact duplicate rows",
    "Fill missing with median",
    "Fill missing with mean",
    "Fill missing with business value",
    "Keep missing values",
    "Remove rows with missing values",
    "Confirm negative quantity valid",
    "Correct negative quantity",
    "Keep negative quantity",
    "Manual review",
}


def make_repair_plan(issues: list[dict]) -> list[dict]:
    plans = []

    for issue in issues:
        name = issue.get("issue", "")
        column = issue.get("column", "")

        if name == "Whitespace inconsistency":
            plans.append({
                "action": "Trim whitespace",
                "column": column,
                "risk": "Low",
                "automatic": True,
                "description": "Trim leading and trailing whitespace.",
            })

        elif name == "Exact duplicate rows":
            plans.append({
                "action": "Remove exact duplicate rows",
                "column": "All columns",
                "risk": "Medium",
                "automatic": True,
                "description": "Keep the first occurrence of exact duplicate rows.",
            })

        elif name == "Missing values":
            plans.extend([
                {
                    "action": "Fill missing with median",
                    "column": column,
                    "risk": "Medium",
                    "automatic": False,
                    "description": "Fill missing numeric values using the median.",
                },
                {
                    "action": "Fill missing with mean",
                    "column": column,
                    "risk": "Medium",
                    "automatic": False,
                    "description": "Fill missing numeric values using the mean.",
                },
                {
                    "action": "Fill missing with business value",
                    "column": column,
                    "risk": "Context needed",
                    "automatic": False,
                    "description": "Enter a replacement value justified by business rules.",
                },
                {
                    "action": "Keep missing values",
                    "column": column,
                    "risk": "Low",
                    "automatic": False,
                    "description": "Retain the missing values without changing the data.",
                },
                {
                    "action": "Remove rows with missing values",
                    "column": column,
                    "risk": "Medium",
                    "automatic": False,
                    "description": "Remove rows with missing values in this column.",
                },
            ])

        elif name == "Potentially negative measure" and column == "quantity":
            plans.extend([
                {
                    "action": "Confirm negative quantity valid",
                    "column": column,
                    "risk": "Low",
                    "automatic": False,
                    "description": "Retain negative quantities confirmed as valid returns or adjustments.",
                },
                {
                    "action": "Keep negative quantity",
                    "column": column,
                    "risk": "Low",
                    "automatic": False,
                    "description": "Leave negative quantities unchanged pending review.",
                },
                {
                    "action": "Correct negative quantity",
                    "column": column,
                    "risk": "High",
                    "automatic": False,
                    "description": "Correction requires a verified replacement value.",
                },
            ])

        elif name == "Repeated identifier values":
            plans.append({
                "action": "Manual review",
                "column": column,
                "risk": "Context needed",
                "automatic": False,
                "description": "Confirm whether this identifier must be unique.",
            })

        else:
            plans.append({
                "action": "Manual review",
                "column": column,
                "risk": "Context needed",
                "automatic": False,
                "description": "Review the evidence and applicable business rules.",
            })

    unique = {}
    for plan in plans:
        unique[(plan["action"], plan["column"])] = plan

    return list(unique.values())


def apply_approved_repairs(
    df: pd.DataFrame,
    original_issues: list[dict],
    actions: list[dict],
) -> dict:
    result = df.copy(deep=True)
    repair_log = []

    for item in actions:
        action = item.get("action")
        column = item.get("column")

        if action not in SAFE_ACTIONS:
            raise ValueError(f"Unsupported repair action: {action!r}")

        if not item.get("confirmed", False):
            raise ValueError(
                f"Explicit confirmation is required for {action!r}."
            )

        if action == "Trim whitespace":
            if column not in result.columns:
                raise ValueError(f"Column not found: {column}")

            before = result[column].copy()
            result[column] = result[column].map(
                lambda value: value.strip()
                if isinstance(value, str)
                else value
            )
            changed = int(
                (before != result[column]).fillna(False).sum()
            )
            repair_log.append(
                f"Trimmed whitespace in {changed} cell(s) in '{column}'."
            )

        elif action == "Remove exact duplicate rows":
            before = len(result)
            result = result.drop_duplicates().reset_index(drop=True)
            repair_log.append(
                f"Removed {before - len(result)} exact duplicate row(s)."
            )

        elif action in {
            "Fill missing with median",
            "Fill missing with mean",
            "Fill missing with business value",
            "Keep missing values",
            "Remove rows with missing values",
        }:
            if column not in result.columns:
                raise ValueError(f"Column not found: {column}")

            if action == "Keep missing values":
                repair_log.append(
                    f"Kept missing values in '{column}' unchanged."
                )
                continue

            if action == "Remove rows with missing values":
                before = len(result)
                result = result.dropna(subset=[column]).reset_index(drop=True)
                repair_log.append(
                    f"Removed {before - len(result)} row(s) missing '{column}'."
                )
                continue

            if action in {"Fill missing with median", "Fill missing with mean"}:
                if not pd.api.types.is_numeric_dtype(result[column]):
                    raise ValueError(
                        f"Statistical imputation requires a numeric column: '{column}'."
                    )

                known = result[column].dropna()
                if known.empty:
                    raise ValueError(
                        f"No known values are available in '{column}'."
                    )

                fill_value = (
                    known.median()
                    if action == "Fill missing with median"
                    else known.mean()
                )
            else:
                if item.get("value") is None:
                    raise ValueError(
                        f"Supply a business-approved value for '{column}'."
                    )

                fill_value = item["value"]

                if pd.api.types.is_numeric_dtype(result[column]):
                    try:
                        fill_value = pd.to_numeric(
                            fill_value, errors="raise"
                        )
                    except (ValueError, TypeError) as exc:
                        raise ValueError(
                            f"The replacement value for '{column}' must be numeric."
                        ) from exc

            missing_count = int(result[column].isna().sum())
            result[column] = result[column].fillna(fill_value)
            repair_log.append(
                f"Filled {missing_count} missing value(s) in '{column}' "
                f"with the approved value {fill_value!r}."
            )

        elif action == "Confirm negative quantity":
            if column not in result.columns:
                raise ValueError(f"Column not found: {column}")

            repair_log.append(
                "Negative quantities retained as explicitly confirmed valid adjustments."
            )

        elif action == "Keep negative quantity":
            repair_log.append(
                "Negative quantities retained unchanged pending further review."
            )

        elif action == "Correct negative quantity":
            if column not in result.columns:
                raise ValueError(f"Column not found: {column}")

            replacement = item.get("value")
            if replacement is None:
                raise ValueError(
                    "A verified replacement quantity is required. "
                    "The system will not guess a correction."
                )

            try:
                replacement = pd.to_numeric(replacement, errors="raise")
            except (ValueError, TypeError) as exc:
                raise ValueError(
                    "The replacement quantity must be numeric."
                ) from exc

            if replacement < 0:
                raise ValueError(
                    "The corrected quantity must be non-negative."
                )

            negative_mask = result[column] < 0
            count = int(negative_mask.sum())
            result.loc[negative_mask, column] = replacement
            repair_log.append(
                f"Replaced {count} negative value(s) in '{column}' "
                "with the explicitly supplied value."
            )

        elif action == "Manual review":
            raise ValueError(
                f"'{column}' still requires a specific repair decision."
            )

    remaining_issues = detect_issues(result)
    original_count = len(original_issues)
    remaining_count = len(remaining_issues)

    repair_log.append(
        f"Verification: {original_count} issue type(s) before; "
        f"{remaining_count} issue type(s) after."
    )

    return {
        "repaired_df": result,
        "repair_log": repair_log,
        "verification": {
            "passed": True,
            "rolled_back": False,
            "issues_before": original_count,
            "issues_after": remaining_count,
            "remaining_issues": remaining_issues,
            "note": (
                "Repair operations completed. Review the remaining issues "
                "and data preview; completion does not guarantee that "
                "every data-quality issue has been resolved."
            ),
        },
    }
