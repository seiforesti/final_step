#!/usr/bin/env python3
import os
import sys
import argparse
import subprocess
from pathlib import Path

from uml_usecase_builder import UseCaseDiagramBuilder


BASE_DIR = Path(__file__).parent
OUT_DIR = BASE_DIR / "out"


def ensure_out_dir():
    OUT_DIR.mkdir(parents=True, exist_ok=True)


def write_and_optionally_render(name: str, builder: UseCaseDiagramBuilder, render: bool) -> Path:
    ensure_out_dir()
    puml_path = OUT_DIR / f"{name}.puml"
    builder.write(str(puml_path))
    if render:
        render_puml(puml_path)
    return puml_path


def render_puml(puml_file: Path) -> None:
    try:
        subprocess.run(["plantuml", "-tsvg", str(puml_file)], check=True, capture_output=True, text=True)
    except FileNotFoundError:
        print("plantuml not found; skipping render. Install with: sudo apt-get install plantuml or use Docker")
    except subprocess.CalledProcessError as e:
        print(f"PlantUML render failed: {e.stderr}")


def diagram_global() -> UseCaseDiagramBuilder:
    b = UseCaseDiagramBuilder(title="DataWave_Global_UseCase_Architecture")
    b.add_skinparam("skinparam roundCorner 10")
    b.add_skinparam("skinparam shadowing false")

    # Actors (selected key set from existing global file)
    b.actor("CDO", "👔 Chief Data Officer", "Executive")
    b.actor("CTO", "👔 Chief Technology Officer", "Executive")
    b.actor("CISO", "👔 Chief Information Security Officer", "Executive")
    b.actor("DataSteward", "👤 Data Steward", "Governance")
    b.actor("DataArchitect", "👤 Data Architect", "Governance")
    b.actor("ComplianceOfficer", "👤 Compliance Officer", "Governance")
    b.actor("DataEngineer", "👨‍💻 Data Engineer", "Technical")
    b.actor("DataScientist", "👨‍🔬 Data Scientist", "Technical")
    b.actor("SecurityAdmin", "🔐 Security Administrator", "Technical")
    b.actor("BusinessAnalyst", "👩‍📊 Business Analyst", "Business")
    b.actor("DomainExpert", "👩‍🏫 Domain Expert", "Business")
    b.actor("EndUser", "👤 End User", "Business")

    # External actors
    b.actor("AzureEcosystem", "☁️ Azure Ecosystem", "External")
    b.actor("ThirdPartyTools", "🔧 Third-Party Tools", "External")
    b.actor("RegulatoryBodies", "⚖️ Regulatory Bodies", "External")
    b.actor("MLPlatforms", "🤖 ML Platforms", "External")
    b.actor("AIServices", "🧠 AI Services", "External")

    sysb = b.system("🏛️ DATAWAVE DATA GOVERNANCE ECOSYSTEM", alias="System")

    # Core groups and representative use cases
    disc = sysb.group("🔍 Data Discovery & Intelligent Cataloging", alias="DataDiscovery", stereotype="DataDiscovery")
    disc.usecase("UC_IntelligentDiscovery", "🤖 Intelligent Data Discovery", "DataDiscovery")
    disc.usecase("UC_AdvancedCataloging", "📚 Advanced Data Cataloging", "DataDiscovery")
    disc.usecase("UC_SemanticSearch", "🧠 Semantic Search & Navigation", "DataDiscovery")
    disc.usecase("UC_LineageManagement", "🕸️ Advanced Lineage Management", "DataDiscovery")

    clf = sysb.group("🏷️ AI-Powered Data Classification", alias="AIClassification", stereotype="AIClassification")
    clf.usecase("UC_AutomatedClassification", "🤖 Automated Classification", "AIClassification")
    clf.usecase("UC_IntelligentLabeling", "🏷️ Intelligent Data Labeling", "AIClassification")
    clf.usecase("UC_ModelTraining", "🎓 Classification Model Training", "AIClassification")
    clf.usecase("UC_ClassificationGovernance", "📋 Classification Governance", "AIClassification")

    comp = sysb.group("📋 Comprehensive Compliance & Governance", alias="Compliance", stereotype="Compliance")
    comp.usecase("UC_RegulatoryCompliance", "⚖️ Multi-Framework Compliance", "Compliance")
    comp.usecase("UC_RiskManagement", "⚠️ Advanced Risk Management", "Compliance")
    comp.usecase("UC_PolicyOrchestration", "📜 Policy Orchestration", "Compliance")
    comp.usecase("UC_AuditExcellence", "📝 Audit Excellence", "Compliance")

    scan = sysb.group("🔍 Intelligent Scanning & Orchestration", alias="ScanOrchestration", stereotype="ScanOrchestration")
    scan.usecase("UC_ScanOrchestration", "🎯 Advanced Scan Orchestration", "ScanOrchestration")
    scan.usecase("UC_AdaptiveScanning", "⚡ Adaptive Scanning Engine", "ScanOrchestration")
    scan.usecase("UC_QualityMonitoring", "📊 Data Quality Monitoring", "ScanOrchestration")
    scan.usecase("UC_ScanIntelligence", "🧠 Scan Intelligence & Analytics", "ScanOrchestration")

    rules = sysb.group("⚙️ Intelligent Rule Processing & Management", alias="RuleProcessing", stereotype="RuleProcessing")
    rules.usecase("UC_IntelligentRuleEngine", "🧠 Intelligent Rule Engine", "RuleProcessing")
    rules.usecase("UC_AdvancedRuleManagement", "📋 Advanced Rule Management", "RuleProcessing")
    rules.usecase("UC_RuleSetOrchestration", "🎯 Rule Set Orchestration", "RuleProcessing")
    rules.usecase("UC_RuleAnalytics", "📊 Rule Analytics & Insights", "RuleProcessing")

    know = sysb.group("📚 Advanced Knowledge Management", alias="KnowledgeManagement", stereotype="KnowledgeManagement")
    know.usecase("UC_CollaborativeCataloging", "🤝 Collaborative Data Cataloging", "KnowledgeManagement")
    know.usecase("UC_SemanticKnowledgeGraphs", "🧠 Semantic Knowledge Graphs", "KnowledgeManagement")
    know.usecase("UC_IntelligentInsights", "💡 Intelligent Insights", "KnowledgeManagement")
    know.usecase("UC_KnowledgeLifecycle", "🔄 Knowledge Lifecycle Management", "KnowledgeManagement")

    sec = sysb.group("🔒 Enterprise Security & Access Control", alias="Security", stereotype="Security")
    sec.usecase("UC_IdentityManagement", "👤 Advanced Identity Management", "Security")
    sec.usecase("UC_AccessControl", "🚪 Fine-Grained Access Control", "Security")
    sec.usecase("UC_SecurityMonitoring", "👁️ Security Monitoring & Threat Detection", "Security")
    sec.usecase("UC_DataProtection", "🛡️ Advanced Data Protection", "Security")

    racine = sysb.group("👑 Racine Master Orchestration", alias="RacineOrchestration", stereotype="RacineOrchestration")
    racine.usecase("UC_MasterOrchestration", "🎭 Master System Orchestration", "RacineOrchestration")
    racine.usecase("UC_WorkspaceManagement", "🏢 Advanced Workspace Management", "RacineOrchestration")
    racine.usecase("UC_AIAssistance", "🤖 AI-Powered Assistance", "RacineOrchestration")
    racine.usecase("UC_AdvancedCollaboration", "🤝 Advanced Collaboration", "RacineOrchestration")

    # Key actor relations (subset representative)
    b.relation("CDO", "UC_IntelligentDiscovery", "Strategic Data Discovery")
    b.relation("CTO", "UC_ScanOrchestration", "Technical Strategy")
    b.relation("CISO", "UC_SecurityMonitoring", "Security Strategy")
    b.relation("DataSteward", "UC_AdvancedCataloging", "Catalog Management")
    b.relation("DataArchitect", "UC_PolicyOrchestration", "Governance Framework")
    b.relation("ComplianceOfficer", "UC_RegulatoryCompliance", "Compliance Management")
    b.relation("DataEngineer", "UC_AdaptiveScanning", "Performance Optimization")
    b.relation("DataScientist", "UC_ModelTraining", "Model Training")
    b.relation("SecurityAdmin", "UC_AccessControl", "Access Management")
    b.relation("BusinessAnalyst", "UC_IntelligentInsights", "Business Intelligence")
    b.relation("DomainExpert", "UC_IntelligentLabeling", "Domain Knowledge")
    b.relation("EndUser", "UC_SemanticSearch", "Self-Service Discovery")

    # External dashed relations
    b.relation("AzureEcosystem", "UC_ScanOrchestration", "Cloud Integration", dashed=True)
    b.relation("ThirdPartyTools", "UC_AdvancedCataloging", "Tool Integration", dashed=True)
    b.relation("RegulatoryBodies", "UC_RegulatoryCompliance", "Compliance Requirements", dashed=True)
    b.relation("MLPlatforms", "UC_ModelTraining", "Model Training", dashed=True)
    b.relation("AIServices", "UC_AutomatedClassification", "Pattern Recognition", dashed=True)

    # Includes / Extends
    b.include("UC_IntelligentDiscovery", "UC_AdvancedCataloging")
    b.include("UC_AutomatedClassification", "UC_IntelligentLabeling")
    b.include("UC_RegulatoryCompliance", "UC_AuditExcellence")
    b.include("UC_ScanOrchestration", "UC_AdaptiveScanning")
    b.include("UC_IdentityManagement", "UC_AccessControl")

    b.extend("UC_SemanticSearch", "UC_AdvancedCataloging")
    b.extend("UC_AdvancedCollaboration", "UC_WorkspaceManagement")
    b.extend("UC_SecurityMonitoring", "UC_DataProtection")

    return b


