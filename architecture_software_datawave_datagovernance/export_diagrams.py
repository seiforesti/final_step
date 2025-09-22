#!/usr/bin/env python3
"""
DataWave Data Governance System - Diagram Export Utility
========================================================

This script exports Mermaid diagrams to various formats (SVG, PNG, PDF)
using the Mermaid CLI tool.

Prerequisites:
- Node.js 18+
- @mermaid-js/mermaid-cli installed globally: npm install -g @mermaid-js/mermaid-cli
- Puppeteer dependencies for headless Chrome

Usage:
    python export_diagrams.py [--format svg|png|pdf] [--all] [--diagram DIAGRAM_NAME]

Examples:
    python export_diagrams.py --all                    # Export all diagrams to SVG
    python export_diagrams.py --format png --all       # Export all diagrams to PNG
    python export_diagrams.py --diagram component      # Export component diagram to SVG
"""

import os
import sys
import subprocess
import argparse
from pathlib import Path
from typing import List, Dict, Optional

class DiagramExporter:
    """Utility class for exporting Mermaid diagrams to various formats."""
    
    def __init__(self, base_dir: str = None):
        """Initialize the exporter with base directory."""
        self.base_dir = Path(base_dir) if base_dir else Path(__file__).parent
        self.diagrams_dir = self.base_dir / "diagrams"
        self.exports_dir = self.base_dir / "exports"
        
        # Diagram definitions
        self.diagrams = {
            "component": {
                "file": "01_advanced_component_diagram.mmd",
                "title": "Advanced Component Architecture",
                "description": "Comprehensive component architecture with detailed service interactions"
            },
            "package": {
                "file": "02_advanced_package_diagram.mmd",
                "title": "Advanced Package Structure",
                "description": "Detailed package dependencies and modular organization"
            },
            "sequence": {
                "file": "03_advanced_sequence_diagrams.mmd",
                "title": "Advanced Sequence Diagrams",
                "description": "Critical system interaction flows and workflows"
            },
            "deployment": {
                "file": "04_advanced_deployment_diagram.mmd",
                "title": "Advanced Deployment Architecture",
                "description": "Cloud-native deployment on Azure Kubernetes Service"
            },
            "usecase": {
                "file": "05_advanced_usecase_diagram.mmd",
                "title": "Advanced Use Case Diagram",
                "description": "Comprehensive user interactions and system capabilities"
            },
            "state": {
                "file": "06_advanced_state_diagram.mmd",
                "title": "Advanced State Diagram",
                "description": "System state transitions and lifecycle management"
            },
            "activity": {
                "file": "07_advanced_activity_diagram.mmd",
                "title": "Advanced Activity Diagram",
                "description": "Detailed business process flows and workflows"
            }
        }
        
        # Supported formats
        self.formats = ["svg", "png", "pdf"]
        
    def setup_directories(self):
        """Create necessary export directories."""
        for format_type in self.formats:
            export_path = self.exports_dir / format_type
            export_path.mkdir(parents=True, exist_ok=True)
            print(f"✅ Created directory: {export_path}")
    
    def check_prerequisites(self) -> bool:
        """Check if required tools are installed."""
        try:
            # Check if mmdc (Mermaid CLI) is installed
            result = subprocess.run(["mmdc", "--version"], 
                                  capture_output=True, text=True, check=True)
            print(f"✅ Mermaid CLI found: {result.stdout.strip()}")
            return True
        except (subprocess.CalledProcessError, FileNotFoundError):
            print("❌ Mermaid CLI not found. Please install it with:")
            print("   npm install -g @mermaid-js/mermaid-cli")
            return False
    
    def export_diagram(self, diagram_name: str, format_type: str = "svg") -> bool:
        """Export a single diagram to the specified format."""
        if diagram_name not in self.diagrams:
            print(f"❌ Unknown diagram: {diagram_name}")
            return False
        
        if format_type not in self.formats:
            print(f"❌ Unsupported format: {format_type}")
            return False
        
        diagram_info = self.diagrams[diagram_name]
        input_file = self.diagrams_dir / diagram_info["file"]
        output_file = self.exports_dir / format_type / f"{diagram_name}_diagram.{format_type}"
        
        if not input_file.exists():
            print(f"❌ Input file not found: {input_file}")
            return False
        
        try:
            # Prepare mermaid CLI command
            cmd = [
                "mmdc",
                "-i", str(input_file),
                "-o", str(output_file),
                "-t", "dark",  # Use dark theme
                "-b", "white",  # White background
                "--width", "1920",  # High resolution
                "--height", "1080"
            ]
            
            # Add format-specific options
            if format_type == "png":
                cmd.extend(["--scale", "2"])  # High DPI for PNG
            elif format_type == "pdf":
                cmd.extend(["--pdfFit", "true"])  # Fit to page for PDF
            
            print(f"🔄 Exporting {diagram_info['title']} to {format_type.upper()}...")
            
            # Execute the export command
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            
            if output_file.exists():
                file_size = output_file.stat().st_size
                print(f"✅ Successfully exported: {output_file} ({file_size:,} bytes)")
                return True
            else:
                print(f"❌ Export failed: Output file not created")
                return False
                
        except subprocess.CalledProcessError as e:
            print(f"❌ Export failed: {e}")
            if e.stderr:
                print(f"   Error details: {e.stderr}")
            return False
    
    def export_all_diagrams(self, format_type: str = "svg") -> Dict[str, bool]:
        """Export all diagrams to the specified format."""
        results = {}
        
        print(f"\n🚀 Starting bulk export to {format_type.upper()} format...")
        print("=" * 60)
        
        for diagram_name in self.diagrams:
            success = self.export_diagram(diagram_name, format_type)
            results[diagram_name] = success
            print()  # Add spacing between exports
        
        # Summary
        successful = sum(1 for success in results.values() if success)
        total = len(results)
        
        print("=" * 60)
        print(f"📊 Export Summary: {successful}/{total} diagrams exported successfully")
        
        if successful < total:
            failed = [name for name, success in results.items() if not success]
            print(f"❌ Failed exports: {', '.join(failed)}")
        
        return results
    
    def generate_export_report(self) -> str:
        """Generate a report of all exported diagrams."""
        report_lines = [
            "# DataWave Architecture Diagrams - Export Report",
            "",
            f"Generated on: {subprocess.run(['date'], capture_output=True, text=True).stdout.strip()}",
            "",
            "## Available Diagrams",
            ""
        ]
        
        for diagram_name, info in self.diagrams.items():
            report_lines.extend([
                f"### {info['title']}",
                f"**File**: `{info['file']}`  ",
                f"**Description**: {info['description']}  ",
                ""
            ])
            
            # Check which formats are available
            available_formats = []
            for format_type in self.formats:
                export_file = self.exports_dir / format_type / f"{diagram_name}_diagram.{format_type}"
                if export_file.exists():
                    file_size = export_file.stat().st_size
                    available_formats.append(f"[{format_type.upper()}](./{format_type}/{diagram_name}_diagram.{format_type}) ({file_size:,} bytes)")
            
            if available_formats:
                report_lines.extend([
                    "**Available Formats**: " + " | ".join(available_formats),
                    ""
                ])
        
        report_lines.extend([
            "## Usage Instructions",
            "",
            "1. **SVG Files**: Best for web display and scalable graphics",
            "2. **PNG Files**: High-resolution raster images for presentations",
            "3. **PDF Files**: Print-ready documents",
            "",
            "## Viewing Diagrams",
            "",
            "- **Online**: Upload to [Mermaid Live Editor](https://mermaid.live/)",
            "- **VS Code**: Use Mermaid Preview extension",
            "- **Command Line**: Use `mmdc` CLI tool",
            "",
            "---",
            "",
            "*Report generated by DataWave Diagram Export Utility*"
        ])
        
        return "\n".join(report_lines)
    
    def save_export_report(self):
        """Save the export report to a markdown file."""
        report_content = self.generate_export_report()
        report_file = self.exports_dir / "EXPORT_REPORT.md"
        
        with open(report_file, 'w', encoding='utf-8') as f:
            f.write(report_content)
        
        print(f"📄 Export report saved: {report_file}")

