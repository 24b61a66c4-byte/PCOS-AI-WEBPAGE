import json
import time
import os
from datetime import datetime

COLLAB_FILE = 'ai-collab.json'
LAST_STATE = None

print('AI Collab Watcher started. Monitoring for changes...')

def read_collab():
    with open(COLLAB_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

def process_new_messages(messages):
    # Example: Print new messages, trigger AI actions, etc.
    for msg in messages:
        print(f"[{msg.get('timestamp')}] {msg.get('from')}: {msg.get('content')}")

while True:
    try:
        if not os.path.exists(COLLAB_FILE):
            time.sleep(2)
            continue
        data = read_collab()
        messages = data.get('messages', [])
        # Detect new messages
        if LAST_STATE is None or len(messages) > len(LAST_STATE):
            process_new_messages(messages[len(LAST_STATE or []):])
            LAST_STATE = list(messages)
        time.sleep(2)
    except Exception as e:
        print('Error:', e)
        time.sleep(5)