def diagram_datasource() -> UseCaseDiagramBuilder:
    b = UseCaseDiagramBuilder(title="DataWave_DataSource_Module_UseCases")
    b.add_skinparam("skinparam roundCorner 10")
    # Actors
    b.actor("DS_DATA_ENGINEER", "👨‍💻 Data Engineer", "Technical")
    b.actor("DS_DATA_ARCHITECT", "👤 Data Architect", "Governance")
    b.actor("DS_SYSTEM_ADMIN", "⚙️ System Administrator", "Technical")
    b.actor("DS_DATA_STEWARD", "👤 Data Steward", "Governance")
    b.actor("DS_COMPLIANCE_OFFICER", "👤 Compliance Officer", "Governance")
    b.actor("DS_BUSINESS_ANALYST", "👩‍📊 Business Analyst", "Business")
    b.actor("DS_DOMAIN_EXPERT", "👩‍🏫 Domain Expert", "Business")

    sysb = b.system("🗄️ DATASOURCE MANAGEMENT MODULE", alias="DATASOURCE_SYSTEM")

    # Groups
    disc = sysb.group("🔍 Intelligent Data Discovery", alias="DS_DISCOVERY_UC", stereotype="DataDiscovery")
    disc.usecase("UC_AUTO_DISCOVERY", "🤖 Automated Discovery", "DataDiscovery")
    disc.usecase("UC_SCHEMA_ANALYSIS", "📋 Schema Analysis", "DataDiscovery")
    disc.usecase("UC_METADATA_EXTRACTION", "📊 Metadata Extraction", "DataDiscovery")
    disc.usecase("UC_EDGE_DISCOVERY", "🌐 Edge Discovery", "DataDiscovery")

    conn = sysb.group("🔗 Advanced Connection Management", alias="DS_CONNECTION_UC", stereotype="ScanOrchestration")
    conn.usecase("UC_CONNECTION_SETUP", "⚙️ Connection Setup", "ScanOrchestration")
    conn.usecase("UC_CONNECTION_POOLING", "🏊 Connection Pooling", "ScanOrchestration")
    conn.usecase("UC_SECURITY_MANAGEMENT", "🔒 Security Management", "Security")
    conn.usecase("UC_CONNECTION_MONITORING", "📊 Connection Monitoring", "ScanOrchestration")

    mgmt = sysb.group("📋 Data Source Management", alias="DS_MANAGEMENT_UC", stereotype="KnowledgeManagement")
    mgmt.usecase("UC_SOURCE_REGISTRATION", "📝 Source Registration", "KnowledgeManagement")
    mgmt.usecase("UC_SOURCE_VALIDATION", "✅ Source Validation", "KnowledgeManagement")
    mgmt.usecase("UC_SOURCE_LIFECYCLE", "🔄 Source Lifecycle", "KnowledgeManagement")
    mgmt.usecase("UC_SOURCE_OPTIMIZATION", "⚡ Source Optimization", "KnowledgeManagement")

    integ = sysb.group("🔗 Integration & Synchronization", alias="DS_INTEGRATION_UC", stereotype="RuleProcessing")
    integ.usecase("UC_PIPELINE_INTEGRATION", "🔄 Pipeline Integration", "RuleProcessing")
    integ.usecase("UC_DATA_SYNCHRONIZATION", "🔄 Data Synchronization", "RuleProcessing")
    integ.usecase("UC_FEDERATION_MANAGEMENT", "🌐 Federation Management", "RuleProcessing")
    integ.usecase("UC_API_MANAGEMENT", "🌐 API Management", "RuleProcessing")

    # Relations (subset)
    b.relation("DS_DATA_ENGINEER", "UC_AUTO_DISCOVERY")
    b.relation("DS_DATA_ENGINEER", "UC_CONNECTION_SETUP")
    b.relation("DS_DATA_ENGINEER", "UC_PIPELINE_INTEGRATION")
    b.relation("DS_DATA_ARCHITECT", "UC_SCHEMA_ANALYSIS")
    b.relation("DS_SYSTEM_ADMIN", "UC_CONNECTION_MONITORING")
    b.relation("DS_DATA_STEWARD", "UC_SOURCE_REGISTRATION")
    b.relation("DS_COMPLIANCE_OFFICER", "UC_SECURITY_MANAGEMENT")
    b.relation("DS_BUSINESS_ANALYST", "UC_AUTO_DISCOVERY")
    b.relation("DS_DOMAIN_EXPERT", "UC_SOURCE_VALIDATION")

    # Includes / Extends
    b.include("UC_AUTO_DISCOVERY", "UC_SCHEMA_ANALYSIS")
    b.include("UC_SCHEMA_ANALYSIS", "UC_METADATA_EXTRACTION")
    b.include("UC_CONNECTION_SETUP", "UC_SECURITY_MANAGEMENT")
    b.include("UC_PIPELINE_INTEGRATION", "UC_DATA_SYNCHRONIZATION")
    b.extend("UC_EDGE_DISCOVERY", "UC_AUTO_DISCOVERY")
    b.extend("UC_SOURCE_OPTIMIZATION", "UC_SOURCE_LIFECYCLE")

    return b


