from telethon.sessions import StringSession
from telethon.sync import TelegramClient

# Masukkan credentials langsung di dalam variabel
api_id = 38828922
api_hash = "7d2b8b00305fe4614bfc9c04661e0877"

with TelegramClient(StringSession(), api_id, api_hash) as client:
    print("\n========================================")
    print("INILAH VALUE UNTUK TELEGRAM_SESSION:")
    print(client.session.save())
    print("========================================\n")