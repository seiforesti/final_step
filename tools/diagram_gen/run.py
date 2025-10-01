import os
import subprocess


def main():
    models_root = os.environ.get("MODELS_ROOT", "app/models")
    out_dir = "architecture/generated_class_diagrams"
    os.makedirs(out_dir, exist_ok=True)

    subprocess.check_call([
        "python", "tools/diagram_gen/extract_models.py",
        "--models-root", models_root,
        "--out-json", os.path.join(out_dir, "models_graph.json"),
    ])

    subprocess.check_call([
        "python", "tools/diagram_gen/generate_mermaid.py",
        "--graph-json", os.path.join(out_dir, "models_graph.json"),
        "--out-dir", out_dir,
    ])

    print("Done. See architecture/generated_class_diagrams/")


if __name__ == "__main__":
    main()