def diagram_classification() -> UseCaseDiagramBuilder:
    b = UseCaseDiagramBuilder(title="DataWave_Classification_Module_UseCases")
    b.actor("CL_DATA_SCIENTIST", "👨‍🔬 Data Scientist", "Technical")
    b.actor("CL_DATA_STEWARD", "👤 Data Steward", "Governance")
    b.actor("CL_COMPLIANCE_OFFICER", "👤 Compliance Officer", "Governance")
    b.actor("CL_ENGINEER", "👨‍💻 ML Engineer", "Technical")
    sysb = b.system("🏷️ DATA CLASSIFICATION MODULE", alias="CLASSIFICATION_SYSTEM")

    core = sysb.group("🤖 Automated & Manual Classification", alias="CL_CORE", stereotype="AIClassification")
    core.usecase("UC_AUTO_CLASSIFY", "🤖 Automated Classification", "AIClassification")
    core.usecase("UC_MANUAL_CLASSIFY", "✋ Manual Classification", "AIClassification")
    core.usecase("UC_MANAGE_LABELS", "🏷️ Manage Labels", "AIClassification")
    core.usecase("UC_SENSITIVITY_ANALYSIS", "🔍 Sensitivity Analysis", "AIClassification")

    ml = sysb.group("🎓 Model Lifecycle", alias="CL_ML", stereotype="AIClassification")
    ml.usecase("UC_MODEL_TRAINING", "🎓 Model Training", "AIClassification")
    ml.usecase("UC_MODEL_VALIDATION", "✅ Model Validation", "AIClassification")
    ml.usecase("UC_MODEL_DEPLOYMENT", "🚀 Model Deployment", "AIClassification")
    ml.usecase("UC_MODEL_MONITORING", "📊 Model Monitoring", "AIClassification")

    gov = sysb.group("📋 Classification Governance", alias="CL_GOV", stereotype="Compliance")
    gov.usecase("UC_RULE_MANAGEMENT", "📋 Classification Rules", "Compliance")
    gov.usecase("UC_QUALITY_REVIEW", "🔎 Quality Review & Approval", "Compliance")
    gov.usecase("UC_AUDIT_TRAIL", "📜 Audit Trail", "Compliance")

    # Relations
    b.relation("CL_DATA_SCIENTIST", "UC_MODEL_TRAINING")
    b.relation("CL_ENGINEER", "UC_MODEL_DEPLOYMENT")
    b.relation("CL_DATA_STEWARD", "UC_MANUAL_CLASSIFY")
    b.relation("CL_COMPLIANCE_OFFICER", "UC_RULE_MANAGEMENT")
    b.include("UC_AUTO_CLASSIFY", "UC_SENSITIVITY_ANALYSIS")
    b.extend("UC_MANUAL_CLASSIFY", "UC_AUTO_CLASSIFY")
    b.include("UC_MODEL_MONITORING", "UC_AUDIT_TRAIL")
    return b


