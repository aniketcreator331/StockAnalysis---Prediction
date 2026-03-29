import sqlite3
import hashlib

DB_APP = "users.db"

def init_db():
    conn = sqlite3.connect(DB_APP)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS users
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE, password_hash TEXT)''')
    conn.commit()
    conn.close()

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def create_user(email: str, password: str) -> bool:
    conn = sqlite3.connect(DB_APP)
    c = conn.cursor()
    try:
        c.execute("INSERT INTO users (email, password_hash) VALUES (?, ?)", (email, hash_password(password)))
        conn.commit()
        return True
    except sqlite3.IntegrityError:
        return False
    finally:
        conn.close()

def verify_user(email: str, password: str) -> bool:
    conn = sqlite3.connect(DB_APP)
    c = conn.cursor()
    c.execute("SELECT * FROM users WHERE email=? AND password_hash=?", (email, hash_password(password)))
    user = c.fetchone()
    conn.close()
    return user is not None

# Initialize the database when the module is imported
init_db()
