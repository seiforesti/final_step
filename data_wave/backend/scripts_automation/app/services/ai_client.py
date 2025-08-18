import requests

class OllamaClient:
    """
    A simple client to interact with the local Ollama server API.
    """
    def __init__(self, base_url="http://localhost:11434", model="llama3"):
        self.base_url = base_url
        self.model = model

    def ask(self, prompt: str) -> str:
        url = f"{self.base_url}/api/generate"
        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": False
        }
        try:
            response = requests.post(url, json=payload)
            response.raise_for_status()
            # 🔥 Correct here: expect 'generated_text' not 'response'
            return response.json().get("generated_text", "").strip()
        except requests.RequestException as e:
            return f"Error contacting Ollama API: {e}"
