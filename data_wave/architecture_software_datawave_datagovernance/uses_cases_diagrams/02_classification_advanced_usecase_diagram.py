# Advanced Classification Module Use Case Diagram - Python Code
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import Ellipse, FancyBboxPatch, Circle, Polygon
import numpy as np

def create_classification_usecase_diagram():
    """
    Create advanced use case diagram for AI-Powered Classification Module
    """
    fig, ax = plt.subplots(1, 1, figsize=(28, 22))
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')
    
    # System Boundary
    system_boundary = FancyBboxPatch(
        (6, 10), 88, 85,
        boxstyle="round,pad=2",
        facecolor='#fff7ed',
        edgecolor='#ea580c',
        linewidth=4,
        linestyle='-'
    )
    ax.add_patch(system_boundary)
    
    # System Title
    ax.text(50, 92, 'AI-Powered Data Classification Module', 
            fontsize=22, fontweight='bold', ha='center', va='center',
            bbox=dict(boxstyle="round,pad=0.8", facecolor='#ea580c', edgecolor='none'),
            color='white')
    
    # Module Description
    ax.text(50, 88, 'Intelligent Data Classification & Labeling with Advanced Machine Learning', 
            fontsize=14, fontweight='normal', ha='center', va='center',
            style='italic', color='#c2410c')
    
    # === PRIMARY ACTORS (Left Side) ===
    
    # AI/ML Professionals
    data_scientist = patches.Rectangle((1, 80), 6, 8, facecolor='#fef3c7', edgecolor='#d97706', linewidth=2)
    ax.add_patch(data_scientist)
    ax.text(4, 84, 'Data\nScientist', fontsize=9, fontweight='bold', ha='center', va='center')
    
    ml_engineer = patches.Rectangle((1, 70), 6, 8, facecolor='#fef3c7', edgecolor='#d97706', linewidth=2)
    ax.add_patch(ml_engineer)
    ax.text(4, 74, 'ML\nEngineer', fontsize=9, fontweight='bold', ha='center', va='center')
    
    ai_researcher = patches.Rectangle((1, 60), 6, 8, facecolor='#fef3c7', edgecolor='#d97706', linewidth=2)
    ax.add_patch(ai_researcher)
    ax.text(4, 64, 'AI\nResearcher', fontsize=9, fontweight='bold', ha='center', va='center')
    
    # Governance Professionals
    data_steward = patches.Rectangle((1, 47), 6, 8, facecolor='#dcfce7', edgecolor='#16a34a', linewidth=2)
    ax.add_patch(data_steward)
    ax.text(4, 51, 'Data\nSteward', fontsize=9, fontweight='bold', ha='center', va='center')
    
    compliance_officer = patches.Rectangle((1, 37), 6, 8, facecolor='#dcfce7', edgecolor='#16a34a', linewidth=2)
    ax.add_patch(compliance_officer)
    ax.text(4, 41, 'Compliance\nOfficer', fontsize=9, fontweight='bold', ha='center', va='center')
    
    privacy_officer = patches.Rectangle((1, 27), 6, 8, facecolor='#dcfce7', edgecolor='#16a34a', linewidth=2)
    ax.add_patch(privacy_officer)
    ax.text(4, 31, 'Privacy\nOfficer', fontsize=9, fontweight='bold', ha='center', va='center')
    
    # Domain Experts
    subject_expert = patches.Rectangle((1, 17), 6, 8, facecolor='#fce7f3', edgecolor='#be185d', linewidth=2)
    ax.add_patch(subject_expert)
    ax.text(4, 21, 'Subject\nExpert', fontsize=9, fontweight='bold', ha='center', va='center')
    
    # === SECONDARY ACTORS (Right Side) ===
    
    # AI/ML Platforms
    ml_frameworks = patches.Rectangle((93, 80), 6, 8, facecolor='#e0f2f1', edgecolor='#00695c', linewidth=2)
    ax.add_patch(ml_frameworks)
    ax.text(96, 84, 'ML\nFrameworks', fontsize=9, fontweight='bold', ha='center', va='center')
    
    cloud_ai = patches.Rectangle((93, 70), 6, 8, facecolor='#e0f2f1', edgecolor='#00695c', linewidth=2)
    ax.add_patch(cloud_ai)
    ax.text(96, 74, 'Cloud AI\nServices', fontsize=9, fontweight='bold', ha='center', va='center')
    
    nlp_services = patches.Rectangle((93, 60), 6, 8, facecolor='#e0f2f1', edgecolor='#00695c', linewidth=2)
    ax.add_patch(nlp_services)
    ax.text(96, 64, 'NLP\nServices', fontsize=9, fontweight='bold', ha='center', va='center')
    
    # Data Systems
    training_data = patches.Rectangle((93, 47), 6, 8, facecolor='#e3f2fd', edgecolor='#1565c0', linewidth=2)
    ax.add_patch(training_data)
    ax.text(96, 51, 'Training\nData', fontsize=9, fontweight='bold', ha='center', va='center')
    
    knowledge_bases = patches.Rectangle((93, 37), 6, 8, facecolor='#e3f2fd', edgecolor='#1565c0', linewidth=2)
    ax.add_patch(knowledge_bases)
    ax.text(96, 41, 'Knowledge\nBases', fontsize=9, fontweight='bold', ha='center', va='center')
    
    # Integration Systems
    data_sources = patches.Rectangle((93, 27), 6, 8, facecolor='#f3e5f5', edgecolor='#7b1fa2', linewidth=2)
    ax.add_patch(data_sources)
    ax.text(96, 31, 'Data\nSources', fontsize=9, fontweight='bold', ha='center', va='center')
    
    governance_systems = patches.Rectangle((93, 17), 6, 8, facecolor='#f3e5f5', edgecolor='#7b1fa2', linewidth=2)
    ax.add_patch(governance_systems)
    ax.text(96, 21, 'Governance\nSystems', fontsize=9, fontweight='bold', ha='center', va='center')
    
    # === CORE USE CASES ===
    
    # AI-Powered Classification Layer
    uc_auto_classification = Ellipse((18, 82), 11, 6, facecolor='#fef3c7', edgecolor='#d97706', linewidth=3)
    ax.add_patch(uc_auto_classification)
    ax.text(18, 82, 'Automated\nClassification', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_deep_learning = Ellipse((32, 82), 11, 6, facecolor='#fef3c7', edgecolor='#d97706', linewidth=3)
    ax.add_patch(uc_deep_learning)
    ax.text(32, 82, 'Deep Learning\nClassification', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_ensemble_methods = Ellipse((46, 82), 11, 6, facecolor='#fef3c7', edgecolor='#d97706', linewidth=3)
    ax.add_patch(uc_ensemble_methods)
    ax.text(46, 82, 'Ensemble\nMethods', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_active_learning = Ellipse((60, 82), 11, 6, facecolor='#fef3c7', edgecolor='#d97706', linewidth=3)
    ax.add_patch(uc_active_learning)
    ax.text(60, 82, 'Active\nLearning', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_federated_learning = Ellipse((74, 82), 11, 6, facecolor='#fef3c7', edgecolor='#d97706', linewidth=3)
    ax.add_patch(uc_federated_learning)
    ax.text(74, 82, 'Federated\nLearning', fontsize=8, fontweight='bold', ha='center', va='center')
    
    # Intelligent Labeling Layer
    uc_smart_labeling = Ellipse((18, 72), 11, 6, facecolor='#fff8e1', edgecolor='#f57f17', linewidth=2)
    ax.add_patch(uc_smart_labeling)
    ax.text(18, 72, 'Smart\nLabeling', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_sensitivity_detection = Ellipse((32, 72), 11, 6, facecolor='#fff8e1', edgecolor='#f57f17', linewidth=2)
    ax.add_patch(uc_sensitivity_detection)
    ax.text(32, 72, 'Sensitivity\nDetection', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_regulatory_mapping = Ellipse((46, 72), 11, 6, facecolor='#fff8e1', edgecolor='#f57f17', linewidth=2)
    ax.add_patch(uc_regulatory_mapping)
    ax.text(46, 72, 'Regulatory\nMapping', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_business_classification = Ellipse((60, 72), 11, 6, facecolor='#fff8e1', edgecolor='#f57f17', linewidth=2)
    ax.add_patch(uc_business_classification)
    ax.text(60, 72, 'Business\nClassification', fontsize=8, fontweight='bold', ha='center', va='center')
    
    # Model Management Layer
    uc_model_development = Ellipse((18, 62), 11, 6, facecolor='#e1f5fe', edgecolor='#0277bd', linewidth=2)
    ax.add_patch(uc_model_development)
    ax.text(18, 62, 'Model\nDevelopment', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_model_training = Ellipse((32, 62), 11, 6, facecolor='#e1f5fe', edgecolor='#0277bd', linewidth=2)
    ax.add_patch(uc_model_training)
    ax.text(32, 62, 'Model\nTraining', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_model_validation = Ellipse((46, 62), 11, 6, facecolor='#e1f5fe', edgecolor='#0277bd', linewidth=2)
    ax.add_patch(uc_model_validation)
    ax.text(46, 62, 'Model\nValidation', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_model_deployment = Ellipse((60, 62), 11, 6, facecolor='#e1f5fe', edgecolor='#0277bd', linewidth=2)
    ax.add_patch(uc_model_deployment)
    ax.text(60, 62, 'Model\nDeployment', fontsize=8, fontweight='bold', ha='center', va='center')
    
    # Pattern Recognition Layer
    uc_pattern_discovery = Ellipse((18, 52), 11, 6, facecolor='#e8f5e8', edgecolor='#388e3c', linewidth=2)
    ax.add_patch(uc_pattern_discovery)
    ax.text(18, 52, 'Pattern\nDiscovery', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_regex_patterns = Ellipse((32, 52), 11, 6, facecolor='#e8f5e8', edgecolor='#388e3c', linewidth=2)
    ax.add_patch(uc_regex_patterns)
    ax.text(32, 52, 'Regex\nPatterns', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_semantic_analysis = Ellipse((46, 52), 11, 6, facecolor='#e8f5e8', edgecolor='#388e3c', linewidth=2)
    ax.add_patch(uc_semantic_analysis)
    ax.text(46, 52, 'Semantic\nAnalysis', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_statistical_analysis = Ellipse((60, 52), 11, 6, facecolor='#e8f5e8', edgecolor='#388e3c', linewidth=2)
    ax.add_patch(uc_statistical_analysis)
    ax.text(60, 52, 'Statistical\nAnalysis', fontsize=8, fontweight='bold', ha='center', va='center')
    
    # Governance & Quality Layer
    uc_expert_review = Ellipse((18, 42), 11, 6, facecolor='#fce4ec', edgecolor='#ad1457', linewidth=2)
    ax.add_patch(uc_expert_review)
    ax.text(18, 42, 'Expert\nReview', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_approval_workflow = Ellipse((32, 42), 11, 6, facecolor='#fce4ec', edgecolor='#ad1457', linewidth=2)
    ax.add_patch(uc_approval_workflow)
    ax.text(32, 42, 'Approval\nWorkflow', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_quality_assurance = Ellipse((46, 42), 11, 6, facecolor='#fce4ec', edgecolor='#ad1457', linewidth=2)
    ax.add_patch(uc_quality_assurance)
    ax.text(46, 42, 'Quality\nAssurance', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_exception_handling = Ellipse((60, 42), 11, 6, facecolor='#fce4ec', edgecolor='#ad1457', linewidth=2)
    ax.add_patch(uc_exception_handling)
    ax.text(60, 42, 'Exception\nHandling', fontsize=8, fontweight='bold', ha='center', va='center')
    
    # Monitoring & Optimization Layer
    uc_performance_monitoring = Ellipse((18, 32), 11, 6, facecolor='#f3e5f5', edgecolor='#7b1fa2', linewidth=2)
    ax.add_patch(uc_performance_monitoring)
    ax.text(18, 32, 'Performance\nMonitoring', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_drift_detection = Ellipse((32, 32), 11, 6, facecolor='#f3e5f5', edgecolor='#7b1fa2', linewidth=2)
    ax.add_patch(uc_drift_detection)
    ax.text(32, 32, 'Drift\nDetection', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_bias_analysis = Ellipse((46, 32), 11, 6, facecolor='#f3e5f5', edgecolor='#7b1fa2', linewidth=2)
    ax.add_patch(uc_bias_analysis)
    ax.text(46, 32, 'Bias\nAnalysis', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_explainability = Ellipse((60, 32), 11, 6, facecolor='#f3e5f5', edgecolor='#7b1fa2', linewidth=2)
    ax.add_patch(uc_explainability)
    ax.text(60, 32, 'Model\nExplainability', fontsize=8, fontweight='bold', ha='center', va='center')
    
    # Integration & Automation Layer
    uc_pipeline_integration = Ellipse((25, 22), 11, 6, facecolor='#e0f2f1', edgecolor='#00695c', linewidth=2)
    ax.add_patch(uc_pipeline_integration)
    ax.text(25, 22, 'Pipeline\nIntegration', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_auto_labeling = Ellipse((39, 22), 11, 6, facecolor='#e0f2f1', edgecolor='#00695c', linewidth=2)
    ax.add_patch(uc_auto_labeling)
    ax.text(39, 22, 'Automated\nLabeling', fontsize=8, fontweight='bold', ha='center', va='center')
    
    uc_continuous_learning = Ellipse((53, 22), 11, 6, facecolor='#e0f2f1', edgecolor='#00695c', linewidth=2)
    ax.add_patch(uc_continuous_learning)
    ax.text(53, 22, 'Continuous\nLearning', fontsize=8, fontweight='bold', ha='center', va='center')
    
    # === ACTOR-USE CASE RELATIONSHIPS ===
    
    # Data Scientist relationships
    ax.annotate('', xy=(12.5, 82), xytext=(7, 84),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    ax.annotate('', xy=(12.5, 62), xytext=(7, 84),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    ax.annotate('', xy=(12.5, 52), xytext=(7, 84),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    ax.annotate('', xy=(40.5, 32), xytext=(7, 84),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    ax.annotate('', xy=(54.5, 32), xytext=(7, 84),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    
    # ML Engineer relationships
    ax.annotate('', xy=(54.5, 62), xytext=(7, 74),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    ax.annotate('', xy=(12.5, 32), xytext=(7, 74),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    ax.annotate('', xy=(26.5, 32), xytext=(7, 74),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    ax.annotate('', xy=(19.5, 22), xytext=(7, 74),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    ax.annotate('', xy=(47.5, 22), xytext=(7, 74),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    
    # AI Researcher relationships
    ax.annotate('', xy=(26.5, 82), xytext=(7, 64),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    ax.annotate('', xy=(40.5, 82), xytext=(7, 64),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    ax.annotate('', xy=(54.5, 82), xytext=(7, 64),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    ax.annotate('', xy=(68.5, 82), xytext=(7, 64),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    ax.annotate('', xy=(54.5, 32), xytext=(7, 64),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    
    # Data Steward relationships
    ax.annotate('', xy=(12.5, 42), xytext=(7, 51),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    ax.annotate('', xy=(40.5, 42), xytext=(7, 51),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    ax.annotate('', xy=(12.5, 72), xytext=(7, 51),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    ax.annotate('', xy=(54.5, 72), xytext=(7, 51),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    ax.annotate('', xy=(26.5, 42), xytext=(7, 51),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    
    # Compliance Officer relationships
    ax.annotate('', xy=(40.5, 72), xytext=(7, 41),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    ax.annotate('', xy=(26.5, 72), xytext=(7, 41),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    ax.annotate('', xy=(40.5, 32), xytext=(7, 41),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    ax.annotate('', xy=(40.5, 42), xytext=(7, 41),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    
    # Privacy Officer relationships
    ax.annotate('', xy=(26.5, 72), xytext=(7, 31),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    ax.annotate('', xy=(40.5, 72), xytext=(7, 31),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    ax.annotate('', xy=(40.5, 32), xytext=(7, 31),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    
    # Subject Expert relationships
    ax.annotate('', xy=(12.5, 42), xytext=(7, 21),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    ax.annotate('', xy=(54.5, 72), xytext=(7, 21),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    ax.annotate('', xy=(40.5, 52), xytext=(7, 21),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    ax.annotate('', xy=(54.5, 82), xytext=(7, 21),
                arrowprops=dict(arrowstyle='->', color='#374151', lw=1.5))
    
    # === SECONDARY ACTOR INTEGRATIONS ===
    
    # ML Frameworks integrations
    ax.annotate('', xy=(87, 82), xytext=(93, 84),
                arrowprops=dict(arrowstyle='<->', color='#6b7280', lw=1, linestyle='dotted'))
    ax.annotate('', xy=(87, 62), xytext=(93, 84),
                arrowprops=dict(arrowstyle='<->', color='#6b7280', lw=1, linestyle='dotted'))
    
    # Cloud AI integrations
    ax.annotate('', xy=(87, 82), xytext=(93, 74),
                arrowprops=dict(arrowstyle='<->', color='#6b7280', lw=1, linestyle='dotted'))
    ax.annotate('', xy=(87, 62), xytext=(93, 74),
                arrowprops=dict(arrowstyle='<->', color='#6b7280', lw=1, linestyle='dotted'))
    
    # NLP Services integrations
    ax.annotate('', xy=(87, 52), xytext=(93, 64),
                arrowprops=dict(arrowstyle='<->', color='#6b7280', lw=1, linestyle='dotted'))
    ax.annotate('', xy=(87, 72), xytext=(93, 64),
                arrowprops=dict(arrowstyle='<->', color='#6b7280', lw=1, linestyle='dotted'))
    
    # Training Data integrations
    ax.annotate('', xy=(87, 62), xytext=(93, 51),
                arrowprops=dict(arrowstyle='<->', color='#6b7280', lw=1, linestyle='dotted'))
    ax.annotate('', xy=(87, 32), xytext=(93, 51),
                arrowprops=dict(arrowstyle='<->', color='#6b7280', lw=1, linestyle='dotted'))
    
    # Knowledge Bases integrations
    ax.annotate('', xy=(87, 52), xytext=(93, 41),
                arrowprops=dict(arrowstyle='<->', color='#6b7280', lw=1, linestyle='dotted'))
    ax.annotate('', xy=(87, 72), xytext=(93, 41),
                arrowprops=dict(arrowstyle='<->', color='#6b7280', lw=1, linestyle='dotted'))
    
    # Data Sources integrations
    ax.annotate('', xy=(87, 82), xytext=(93, 31),
                arrowprops=dict(arrowstyle='<->', color='#6b7280', lw=1, linestyle='dotted'))
    ax.annotate('', xy=(87, 52), xytext=(93, 31),
                arrowprops=dict(arrowstyle='<->', color='#6b7280', lw=1, linestyle='dotted'))
    
    # Governance Systems integrations
    ax.annotate('', xy=(87, 72), xytext=(93, 21),
                arrowprops=dict(arrowstyle='<->', color='#6b7280', lw=1, linestyle='dotted'))
    ax.annotate('', xy=(87, 42), xytext=(93, 21),
                arrowprops=dict(arrowstyle='<->', color='#6b7280', lw=1, linestyle='dotted'))
    
    # === USE CASE DEPENDENCIES ===
    
    # Include relationships
    ax.annotate('', xy=(23.5, 72), xytext=(18, 82),
                arrowprops=dict(arrowstyle='->', color='#6b7280', lw=1, linestyle='dashed'))
    ax.text(20.75, 77, '<<includes>>', fontsize=6, ha='center', va='center', style='italic', rotation=60)
    
    ax.annotate('', xy=(23.5, 62), xytext=(18, 62),
                arrowprops=dict(arrowstyle='->', color='#6b7280', lw=1, linestyle='dashed'))
    ax.text(20.75, 62, '<<includes>>', fontsize=6, ha='center', va='bottom', style='italic')
    
    ax.annotate('', xy=(37.5, 62), xytext=(32, 62),
                arrowprops=dict(arrowstyle='->', color='#6b7280', lw=1, linestyle='dashed'))
    ax.text(34.75, 64, '<<includes>>', fontsize=6, ha='center', va='bottom', style='italic')
    
    ax.annotate('', xy=(51.5, 62), xytext=(46, 62),
                arrowprops=dict(arrowstyle='->', color='#6b7280', lw=1, linestyle='dashed'))
    ax.text(48.75, 64, '<<includes>>', fontsize=6, ha='center', va='bottom', style='italic')
    
    ax.annotate('', xy=(23.5, 42), xytext=(18, 42),
                arrowprops=dict(arrowstyle='->', color='#6b7280', lw=1, linestyle='dashed'))
    ax.text(20.75, 44, '<<includes>>', fontsize=6, ha='center', va='bottom', style='italic')
    
    ax.annotate('', xy=(23.5, 32), xytext=(18, 32),
                arrowprops=dict(arrowstyle='->', color='#6b7280', lw=1, linestyle='dashed'))
    ax.text(20.75, 34, '<<includes>>', fontsize=6, ha='center', va='bottom', style='italic')
    
    # Extend relationships
    ax.annotate('', xy=(26.5, 82), xytext=(18, 82),
                arrowprops=dict(arrowstyle='->', color='#9ca3af', lw=1, linestyle='dashdot'))
    ax.text(22.25, 84, '<<extends>>', fontsize=6, ha='center', va='bottom', style='italic', color='#6b7280')
    
    ax.annotate('', xy=(40.5, 72), xytext=(18, 72),
                arrowprops=dict(arrowstyle='->', color='#9ca3af', lw=1, linestyle='dashdot'))
    ax.text(29.25, 74, '<<extends>>', fontsize=6, ha='center', va='bottom', style='italic', color='#6b7280')
    
    ax.annotate('', xy=(40.5, 52), xytext=(18, 52),
                arrowprops=dict(arrowstyle='->', color='#9ca3af', lw=1, linestyle='dashdot'))
    ax.text(29.25, 54, '<<extends>>', fontsize=6, ha='center', va='bottom', style='italic', color='#6b7280')
    
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
    
    ax.text(50, 6.5, 'AI-Powered Data Classification Module - Advanced Use Case Architecture', 
            fontsize=16, fontweight='bold', ha='center', va='center')
    
    # Actor Legend
    ax.text(13, 5, '🤖 AI/ML Pros', fontsize=9, ha='left', va='center',
            bbox=dict(boxstyle="round,pad=0.2", facecolor='#fef3c7', alpha=0.7))
    ax.text(13, 4, '👤 Governance', fontsize=9, ha='left', va='center',
            bbox=dict(boxstyle="round,pad=0.2", facecolor='#dcfce7', alpha=0.7))
    ax.text(13, 3, '👩‍🏫 Experts', fontsize=9, ha='left', va='center',
            bbox=dict(boxstyle="round,pad=0.2", facecolor='#fce7f3', alpha=0.7))
    
    # Use Case Legend
    ax.text(28, 5, '🤖 AI Classification', fontsize=9, ha='left', va='center',
            bbox=dict(boxstyle="round,pad=0.2", facecolor='#fef3c7', alpha=0.7))
    ax.text(28, 4, '🏷️ Labeling', fontsize=9, ha='left', va='center',
            bbox=dict(boxstyle="round,pad=0.2", facecolor='#fff8e1', alpha=0.7))
    ax.text(28, 3, '🎓 Models', fontsize=9, ha='left', va='center',
            bbox=dict(boxstyle="round,pad=0.2", facecolor='#e1f5fe', alpha=0.7))
    
    ax.text(48, 5, '🔍 Patterns', fontsize=9, ha='left', va='center',
            bbox=dict(boxstyle="round,pad=0.2", facecolor='#e8f5e8', alpha=0.7))
    ax.text(48, 4, '📋 Governance', fontsize=9, ha='left', va='center',
            bbox=dict(boxstyle="round,pad=0.2", facecolor='#fce4ec', alpha=0.7))
    ax.text(48, 3, '📊 Monitoring', fontsize=9, ha='left', va='center',
            bbox=dict(boxstyle="round,pad=0.2", facecolor='#f3e5f5', alpha=0.7))
    
    ax.text(68, 5, '🔄 Integration', fontsize=9, ha='left', va='center',
            bbox=dict(boxstyle="round,pad=0.2", facecolor='#e0f2f1', alpha=0.7))
    ax.text(68, 4, '🧠 AI Platforms', fontsize=9, ha='left', va='center',
            bbox=dict(boxstyle="round,pad=0.2", facecolor='#e0f2f1', alpha=0.7))
    ax.text(68, 3, '📚 Data Systems', fontsize=9, ha='left', va='center',
            bbox=dict(boxstyle="round,pad=0.2", facecolor='#e3f2fd', alpha=0.7))
    
    plt.tight_layout()
    return fig

# Generate the diagram
fig = create_classification_usecase_diagram()
plt.savefig('/workspace/classification_usecase_diagram.png', dpi=300, bbox_inches='tight')
plt.show()