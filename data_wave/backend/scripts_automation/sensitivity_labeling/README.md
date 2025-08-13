# Sensitivity Labeling System - Documentation

## Overview

This system provides advanced, collaborative, and context-aware sensitivity labeling for data schemas, inspired by Microsoft Purview but tailored for extensibility and integration with your backend.

## Key Features

- **Label Suggestion Engine:** Suggests labels using schema metadata, classifier results, and historical patterns.
- **Collaborative Workflow:** Multi-user proposal, voting, and consensus with audit trail.
- **Contextual Labeling:** Labels can be applied at table, column, relationship, or data flow level, including conditional logic.
- **Justification & Documentation:** All label changes require justification, stored for compliance.
- **Label Expiry & Review:** Labels can expire or require periodic review, with notification hooks.
- **Analytics & Reporting:** Endpoints for coverage, pending reviews, and label change history.
- **Integration:** Hooks for data access controls and extensibility for notifications and review cycles.

## Workflow

1. **Schema Extraction:** System extracts schema and runs classifiers.
2. **Label Suggestion:** Suggestion engine proposes labels for each object.
3. **User Review:** Users can accept, modify, or reject suggestions, providing justification.
4. **Collaborative Approval:** Multiple users review/vote; consensus is required for finalization.
5. **Audit Trail:** All actions are logged.
6. **Expiry/Review:** Labels can expire or require review; notifications are sent.
7. **Integration:** Labels can be used to enforce access controls and for analytics.

## API Endpoints

- `POST /sensitivity-labels/suggestions/`: Advanced label suggestions.
- `POST /sensitivity-labels/suggestions/{label_id}/accept`: Accept a suggestion.
- `POST /sensitivity-labels/suggestions/{proposal_id}/modify`: Modify a suggestion.
- `POST /sensitivity-labels/suggestions/{proposal_id}/reject`: Reject a suggestion.
- `POST /sensitivity-labels/proposals/{proposal_id}/vote`: Vote on a proposal.
- `GET /sensitivity-labels/analytics/coverage`: Label coverage analytics.
- `GET /sensitivity-labels/analytics/pending-reviews`: Pending reviews.
- `GET /sensitivity-labels/analytics/history`: Audit trail/history.

## Notification Hooks

- Notification stubs are present in the workflow service (see `workflow.py`).
- Extend these stubs to send emails, Slack messages, or other alerts when:
  - A label is approved or rejected.
  - A label is about to expire or needs review.

## Access Control Integration

- Use label status and type (e.g., "Highly Sensitive") to restrict access in your data access layer.
- Example: Before serving data, check if the user has permission for the label(s) applied to the data object.

## Extensibility

- Consensus rules, expiry cycles, and notification logic are configurable in the service layer.
- Add new endpoints or hooks as needed for your governance and compliance requirements.

## Further Reading

- See code comments in `api.py`, `workflow.py`, and `suggestion_engine.py` for implementation details.
- For frontend integration, ensure all sensitive actions use session-based authentication.

---

For questions or contributions, contact the backend/data governance team.
