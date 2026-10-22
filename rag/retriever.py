# from pathlib import Path
# from config import RULES_FILE

# def retrieve_business_rules(query: str, k: int = 4, custom_rules: str = "") -> list[dict]:
#     """Small local retrieval over policy text; no vector DB or embedding service needed."""
#     text = RULES_FILE.read_text(encoding="utf-8") if RULES_FILE.exists() else ""
#     rules = [line.strip("- *\t") for line in text.splitlines() if line.strip() and not line.startswith("#")]
#     rules.extend(line.strip() for line in custom_rules.splitlines() if line.strip())
#     terms = {word.strip(".,:;()[]{}").lower() for word in query.split() if len(word) > 2}
#     ranked = sorted(
#         enumerate(rules),
#         key=lambda pair: (sum(term in pair[1].lower() for term in terms), -pair[0]),
#         reverse=True,
#     )
#     return [{"text": rule, "source": RULES_FILE.name if RULES_FILE.exists() else "local_rules"}
#             for _, rule in ranked[:k]]


from config import RULES_FILE


def retrieve_business_rules(
    query: str,
    k: int = 4,
    custom_rules: str = "",
) -> list[dict]:
    """Retrieve relevant business rules using simple keyword-based ranking."""

    rules = []

    if RULES_FILE.exists():
        content = RULES_FILE.read_text(encoding="utf-8")

        for line in content.splitlines():
            line = line.strip()

            if not line or line.startswith("#"):
                continue

            line = line.lstrip("-* \t").strip()

            if line:
                rules.append({
                    "text": line,
                    "source": RULES_FILE.name,
                })

    for line in custom_rules.splitlines():
        line = line.strip().lstrip("-* \t").strip()

        if line:
            rules.append({
                "text": line,
                "source": "custom_rules",
            })

    if not rules or k <= 0:
        return []

    stop_words = {
        "the", "and", "for", "with", "from", "that", "this",
        "are", "was", "were", "has", "have", "not", "into",
        "can", "may", "should", "could", "would", "data",
    }

    query_terms = {
        word.strip(".,:;()[]{}\"'").lower()
        for word in query.split()
        if len(word.strip(".,:;()[]{}\"'")) > 2
        and word.strip(".,:;()[]{}\"'").lower() not in stop_words
    }

    ranked_rules = []

    for index, rule in enumerate(rules):
        text = rule["text"].lower()

        score = sum(
            2 if term in text.split() else 1
            for term in query_terms
            if term in text
        )

        ranked_rules.append((score, -index, rule))

    ranked_rules.sort(reverse=True, key=lambda item: (item[0], item[1]))

    relevant = [
        rule
        for score, _, rule in ranked_rules
        if score > 0
    ]

    # If nothing matches the query, return no unrelated rules.
    return relevant[:k]