#!/usr/bin/env python3

from app.db_session import get_session
from sqlmodel import SQLModel
from contextlib import contextmanager

def check_tables():
    with get_session() as session:
        inspector = session.get_bind().dialect.inspector(session.get_bind())
        tables = inspector.get_table_names()
        print(f'Total tables created: {len(tables)}')
        print('Tables:', sorted(tables)[:10], '...' if len(tables) > 10 else '')
        return len(tables)

if __name__ == "__main__":
    check_tables()
