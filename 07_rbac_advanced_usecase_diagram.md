# RBAC Module - Advanced Use Case Diagram

## Python-Generated Enterprise Security & Access Control Architecture

This document presents an advanced use case diagram for the RBAC Module using Python diagram-as-code with proper UML structure, showcasing comprehensive enterprise security and fine-grained access control capabilities.

```python
# Advanced RBAC Module Use Case Diagram - Python Code
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import Ellipse, FancyBboxPatch, Circle, Polygon
import numpy as np

def create_rbac_usecase_diagram():
    """
    Create advanced use case diagram for Enterprise RBAC & Security Module
    """
    fig, ax = plt.subplots(1, 1, figsize=(28, 22))
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')
    
    # System Boundary
    system_boundary = FancyBboxPatch(
        (6, 10), 88, 85,
        boxstyle="round,pad=2",
        facecolor='#fef2f2',
        edgecolor='#dc2626',
        linewidth=4,
        linestyle='-'
    )
    ax.add_patch(system_boundary)
    
    # System Title
    ax.text(50, 92, 'Enterprise RBAC & Security Module', 
            fontsize=22, fontweight='bold', ha='center', va='center',
            bbox=dict(boxstyle="round,pad=0.8", facecolor='#dc2626', edgecolor='none'),
            color='white')
    
    # Module Description
    ax.text(50, 88, 'Advanced Identity Management & Fine-Grained Access Control System', 
            fontsize=14, fontweight='normal', ha='center', va='center',
            style='italic', color='#b91c1c')
    
    # === PRIMARY ACTORS (Left Side) ===
    
    # Security Leadership
    ciso = patches.Rectangle((1, 80), 6, 8, facecolor='#fef3c7', edgecolor='#d97706', linewidth=2)
    ax.add_patch(ciso)
    ax.text(4, 84, 'Chief Security\nOfficer', fontsize=9, fontweight='bold', ha='center', va='center')
    
    security_director = patches.Rectangle((1, 70), 6, 8, facecolor='#fef3c7', edgecolor='#d97706', linewidth=2)
    ax.add_patch(security_director)
    ax.text(4, 74, 'Security\nDirector', fontsize=9, fontweight='bold', ha='center', va='center')
    
    # Security Professionals
    security_admin = patches.Rectangle((1, 57), 6, 8, facecolor='#fef2f2', edgecolor='#dc2626', linewidth=2)
    ax.add_patch(security_admin)
    ax.text(4, 61, 'Security\nAdmin', fontsize=9, fontweight='bold', ha='center', va='center')
    
    identity_admin = patches.Rectangle((1, 47), 6, 8, facecolor='#fef2f2', edgecolor='#dc2626', linewidth=2)
    ax.add_patch(identity_admin)
    ax.text(4, 51, 'Identity\nAdmin', fontsize=9, fontweight='bold', ha='center', va='center')
    
    security_analyst = patches.Rectangle((1, 37), 6, 8, facecolor='#fef2f2', edgecolor='#dc2626', linewidth=2)
    ax.add_patch(security_analyst)
    ax.text(4, 41, 'Security\nAnalyst', fontsize=9, fontweight='bold', ha='center', va='center')
    
    # System Users
    system_admin = patches.Rectangle((1, 27), 6, 8, facecolor='#dbeafe', edgecolor='#1d4ed8', linewidth=2)
    ax.add_patch(system_admin)
    ax.text(4, 31, 'System\nAdmin', fontsize=9, fontweight='bold', ha='center', va='center')
    
    end_user = patches.Rectangle((1, 17), 6, 8, facecolor='#dcfce7', edgecolor='#16a34a', linewidth=2)
    ax.add_patch(end_user)
    ax.text(4, 21, 'End\nUser', fontsize=9, fontweight='bold', ha='center', va='center')
    
    # Compliance & Audit
    compliance_officer = patches.Rectangle((1, 7), 6, 8, facecolor='#fce7f3', edgecolor='#be185d', linewidth=2)
    ax.add_patch(compliance_officer)
    ax.text(4, 11, 'Compliance\nOfficer', fontsize=9, fontweight='bold', ha='center', va='center')
    
    # === SECONDARY ACTORS (Right Side) ===
    
    # Identity Systems
    active_directory = patches.Rectangle((93, 80), 6, 8, facecolor='#e0f2f1', edgecolor='#00695c', linewidth=2)
    ax.add_patch(active_directory)
    ax.text(96, 84, 'Active\nDirectory', fontsize=9, fontweight='bold', ha='center', va='center')
    
    ldap_systems = patches.Rectangle((93, 70), 6, 8, facecolor='#e0f2f1', edgecolor='#00695c', linewidth=2)
    ax.add_patch(ldap_systems)
    ax.text(96, 74, 'LDAP\nSystems', fontsize=9, fontweight='bold', ha='center', va='center')
    
    # Security Systems
    siem_systems = patches.Rectangle((93, 60), 6, 8, facecolor='#e3f2fd', edgecolor='#1565c0', linewidth=2)
    ax.add_patch(siem_systems)
    ax.text(96, 64, 'SIEM\nSystems', fontsize=9, fontweight='bold', ha='center', va='center')
    
    security_tools = patches.Rectangle((93, 50), 6, 8, facecolor='#e3f2fd', edgecolor='#1565c0', linewidth=2)
    ax.add_patch(security_tools)
    ax.text(96, 54, 'Security\nTools', fontsize=9, fontweight='bold', ha='center', va='center')
    
    # Business Applications
    business_apps = patches.Rectangle((93, 40), 6, 8, facecolor='#fff7ed', edgecolor='#ea580c', linewidth=2)
    ax.add_patch(business_apps)
    ax.text(96, 44, 'Business\nApps', fontsize=9, fontweight='bold', ha='center', va='center')
    
    cloud_services = patches.Rectangle((93, 30), 6, 8, facecolor='#fff7ed', edgecolor='#ea580c', linewidth=2)
    ax.add_patch(cloud_services)
    ax.text(96, 34, 'Cloud\nServices', fontsize=9, fontweight='bold', ha='center', va='center')
    
    # External Systems
    mfa_systems = patches.Rectangle((93, 20), 6, 8, facecolor='#f3e5f5', edgecolor='#7b1fa2', linewidth=2)
    ax.add_patch(mfa_systems)
    ax.text(96, 24, 'MFA\nSystems', fontsize=9, fontweight='bold', ha='center', va='center')
    
    audit_systems = patches.Rectangle((93, 10), 6, 8, facecolor='#f3e5f5', edgecolor='#7b1fa2', linewidth=2)
    ax.add_patch(audit_systems)
    ax.text(96, 14, 'Audit\nSystems', fontsize=9, fontweight='bold', ha='center', va='center')
    
    # === CORE USE CASES ===
    
    # Advanced Identity Management Layer
    uc_multi_factor_auth = Ellipse((18, 82), 11, 6, facecolor='#fef3c7', edgecolor='#d97706', linewidth=3)
    ax.add_patch(uc_multi_factor_auth)
    ax.text(18, 82, 'Multi-Factor\nAuthentication', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_single_sign_on = Ellipse((32, 82), 11, 6, facecolor='#fef3c7', edgecolor='#d97706', linewidth=3)
    ax.add_patch(uc_single_sign_on)
    ax.text(32, 82, 'Single\nSign-On', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_identity_federation = Ellipse((46, 82), 11, 6, facecolor='#fef3c7', edgecolor='#d97706', linewidth=3)
    ax.add_patch(uc_identity_federation)
    ax.text(46, 82, 'Identity\nFederation', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_user_provisioning = Ellipse((60, 82), 11, 6, facecolor='#fef3c7', edgecolor='#d97706', linewidth=3)
    ax.add_patch(uc_user_provisioning)
    ax.text(60, 82, 'User\nProvisioning', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_lifecycle_mgmt = Ellipse((74, 82), 11, 6, facecolor='#fef3c7', edgecolor='#d97706', linewidth=3)
    ax.add_patch(uc_lifecycle_mgmt)
    ax.text(74, 82, 'Lifecycle\nManagement', fontsize=8, fontweight='bold', ha='center', va='center')
    
    # Fine-Grained Access Control Layer
    uc_role_based_access = Ellipse((18, 72), 11, 6, facecolor='#fef2f2', edgecolor='#dc2626', linewidth=2)
    ax.add_patch(uc_role_based_access)
    ax.text(18, 72, 'Role-Based\nAccess', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_attribute_based = Ellipse((32, 72), 11, 6, facecolor='#fef2f2', edgecolor='#dc2626', linewidth=2)
    ax.add_patch(uc_attribute_based)
    ax.text(32, 72, 'Attribute-Based\nAccess', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_dynamic_authorization = Ellipse((46, 72), 11, 6, facecolor='#fef2f2', edgecolor='#dc2626', linewidth=2)
    ax.add_patch(uc_dynamic_authorization)
    ax.text(46, 72, 'Dynamic\nAuthorization', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_contextual_access = Ellipse((60, 72), 11, 6, facecolor='#fef2f2', edgecolor='#dc2626', linewidth=2)
    ax.add_patch(uc_contextual_access)
    ax.text(60, 72, 'Contextual\nAccess', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_fine_grained_permissions = Ellipse((74, 72), 11, 6, facecolor='#fef2f2', edgecolor='#dc2626', linewidth=2)
    ax.add_patch(uc_fine_grained_permissions)
    ax.text(74, 72, 'Fine-Grained\nPermissions', fontsize=8, fontweight='bold', ha='center', va='center')
    
    # Privileged Access Management Layer
    uc_privileged_access = Ellipse((18, 62), 11, 6, facecolor='#fff7ed', edgecolor='#ea580c', linewidth=2)
    ax.add_patch(uc_privileged_access)
    ax.text(18, 62, 'Privileged\nAccess Mgmt', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_just_in_time = Ellipse((32, 62), 11, 6, facecolor='#fff7ed', edgecolor='#ea580c', linewidth=2)
    ax.add_patch(uc_just_in_time)
    ax.text(32, 62, 'Just-in-Time\nAccess', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_session_management = Ellipse((46, 62), 11, 6, facecolor='#fff7ed', edgecolor='#ea580c', linewidth=2)
    ax.add_patch(uc_session_management)
    ax.text(46, 62, 'Session\nManagement', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_privileged_monitoring = Ellipse((60, 62), 11, 6, facecolor='#fff7ed', edgecolor='#ea580c', linewidth=2)
    ax.add_patch(uc_privileged_monitoring)
    ax.text(60, 62, 'Privileged\nMonitoring', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_password_vaulting = Ellipse((74, 62), 11, 6, facecolor='#fff7ed', edgecolor='#ea580c', linewidth=2)
    ax.add_patch(uc_password_vaulting)
    ax.text(74, 62, 'Password\nVaulting', fontsize=8, fontweight='bold', ha='center', va='center')
    
    # Security Intelligence Layer
    uc_behavioral_analytics = Ellipse((18, 52), 11, 6, facecolor='#e1f5fe', edgecolor='#0277bd', linewidth=2)
    ax.add_patch(uc_behavioral_analytics)
    ax.text(18, 52, 'Behavioral\nAnalytics', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_threat_detection = Ellipse((32, 52), 11, 6, facecolor='#e1f5fe', edgecolor='#0277bd', linewidth=2)
    ax.add_patch(uc_threat_detection)
    ax.text(32, 52, 'Threat\nDetection', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_risk_assessment = Ellipse((46, 52), 11, 6, facecolor='#e1f5fe', edgecolor='#0277bd', linewidth=2)
    ax.add_patch(uc_risk_assessment)
    ax.text(46, 52, 'Risk\nAssessment', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_anomaly_detection = Ellipse((60, 52), 11, 6, facecolor='#e1f5fe', edgecolor='#0277bd', linewidth=2)
    ax.add_patch(uc_anomaly_detection)
    ax.text(60, 52, 'Anomaly\nDetection', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_security_scoring = Ellipse((74, 52), 11, 6, facecolor='#e1f5fe', edgecolor='#0277bd', linewidth=2)
    ax.add_patch(uc_security_scoring)
    ax.text(74, 52, 'Security\nScoring', fontsize=8, fontweight='bold', ha='center', va='center')
    
    # Governance & Compliance Layer
    uc_access_governance = Ellipse((18, 42), 11, 6, facecolor='#f3e8ff', edgecolor='#7c3aed', linewidth=2)
    ax.add_patch(uc_access_governance)
    ax.text(18, 42, 'Access\nGovernance', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_certification_campaigns = Ellipse((32, 42), 11, 6, facecolor='#f3e8ff', edgecolor='#7c3aed', linewidth=2)
    ax.add_patch(uc_certification_campaigns)
    ax.text(32, 42, 'Certification\nCampaigns', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_segregation_duties = Ellipse((46, 42), 11, 6, facecolor='#f3e8ff', edgecolor='#7c3aed', linewidth=2)
    ax.add_patch(uc_segregation_duties)
    ax.text(46, 42, 'Segregation\nof Duties', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_compliance_reporting = Ellipse((60, 42), 11, 6, facecolor='#f3e8ff', edgecolor='#7c3aed', linewidth=2)
    ax.add_patch(uc_compliance_reporting)
    ax.text(60, 42, 'Compliance\nReporting', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_audit_excellence = Ellipse((74, 42), 11, 6, facecolor='#f3e8ff', edgecolor='#7c3aed', linewidth=2)
    ax.add_patch(uc_audit_excellence)
    ax.text(74, 42, 'Audit\nExcellence', fontsize=8, fontweight='bold', ha='center', va='center')
    
    # Automation & Orchestration Layer
    uc_intelligent_provisioning = Ellipse((18, 32), 11, 6, facecolor='#e8f5e8', edgecolor='#388e3c', linewidth=2)
    ax.add_patch(uc_intelligent_provisioning)
    ax.text(18, 32, 'Intelligent\nProvisioning', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_workflow_automation = Ellipse((32, 32), 11, 6, facecolor='#e8f5e8', edgecolor='#388e3c', linewidth=2)
    ax.add_patch(uc_workflow_automation)
    ax.text(32, 32, 'Workflow\nAutomation', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_self_service = Ellipse((46, 32), 11, 6, facecolor='#e8f5e8', edgecolor='#388e3c', linewidth=2)
    ax.add_patch(uc_self_service)
    ax.text(46, 32, 'Self-Service\nPortal', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_approval_workflows = Ellipse((60, 32), 11, 6, facecolor='#e8f5e8', edgecolor='#388e3c', linewidth=2)
    ax.add_patch(uc_approval_workflows)
    ax.text(60, 32, 'Approval\nWorkflows', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_policy_automation = Ellipse((74, 32), 11, 6, facecolor='#e8f5e8', edgecolor='#388e3c', linewidth=2)
    ax.add_patch(uc_policy_automation)
    ax.text(74, 32, 'Policy\nAutomation', fontsize=8, fontweight='bold', ha='center', va='center')
    
    # Zero-Trust Security Layer
    uc_zero_trust = Ellipse((25, 22), 11, 6, facecolor='#fce4ec', edgecolor='#ad1457', linewidth=2)
    ax.add_patch(uc_zero_trust)
    ax.text(25, 22, 'Zero-Trust\nSecurity', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_continuous_verification = Ellipse((39, 22), 11, 6, facecolor='#fce4ec', edgecolor='#ad1457', linewidth=2)
    ax.add_patch(uc_continuous_verification)
    ax.text(39, 22, 'Continuous\nVerification', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_adaptive_authentication = Ellipse((53, 22), 11, 6, facecolor='#fce4ec', edgecolor='#ad1457', linewidth=2)
    ax.add_patch(uc_adaptive_authentication)
    ax.text(53, 22, 'Adaptive\nAuthentication', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_micro_segmentation = Ellipse((67, 22), 11, 6, facecolor='#fce4ec', edgecolor='#ad1457', linewidth=2)
    ax.add_patch(uc_micro_segmentation)
    ax.text(67, 22, 'Micro\nSegmentation', fontsize=8, fontweight='bold', ha='center', va='center')
    
    # === ACTOR-USE CASE RELATIONSHIPS ===
    
    # CISO relationships
    ax.annotate('', xy=(12.5, 82), xytext=(7, 84),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    ax.annotate('', xy=(12.5, 72), xytext=(7, 84),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    ax.annotate('', xy=(12.5, 52), xytext=(7, 84),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    ax.annotate('', xy=(19.5, 22), xytext=(7, 84),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    
    # Security Director relationships
    ax.annotate('', xy=(26.5, 82), xytext=(7, 74),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    ax.annotate('', xy=(12.5, 42), xytext=(7, 74),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    ax.annotate('', xy=(68.5, 42), xytext=(7, 74),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    ax.annotate('', xy=(68.5, 32), xytext=(7, 74),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    
    # Security Admin relationships
    ax.annotate('', xy=(12.5, 72), xytext=(7, 61),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    ax.annotate('', xy=(26.5, 72), xytext=(7, 61),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    ax.annotate('', xy=(40.5, 72), xytext=(7, 61),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    ax.annotate('', xy=(12.5, 62), xytext=(7, 61),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    
    # Identity Admin relationships
    ax.annotate('', xy=(12.5, 82), xytext=(7, 51),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    ax.annotate('', xy=(54.5, 82), xytext=(7, 51),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    ax.annotate('', xy=(68.5, 82), xytext=(7, 51),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    ax.annotate('', xy=(12.5, 32), xytext=(7, 51),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    
    # Security Analyst relationships
    ax.annotate('', xy=(12.5, 52), xytext=(7, 41),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    ax.annotate('', xy=(26.5, 52), xytext=(7, 41),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    ax.annotate('', xy=(54.5, 52), xytext=(7, 41),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    ax.annotate('', xy=(68.5, 52), xytext=(7, 41),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    
    # System Admin relationships
    ax.annotate('', xy=(40.5, 62), xytext=(7, 31),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    ax.annotate('', xy=(54.5, 62), xytext=(7, 31),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    ax.annotate('', xy=(26.5, 32), xytext=(7, 31),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    ax.annotate('', xy=(40.5, 32), xytext=(7, 31),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    
    # End User relationships
    ax.annotate('', xy=(26.5, 82), xytext=(7, 21),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    ax.annotate('', xy=(40.5, 32), xytext=(7, 21),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    ax.annotate('', xy=(47.5, 22), xytext=(7, 21),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    
    # Compliance Officer relationships
    ax.annotate('', xy=(12.5, 42), xytext=(7, 11),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    ax.annotate('', xy=(26.5, 42), xytext=(7, 11),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    ax.annotate('', xy=(54.5, 42), xytext=(7, 11),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    ax.annotate('', xy=(68.5, 42), xytext=(7, 11),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    
    # === SECONDARY ACTOR INTEGRATIONS ===
    
    # Active Directory integrations
    ax.annotate('', xy=(87, 82), xytext=(93, 84),
                arrowprops=dict(arrowstyle='<->', color='#6b7280', lw=1, linestyle='dotted'))
    ax.annotate('', xy=(87, 72), xytext=(93, 84),
                arrowprops=dict(arrowstyle='<->', color='#6b7280', lw=1, linestyle='dotted'))
    
    # LDAP Systems integrations
    ax.annotate('', xy=(87, 82), xytext=(93, 74),
                arrowprops=dict(arrowstyle='<->', color='#6b7280', lw=1, linestyle='dotted'))
    ax.annotate('', xy=(87, 32), xytext=(93, 74),
                arrowprops=dict(arrowstyle='<->', color='#6b7280', lw=1, linestyle='dotted'))
    
    # SIEM Systems integrations
    ax.annotate('', xy=(87, 52), xytext=(93, 64),
                arrowprops=dict(arrowstyle='<->', color='#6b7280', lw=1, linestyle='dotted'))
    ax.annotate('', xy=(87, 42), xytext=(93, 64),
                arrowprops=dict(arrowstyle='<->', color='#6b7280', lw=1, linestyle='dotted'))
    
    # Security Tools integrations
    ax.annotate('', xy=(87, 52), xytext=(93, 54),
                arrowprops=dict(arrowstyle='<->', color='#6b7280', lw=1, linestyle='dotted'))
    ax.annotate('', xy=(87, 22), xytext=(93, 54),
                arrowprops=dict(arrowstyle='<->', color='#6b7280', lw=1, linestyle='dotted'))
    
    # Business Apps integrations
    ax.annotate('', xy=(87, 72), xytext=(93, 44),
                arrowprops=dict(arrowstyle='<->', color='#6b7280', lw=1, linestyle='dotted'))
    ax.annotate('', xy=(87, 32), xytext=(93, 44),
                arrowprops=dict(arrowstyle='<->', color='#6b7280', lw=1, linestyle='dotted'))
    
    # Cloud Services integrations
    ax.annotate('', xy=(87, 82), xytext=(93, 34),
                arrowprops=dict(arrowstyle='<->', color='#6b7280', lw=1, linestyle='dotted'))
    ax.annotate('', xy=(87, 72), xytext=(93, 34),
                arrowprops=dict(arrowstyle='<->', color='#6b7280', lw=1, linestyle='dotted'))
    
    # MFA Systems integrations
    ax.annotate('', xy=(87, 82), xytext=(93, 24),
                arrowprops=dict(arrowstyle='<->', color='#6b7280', lw=1, linestyle='dotted'))
    ax.annotate('', xy=(87, 22), xytext=(93, 24),
                arrowprops=dict(arrowstyle='<->', color='#6b7280', lw=1, linestyle='dotted'))
    
    # Audit Systems integrations
    ax.annotate('', xy=(87, 42), xytext=(93, 14),
                arrowprops=dict(arrowstyle='<->', color='#6b7280', lw=1, linestyle='dotted'))
    ax.annotate('', xy=(87, 32), xytext=(93, 14),
                arrowprops=dict(arrowstyle='<->', color='#6b7280', lw=1, linestyle='dotted'))
    
    # === USE CASE DEPENDENCIES ===
    
    # Include relationships
    ax.annotate('', xy=(23.5, 72), xytext=(18, 82),
                arrowprops=dict(arrowstyle='->', color='#6b7280', lw=1, linestyle='dashed'))
    ax.text(20.75, 77, '<<includes>>', fontsize=6, ha='center', va='center', style='italic', rotation=60)
    
    ax.annotate('', xy=(23.5, 62), xytext=(18, 72),
                arrowprops=dict(arrowstyle='->', color='#6b7280', lw=1, linestyle='dashed'))
    ax.text(20.75, 67, '<<includes>>', fontsize=6, ha='center', va='center', style='italic', rotation=60)
    
    ax.annotate('', xy=(23.5, 52), xytext=(18, 62),
                arrowprops=dict(arrowstyle='->', color='#6b7280', lw=1, linestyle='dashed'))
    ax.text(20.75, 57, '<<includes>>', fontsize=6, ha='center', va='center', style='italic', rotation=60)
    
    ax.annotate('', xy=(37.5, 82), xytext=(32, 82),
                arrowprops=dict(arrowstyle='->', color='#6b7280', lw=1, linestyle='dashed'))
    ax.text(34.75, 84, '<<includes>>', fontsize=6, ha='center', va='bottom', style='italic')
    
    ax.annotate('', xy=(51.5, 82), xytext=(46, 82),
                arrowprops=dict(arrowstyle='->', color='#6b7280', lw=1, linestyle='dashed'))
    ax.text(48.75, 84, '<<includes>>', fontsize=6, ha='center', va='bottom', style='italic')
    
    ax.annotate('', xy=(37.5, 72), xytext=(32, 72),
                arrowprops=dict(arrowstyle='->', color='#6b7280', lw=1, linestyle='dashed'))
    ax.text(34.75, 74, '<<includes>>', fontsize=6, ha='center', va='bottom', style='italic')
    
    # Extend relationships
    ax.annotate('', xy=(33.5, 22), xytext=(25, 22),
                arrowprops=dict(arrowstyle='->', color='#9ca3af', lw=1, linestyle='dashdot'))
    ax.text(29.25, 24, '<<extends>>', fontsize=6, ha='center', va='bottom', style='italic', color='#6b7280')
    
    ax.annotate('', xy=(47.5, 22), xytext=(39, 22),
                arrowprops=dict(arrowstyle='->', color='#9ca3af', lw=1, linestyle='dashdot'))
    ax.text(43.25, 24, '<<extends>>', fontsize=6, ha='center', va='bottom', style='italic', color='#6b7280')
    
    ax.annotate('', xy=(61.5, 22), xytext=(53, 22),
                arrowprops=dict(arrowstyle='->', color='#9ca3af', lw=1, linestyle='dashdot'))
    ax.text(57.25, 24, '<<extends>>', fontsize=6, ha='center', va='bottom', style='italic', color='#6b7280')
    
    # === LEGEND AND ANNOTATIONS ===
    
    # Legend Box
    legend_box = FancyBboxPatch(
        (10, 2), 80, 6,
        boxstyle="round,pad=0.5",
        facecolor='#f9fafb',
        edgecolor='#6b7280',
        linewidth=1
    )
    ax.add_patch(legend_box)
    
    ax.text(50, 6.5, 'Enterprise RBAC & Security Module - Advanced Use Case Architecture', 
            fontsize=16, fontweight='bold', ha='center', va='center')
    
    # Actor Legend
    ax.text(13, 5, '👔 Leadership', fontsize=9, ha='left', va='center',
            bbox=dict(boxstyle="round,pad=0.2", facecolor='#fef3c7', alpha=0.7))
    ax.text(13, 4, '🔐 Security', fontsize=9, ha='left', va='center',
            bbox=dict(boxstyle="round,pad=0.2", facecolor='#fef2f2', alpha=0.7))
    ax.text(13, 3, '👤 Users', fontsize=9, ha='left', va='center',
            bbox=dict(boxstyle="round,pad=0.2", facecolor='#dbeafe', alpha=0.7))
    
    # Use Case Legend
    ax.text(28, 5, '🔑 Identity Mgmt', fontsize=9, ha='left', va='center',
            bbox=dict(boxstyle="round,pad=0.2", facecolor='#fef3c7', alpha=0.7))
    ax.text(28, 4, '🚪 Access Control', fontsize=9, ha='left', va='center',
            bbox=dict(boxstyle="round,pad=0.2", facecolor='#fef2f2', alpha=0.7))
    ax.text(28, 3, '👑 Privileged Access', fontsize=9, ha='left', va='center',
            bbox=dict(boxstyle="round,pad=0.2", facecolor='#fff7ed', alpha=0.7))
    
    ax.text(48, 5, '🧠 Intelligence', fontsize=9, ha='left', va='center',
            bbox=dict(boxstyle="round,pad=0.2", facecolor='#e1f5fe', alpha=0.7))
    ax.text(48, 4, '📋 Governance', fontsize=9, ha='left', va='center',
            bbox=dict(boxstyle="round,pad=0.2", facecolor='#f3e8ff', alpha=0.7))
    ax.text(48, 3, '🤖 Automation', fontsize=9, ha='left', va='center',
            bbox=dict(boxstyle="round,pad=0.2", facecolor='#e8f5e8', alpha=0.7))
    
    ax.text(68, 5, '🛡️ Zero-Trust', fontsize=9, ha='left', va='center',
            bbox=dict(boxstyle="round,pad=0.2", facecolor='#fce4ec', alpha=0.7))
    ax.text(68, 4, '🏢 Identity Sys', fontsize=9, ha='left', va='center',
            bbox=dict(boxstyle="round,pad=0.2", facecolor='#e0f2f1', alpha=0.7))
    ax.text(68, 3, '🔧 Security Tools', fontsize=9, ha='left', va='center',
            bbox=dict(boxstyle="round,pad=0.2", facecolor='#e3f2fd', alpha=0.7))
    
    plt.tight_layout()
    return fig

# Generate the diagram
fig = create_rbac_usecase_diagram()
plt.savefig('/workspace/rbac_usecase_diagram.png', dpi=300, bbox_inches='tight')
plt.show()
```