def diagram_compliance() -> UseCaseDiagramBuilder:
    b = UseCaseDiagramBuilder(title="DataWave_Compliance_Module_UseCases")
    b.actor("CP_COMPLIANCE_OFFICER", "👤 Compliance Officer", "Governance")
    b.actor("CP_CISO", "👔 CISO", "Executive")
    b.actor("CP_AUDITOR", "🔎 Auditor", "External")
    sysb = b.system("⚖️ COMPLIANCE & GOVERNANCE MODULE", alias="COMPLIANCE_SYSTEM")

    pol = sysb.group("📜 Policy & Control", alias="CP_POLICY", stereotype="Compliance")
    pol.usecase("UC_POLICY_DEF", "📜 Policy Definition", "Compliance")
    pol.usecase("UC_CONTROL_MAPPING", "🧭 Control Mapping", "Compliance")
    pol.usecase("UC_EXCEPTION_MGMT", "🚨 Exception Management", "Compliance")

    mon = sysb.group("📊 Monitoring & Risk", alias="CP_MON", stereotype="Compliance")
    mon.usecase("UC_COMPLIANCE_MONITOR", "📊 Compliance Monitoring", "Compliance")
    mon.usecase("UC_RISK_ASSESS", "⚠️ Risk Assessment", "Compliance")
    mon.usecase("UC_REPORTING", "📑 Regulatory Reporting", "Compliance")

    aud = sysb.group("📝 Audit & Evidence", alias="CP_AUDIT", stereotype="Compliance")
    aud.usecase("UC_AUDIT_TRAIL", "📜 Audit Trail", "Compliance")
    aud.usecase("UC_EVIDENCE", "📁 Evidence Collection", "Compliance")
    aud.usecase("UC_CERTIFICATION", "✅ Certification Support", "Compliance")

    b.relation("CP_COMPLIANCE_OFFICER", "UC_POLICY_DEF")
    b.relation("CP_CISO", "UC_RISK_ASSESS")
    b.relation("CP_AUDITOR", "UC_AUDIT_TRAIL")
    b.include("UC_COMPLIANCE_MONITOR", "UC_RISK_ASSESS")
    b.include("UC_REPORTING", "UC_AUDIT_TRAIL")
    return b


