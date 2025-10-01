# Advanced Data Source Module Use Case Diagram - Python Code
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import Ellipse, FancyBboxPatch, Circle
import numpy as np

def create_datasource_usecase_diagram():
    """
    Create advanced use case diagram for Data Source Management Module
    """
    fig, ax = plt.subplots(1, 1, figsize=(26, 20))
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')
    
    # System Boundary
    system_boundary = FancyBboxPatch(
        (8, 12), 84, 82,
        boxstyle="round,pad=2",
        facecolor='#f0f9ff',
        edgecolor='#0369a1',
        linewidth=4,
        linestyle='-'
    )
    ax.add_patch(system_boundary)
    
    # System Title
    ax.text(50, 90, 'Data Source Management Module', 
            fontsize=22, fontweight='bold', ha='center', va='center',
            bbox=dict(boxstyle="round,pad=0.8", facecolor='#0369a1', edgecolor='none'),
            color='white')
    
    # Module Description
    ax.text(50, 86, 'Intelligent Data Discovery & Connection Management System', 
            fontsize=14, fontweight='normal', ha='center', va='center',
            style='italic', color='#1e40af')
    
    # === PRIMARY ACTORS (Left Side) ===
    
    # Technical Professionals
    data_engineer = patches.Rectangle((1, 75), 6, 8, facecolor='#dbeafe', edgecolor='#1d4ed8', linewidth=2)
    ax.add_patch(data_engineer)
    ax.text(4, 79, 'Data\nEngineer', fontsize=9, fontweight='bold', ha='center', va='center')
    
    data_architect = patches.Rectangle((1, 65), 6, 8, facecolor='#dbeafe', edgecolor='#1d4ed8', linewidth=2)
    ax.add_patch(data_architect)
    ax.text(4, 69, 'Data\nArchitect', fontsize=9, fontweight='bold', ha='center', va='center')
    
    system_admin = patches.Rectangle((1, 55), 6, 8, facecolor='#dbeafe', edgecolor='#1d4ed8', linewidth=2)
    ax.add_patch(system_admin)
    ax.text(4, 59, 'System\nAdmin', fontsize=9, fontweight='bold', ha='center', va='center')
    
    # Governance Professionals
    data_steward = patches.Rectangle((1, 42), 6, 8, facecolor='#dcfce7', edgecolor='#16a34a', linewidth=2)
    ax.add_patch(data_steward)
    ax.text(4, 46, 'Data\nSteward', fontsize=9, fontweight='bold', ha='center', va='center')
    
    compliance_officer = patches.Rectangle((1, 32), 6, 8, facecolor='#dcfce7', edgecolor='#16a34a', linewidth=2)
    ax.add_patch(compliance_officer)
    ax.text(4, 36, 'Compliance\nOfficer', fontsize=9, fontweight='bold', ha='center', va='center')
    
    # Business Users
    business_analyst = patches.Rectangle((1, 22), 6, 8, facecolor='#fce7f3', edgecolor='#be185d', linewidth=2)
    ax.add_patch(business_analyst)
    ax.text(4, 26, 'Business\nAnalyst', fontsize=9, fontweight='bold', ha='center', va='center')
    
    # === SECONDARY ACTORS (Right Side) ===
    
    # Database Systems
    databases = patches.Rectangle((93, 75), 6, 8, facecolor='#fed7aa', edgecolor='#ea580c', linewidth=2)
    ax.add_patch(databases)
    ax.text(96, 79, 'Database\nSystems', fontsize=9, fontweight='bold', ha='center', va='center')
    
    # Cloud Storage
    cloud_storage = patches.Rectangle((93, 65), 6, 8, facecolor='#fed7aa', edgecolor='#ea580c', linewidth=2)
    ax.add_patch(cloud_storage)
    ax.text(96, 69, 'Cloud\nStorage', fontsize=9, fontweight='bold', ha='center', va='center')
    
    # ETL Tools
    etl_tools = patches.Rectangle((93, 55), 6, 8, facecolor='#fed7aa', edgecolor='#ea580c', linewidth=2)
    ax.add_patch(etl_tools)
    ax.text(96, 59, 'ETL/ELT\nTools', fontsize=9, fontweight='bold', ha='center', va='center')
    
    # API Services
    api_services = patches.Rectangle((93, 45), 6, 8, facecolor='#fed7aa', edgecolor='#ea580c', linewidth=2)
    ax.add_patch(api_services)
    ax.text(96, 49, 'API\nServices', fontsize=9, fontweight='bold', ha='center', va='center')
    
    # Monitoring Systems
    monitoring = patches.Rectangle((93, 35), 6, 8, facecolor='#fed7aa', edgecolor='#ea580c', linewidth=2)
    ax.add_patch(monitoring)
    ax.text(96, 39, 'Monitoring\nSystems', fontsize=9, fontweight='bold', ha='center', va='center')
    
    # === CORE USE CASES ===
    
    # Intelligent Discovery Layer
    uc_auto_discovery = Ellipse((20, 78), 10, 5, facecolor='#dcfce7', edgecolor='#16a34a', linewidth=2)
    ax.add_patch(uc_auto_discovery)
    ax.text(20, 78, 'Automated\nDiscovery', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_schema_analysis = Ellipse((35, 78), 10, 5, facecolor='#dcfce7', edgecolor='#16a34a', linewidth=2)
    ax.add_patch(uc_schema_analysis)
    ax.text(35, 78, 'Schema\nAnalysis', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_metadata_extraction = Ellipse((50, 78), 10, 5, facecolor='#dcfce7', edgecolor='#16a34a', linewidth=2)
    ax.add_patch(uc_metadata_extraction)
    ax.text(50, 78, 'Metadata\nExtraction', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_edge_discovery = Ellipse((65, 78), 10, 5, facecolor='#dcfce7', edgecolor='#16a34a', linewidth=2)
    ax.add_patch(uc_edge_discovery)
    ax.text(65, 78, 'Edge\nDiscovery', fontsize=8, fontweight='bold', ha='center', va='center')
    
    # Connection Management Layer
    uc_connection_setup = Ellipse((20, 68), 10, 5, facecolor='#dbeafe', edgecolor='#2563eb', linewidth=2)
    ax.add_patch(uc_connection_setup)
    ax.text(20, 68, 'Connection\nSetup', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_connection_pooling = Ellipse((35, 68), 10, 5, facecolor='#dbeafe', edgecolor='#2563eb', linewidth=2)
    ax.add_patch(uc_connection_pooling)
    ax.text(35, 68, 'Connection\nPooling', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_security_mgmt = Ellipse((50, 68), 10, 5, facecolor='#dbeafe', edgecolor='#2563eb', linewidth=2)
    ax.add_patch(uc_security_mgmt)
    ax.text(50, 68, 'Security\nManagement', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_connection_monitoring = Ellipse((65, 68), 10, 5, facecolor='#dbeafe', edgecolor='#2563eb', linewidth=2)
    ax.add_patch(uc_connection_monitoring)
    ax.text(65, 68, 'Connection\nMonitoring', fontsize=8, fontweight='bold', ha='center', va='center')
    
    # Data Source Management Layer
    uc_source_registration = Ellipse((20, 58), 10, 5, facecolor='#fff7ed', edgecolor='#ea580c', linewidth=2)
    ax.add_patch(uc_source_registration)
    ax.text(20, 58, 'Source\nRegistration', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_source_validation = Ellipse((35, 58), 10, 5, facecolor='#fff7ed', edgecolor='#ea580c', linewidth=2)
    ax.add_patch(uc_source_validation)
    ax.text(35, 58, 'Source\nValidation', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_lifecycle_mgmt = Ellipse((50, 58), 10, 5, facecolor='#fff7ed', edgecolor='#ea580c', linewidth=2)
    ax.add_patch(uc_lifecycle_mgmt)
    ax.text(50, 58, 'Lifecycle\nManagement', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_source_optimization = Ellipse((65, 58), 10, 5, facecolor='#fff7ed', edgecolor='#ea580c', linewidth=2)
    ax.add_patch(uc_source_optimization)
    ax.text(65, 58, 'Source\nOptimization', fontsize=8, fontweight='bold', ha='center', va='center')
    
    # Integration & Synchronization Layer
    uc_pipeline_integration = Ellipse((20, 48), 10, 5, facecolor='#f3e8ff', edgecolor='#7c3aed', linewidth=2)
    ax.add_patch(uc_pipeline_integration)
    ax.text(20, 48, 'Pipeline\nIntegration', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_data_sync = Ellipse((35, 48), 10, 5, facecolor='#f3e8ff', edgecolor='#7c3aed', linewidth=2)
    ax.add_patch(uc_data_sync)
    ax.text(35, 48, 'Data\nSynchronization', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_federation_mgmt = Ellipse((50, 48), 10, 5, facecolor='#f3e8ff', edgecolor='#7c3aed', linewidth=2)
    ax.add_patch(uc_federation_mgmt)
    ax.text(50, 48, 'Federation\nManagement', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_api_mgmt = Ellipse((65, 48), 10, 5, facecolor='#f3e8ff', edgecolor='#7c3aed', linewidth=2)
    ax.add_patch(uc_api_mgmt)
    ax.text(65, 48, 'API\nManagement', fontsize=8, fontweight='bold', ha='center', va='center')
    
    # AI-Powered Features Layer
    uc_intelligent_recommendations = Ellipse((20, 38), 10, 5, facecolor='#fef3c7', edgecolor='#d97706', linewidth=3)
    ax.add_patch(uc_intelligent_recommendations)
    ax.text(20, 38, 'Intelligent\nRecommendations', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_anomaly_detection = Ellipse((35, 38), 10, 5, facecolor='#fef3c7', edgecolor='#d97706', linewidth=3)
    ax.add_patch(uc_anomaly_detection)
    ax.text(35, 38, 'Anomaly\nDetection', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_predictive_analytics = Ellipse((50, 38), 10, 5, facecolor='#fef3c7', edgecolor='#d97706', linewidth=3)
    ax.add_patch(uc_predictive_analytics)
    ax.text(50, 38, 'Predictive\nAnalytics', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_auto_optimization = Ellipse((65, 38), 10, 5, facecolor='#fef3c7', edgecolor='#d97706', linewidth=3)
    ax.add_patch(uc_auto_optimization)
    ax.text(65, 38, 'Auto\nOptimization', fontsize=8, fontweight='bold', ha='center', va='center')
    
    # Monitoring & Analytics Layer
    uc_performance_monitoring = Ellipse((20, 28), 10, 5, facecolor='#ecfdf5', edgecolor='#059669', linewidth=2)
    ax.add_patch(uc_performance_monitoring)
    ax.text(20, 28, 'Performance\nMonitoring', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_usage_analytics = Ellipse((35, 28), 10, 5, facecolor='#ecfdf5', edgecolor='#059669', linewidth=2)
    ax.add_patch(uc_usage_analytics)
    ax.text(35, 28, 'Usage\nAnalytics', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_health_monitoring = Ellipse((50, 28), 10, 5, facecolor='#ecfdf5', edgecolor='#059669', linewidth=2)
    ax.add_patch(uc_health_monitoring)
    ax.text(50, 28, 'Health\nMonitoring', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_alerting_system = Ellipse((65, 28), 10, 5, facecolor='#ecfdf5', edgecolor='#059669', linewidth=2)
    ax.add_patch(uc_alerting_system)
    ax.text(65, 28, 'Advanced\nAlerting', fontsize=8, fontweight='bold', ha='center', va='center')
    
    # Security & Compliance Layer
    uc_access_control = Ellipse((27.5, 18), 10, 5, facecolor='#fef2f2', edgecolor='#dc2626', linewidth=2)
    ax.add_patch(uc_access_control)
    ax.text(27.5, 18, 'Access\nControl', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_data_encryption = Ellipse((42.5, 18), 10, 5, facecolor='#fef2f2', edgecolor='#dc2626', linewidth=2)
    ax.add_patch(uc_data_encryption)
    ax.text(42.5, 18, 'Data\nEncryption', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_compliance_monitoring = Ellipse((57.5, 18), 10, 5, facecolor='#fef2f2', edgecolor='#dc2626', linewidth=2)
    ax.add_patch(uc_compliance_monitoring)
    ax.text(57.5, 18, 'Compliance\nMonitoring', fontsize=8, fontweight='bold', ha='center', va='center')
    
    # === ACTOR-USE CASE RELATIONSHIPS ===
    
    # Data Engineer relationships
    ax.annotate('', xy=(15, 78), xytext=(7, 79),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    ax.annotate('', xy=(15, 68), xytext=(7, 79),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    ax.annotate('', xy=(15, 48), xytext=(7, 79),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    ax.annotate('', xy=(15, 28), xytext=(7, 79),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    
    # Data Architect relationships
    ax.annotate('', xy=(30, 78), xytext=(7, 69),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    ax.annotate('', xy=(45, 78), xytext=(7, 69),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    ax.annotate('', xy=(45, 48), xytext=(7, 69),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    ax.annotate('', xy=(15, 38), xytext=(7, 69),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    
    # System Admin relationships
    ax.annotate('', xy=(60, 68), xytext=(7, 59),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    ax.annotate('', xy=(60, 58), xytext=(7, 59),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    ax.annotate('', xy=(45, 28), xytext=(7, 59),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    
    # Data Steward relationships
    ax.annotate('', xy=(15, 58), xytext=(7, 46),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    ax.annotate('', xy=(30, 58), xytext=(7, 46),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    ax.annotate('', xy=(45, 58), xytext=(7, 46),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    ax.annotate('', xy=(30, 28), xytext=(7, 46),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    
    # Compliance Officer relationships
    ax.annotate('', xy=(22, 18), xytext=(7, 36),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    ax.annotate('', xy=(37, 18), xytext=(7, 36),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    ax.annotate('', xy=(52, 18), xytext=(7, 36),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    
    # Business Analyst relationships
    ax.annotate('', xy=(15, 78), xytext=(7, 26),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    ax.annotate('', xy=(30, 28), xytext=(7, 26),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    ax.annotate('', xy=(45, 38), xytext=(7, 26),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    
    # === SECONDARY ACTOR INTEGRATIONS ===
    
    # Database Systems integrations
    ax.annotate('', xy=(85, 78), xytext=(93, 79),
                arrowprops=dict(arrowstyle='<->', color='#6b7280', lw=1, linestyle='dotted'))
    ax.annotate('', xy=(85, 68), xytext=(93, 79),
                arrowprops=dict(arrowstyle='<->', color='#6b7280', lw=1, linestyle='dotted'))
    
    # Cloud Storage integrations
    ax.annotate('', xy=(85, 78), xytext=(93, 69),
                arrowprops=dict(arrowstyle='<->', color='#6b7280', lw=1, linestyle='dotted'))
    ax.annotate('', xy=(85, 48), xytext=(93, 69),
                arrowprops=dict(arrowstyle='<->', color='#6b7280', lw=1, linestyle='dotted'))
    
    # ETL Tools integrations
    ax.annotate('', xy=(85, 48), xytext=(93, 59),
                arrowprops=dict(arrowstyle='<->', color='#6b7280', lw=1, linestyle='dotted'))
    ax.annotate('', xy=(85, 58), xytext=(93, 59),
                arrowprops=dict(arrowstyle='<->', color='#6b7280', lw=1, linestyle='dotted'))
    
    # API Services integrations
    ax.annotate('', xy=(85, 48), xytext=(93, 49),
                arrowprops=dict(arrowstyle='<->', color='#6b7280', lw=1, linestyle='dotted'))
    ax.annotate('', xy=(85, 68), xytext=(93, 49),
                arrowprops=dict(arrowstyle='<->', color='#6b7280', lw=1, linestyle='dotted'))
    
    # Monitoring Systems integrations
    ax.annotate('', xy=(85, 28), xytext=(93, 39),
                arrowprops=dict(arrowstyle='<->', color='#6b7280', lw=1, linestyle='dotted'))
    
    # === USE CASE DEPENDENCIES ===
    
    # Include relationships
    ax.annotate('', xy=(30, 78), xytext=(25, 78),
                arrowprops=dict(arrowstyle='->', color='#6b7280', lw=1, linestyle='dashed'))
    ax.text(27.5, 80, '<<includes>>', fontsize=6, ha='center', va='bottom', style='italic')
    
    ax.annotate('', xy=(45, 78), xytext=(40, 78),
                arrowprops=dict(arrowstyle='->', color='#6b7280', lw=1, linestyle='dashed'))
    ax.text(42.5, 80, '<<includes>>', fontsize=6, ha='center', va='bottom', style='italic')
    
    ax.annotate('', xy=(30, 68), xytext=(25, 68),
                arrowprops=dict(arrowstyle='->', color='#6b7280', lw=1, linestyle='dashed'))
    ax.text(27.5, 70, '<<includes>>', fontsize=6, ha='center', va='bottom', style='italic')
    
    ax.annotate('', xy=(30, 58), xytext=(25, 58),
                arrowprops=dict(arrowstyle='->', color='#6b7280', lw=1, linestyle='dashed'))
    ax.text(27.5, 60, '<<includes>>', fontsize=6, ha='center', va='bottom', style='italic')
    
    # Extend relationships
    ax.annotate('', xy=(60, 78), xytext=(25, 78),
                arrowprops=dict(arrowstyle='->', color='#9ca3af', lw=1, linestyle='dashdot'))
    ax.text(42.5, 75, '<<extends>>', fontsize=6, ha='center', va='bottom', style='italic', color='#6b7280')
    
    ax.annotate('', xy=(60, 58), xytext=(25, 58),
                arrowprops=dict(arrowstyle='->', color='#9ca3af', lw=1, linestyle='dashdot'))
    ax.text(42.5, 55, '<<extends>>', fontsize=6, ha='center', va='bottom', style='italic', color='#6b7280')
    
    # === LEGEND AND ANNOTATIONS ===
    
    # Legend Box
    legend_box = FancyBboxPatch(
        (12, 4), 76, 6,
        boxstyle="round,pad=0.5",
        facecolor='#f9fafb',
        edgecolor='#6b7280',
        linewidth=1
    )
    ax.add_patch(legend_box)
    
    ax.text(50, 8.5, 'Data Source Management Module - Advanced Use Case Architecture', 
            fontsize=16, fontweight='bold', ha='center', va='center')
    
    # Actor Legend
    ax.text(15, 6.5, '👨‍💻 Technical', fontsize=9, ha='left', va='center',
            bbox=dict(boxstyle="round,pad=0.2", facecolor='#dbeafe', alpha=0.7))
    ax.text(15, 5.5, '👤 Governance', fontsize=9, ha='left', va='center',
            bbox=dict(boxstyle="round,pad=0.2", facecolor='#dcfce7', alpha=0.7))
    ax.text(15, 4.5, '👩‍💼 Business', fontsize=9, ha='left', va='center',
            bbox=dict(boxstyle="round,pad=0.2", facecolor='#fce7f3', alpha=0.7))
    
    # Use Case Legend
    ax.text(35, 6.5, '🔍 Discovery', fontsize=9, ha='left', va='center',
            bbox=dict(boxstyle="round,pad=0.2", facecolor='#dcfce7', alpha=0.7))
    ax.text(35, 5.5, '🔗 Connection', fontsize=9, ha='left', va='center',
            bbox=dict(boxstyle="round,pad=0.2", facecolor='#dbeafe', alpha=0.7))
    ax.text(35, 4.5, '📊 Management', fontsize=9, ha='left', va='center',
            bbox=dict(boxstyle="round,pad=0.2", facecolor='#fff7ed', alpha=0.7))
    
    ax.text(55, 6.5, '🔄 Integration', fontsize=9, ha='left', va='center',
            bbox=dict(boxstyle="round,pad=0.2", facecolor='#f3e8ff', alpha=0.7))
    ax.text(55, 5.5, '🤖 AI Features', fontsize=9, ha='left', va='center',
            bbox=dict(boxstyle="round,pad=0.2", facecolor='#fef3c7', alpha=0.7))
    ax.text(55, 4.5, '📈 Monitoring', fontsize=9, ha='left', va='center',
            bbox=dict(boxstyle="round,pad=0.2", facecolor='#ecfdf5', alpha=0.7))
    
    ax.text(75, 6.5, '🔒 Security', fontsize=9, ha='left', va='center',
            bbox=dict(boxstyle="round,pad=0.2", facecolor='#fef2f2', alpha=0.7))
    ax.text(75, 5.5, '🗄️ External', fontsize=9, ha='left', va='center',
            bbox=dict(boxstyle="round,pad=0.2", facecolor='#fed7aa', alpha=0.7))
    
    plt.tight_layout()
    return fig

# Generate the diagram
fig = create_datasource_usecase_diagram()
plt.savefig('/workspace/datasource_usecase_diagram.png', dpi=300, bbox_inches='tight')
plt.show()