## RBAC Module Advanced Enterprise Security Capabilities

### Core Enterprise Security Categories

#### 1. **Advanced Identity Management Layer** 🔑
- **Multi-Factor Authentication**: Advanced MFA with biometric support and adaptive authentication
- **Single Sign-On**: Seamless SSO with SAML, OAuth, and OpenID Connect protocols
- **Identity Federation**: Cross-domain identity federation with trust relationships
- **User Provisioning**: Automated user provisioning with lifecycle management
- **Lifecycle Management**: Complete identity lifecycle from onboarding to offboarding

#### 2. **Fine-Grained Access Control Layer** 🚪
- **Role-Based Access**: Traditional RBAC with hierarchical role structures
- **Attribute-Based Access**: Advanced ABAC with policy-based access control
- **Dynamic Authorization**: Real-time authorization with contextual decision-making
- **Contextual Access**: Context-aware access control with environmental factors
- **Fine-Grained Permissions**: Granular permissions with resource-level control

#### 3. **Privileged Access Management Layer** 👑
- **Privileged Access Management**: Comprehensive PAM with elevated access control
- **Just-in-Time Access**: Temporary elevated access with time-based restrictions
- **Session Management**: Advanced session management with recording and monitoring
- **Privileged Monitoring**: Real-time monitoring of privileged activities
- **Password Vaulting**: Secure password storage and automated rotation