def diagram_scan_logic() -> UseCaseDiagramBuilder:
    b = UseCaseDiagramBuilder(title="DataWave_Scan_Logic_Module_UseCases")
    b.actor("SL_ENGINEER", "👨‍💻 Data Engineer", "Technical")
    b.actor("SL_OPERATOR", "🛠️ Operator", "Technical")
    sysb = b.system("🔍 SCAN LOGIC MODULE", alias="SCAN_LOGIC_SYSTEM")

    orch = sysb.group("⚙️ Orchestration", alias="SL_ORCH", stereotype="ScanOrchestration")
    orch.usecase("UC_SCHEDULE", "🗓️ Schedule Scans", "ScanOrchestration")
    orch.usecase("UC_PARALLEL", "⚡ Parallel Execution", "ScanOrchestration")
    orch.usecase("UC_RETRY", "🔁 Failure Recovery", "ScanOrchestration")

    execg = sysb.group("🚀 Execution Engine", alias="SL_EXEC", stereotype="ScanOrchestration")
    execg.usecase("UC_RUNTIME_OPT", "⚙️ Runtime Optimization", "ScanOrchestration")
    execg.usecase("UC_RESOURCE_SCALE", "📈 Adaptive Scaling", "ScanOrchestration")
    execg.usecase("UC_METRICS", "📊 Execution Metrics", "ScanOrchestration")

    b.relation("SL_ENGINEER", "UC_SCHEDULE")
    b.relation("SL_OPERATOR", "UC_RETRY")
    b.include("UC_PARALLEL", "UC_RESOURCE_SCALE")
    b.include("UC_RUNTIME_OPT", "UC_METRICS")
    return b


