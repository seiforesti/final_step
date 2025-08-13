# -------------------------
# Dockerfile - extractor
# -------------------------
    FROM python:3.9-slim

    # Mise à jour et installation des outils nécessaires
    RUN apt-get update && apt-get install -y \
        iputils-ping \
        build-essential \
        libssl-dev \
        libffi-dev \
        libpq-dev \
        python3-dev \
        gcc \
        netcat-openbsd \
        bash \
        default-mysql-client \
        postgresql-client \
        && apt-get clean \
        && rm -rf /var/lib/apt/lists/*
    
    # Ajouter le script wait-for-it.sh dans le conteneur
    COPY wait-for-it.sh /wait-for-it.sh
    RUN chmod +x /wait-for-it.sh
    
    # Définir le répertoire de travail
    WORKDIR /app
    COPY . /app
    
    # Installation des dépendances
    # Install torch first to ensure CPU-only version and avoid large downloads
    RUN pip install --no-cache-dir --default-timeout=600 torch==2.3.1+cpu -f https://download.pytorch.org/whl/torch_stable.html
    # Then install the rest of the requirements (sentence-transformers will use the installed torch)
    COPY requirements.txt .
    RUN pip install --no-cache-dir --timeout=120 -r requirements.txt
    RUN chmod +x /app/entrypoint.sh

    # Exposer le port 8000
    EXPOSE 8000
    
    # Lancement avec attente de tous les services avant de démarrer uvicorn
    ENTRYPOINT ["/bin/bash", "-c","./entrypoint.sh"]
    CMD ["/wait-for-it.sh mysql-server 3306 60 && \
          /wait-for-it.sh postgres-server 5432 60 && \
          /wait-for-it.sh mongo-server 27017 60 && \
          uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"]