#### 4. **Security Intelligence Layer** 🧠
- **Behavioral Analytics**: AI-powered behavioral analysis for anomaly detection
- **Threat Detection**: Advanced threat detection with machine learning
- **Risk Assessment**: Continuous risk assessment with scoring algorithms
- **Anomaly Detection**: Real-time anomaly detection with behavioral baselines
- **Security Scoring**: Comprehensive security scoring with risk metrics

#### 5. **Governance & Compliance Layer** 📋
- **Access Governance**: Comprehensive access governance with policy management
- **Certification Campaigns**: Automated access certification with approval workflows
- **Segregation of Duties**: Advanced SoD controls with conflict detection
- **Compliance Reporting**: Automated compliance reporting with regulatory frameworks
- **Audit Excellence**: Comprehensive audit capabilities with evidence collection

#### 6. **Automation & Orchestration Layer** 🤖
- **Intelligent Provisioning**: AI-powered user provisioning with smart recommendations
- **Workflow Automation**: Advanced workflow automation with business rules
- **Self-Service Portal**: User-friendly self-service capabilities with approval workflows
- **Approval Workflows**: Configurable approval workflows with escalation management
- **Policy Automation**: Automated policy enforcement with real-time monitoring

#### 7. **Zero-Trust Security Layer** 🛡️
- **Zero-Trust Security**: Never trust, always verify with continuous validation
- **Continuous Verification**: Ongoing verification with adaptive authentication
- **Adaptive Authentication**: Risk-based authentication with contextual factors
- **Micro Segmentation**: Network micro-segmentation with application-level controls