def main():
    """Main function to handle command line arguments and execute exports."""
    parser = argparse.ArgumentParser(
        description="Export DataWave architecture diagrams to various formats",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s --all                    Export all diagrams to SVG
  %(prog)s --format png --all       Export all diagrams to PNG  
  %(prog)s --diagram component      Export component diagram to SVG
  %(prog)s --format pdf --diagram deployment  Export deployment diagram to PDF
        """
    )
    
    parser.add_argument(
        "--format", 
        choices=["svg", "png", "pdf"], 
        default="svg",
        help="Output format (default: svg)"
    )
    
    parser.add_argument(
        "--all", 
        action="store_true",
        help="Export all diagrams"
    )
    
    parser.add_argument(
        "--diagram",
        choices=["component", "package", "sequence", "deployment", "usecase", "state", "activity"],
        help="Export specific diagram"
    )
    
    parser.add_argument(
        "--report",
        action="store_true",
        help="Generate export report"
    )
    
    args = parser.parse_args()
    
    # Validate arguments
    if not args.all and not args.diagram and not args.report:
        parser.error("Must specify --all, --diagram, or --report")
    
    # Initialize exporter
    exporter = DiagramExporter()
    
    print("🏛️ DataWave Data Governance System - Diagram Export Utility")
    print("=" * 60)
    
    # Check prerequisites
    if not exporter.check_prerequisites():
        sys.exit(1)
    
    # Setup directories
    exporter.setup_directories()
    print()
    
    # Execute export operations
    if args.all:
        exporter.export_all_diagrams(args.format)
    elif args.diagram:
        exporter.export_diagram(args.diagram, args.format)
    
    # Generate report
    if args.report or args.all:
        exporter.save_export_report()
    
    print("\n🎉 Export process completed!")
    print(f"📁 Check the exports directory: {exporter.exports_dir}")

if __name__ == "__main__":
    main()