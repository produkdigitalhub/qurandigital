import asyncio
import json
import os
from telethon import TelegramClient
from telethon.sessions import StringSession

API_ID = int(os.environ["TELEGRAM_API_ID"])
API_HASH = os.environ["TELEGRAM_API_HASH"]

# Mengambil session string dan membersihkan spasi/petik ekstra
SESSION_STRING = os.environ.get("TELEGRAM_SESSION", "").strip().strip('"\'')

# Menambahkan padding otomatis jika panjang string kurang (kelipatan 4)
if SESSION_STRING:
    missing_padding = len(SESSION_STRING) % 4
    if missing_padding:
        SESSION_STRING += "=" * (4 - missing_padding)

CHANNELS = ["hafayutv", "pelajarsunnahid"]



async def fetch_messages():
    async with TelegramClient(
        StringSession(SESSION_STRING), API_ID, API_HASH
    ) as client:
        all_posts = []

        for channel in CHANNELS:
            try:
                async for message in client.iter_messages(channel, limit=10):
                    if message.text:
                        all_posts.append(
                            {
                                "channel": channel,
                                "id": message.id,
                                "date": message.date.strftime(
                                    "%Y-%m-%d %H:%M:%S"
                                ),
                                "text": message.text,
                            }
                        )
            except Exception as e:
                print(f"Gagal mengambil pesan dari {channel}: {e}")

        all_posts.sort(key=lambda x: x["date"], reverse=True)

        os.makedirs("data", exist_ok=True)
        with open("data/posts.json", "w", encoding="utf-8") as f:
            json.dump(all_posts, f, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    asyncio.run(fetch_messages())