### Advanced Security Technologies

#### **Zero-Trust Architecture**:
- Never trust, always verify approach with continuous monitoring
- Micro-segmentation with application and data-level controls
- Adaptive authentication with risk-based decision making
- Continuous verification with behavioral analytics

#### **AI-Powered Security**:
- Machine learning for behavioral analysis and anomaly detection
- Predictive analytics for risk assessment and threat prediction
- Natural language processing for policy interpretation and automation
- Deep learning for pattern recognition and fraud detection

### Actor Interaction Patterns

#### **Security Leadership**:
- **Chief Security Officer**: Strategic security oversight with risk management
- **Security Director**: Operational security management with team coordination

#### **Security Professionals**:
- **Security Administrators**: Access control management and security operations
- **Identity Administrators**: Identity lifecycle management and federation
- **Security Analysts**: Security monitoring, threat analysis, and incident response

#### **System Users**:
- **System Administrators**: Infrastructure management with privileged access
- **End Users**: Standard system access with self-service capabilities

#### **Compliance & Audit**:
- **Compliance Officers**: Compliance monitoring and regulatory reporting
- **Auditors**: Access certification and audit trail management

#### **Secondary Actors**:
- **Identity Systems**: Active Directory, LDAP, and identity providers
- **Security Systems**: SIEM, security tools, and monitoring platforms
- **Business Applications**: Enterprise applications and cloud services
- **External Systems**: MFA systems, audit systems, and compliance platforms

### Advanced Features:

#### **Enterprise Security**:
- Zero-trust security model with continuous verification
- Multi-factor authentication with biometric and adaptive capabilities
- Fine-grained access control with attribute-based policies
- Comprehensive privileged access management with session monitoring

#### **AI-Powered Intelligence**:
- Behavioral analytics with machine learning for anomaly detection
- Risk-based authentication with contextual decision making
- Predictive risk assessment with threat intelligence integration
- Automated policy enforcement with intelligent recommendations

#### **Governance Excellence**:
- Comprehensive access governance with automated certification campaigns
- Segregation of duties controls with conflict detection and resolution
- Compliance reporting with regulatory framework support
- Audit excellence with comprehensive evidence collection and reporting

This RBAC Module serves as the security backbone of the DataWave Data Governance System, providing comprehensive enterprise security and fine-grained access control capabilities with advanced AI-powered intelligence and zero-trust architecture to ensure the highest levels of security, compliance, and operational excellence.