"""
ml_retraining_job.py
Background job for periodic ML retraining using feedback and historical data.
"""
import time
from app.db_session import get_session
from sqlalchemy.orm import Session
from sensitivity_labeling.ml_service import ml_suggestion_service

def retrain_job():
    db: Session = get_session()
    try:
        ml_suggestion_service.retrain_from_feedback(db)
    finally:
        db.close()

if __name__ == "__main__":
    while True:
        retrain_job()
        time.sleep(86400)  # Retrain every 24 hours
