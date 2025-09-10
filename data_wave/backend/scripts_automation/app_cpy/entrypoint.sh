#!/bin/bash
echo "📦 Container initialisé"
echo "🚀 Lancement du watcher automatique en arrière-plan..."
python watcher_and_dynamic_trainer.py &

echo "⏳ Attente des dépendances (Postgres, Redis, Mongo) via wait-for-it..."
/wait-for-it.sh postgres 5432 60
/wait-for-it.sh redis 6379 60
/wait-for-it.sh mongodb 27017 60

echo "🟢 Démarrage d'Uvicorn"
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
