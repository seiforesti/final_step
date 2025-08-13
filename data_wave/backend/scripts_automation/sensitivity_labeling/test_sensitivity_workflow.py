import requests

# Use container backend if needed
BASE_URL = "http://localhost:8000"  # Change to your container URL if running in Docker

# Pre-obtained session tokens for users
cookies1 = {"session_token": "GcvcSl2t4eQK2KzsmFtbMhh6FpYR98WrlJdZ3hqo4GomS83z0uN2LQREreteaQPF"}  # admin
cookies2 = {"session_token": "NweHT9YJGlZrqyepgAQvIZvS3BKfwpEmSfesP3HG0ZlfGAlflQAHLNnhuH8XYOS"}  # user

# 1. Extract schema (simulate extraction)
extract_payload = {
    "database_type": "mysql",
    "connection_uri": "mysql+pymysql://root:root@mysql-server:3306/testdb"
}
resp = requests.post(f"{BASE_URL}/extract/mysql", json=extract_payload, cookies=cookies1)
print("Extract:", resp.text)

# 2. Search for available columns after extraction
resp = requests.get(f"{BASE_URL}/search", params={"query": ""}, cookies=cookies1)
schema_info = resp.json()
print("Schema info:", schema_info)

preferred_categories = {"PII", "Sensitive", "Financial"}
candidate_columns = [entry for entry in schema_info if entry["categories"] in preferred_categories]

if not candidate_columns:
    candidate_columns = [entry for entry in schema_info if entry["column_name"].lower() != "id"]

found_suggestion = False
for entry in candidate_columns:
    table_name = entry['table_name']
    column_name = entry['column_name']
    # Use the new advanced endpoint
    resp = requests.get(f"{BASE_URL}/sensitivity-labels/suggestions/column/{column_name}", cookies=cookies1)
    if resp.status_code == 200:
        suggestions = resp.json()
        if suggestions:
            print(f"Using table: {table_name}, column: {column_name}")
            print("Suggestions:", suggestions)
            found_suggestion = True
            break
    # Try fully qualified name if not found
    fq_column = f"{table_name}.{column_name}"
    resp = requests.get(f"{BASE_URL}/sensitivity-labels/suggestions/column/{fq_column}", cookies=cookies1)
    if resp.status_code == 200:
        suggestions = resp.json()
        if suggestions:
            print(f"Using table: {table_name}, column: {fq_column}")
            print("Suggestions:", suggestions)
            column_name = fq_column
            found_suggestion = True
            break

if not found_suggestion:
    raise Exception("No label suggestions found for any candidate column.")

# 4. Accept a suggestion (as user1)
label_id = suggestions[0]["id"]
accept_payload = {
    "object_type": "column",
    "object_id": column_name,
    "justification": "Test label",
}
resp = requests.post(f"{BASE_URL}/sensitivity-labels/suggestions/{label_id}/accept", json=accept_payload, cookies=cookies1)
proposal = resp.json()
print("Proposal:", proposal)

# 5. User2 votes to approve
proposal_id = proposal["id"]
vote_payload = {"approve": True}
resp = requests.post(f"{BASE_URL}/sensitivity-labels/proposals/{proposal_id}/vote", json=vote_payload, cookies=cookies2)
print("Vote:", resp.json())

# 6. Check access control (as user1)
resp = requests.get(f"{BASE_URL}/classified/protected", cookies=cookies1)
print("Accessible columns for user1:", resp.json())

# 7. Analytics
resp = requests.get(f"{BASE_URL}/sensitivity-labels/analytics/coverage", cookies=cookies1)
print("Coverage:", resp.json())