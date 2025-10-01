# Advanced Scan Logic Module Use Case Diagram - Python Code
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import Ellipse, FancyBboxPatch, Circle, Polygon
import numpy as np

def create_scan_logic_usecase_diagram():
    """
    Create advanced use case diagram for Intelligent Scan Logic & Orchestration Module
    """
    fig, ax = plt.subplots(1, 1, figsize=(28, 22))
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')
    
    # System Boundary
    system_boundary = FancyBboxPatch(
        (6, 10), 88, 85,
        boxstyle="round,pad=2",
        facecolor='#f0f9ff',
        edgecolor='#0369a1',
        linewidth=4,
        linestyle='-'
    )
    ax.add_patch(system_boundary)
    
    # System Title
    ax.text(50, 92, 'Intelligent Scan Logic & Orchestration Module', 
            fontsize=22, fontweight='bold', ha='center', va='center',
            bbox=dict(boxstyle="round,pad=0.8", facecolor='#0369a1', edgecolor='none'),
            color='white')
    
    # Module Description
    ax.text(50, 88, 'Advanced Scan Orchestration with AI-Powered Optimization & Fault Tolerance', 
            fontsize=14, fontweight='normal', ha='center', va='center',
            style='italic', color='#0c4a6e')
    
    # === PRIMARY ACTORS (Left Side) ===
    
    # Technical Professionals
    data_engineer = patches.Rectangle((1, 80), 6, 8, facecolor='#dbeafe', edgecolor='#1d4ed8', linewidth=2)
    ax.add_patch(data_engineer)
    ax.text(4, 84, 'Data\nEngineer', fontsize=9, fontweight='bold', ha='center', va='center')
    
    system_architect = patches.Rectangle((1, 70), 6, 8, facecolor='#dbeafe', edgecolor='#1d4ed8', linewidth=2)
    ax.add_patch(system_architect)
    ax.text(4, 74, 'System\nArchitect', fontsize=9, fontweight='bold', ha='center', va='center')
    
    devops_engineer = patches.Rectangle((1, 60), 6, 8, facecolor='#dbeafe', edgecolor='#1d4ed8', linewidth=2)
    ax.add_patch(devops_engineer)
    ax.text(4, 64, 'DevOps\nEngineer', fontsize=9, fontweight='bold', ha='center', va='center')
    
    # Operations Team
    system_admin = patches.Rectangle((1, 47), 6, 8, facecolor='#dcfce7', edgecolor='#16a34a', linewidth=2)
    ax.add_patch(system_admin)
    ax.text(4, 51, 'System\nAdmin', fontsize=9, fontweight='bold', ha='center', va='center')
    
    operations_manager = patches.Rectangle((1, 37), 6, 8, facecolor='#dcfce7', edgecolor='#16a34a', linewidth=2)
    ax.add_patch(operations_manager)
    ax.text(4, 41, 'Operations\nManager', fontsize=9, fontweight='bold', ha='center', va='center')
    
    # Data Professionals
    data_steward = patches.Rectangle((1, 27), 6, 8, facecolor='#fce7f3', edgecolor='#be185d', linewidth=2)
    ax.add_patch(data_steward)
    ax.text(4, 31, 'Data\nSteward', fontsize=9, fontweight='bold', ha='center', va='center')
    
    data_analyst = patches.Rectangle((1, 17), 6, 8, facecolor='#fce7f3', edgecolor='#be185d', linewidth=2)
    ax.add_patch(data_analyst)
    ax.text(4, 21, 'Data\nAnalyst', fontsize=9, fontweight='bold', ha='center', va='center')
    
    # === SECONDARY ACTORS (Right Side) ===
    
    # Container Orchestration
    kubernetes = patches.Rectangle((93, 80), 6, 8, facecolor='#e0f2f1', edgecolor='#00695c', linewidth=2)
    ax.add_patch(kubernetes)
    ax.text(96, 84, 'Kubernetes\nCluster', fontsize=9, fontweight='bold', ha='center', va='center')
    
    # Cloud Services
    cloud_services = patches.Rectangle((93, 70), 6, 8, facecolor='#e0f2f1', edgecolor='#00695c', linewidth=2)
    ax.add_patch(cloud_services)
    ax.text(96, 74, 'Cloud\nServices', fontsize=9, fontweight='bold', ha='center', va='center')
    
    # Processing Engines
    processing_engines = patches.Rectangle((93, 60), 6, 8, facecolor='#e0f2f1', edgecolor='#00695c', linewidth=2)
    ax.add_patch(processing_engines)
    ax.text(96, 64, 'Processing\nEngines', fontsize=9, fontweight='bold', ha='center', va='center')
    
    # Message Queues
    message_queues = patches.Rectangle((93, 50), 6, 8, facecolor='#e3f2fd', edgecolor='#1565c0', linewidth=2)
    ax.add_patch(message_queues)
    ax.text(96, 54, 'Message\nQueues', fontsize=9, fontweight='bold', ha='center', va='center')
    
    # Monitoring Systems
    monitoring_systems = patches.Rectangle((93, 40), 6, 8, facecolor='#e3f2fd', edgecolor='#1565c0', linewidth=2)
    ax.add_patch(monitoring_systems)
    ax.text(96, 44, 'Monitoring\nSystems', fontsize=9, fontweight='bold', ha='center', va='center')
    
    # Storage Systems
    storage_systems = patches.Rectangle((93, 30), 6, 8, facecolor='#f3e5f5', edgecolor='#7b1fa2', linewidth=2)
    ax.add_patch(storage_systems)
    ax.text(96, 34, 'Storage\nSystems', fontsize=9, fontweight='bold', ha='center', va='center')
    
    # External APIs
    external_apis = patches.Rectangle((93, 20), 6, 8, facecolor='#f3e5f5', edgecolor='#7b1fa2', linewidth=2)
    ax.add_patch(external_apis)
    ax.text(96, 24, 'External\nAPIs', fontsize=9, fontweight='bold', ha='center', va='center')
    
    # === CORE USE CASES ===
    
    # Advanced Orchestration Layer
    uc_scan_planning = Ellipse((18, 82), 11, 6, facecolor='#dbeafe', edgecolor='#1d4ed8', linewidth=3)
    ax.add_patch(uc_scan_planning)
    ax.text(18, 82, 'Scan\nPlanning', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_workflow_orchestration = Ellipse((32, 82), 11, 6, facecolor='#dbeafe', edgecolor='#1d4ed8', linewidth=3)
    ax.add_patch(uc_workflow_orchestration)
    ax.text(32, 82, 'Workflow\nOrchestration', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_resource_management = Ellipse((46, 82), 11, 6, facecolor='#dbeafe', edgecolor='#1d4ed8', linewidth=3)
    ax.add_patch(uc_resource_management)
    ax.text(46, 82, 'Resource\nManagement', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_dependency_resolution = Ellipse((60, 82), 11, 6, facecolor='#dbeafe', edgecolor='#1d4ed8', linewidth=3)
    ax.add_patch(uc_dependency_resolution)
    ax.text(60, 82, 'Dependency\nResolution', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_priority_management = Ellipse((74, 82), 11, 6, facecolor='#dbeafe', edgecolor='#1d4ed8', linewidth=3)
    ax.add_patch(uc_priority_management)
    ax.text(74, 82, 'Priority\nManagement', fontsize=8, fontweight='bold', ha='center', va='center')
    
    # High-Performance Execution Layer
    uc_parallel_processing = Ellipse((18, 72), 11, 6, facecolor='#dcfce7', edgecolor='#16a34a', linewidth=2)
    ax.add_patch(uc_parallel_processing)
    ax.text(18, 72, 'Parallel\nProcessing', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_distributed_execution = Ellipse((32, 72), 11, 6, facecolor='#dcfce7', edgecolor='#16a34a', linewidth=2)
    ax.add_patch(uc_distributed_execution)
    ax.text(32, 72, 'Distributed\nExecution', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_stream_processing = Ellipse((46, 72), 11, 6, facecolor='#dcfce7', edgecolor='#16a34a', linewidth=2)
    ax.add_patch(uc_stream_processing)
    ax.text(46, 72, 'Stream\nProcessing', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_batch_processing = Ellipse((60, 72), 11, 6, facecolor='#dcfce7', edgecolor='#16a34a', linewidth=2)
    ax.add_patch(uc_batch_processing)
    ax.text(60, 72, 'Batch\nProcessing', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_quality_control = Ellipse((74, 72), 11, 6, facecolor='#dcfce7', edgecolor='#16a34a', linewidth=2)
    ax.add_patch(uc_quality_control)
    ax.text(74, 72, 'Quality\nControl', fontsize=8, fontweight='bold', ha='center', va='center')
    
    # Performance Optimization Layer
    uc_auto_scaling = Ellipse((18, 62), 11, 6, facecolor='#fff7ed', edgecolor='#ea580c', linewidth=2)
    ax.add_patch(uc_auto_scaling)
    ax.text(18, 62, 'Auto\nScaling', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_load_balancing = Ellipse((32, 62), 11, 6, facecolor='#fff7ed', edgecolor='#ea580c', linewidth=2)
    ax.add_patch(uc_load_balancing)
    ax.text(32, 62, 'Load\nBalancing', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_performance_tuning = Ellipse((46, 62), 11, 6, facecolor='#fff7ed', edgecolor='#ea580c', linewidth=2)
    ax.add_patch(uc_performance_tuning)
    ax.text(46, 62, 'Performance\nTuning', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_resource_optimization = Ellipse((60, 62), 11, 6, facecolor='#fff7ed', edgecolor='#ea580c', linewidth=2)
    ax.add_patch(uc_resource_optimization)
    ax.text(60, 62, 'Resource\nOptimization', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_cost_optimization = Ellipse((74, 62), 11, 6, facecolor='#fff7ed', edgecolor='#ea580c', linewidth=2)
    ax.add_patch(uc_cost_optimization)
    ax.text(74, 62, 'Cost\nOptimization', fontsize=8, fontweight='bold', ha='center', va='center')
    
    # Monitoring & Analytics Layer
    uc_real_time_monitoring = Ellipse((18, 52), 11, 6, facecolor='#fff8e1', edgecolor='#f57f17', linewidth=2)
    ax.add_patch(uc_real_time_monitoring)
    ax.text(18, 52, 'Real-time\nMonitoring', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_performance_analytics = Ellipse((32, 52), 11, 6, facecolor='#fff8e1', edgecolor='#f57f17', linewidth=2)
    ax.add_patch(uc_performance_analytics)
    ax.text(32, 52, 'Performance\nAnalytics', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_operational_intelligence = Ellipse((46, 52), 11, 6, facecolor='#fff8e1', edgecolor='#f57f17', linewidth=2)
    ax.add_patch(uc_operational_intelligence)
    ax.text(46, 52, 'Operational\nIntelligence', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_predictive_analytics = Ellipse((60, 52), 11, 6, facecolor='#fff8e1', edgecolor='#f57f17', linewidth=2)
    ax.add_patch(uc_predictive_analytics)
    ax.text(60, 52, 'Predictive\nAnalytics', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_capacity_planning = Ellipse((74, 52), 11, 6, facecolor='#fff8e1', edgecolor='#f57f17', linewidth=2)
    ax.add_patch(uc_capacity_planning)
    ax.text(74, 52, 'Capacity\nPlanning', fontsize=8, fontweight='bold', ha='center', va='center')
    
    # AI-Powered Optimization Layer
    uc_intelligent_scheduling = Ellipse((18, 42), 11, 6, facecolor='#fef3c7', edgecolor='#d97706', linewidth=3)
    ax.add_patch(uc_intelligent_scheduling)
    ax.text(18, 42, 'Intelligent\nScheduling', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_adaptive_optimization = Ellipse((32, 42), 11, 6, facecolor='#fef3c7', edgecolor='#d97706', linewidth=3)
    ax.add_patch(uc_adaptive_optimization)
    ax.text(32, 42, 'Adaptive\nOptimization', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_predictive_scaling = Ellipse((46, 42), 11, 6, facecolor='#fef3c7', edgecolor='#d97706', linewidth=3)
    ax.add_patch(uc_predictive_scaling)
    ax.text(46, 42, 'Predictive\nScaling', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_anomaly_detection = Ellipse((60, 42), 11, 6, facecolor='#fef3c7', edgecolor='#d97706', linewidth=3)
    ax.add_patch(uc_anomaly_detection)
    ax.text(60, 42, 'Anomaly\nDetection', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_self_healing = Ellipse((74, 42), 11, 6, facecolor='#fef3c7', edgecolor='#d97706', linewidth=3)
    ax.add_patch(uc_self_healing)
    ax.text(74, 42, 'Self-Healing\nSystems', fontsize=8, fontweight='bold', ha='center', va='center')
    
    # Fault Tolerance Layer
    uc_fault_detection = Ellipse((18, 32), 11, 6, facecolor='#fce4ec', edgecolor='#ad1457', linewidth=2)
    ax.add_patch(uc_fault_detection)
    ax.text(18, 32, 'Fault\nDetection', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_automatic_recovery = Ellipse((32, 32), 11, 6, facecolor='#fce4ec', edgecolor='#ad1457', linewidth=2)
    ax.add_patch(uc_automatic_recovery)
    ax.text(32, 32, 'Automatic\nRecovery', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_circuit_breaker = Ellipse((46, 32), 11, 6, facecolor='#fce4ec', edgecolor='#ad1457', linewidth=2)
    ax.add_patch(uc_circuit_breaker)
    ax.text(46, 32, 'Circuit\nBreaker', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_graceful_degradation = Ellipse((60, 32), 11, 6, facecolor='#fce4ec', edgecolor='#ad1457', linewidth=2)
    ax.add_patch(uc_graceful_degradation)
    ax.text(60, 32, 'Graceful\nDegradation', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_disaster_recovery = Ellipse((74, 32), 11, 6, facecolor='#fce4ec', edgecolor='#ad1457', linewidth=2)
    ax.add_patch(uc_disaster_recovery)
    ax.text(74, 32, 'Disaster\nRecovery', fontsize=8, fontweight='bold', ha='center', va='center')
    
    # Distributed Coordination Layer
    uc_cluster_coordination = Ellipse((25, 22), 11, 6, facecolor='#f3e5f5', edgecolor='#7b1fa2', linewidth=2)
    ax.add_patch(uc_cluster_coordination)
    ax.text(25, 22, 'Cluster\nCoordination', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_consensus_management = Ellipse((39, 22), 11, 6, facecolor='#f3e5f5', edgecolor='#7b1fa2', linewidth=2)
    ax.add_patch(uc_consensus_management)
    ax.text(39, 22, 'Consensus\nManagement', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_state_synchronization = Ellipse((53, 22), 11, 6, facecolor='#f3e5f5', edgecolor='#7b1fa2', linewidth=2)
    ax.add_patch(uc_state_synchronization)
    ax.text(53, 22, 'State\nSynchronization', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_leader_election = Ellipse((67, 22), 11, 6, facecolor='#f3e5f5', edgecolor='#7b1fa2', linewidth=2)
    ax.add_patch(uc_leader_election)
    ax.text(67, 22, 'Leader\nElection', fontsize=8, fontweight='bold', ha='center', va='center')
    
    # === ACTOR-USE CASE RELATIONSHIPS ===
    
    # Data Engineer relationships
    ax.annotate('', xy=(12.5, 82), xytext=(7, 84),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    ax.annotate('', xy=(12.5, 72), xytext=(7, 84),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    ax.annotate('', xy=(12.5, 62), xytext=(7, 84),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    ax.annotate('', xy=(12.5, 52), xytext=(7, 84),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    
    # System Architect relationships
    ax.annotate('', xy=(26.5, 82), xytext=(7, 74),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    ax.annotate('', xy=(40.5, 82), xytext=(7, 74),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    ax.annotate('', xy=(54.5, 82), xytext=(7, 74),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    ax.annotate('', xy=(19.5, 22), xytext=(7, 74),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    
    # DevOps Engineer relationships
    ax.annotate('', xy=(12.5, 62), xytext=(7, 64),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    ax.annotate('', xy=(26.5, 62), xytext=(7, 64),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    ax.annotate('', xy=(12.5, 32), xytext=(7, 64),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    ax.annotate('', xy=(68.5, 32), xytext=(7, 64),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    
    # System Admin relationships
    ax.annotate('', xy=(12.5, 52), xytext=(7, 51),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    ax.annotate('', xy=(26.5, 52), xytext=(7, 51),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    ax.annotate('', xy=(12.5, 32), xytext=(7, 51),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    ax.annotate('', xy=(26.5, 32), xytext=(7, 51),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    
    # Operations Manager relationships
    ax.annotate('', xy=(40.5, 52), xytext=(7, 41),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    ax.annotate('', xy=(68.5, 52), xytext=(7, 41),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    ax.annotate('', xy=(12.5, 42), xytext=(7, 41),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    ax.annotate('', xy=(68.5, 42), xytext=(7, 41),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    
    # Data Steward relationships
    ax.annotate('', xy=(12.5, 82), xytext=(7, 31),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    ax.annotate('', xy=(68.5, 82), xytext=(7, 31),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    ax.annotate('', xy=(68.5, 72), xytext=(7, 31),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    
    # Data Analyst relationships
    ax.annotate('', xy=(26.5, 52), xytext=(7, 21),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    ax.annotate('', xy=(40.5, 52), xytext=(7, 21),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    ax.annotate('', xy=(54.5, 52), xytext=(7, 21),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    
    # === SECONDARY ACTOR INTEGRATIONS ===
    
    # Kubernetes integrations
    ax.annotate('', xy=(87, 82), xytext=(93, 84),
                arrowprops=dict(arrowstyle='<->', color='#6b7280', lw=1, linestyle='dotted'))
    ax.annotate('', xy=(87, 72), xytext=(93, 84),
                arrowprops=dict(arrowstyle='<->', color='#6b7280', lw=1, linestyle='dotted'))
    ax.annotate('', xy=(87, 62), xytext=(93, 84),
                arrowprops=dict(arrowstyle='<->', color='#6b7280', lw=1, linestyle='dotted'))
    
    # Cloud Services integrations
    ax.annotate('', xy=(87, 82), xytext=(93, 74),
                arrowprops=dict(arrowstyle='<->', color='#6b7280', lw=1, linestyle='dotted'))
    ax.annotate('', xy=(87, 62), xytext=(93, 74),
                arrowprops=dict(arrowstyle='<->', color='#6b7280', lw=1, linestyle='dotted'))
    
    # Processing Engines integrations
    ax.annotate('', xy=(87, 72), xytext=(93, 64),
                arrowprops=dict(arrowstyle='<->', color='#6b7280', lw=1, linestyle='dotted'))
    ax.annotate('', xy=(87, 42), xytext=(93, 64),
                arrowprops=dict(arrowstyle='<->', color='#6b7280', lw=1, linestyle='dotted'))
    
    # Message Queues integrations
    ax.annotate('', xy=(87, 82), xytext=(93, 54),
                arrowprops=dict(arrowstyle='<->', color='#6b7280', lw=1, linestyle='dotted'))
    ax.annotate('', xy=(87, 22), xytext=(93, 54),
                arrowprops=dict(arrowstyle='<->', color='#6b7280', lw=1, linestyle='dotted'))
    
    # Monitoring Systems integrations
    ax.annotate('', xy=(87, 52), xytext=(93, 44),
                arrowprops=dict(arrowstyle='<->', color='#6b7280', lw=1, linestyle='dotted'))
    ax.annotate('', xy=(87, 42), xytext=(93, 44),
                arrowprops=dict(arrowstyle='<->', color='#6b7280', lw=1, linestyle='dotted'))
    
    # Storage Systems integrations
    ax.annotate('', xy=(87, 72), xytext=(93, 34),
                arrowprops=dict(arrowstyle='<->', color='#6b7280', lw=1, linestyle='dotted'))
    ax.annotate('', xy=(87, 32), xytext=(93, 34),
                arrowprops=dict(arrowstyle='<->', color='#6b7280', lw=1, linestyle='dotted'))
    
    # External APIs integrations
    ax.annotate('', xy=(87, 72), xytext=(93, 24),
                arrowprops=dict(arrowstyle='<->', color='#6b7280', lw=1, linestyle='dotted'))
    ax.annotate('', xy=(87, 22), xytext=(93, 24),
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
    ax.annotate('', xy=(26.5, 42), xytext=(18, 52),
                arrowprops=dict(arrowstyle='->', color='#9ca3af', lw=1, linestyle='dashdot'))
    ax.text(22.25, 47, '<<extends>>', fontsize=6, ha='center', va='center', style='italic', color='#6b7280', rotation=45)
    
    ax.annotate('', xy=(40.5, 42), xytext=(32, 52),
                arrowprops=dict(arrowstyle='->', color='#9ca3af', lw=1, linestyle='dashdot'))
    ax.text(36.25, 47, '<<extends>>', fontsize=6, ha='center', va='center', style='italic', color='#6b7280', rotation=45)
    
    ax.annotate('', xy=(68.5, 42), xytext=(74, 52),
                arrowprops=dict(arrowstyle='->', color='#9ca3af', lw=1, linestyle='dashdot'))
    ax.text(71.25, 47, '<<extends>>', fontsize=6, ha='center', va='center', style='italic', color='#6b7280', rotation=-45)
    
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
    
    ax.text(50, 6.5, 'Intelligent Scan Logic & Orchestration Module - Advanced Use Case Architecture', 
            fontsize=16, fontweight='bold', ha='center', va='center')
    
    # Actor Legend
    ax.text(13, 5, '👨‍💻 Technical', fontsize=9, ha='left', va='center',
            bbox=dict(boxstyle="round,pad=0.2", facecolor='#dbeafe', alpha=0.7))
    ax.text(13, 4, '⚙️ Operations', fontsize=9, ha='left', va='center',
            bbox=dict(boxstyle="round,pad=0.2", facecolor='#dcfce7', alpha=0.7))
    ax.text(13, 3, '👤 Data Pros', fontsize=9, ha='left', va='center',
            bbox=dict(boxstyle="round,pad=0.2", facecolor='#fce7f3', alpha=0.7))
    
    # Use Case Legend
    ax.text(28, 5, '🎯 Orchestration', fontsize=9, ha='left', va='center',
            bbox=dict(boxstyle="round,pad=0.2", facecolor='#dbeafe', alpha=0.7))
    ax.text(28, 4, '⚡ Execution', fontsize=9, ha='left', va='center',
            bbox=dict(boxstyle="round,pad=0.2", facecolor='#dcfce7', alpha=0.7))
    ax.text(28, 3, '📈 Optimization', fontsize=9, ha='left', va='center',
            bbox=dict(boxstyle="round,pad=0.2", facecolor='#fff7ed', alpha=0.7))
    
    ax.text(48, 5, '📊 Monitoring', fontsize=9, ha='left', va='center',
            bbox=dict(boxstyle="round,pad=0.2", facecolor='#fff8e1', alpha=0.7))
    ax.text(48, 4, '🤖 AI Features', fontsize=9, ha='left', va='center',
            bbox=dict(boxstyle="round,pad=0.2", facecolor='#fef3c7', alpha=0.7))
    ax.text(48, 3, '🛡️ Fault Tolerance', fontsize=9, ha='left', va='center',
            bbox=dict(boxstyle="round,pad=0.2", facecolor='#fce4ec', alpha=0.7))
    
    ax.text(68, 5, '🔄 Distributed', fontsize=9, ha='left', va='center',
            bbox=dict(boxstyle="round,pad=0.2", facecolor='#f3e5f5', alpha=0.7))
    ax.text(68, 4, '☁️ Cloud/K8s', fontsize=9, ha='left', va='center',
            bbox=dict(boxstyle="round,pad=0.2", facecolor='#e0f2f1', alpha=0.7))
    ax.text(68, 3, '🔧 Systems', fontsize=9, ha='left', va='center',
            bbox=dict(boxstyle="round,pad=0.2", facecolor='#e3f2fd', alpha=0.7))
    
    plt.tight_layout()
    return fig

# Generate the diagram
fig = create_scan_logic_usecase_diagram()
plt.savefig('/workspace/scan_logic_usecase_diagram.png', dpi=300, bbox_inches='tight')
plt.show()