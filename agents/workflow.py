# from typing import TypedDict
# from langgraph.graph import StateGraph, START, END
# from profiling.data_profiler import profile_dataset, detect_issues
# from rag.retriever import retrieve_business_rules
# from agents.investigator import investigate_finding
# from repair.service import make_repair_plan
# from ml_readiness.readiness_analyzer import assess_readiness

# class DataSleuthState(TypedDict, total=False):
#     df: object
#     custom_rules: str
#     target_column: str
#     profile: dict
#     issues: list[dict]
#     investigation: dict
#     retrieved_rules: list[dict]
#     repair_plan: list[dict]
#     ml_readiness: dict
#     workflow_status: str

# def profile_node(state):
#     return {"profile": profile_dataset(state["df"]), "workflow_status": "profiled"}

# def quality_node(state):
#     return {"issues": detect_issues(state["df"]), "workflow_status": "checked"}

# def investigation_node(state):
#     findings = state.get("issues", [])
#     query = " ".join(f'{x["issue"]} {x["column"]} {x["evidence"]}' for x in findings)
#     rules = retrieve_business_rules(query, k=4, custom_rules=state.get("custom_rules", ""))
#     if findings:
#         investigation = investigate_finding(findings[0], state["profile"], rules)
#         investigation["findings_investigated"] = len(findings)
#     else:
#         investigation = {
#             "issue_summary": "No issues were detected by the current checks.",
#             "confirmed_evidence": [], "possible_root_causes": [],
#             "recommended_actions": [], "human_review_required": False,
#             "confidence": "high", "model_note": "No investigation was needed.",
#         }
#     return {"investigation": investigation, "retrieved_rules": rules, "workflow_status": "investigated"}

# def planning_node(state):
#     return {"repair_plan": make_repair_plan(state.get("issues", [])), "workflow_status": "plan_ready"}

# def readiness_node(state):
#     return {"ml_readiness": assess_readiness(state["df"], state.get("target_column") or None),
#             "workflow_status": "complete"}

# def build_graph():
#     graph = StateGraph(DataSleuthState)
#     graph.add_node("profiler", profile_node)
#     graph.add_node("quality_checker", quality_node)
#     graph.add_node("investigator_and_rag", investigation_node)
#     graph.add_node("repair_planner", planning_node)
#     graph.add_node("ml_readiness", readiness_node)
#     graph.add_edge(START, "profiler")
#     graph.add_edge("profiler", "quality_checker")
#     graph.add_edge("quality_checker", "investigator_and_rag")
#     graph.add_edge("investigator_and_rag", "repair_planner")
#     graph.add_edge("repair_planner", "ml_readiness")
#     graph.add_edge("ml_readiness", END)
#     return graph.compile()

# def analyze_dataset(df, custom_rules="", target_column=""):
#     return build_graph().invoke({"df": df.copy(deep=True), "custom_rules": custom_rules,
#                                  "target_column": target_column})


from typing import TypedDict, Any

from langgraph.graph import StateGraph, START, END

from profiling.data_profiler import profile_dataset, detect_issues
from rag.retriever import retrieve_business_rules
from agents.investigator import investigate_finding
from repair.service import make_repair_plan
from ml_readiness.readiness_analyzer import assess_readiness


class DataSleuthState(TypedDict, total=False):
    df: Any
    custom_rules: str
    target_column: str
    selected_issue: dict
    profile: dict
    issues: list[dict]
    investigation: dict
    retrieved_rules: list[dict]
    repair_plan: list[dict]
    ml_readiness: dict
    workflow_status: str


def profile_node(state):
    return {
        "profile": profile_dataset(state["df"]),
        "workflow_status": "profiled",
    }


def quality_node(state):
    return {
        "issues": detect_issues(state["df"]),
        "workflow_status": "checked",
    }


def _same_finding(left, right):
    """Match a selected finding to a finding detected in the current dataset."""
    if not isinstance(left, dict) or not isinstance(right, dict):
        return False

    left_issue = left.get("issue") or left.get("issue_type") or left.get("rule_id")
    right_issue = right.get("issue") or right.get("issue_type") or right.get("rule_id")

    left_column = left.get("column") or left.get("field")
    right_column = right.get("column") or right.get("field")

    issue_matches = (
        str(left_issue).strip().lower() == str(right_issue).strip().lower()
    )
    column_matches = (
        str(left_column).strip().lower() == str(right_column).strip().lower()
    )

    return issue_matches and column_matches


