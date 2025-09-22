#!/usr/bin/env python3
"""
🎨 ENTERPRISE CLASS DIAGRAM GENERATOR
====================================

This script helps generate visual class diagrams from the architecture code.
Supports multiple output formats and tools.

Usage:
    python generate_diagrams.py --method mermaid
    python generate_diagrams.py --method plantuml
    python generate_diagrams.py --method all
"""

import os
import sys
import argparse
import subprocess
import webbrowser
from pathlib import Path

class DiagramGenerator:
    def __init__(self):
        self.base_path = Path(__file__).parent
        self.mermaid_file = self.base_path / "ADVANCED_ENTERPRISE_CLASS_DIAGRAM_ARCHITECTURE.md"
        self.plantuml_file = self.base_path / "PLANTUML_CLASS_DIAGRAM.puml"
        self.output_dir = self.base_path / "generated_diagrams"
        
        # Create output directory
        self.output_dir.mkdir(exist_ok=True)
    
    def extract_mermaid_code(self):
        """Extract Mermaid code from the architecture document"""
        print("📊 Extracting Mermaid diagram code...")
        
        with open(self.mermaid_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Extract the main diagram
        start_marker = "```mermaid\ngraph TB"
        end_marker = "```"
        
        start_idx = content.find(start_marker)
        if start_idx == -1:
            print("❌ Could not find Mermaid diagram in architecture file")
            return None
            
        start_idx += len("```mermaid\n")
        end_idx = content.find(end_marker, start_idx)
        
        if end_idx == -1:
            print("❌ Could not find end of Mermaid diagram")
            return None
            
        mermaid_code = content[start_idx:end_idx].strip()
        
        # Save extracted code
        mermaid_output = self.output_dir / "enterprise_class_diagram.mmd"
        with open(mermaid_output, 'w', encoding='utf-8') as f:
            f.write(mermaid_code)
        
        print(f"✅ Mermaid code saved to: {mermaid_output}")
        return mermaid_output
    
    def generate_mermaid_online(self):
        """Open Mermaid Live Editor with the diagram"""
        print("🌐 Opening Mermaid Live Editor...")
        
        mermaid_file = self.extract_mermaid_code()
        if not mermaid_file:
            return False
        
        # Open Mermaid Live Editor
        webbrowser.open("https://mermaid.live/")
        
        print("📋 Instructions:")
        print("1. Copy the content from:", mermaid_file)
        print("2. Paste it into the Mermaid Live Editor")
        print("3. Export as PNG, SVG, or PDF")
        print("4. The diagram will render automatically")
        
        return True
    
    def generate_mermaid_cli(self):
        """Generate diagram using Mermaid CLI"""
        print("🔧 Generating diagram with Mermaid CLI...")
        
        # Check if mermaid CLI is installed
        try:
            subprocess.run(["mmdc", "--version"], check=True, capture_output=True)
        except (subprocess.CalledProcessError, FileNotFoundError):
            print("❌ Mermaid CLI not found. Install it with:")
            print("   npm install -g @mermaid-js/mermaid-cli")
            return False
        
        mermaid_file = self.extract_mermaid_code()
        if not mermaid_file:
            return False
        
        # Generate different formats
        formats = [
            ("png", "enterprise_class_diagram.png"),
            ("svg", "enterprise_class_diagram.svg"),
            ("pdf", "enterprise_class_diagram.pdf")
        ]
        
        for fmt, filename in formats:
            output_path = self.output_dir / filename
            try:
                cmd = [
                    "mmdc", 
                    "-i", str(mermaid_file),
                    "-o", str(output_path),
                    "-t", "dark",
                    "-b", "transparent"
                ]
                subprocess.run(cmd, check=True)
                print(f"✅ Generated {fmt.upper()}: {output_path}")
            except subprocess.CalledProcessError as e:
                print(f"❌ Failed to generate {fmt.upper()}: {e}")
        
        return True
    
    def generate_plantuml_online(self):
        """Open PlantUML online editor"""
        print("🌐 Opening PlantUML Online Editor...")
        
        webbrowser.open("http://www.plantuml.com/plantuml/uml/")
        
        print("📋 Instructions:")
        print("1. Copy the content from:", self.plantuml_file)
        print("2. Paste it into the PlantUML Online Editor")
        print("3. The diagram will render automatically")
        print("4. Download as PNG, SVG, or other formats")
        
        return True
    
    def generate_plantuml_cli(self):
        """Generate diagram using PlantUML CLI"""
        print("🔧 Generating diagram with PlantUML CLI...")
        
        # Check if PlantUML is available
        plantuml_jar = "plantuml.jar"
        if not Path(plantuml_jar).exists():
            print("❌ PlantUML jar not found. Download it from:")
            print("   https://plantuml.com/download")
            print("   Place plantuml.jar in the same directory as this script")
            return False
        
        # Generate diagram
        output_path = self.output_dir / "enterprise_class_diagram_plantuml.png"
        try:
            cmd = [
                "java", "-jar", plantuml_jar,
                "-o", str(self.output_dir),
                str(self.plantuml_file)
            ]
            subprocess.run(cmd, check=True)
            print(f"✅ Generated PlantUML diagram: {output_path}")
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to generate PlantUML diagram: {e}")
            return False
        
        return True
    
    def create_html_viewer(self):
        """Create an HTML file to view the diagrams"""
        print("📄 Creating HTML viewer...")
        
        html_content = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🏗️ Enterprise Class Diagram Architecture</title>
    <script src="https://unpkg.com/mermaid@10.6.1/dist/mermaid.min.js"></script>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            padding: 30px;
        }
        h1 {
            text-align: center;
            color: #2c3e50;
            margin-bottom: 30px;
            font-size: 2.5em;
        }
        .diagram-container {
            text-align: center;
            margin: 30px 0;
            padding: 20px;
            border: 2px solid #e74c3c;
            border-radius: 10px;
            background: #f8f9fa;
        }
        .instructions {
            background: #e8f5e8;
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
            border-left: 5px solid #27ae60;
        }
        .method-section {
            margin: 30px 0;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 8px;
            background: #f9f9f9;
        }
        .method-title {
            color: #e74c3c;
            font-size: 1.3em;
            margin-bottom: 15px;
        }
        code {
            background: #f4f4f4;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
        }
        .link-button {
            display: inline-block;
            background: #3498db;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            margin: 5px;
            transition: background 0.3s;
        }
        .link-button:hover {
            background: #2980b9;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🏗️ Enterprise Class Diagram Architecture</h1>
        <p style="text-align: center; font-size: 1.2em; color: #7f8c8d;">
            PurSight Data Governance Platform - 400+ Models System
        </p>
        
        <div class="instructions">
            <h3>🎯 How to Generate Your Visual Diagram:</h3>
            <p>Choose one of the methods below to create your visual class diagram:</p>
        </div>
        
        <div class="method-section">
            <div class="method-title">🌐 METHOD 1: Online Mermaid Editor (Recommended)</div>
            <p>1. <a href="https://mermaid.live/" target="_blank" class="link-button">Open Mermaid Live Editor</a></p>
            <p>2. Copy the Mermaid code from: <code>generated_diagrams/enterprise_class_diagram.mmd</code></p>
            <p>3. Paste it into the editor and export as PNG/SVG/PDF</p>
        </div>
        
        <div class="method-section">
            <div class="method-title">🎨 METHOD 2: PlantUML Online</div>
            <p>1. <a href="http://www.plantuml.com/plantuml/uml/" target="_blank" class="link-button">Open PlantUML Online</a></p>
            <p>2. Copy the PlantUML code from: <code>PLANTUML_CLASS_DIAGRAM.puml</code></p>
            <p>3. Paste it into the editor for automatic rendering</p>
        </div>
        
        <div class="method-section">
            <div class="method-title">💻 METHOD 3: Command Line Tools</div>
            <p><strong>Mermaid CLI:</strong></p>
            <p><code>npm install -g @mermaid-js/mermaid-cli</code></p>
            <p><code>mmdc -i enterprise_class_diagram.mmd -o diagram.png</code></p>
            
            <p><strong>PlantUML CLI:</strong></p>
            <p><code>java -jar plantuml.jar PLANTUML_CLASS_DIAGRAM.puml</code></p>
        </div>
        
        <div class="method-section">
            <div class="method-title">🔧 METHOD 4: VS Code Extensions</div>
            <p>Install extensions:</p>
            <ul>
                <li><strong>Mermaid Preview</strong> by bierner.markdown-mermaid</li>
                <li><strong>PlantUML</strong> by jebbs.plantuml</li>
            </ul>
            <p>Then preview the diagram files directly in VS Code</p>
        </div>
        
        <div class="instructions">
            <h3>📊 Architecture Highlights:</h3>
            <ul>
                <li>🎯 <strong>7 Core Module Groups</strong> with master orchestration</li>
                <li>🔐 <strong>Fort Cohesion & Faible Couplage</strong> design principles</li>
                <li>🚫 <strong>Loop-Free Architecture</strong> with hierarchical dependencies</li>
                <li>🤖 <strong>AI-First Approach</strong> with intelligent optimization</li>
                <li>🏢 <strong>Enterprise-Ready</strong> with multi-tenant support</li>
                <li>📈 <strong>400+ Models</strong> across all governance domains</li>
            </ul>
        </div>
        
        <div style="text-align: center; margin-top: 40px; color: #7f8c8d;">
            <p>🏆 This architecture represents a piece of art engineering that balances complexity with maintainability</p>
        </div>
    </div>

    <script>
        mermaid.initialize({ startOnLoad: true, theme: 'default' });
    </script>
</body>
</html>
        """
        
        html_file = self.output_dir / "diagram_viewer.html"
        with open(html_file, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        print(f"✅ HTML viewer created: {html_file}")
        
        # Open in browser
        webbrowser.open(f"file://{html_file.absolute()}")
        
        return True

def main():
    parser = argparse.ArgumentParser(
        description="Generate Enterprise Class Diagrams",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
    python generate_diagrams.py --method mermaid
    python generate_diagrams.py --method plantuml  
    python generate_diagrams.py --method all
    python generate_diagrams.py --method html
        """
    )
    
    parser.add_argument(
        '--method',
        choices=['mermaid', 'plantuml', 'all', 'html'],
        default='html',
        help='Generation method (default: html)'
    )
    
    args = parser.parse_args()
    
    generator = DiagramGenerator()
    
    print("🎨 Enterprise Class Diagram Generator")
    print("=" * 40)
    
    success = True
    
    if args.method in ['mermaid', 'all']:
        print("\n📊 Generating Mermaid diagrams...")
        if not generator.generate_mermaid_online():
            success = False
        
        # Try CLI generation
        generator.generate_mermaid_cli()
    
    if args.method in ['plantuml', 'all']:
        print("\n🎨 Generating PlantUML diagrams...")
        if not generator.generate_plantuml_online():
            success = False
        
        # Try CLI generation
        generator.generate_plantuml_cli()
    
    if args.method in ['html', 'all']:
        print("\n📄 Creating HTML viewer...")
        generator.create_html_viewer()
    
    if success:
        print("\n✅ Diagram generation completed successfully!")
        print(f"📁 Check the '{generator.output_dir}' directory for generated files")
    else:
        print("\n⚠️  Some generation methods failed, but files are available for manual processing")
    
    print("\n🎯 Next Steps:")
    print("1. Use the online editors for immediate results")
    print("2. Install CLI tools for automated generation")
    print("3. Use VS Code extensions for development workflow")

if __name__ == "__main__":
    main()