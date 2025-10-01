# Advanced Global Use Case Diagram - Python Code
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import Ellipse, FancyBboxPatch, ConnectionPatch
import numpy as np

def create_global_usecase_diagram():
    """
    Create advanced global use case diagram for DataWave Data Governance System
    """
    fig, ax = plt.subplots(1, 1, figsize=(24, 18))
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')
    
    # System Boundary
    system_boundary = FancyBboxPatch(
        (5, 10), 90, 85,
        boxstyle="round,pad=2",
        facecolor='#f0f8ff',
        edgecolor='#1e3a8a',
        linewidth=3,
        linestyle='-'
    )
    ax.add_patch(system_boundary)
    
    # System Title
    ax.text(50, 92, 'DataWave Data Governance Ecosystem', 
            fontsize=20, fontweight='bold', ha='center', va='center',
            bbox=dict(boxstyle="round,pad=0.5", facecolor='#1e3a8a', edgecolor='none', alpha=0.8),
            color='white')
    
    # === PRIMARY ACTORS ===
    
    # Executive Leadership
    cdo_actor = patches.Rectangle((2, 75), 8, 12, facecolor='#fef3c7', edgecolor='#d97706', linewidth=2)
    ax.add_patch(cdo_actor)
    ax.text(6, 81, 'Chief Data\nOfficer', fontsize=10, fontweight='bold', ha='center', va='center')
    
    cto_actor = patches.Rectangle((2, 60), 8, 12, facecolor='#fef3c7', edgecolor='#d97706', linewidth=2)
    ax.add_patch(cto_actor)
    ax.text(6, 66, 'Chief Technology\nOfficer', fontsize=10, fontweight='bold', ha='center', va='center')
    
    ciso_actor = patches.Rectangle((2, 45), 8, 12, facecolor='#fef3c7', edgecolor='#d97706', linewidth=2)
    ax.add_patch(ciso_actor)
    ax.text(6, 51, 'Chief Security\nOfficer', fontsize=10, fontweight='bold', ha='center', va='center')
    
    # Data Governance Professionals
    data_steward = patches.Rectangle((2, 30), 8, 12, facecolor='#dcfce7', edgecolor='#16a34a', linewidth=2)
    ax.add_patch(data_steward)
    ax.text(6, 36, 'Data\nSteward', fontsize=10, fontweight='bold', ha='center', va='center')
    
    data_architect = patches.Rectangle((2, 15), 8, 12, facecolor='#dcfce7', edgecolor='#16a34a', linewidth=2)
    ax.add_patch(data_architect)
    ax.text(6, 21, 'Data\nArchitect', fontsize=10, fontweight='bold', ha='center', va='center')
    
    # Business Users
    business_analyst = patches.Rectangle((90, 75), 8, 12, facecolor='#fce7f3', edgecolor='#be185d', linewidth=2)
    ax.add_patch(business_analyst)
    ax.text(94, 81, 'Business\nAnalyst', fontsize=10, fontweight='bold', ha='center', va='center')
    
    domain_expert = patches.Rectangle((90, 60), 8, 12, facecolor='#fce7f3', edgecolor='#be185d', linewidth=2)
    ax.add_patch(domain_expert)
    ax.text(94, 66, 'Domain\nExpert', fontsize=10, fontweight='bold', ha='center', va='center')
    
    end_user = patches.Rectangle((90, 45), 8, 12, facecolor='#fce7f3', edgecolor='#be185d', linewidth=2)
    ax.add_patch(end_user)
    ax.text(94, 51, 'End\nUser', fontsize=10, fontweight='bold', ha='center', va='center')
    
    # === CORE USE CASES ===
    
    # Data Discovery & Cataloging
    uc_discovery = Ellipse((25, 80), 12, 6, facecolor='#dcfce7', edgecolor='#16a34a', linewidth=2)
    ax.add_patch(uc_discovery)
    ax.text(25, 80, 'Intelligent Data\nDiscovery', fontsize=9, fontweight='bold', ha='center', va='center')
    
    uc_cataloging = Ellipse((40, 80), 12, 6, facecolor='#dcfce7', edgecolor='#16a34a', linewidth=2)
    ax.add_patch(uc_cataloging)
    ax.text(40, 80, 'Advanced Data\nCataloging', fontsize=9, fontweight='bold', ha='center', va='center')
    
    # AI-Powered Classification
    uc_classification = Ellipse((60, 80), 12, 6, facecolor='#fed7aa', edgecolor='#ea580c', linewidth=2)
    ax.add_patch(uc_classification)
    ax.text(60, 80, 'AI-Powered\nClassification', fontsize=9, fontweight='bold', ha='center', va='center')
    
    uc_labeling = Ellipse((75, 80), 12, 6, facecolor='#fed7aa', edgecolor='#ea580c', linewidth=2)
    ax.add_patch(uc_labeling)
    ax.text(75, 80, 'Intelligent\nLabeling', fontsize=9, fontweight='bold', ha='center', va='center')
    
    # Compliance & Governance
    uc_compliance = Ellipse((25, 65), 12, 6, facecolor='#fce7f3', edgecolor='#be185d', linewidth=2)
    ax.add_patch(uc_compliance)
    ax.text(25, 65, 'Multi-Framework\nCompliance', fontsize=9, fontweight='bold', ha='center', va='center')
    
    uc_risk_mgmt = Ellipse((40, 65), 12, 6, facecolor='#fce7f3', edgecolor='#be185d', linewidth=2)
    ax.add_patch(uc_risk_mgmt)
    ax.text(40, 65, 'Advanced Risk\nManagement', fontsize=9, fontweight='bold', ha='center', va='center')
    
    # Intelligent Scanning
    uc_scan_orchestration = Ellipse((60, 65), 12, 6, facecolor='#dbeafe', edgecolor='#2563eb', linewidth=2)
    ax.add_patch(uc_scan_orchestration)
    ax.text(60, 65, 'Scan\nOrchestration', fontsize=9, fontweight='bold', ha='center', va='center')
    
    uc_adaptive_scanning = Ellipse((75, 65), 12, 6, facecolor='#dbeafe', edgecolor='#2563eb', linewidth=2)
    ax.add_patch(uc_adaptive_scanning)
    ax.text(75, 65, 'Adaptive\nScanning', fontsize=9, fontweight='bold', ha='center', va='center')
    
    # Rule Processing
    uc_rule_engine = Ellipse((25, 50), 12, 6, facecolor='#f3e8ff', edgecolor='#7c3aed', linewidth=2)
    ax.add_patch(uc_rule_engine)
    ax.text(25, 50, 'Intelligent Rule\nEngine', fontsize=9, fontweight='bold', ha='center', va='center')
    
    uc_rule_management = Ellipse((40, 50), 12, 6, facecolor='#f3e8ff', edgecolor='#7c3aed', linewidth=2)
    ax.add_patch(uc_rule_management)
    ax.text(40, 50, 'Advanced Rule\nManagement', fontsize=9, fontweight='bold', ha='center', va='center')
    
    # Knowledge Management
    uc_semantic_search = Ellipse((60, 50), 12, 6, facecolor='#ecfdf5', edgecolor='#059669', linewidth=2)
    ax.add_patch(uc_semantic_search)
    ax.text(60, 50, 'Semantic Search\n& Navigation', fontsize=9, fontweight='bold', ha='center', va='center')
    
    uc_knowledge_graphs = Ellipse((75, 50), 12, 6, facecolor='#ecfdf5', edgecolor='#059669', linewidth=2)
    ax.add_patch(uc_knowledge_graphs)
    ax.text(75, 50, 'Knowledge\nGraphs', fontsize=9, fontweight='bold', ha='center', va='center')
    
    # Enterprise Security
    uc_identity_mgmt = Ellipse((25, 35), 12, 6, facecolor='#fef2f2', edgecolor='#dc2626', linewidth=2)
    ax.add_patch(uc_identity_mgmt)
    ax.text(25, 35, 'Identity\nManagement', fontsize=9, fontweight='bold', ha='center', va='center')
    
    uc_access_control = Ellipse((40, 35), 12, 6, facecolor='#fef2f2', edgecolor='#dc2626', linewidth=2)
    ax.add_patch(uc_access_control)
    ax.text(40, 35, 'Fine-Grained\nAccess Control', fontsize=9, fontweight='bold', ha='center', va='center')
    
    # Racine Orchestration
    uc_master_orchestration = Ellipse((60, 35), 12, 6, facecolor='#fffbeb', edgecolor='#d97706', linewidth=2)
    ax.add_patch(uc_master_orchestration)
    ax.text(60, 35, 'Master System\nOrchestration', fontsize=9, fontweight='bold', ha='center', va='center')
    
    uc_ai_assistance = Ellipse((75, 35), 12, 6, facecolor='#fffbeb', edgecolor='#d97706', linewidth=2)
    ax.add_patch(uc_ai_assistance)
    ax.text(75, 35, 'AI-Powered\nAssistance', fontsize=9, fontweight='bold', ha='center', va='center')
    
    # === RELATIONSHIPS ===
    
    # CDO relationships
    ax.annotate('', xy=(19, 80), xytext=(10, 81),
                arrowprops=dict(arrowstyle='->', color='#1f2937', lw=1.5))
    ax.annotate('', xy=(19, 65), xytext=(10, 81),
                arrowprops=dict(arrowstyle='->', color='#1f2937', lw=1.5))
    ax.annotate('', xy=(54, 35), xytext=(10, 81),
                arrowprops=dict(arrowstyle='->', color='#1f2937', lw=1.5))
    
    # CTO relationships
    ax.annotate('', xy=(54, 65), xytext=(10, 66),
                arrowprops=dict(arrowstyle='->', color='#1f2937', lw=1.5))
    ax.annotate('', xy=(69, 65), xytext=(10, 66),
                arrowprops=dict(arrowstyle='->', color='#1f2937', lw=1.5))
    ax.annotate('', xy=(69, 35), xytext=(10, 66),
                arrowprops=dict(arrowstyle='->', color='#1f2937', lw=1.5))
    
    # CISO relationships
    ax.annotate('', xy=(19, 35), xytext=(10, 51),
                arrowprops=dict(arrowstyle='->', color='#1f2937', lw=1.5))
    ax.annotate('', xy=(34, 35), xytext=(10, 51),
                arrowprops=dict(arrowstyle='->', color='#1f2937', lw=1.5))
    ax.annotate('', xy=(34, 65), xytext=(10, 51),
                arrowprops=dict(arrowstyle='->', color='#1f2937', lw=1.5))
    
    # Data Steward relationships
    ax.annotate('', xy=(19, 80), xytext=(10, 36),
                arrowprops=dict(arrowstyle='->', color='#1f2937', lw=1.5))
    ax.annotate('', xy=(34, 80), xytext=(10, 36),
                arrowprops=dict(arrowstyle='->', color='#1f2937', lw=1.5))
    ax.annotate('', xy=(54, 80), xytext=(10, 36),
                arrowprops=dict(arrowstyle='->', color='#1f2937', lw=1.5))
    
    # Business User relationships
    ax.annotate('', xy=(81, 50), xytext=(90, 81),
                arrowprops=dict(arrowstyle='->', color='#1f2937', lw=1.5))
    ax.annotate('', xy=(81, 80), xytext=(90, 66),
                arrowprops=dict(arrowstyle='->', color='#1f2937', lw=1.5))
    ax.annotate('', xy=(81, 35), xytext=(90, 51),
                arrowprops=dict(arrowstyle='->', color='#1f2937', lw=1.5))
    
    # Include relationships (dashed lines)
    ax.annotate('', xy=(34, 80), xytext=(25, 80),
                arrowprops=dict(arrowstyle='->', color='#6b7280', lw=1, linestyle='dashed'))
    ax.text(29.5, 82, '<<includes>>', fontsize=7, ha='center', va='bottom', style='italic')
    
    ax.annotate('', xy=(69, 80), xytext=(60, 80),
                arrowprops=dict(arrowstyle='->', color='#6b7280', lw=1, linestyle='dashed'))
    ax.text(64.5, 82, '<<includes>>', fontsize=7, ha='center', va='bottom', style='italic')
    
    ax.annotate('', xy=(34, 65), xytext=(25, 65),
                arrowprops=dict(arrowstyle='->', color='#6b7280', lw=1, linestyle='dashed'))
    ax.text(29.5, 67, '<<includes>>', fontsize=7, ha='center', va='bottom', style='italic')
    
    ax.annotate('', xy=(69, 65), xytext=(60, 65),
                arrowprops=dict(arrowstyle='->', color='#6b7280', lw=1, linestyle='dashed'))
    ax.text(64.5, 67, '<<includes>>', fontsize=7, ha='center', va='bottom', style='italic')
    
    # Legend
    legend_box = FancyBboxPatch(
        (15, 15), 70, 15,
        boxstyle="round,pad=1",
        facecolor='#f9fafb',
        edgecolor='#6b7280',
        linewidth=1
    )
    ax.add_patch(legend_box)
    
    ax.text(50, 27, 'DataWave Data Governance System - Global Use Case Architecture', 
            fontsize=14, fontweight='bold', ha='center', va='center')
    
    ax.text(20, 23, '🏛️ Executive Leadership', fontsize=10, ha='left', va='center', 
            bbox=dict(boxstyle="round,pad=0.3", facecolor='#fef3c7', alpha=0.7))
    ax.text(20, 20, '👤 Data Governance', fontsize=10, ha='left', va='center',
            bbox=dict(boxstyle="round,pad=0.3", facecolor='#dcfce7', alpha=0.7))
    ax.text(20, 17, '👩‍💼 Business Users', fontsize=10, ha='left', va='center',
            bbox=dict(boxstyle="round,pad=0.3", facecolor='#fce7f3', alpha=0.7))
    
    ax.text(55, 23, '🔍 Data Discovery', fontsize=10, ha='left', va='center',
            bbox=dict(boxstyle="round,pad=0.3", facecolor='#dcfce7', alpha=0.7))
    ax.text(55, 20, '🤖 AI Classification', fontsize=10, ha='left', va='center',
            bbox=dict(boxstyle="round,pad=0.3", facecolor='#fed7aa', alpha=0.7))
    ax.text(55, 17, '📋 Compliance', fontsize=10, ha='left', va='center',
            bbox=dict(boxstyle="round,pad=0.3", facecolor='#fce7f3', alpha=0.7))
    
    plt.tight_layout()
    return fig

# Generate the diagram
fig = create_global_usecase_diagram()
plt.savefig('/workspace/global_usecase_diagram.png', dpi=300, bbox_inches='tight')
plt.show()