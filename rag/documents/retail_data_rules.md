# Data quality and repair rules

- Missing values should not be filled with zero unless zero has a valid business meaning.
- Remove exact duplicate rows only when the source and business rules confirm that the rows are duplicates.
- Trim leading and trailing whitespace from text values when whitespace has no business meaning.
- Negative prices, quantities, sales, revenue, or ages must be checked against business rules before changing them.
- Identifier columns should be unique only when the business definition requires uniqueness.
- Keep the uploaded source data unchanged and apply repairs to a separate copy.
- Verify the dataset after each repair and review any remaining issues.
- For machine learning, inspect missing values, target labels, class imbalance, duplicates, and possible data leakage.