def investigation_node(state):
    findings = state.get("issues", [])
    selected = state.get("selected_issue") or {}

    finding = None

    if findings:
        if selected:
            finding = next(
                (item for item in findings if _same_finding(item, selected)),
                None,
            )

        # Do not silently investigate a different issue when the requested
        # finding cannot be matched.
        if selected and finding is None:
            investigation = {
                "issue_summary": (
                    "The selected finding could not be matched to the "
                    "current dataset. Run the investigation again."
                ),
                "confirmed_evidence": [],
                "possible_root_causes": [],
                "recommended_actions": [
                    "Refresh the findings and select an issue from the current dataset."
                ],
                "human_review_required": True,
                "confidence": "low",
                "model_note": "Investigation stopped because the finding was stale or unmatched.",
                "findings_investigated": 0,
                "selected_finding": selected,
            }
            return {
                "investigation": investigation,
                "retrieved_rules": [],
                "workflow_status": "investigation_needs_review",
            }

        if finding is None:
            finding = findings[0]

        query = " ".join(
            str(finding.get(key, ""))
            for key in ("issue", "column", "evidence", "description")
        )

        rules = retrieve_business_rules(
            query,
            k=4,
            custom_rules=state.get("custom_rules", ""),
        )

        investigation = investigate_finding(
            finding,
            state.get("profile", {}),
            rules,
        )

        investigation["findings_investigated"] = 1
        investigation["selected_finding"] = {
            "issue": finding.get("issue", finding.get("issue_type")),
            "column": finding.get("column", finding.get("field")),
            "count": finding.get("count"),
            "severity": finding.get("severity"),
            "evidence": finding.get("evidence", finding.get("description")),
        }
    else:
        rules = retrieve_business_rules(
            "No data quality findings detected",
            k=4,
            custom_rules=state.get("custom_rules", ""),
        )

        investigation = {
            "issue_summary": "No issues were detected by the current checks.",
            "confirmed_evidence": [],
            "possible_root_causes": [],
            "recommended_actions": [],
            "human_review_required": False,
            "confidence": "high",
            "model_note": "No investigation was needed.",
            "findings_investigated": 0,
            "selected_finding": None,
        }

    return {
        "investigation": investigation,
        "retrieved_rules": rules,
        "workflow_status": "investigated",
    }


def planning_node(state):
    findings = state.get("issues", [])
    selected = state.get("selected_issue") or {}

    if selected:
        findings = [
            item for item in findings if _same_finding(item, selected)
        ]

    return {
        "repair_plan": make_repair_plan(findings),
        "workflow_status": "plan_ready",
    }


def readiness_node(state):
    return {
        "ml_readiness": assess_readiness(
            state["df"],
            state.get("target_column") or None,
        ),
        "workflow_status": "complete",
    }


def build_graph():
    graph = StateGraph(DataSleuthState)

    graph.add_node("profiler", profile_node)
    graph.add_node("quality_checker", quality_node)
    graph.add_node("investigator_and_rag", investigation_node)
    graph.add_node("repair_planner", planning_node)
    graph.add_node("ml_readiness", readiness_node)

    graph.add_edge(START, "profiler")
    graph.add_edge("profiler", "quality_checker")
    graph.add_edge("quality_checker", "investigator_and_rag")
    graph.add_edge("investigator_and_rag", "repair_planner")
    graph.add_edge("repair_planner", "ml_readiness")
    graph.add_edge("ml_readiness", END)

    return graph.compile()


def analyze_dataset(
    df,
    custom_rules="",
    target_column="",
    selected_issue=None,
    business_rules=None,
):
    """
    Run the DataSleuth workflow.

    Supports both custom_rules and business_rules so existing API callers
    can use either parameter name.
    """
    rules_text = (
        business_rules
        if business_rules is not None
        else custom_rules
    )

    initial_state = {
        "df": df.copy(deep=True),
        "custom_rules": rules_text or "",
        "target_column": target_column or "",
        "selected_issue": selected_issue or {},
    }

    return build_graph().invoke(initial_state)