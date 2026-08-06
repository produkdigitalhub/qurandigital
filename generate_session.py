from telethon.sync import TelegramClient
from telethon.sessions import StringSession

api_id = int(input("38828922 "))
api_hash = input("7d2b8b00305fe4614bfc9c04661e0877 ")

with TelegramClient(StringSession(), api_id, api_hash) as client:
    print("\n--- SIMPAN STRING DI BAWAH INI ---")
    print(client.session.save())
    print("---------------------------------\n")