def diagram_scan_rule_sets() -> UseCaseDiagramBuilder:
    b = UseCaseDiagramBuilder(title="DataWave_Scan_Rule_Sets_Module_UseCases")
    b.actor("SR_STEWARD", "👤 Data Steward", "Governance")
    b.actor("SR_ENGINEER", "👨‍💻 Data Engineer", "Technical")
    sysb = b.system("⚙️ SCAN RULE SETS MODULE", alias="SCAN_RULES_SYSTEM")

    mg = sysb.group("📋 Rule Set Management", alias="SR_MGMT", stereotype="RuleProcessing")
    mg.usecase("UC_RULESET_CREATE", "📝 Create Rule Sets", "RuleProcessing")
    mg.usecase("UC_RULESET_VERSION", "🧬 Version Control", "RuleProcessing")
    mg.usecase("UC_RULESET_APPROVE", "✅ Approval Workflow", "RuleProcessing")

    ex = sysb.group("🎯 Execution & Analytics", alias="SR_EXEC", stereotype="RuleProcessing")
    ex.usecase("UC_RULESET_EXEC", "🚀 Execute Rule Sets", "RuleProcessing")
    ex.usecase("UC_RULESET_ANALYTICS", "📊 Rule Analytics", "RuleProcessing")

    b.relation("SR_STEWARD", "UC_RULESET_CREATE")
    b.relation("SR_ENGINEER", "UC_RULESET_EXEC")
    b.include("UC_RULESET_APPROVE", "UC_RULESET_CREATE")
    b.include("UC_RULESET_ANALYTICS", "UC_RULESET_EXEC")
    return b


def diagram_data_catalog() -> UseCaseDiagramBuilder:
    b = UseCaseDiagramBuilder(title="DataWave_Data_Catalog_Module_UseCases")
    b.actor("DC_STEWARD", "👤 Data Steward", "Governance")
    b.actor("DC_ANALYST", "👩‍📊 Business Analyst", "Business")
    sysb = b.system("📚 DATA CATALOG MODULE", alias="DATA_CATALOG_SYSTEM")

    cat = sysb.group("📖 Cataloging", alias="DC_CAT", stereotype="DataDiscovery")
    cat.usecase("UC_ASSET_REG", "📝 Asset Registration", "DataDiscovery")
    cat.usecase("UC_METADATA_MGMT", "📊 Metadata Management", "DataDiscovery")
    cat.usecase("UC_LINEAGE", "🔗 Lineage Management", "DataDiscovery")

    search = sysb.group("🔎 Search & Browse", alias="DC_SEARCH", stereotype="KnowledgeManagement")
    search.usecase("UC_ADV_SEARCH", "🔎 Advanced Search", "KnowledgeManagement")
    search.usecase("UC_SEM_SEARCH", "🧠 Semantic Search", "KnowledgeManagement")
    search.usecase("UC_USAGE", "📈 Usage Analytics", "KnowledgeManagement")

    b.relation("DC_STEWARD", "UC_ASSET_REG")
    b.relation("DC_ANALYST", "UC_ADV_SEARCH")
    b.include("UC_ADV_SEARCH", "UC_SEM_SEARCH")
    b.include("UC_METADATA_MGMT", "UC_LINEAGE")
    return b


