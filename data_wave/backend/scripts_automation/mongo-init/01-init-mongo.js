// Initialize MongoDB for Data Governance
// This script sets up the initial MongoDB structure

// Switch to admin database
db = db.getSiblingDB('admin');

// Authenticate as root user
db.auth('admin', 'admin123');

// Create the data governance database
db = db.getSiblingDB('data_governance');

// Create collections for different data governance domains
db.createCollection('data_classifications');
db.createCollection('compliance_rules');
db.createCollection('security_controls');
db.createCollection('quality_assessments');
db.createCollection('lineage_graphs');
db.createCollection('analytics_reports');
db.createCollection('orchestration_jobs');

// Create indexes for better performance
db.data_classifications.createIndex({ "data_source_id": 1 });
db.data_classifications.createIndex({ "classification_type": 1 });
db.data_classifications.createIndex({ "created_at": -1 });

db.compliance_rules.createIndex({ "rule_type": 1 });
db.compliance_rules.createIndex({ "status": 1 });
db.compliance_rules.createIndex({ "created_at": -1 });

db.security_controls.createIndex({ "control_type": 1 });
db.security_controls.createIndex({ "status": 1 });

db.quality_assessments.createIndex({ "data_source_id": 1 });
db.quality_assessments.createIndex({ "assessment_date": -1 });

db.lineage_graphs.createIndex({ "source_id": 1 });
db.lineage_graphs.createIndex({ "target_id": 1 });

db.analytics_reports.createIndex({ "report_type": 1 });
db.analytics_reports.createIndex({ "generated_at": -1 });

db.orchestration_jobs.createIndex({ "job_type": 1 });
db.orchestration_jobs.createIndex({ "status": 1 });
db.orchestration_jobs.createIndex({ "created_at": -1 });

// Create a system info document
db.system_info.insertOne({
    "system_name": "Data Governance Platform",
    "version": "1.0.0",
    "initialized_at": new Date(),
    "collections": [
        "data_classifications",
        "compliance_rules", 
        "security_controls",
        "quality_assessments",
        "lineage_graphs",
        "analytics_reports",
        "orchestration_jobs"
    ],
    "status": "initialized"
});

print("MongoDB Data Governance database initialized successfully");
print("Collections created with appropriate indexes");
print("System info document created");
