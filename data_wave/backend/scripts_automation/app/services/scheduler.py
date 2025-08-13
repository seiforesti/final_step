from apscheduler.schedulers.background import BackgroundScheduler
from app.services.extraction_service import extract_sql_schema

def schedule_tasks():
    scheduler = BackgroundScheduler()
    scheduler.add_job(
        lambda: extract_sql_schema("postgresql://...", "postgresql"),
        trigger='interval', minutes=60
    )
    scheduler.start()