def diagram_rbac() -> UseCaseDiagramBuilder:
    b = UseCaseDiagramBuilder(title="DataWave_RBAC_Module_UseCases")
    b.actor("RBAC_SECURITY_ADMIN", "🔐 Security Administrator", "Technical")
    b.actor("RBAC_AUDITOR", "🔎 Auditor", "External")
    sysb = b.system("🔒 RBAC & ACCESS CONTROL MODULE", alias="RBAC_SYSTEM")

    idm = sysb.group("👤 Identity & User Management", alias="RBAC_IDM", stereotype="Security")
    idm.usecase("UC_USER_PROVISION", "➕ User Provisioning", "Security")
    idm.usecase("UC_AUTH", "🔑 Authentication & SSO", "Security")
    idm.usecase("UC_ID_LIFECYCLE", "🔄 Identity Lifecycle", "Security")

    ac = sysb.group("🛡️ Access Control", alias="RBAC_AC", stereotype="Security")
    ac.usecase("UC_ROLE_MGMT", "🗝️ Role Management", "Security")
    ac.usecase("UC_POLICY_ENF", "📜 Policy Enforcement", "Security")
    ac.usecase("UC_ACCESS_REVIEW", "🧾 Access Reviews", "Security")

    secmon = sysb.group("👁️ Security Monitoring", alias="RBAC_MON", stereotype="Security")
    secmon.usecase("UC_ACCESS_LOG", "📋 Access Logging", "Security")
    secmon.usecase("UC_THREAT_DETECT", "🚨 Threat Detection", "Security")
    secmon.usecase("UC_INCIDENT_RESP", "🧯 Incident Response", "Security")

    b.relation("RBAC_SECURITY_ADMIN", "UC_ROLE_MGMT")
    b.relation("RBAC_SECURITY_ADMIN", "UC_POLICY_ENF")
    b.relation("RBAC_AUDITOR", "UC_ACCESS_LOG")
    b.include("UC_ACCESS_REVIEW", "UC_ROLE_MGMT")
    b.include("UC_POLICY_ENF", "UC_AUTH")
    return b

def main():
    parser = argparse.ArgumentParser(description="Generate DataWave Use Case Diagrams (.puml)")
    parser.add_argument("--render", action="store_true", help="Render to SVG using PlantUML if available")
    parser.add_argument("--only", choices=["global", "datasource", "classification", "compliance", "scan_logic", "scan_rule_sets", "data_catalog", "rbac"], help="Generate only a specific diagram")
    args = parser.parse_args()

    mapping = {
        "global": diagram_global,
        "datasource": diagram_datasource,
        "classification": diagram_classification,
        "compliance": diagram_compliance,
        "scan_logic": diagram_scan_logic,
        "scan_rule_sets": diagram_scan_rule_sets,
        "data_catalog": diagram_data_catalog,
        "rbac": diagram_rbac,
    }

    if args.only:
        name = args.only
        builder = mapping[name]()
        path = write_and_optionally_render(name, builder, args.render)
        print(f"Wrote: {path}")
        return

    # Generate all available in this first batch
    for name, fn in mapping.items():
        builder = fn()
        path = write_and_optionally_render(name, builder, args.render)
        print(f"Wrote: {path}")


if __name__ == "__main__":
    main()

