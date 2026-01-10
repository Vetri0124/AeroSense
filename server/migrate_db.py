import sqlite3
import os

db_path = "user_db.sqlite"

if os.path.exists(db_path):
    print(f"Migrating {db_path}...")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Add email column
        cursor.execute("ALTER TABLE users ADD COLUMN email TEXT")
        print("Added column: email")
    except sqlite3.OperationalError as e:
        print(f"Skipping email: {e}")
        
    try:
        # Add password_hash column
        cursor.execute("ALTER TABLE users ADD COLUMN password_hash TEXT")
        print("Added column: password_hash")
    except sqlite3.OperationalError as e:
        print(f"Skipping password_hash: {e}")
        
    try:
        # Add is_active column
        cursor.execute("ALTER TABLE users ADD COLUMN is_active INTEGER DEFAULT 1")
        print("Added column: is_active")
    except sqlite3.OperationalError as e:
        print(f"Skipping is_active: {e}")
        
    conn.commit()
    conn.close()
    print("Migration complete.")
else:
    print(f"{db_path} not found. No migration needed.")
