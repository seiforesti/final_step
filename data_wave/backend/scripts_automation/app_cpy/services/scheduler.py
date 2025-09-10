from apscheduler.schedulers.background import BackgroundScheduler
from typing import Callable, Any, Tuple
import asyncio


class SchedulerService:
    """Lightweight wrapper around APScheduler to schedule async tasks."""

    def __init__(self) -> None:
        self._scheduler = BackgroundScheduler()
        if not self._scheduler.running:
            self._scheduler.start()

    async def schedule_task(
        self,
        task_name: str,
        delay_seconds: int,
        task_func: Callable[..., Any],
        args: Tuple[Any, ...] | None = None,
        kwargs: dict | None = None,
    ) -> None:
        args = args or tuple()
        kwargs = kwargs or {}

        loop = asyncio.get_running_loop()

        def _runner():
            try:
                loop.call_soon_threadsafe(asyncio.create_task, task_func(*args, **kwargs))
            except RuntimeError:
                # In case no running loop, create a new one (best-effort fallback)
                asyncio.run(task_func(*args, **kwargs))

        from datetime import datetime, timedelta
        run_date = datetime.now() + timedelta(seconds=delay_seconds)
        self._scheduler.add_job(_runner, 'date', run_date=run_date, id=task_name, replace_existing=True)


# Backward-compatible function
def schedule_tasks():
    # No-op default; retained for backward compatibility with existing callers
    if not hasattr(schedule_tasks, "_scheduler"):
        schedule_tasks._scheduler = BackgroundScheduler()
        schedule_tasks._scheduler.start()
