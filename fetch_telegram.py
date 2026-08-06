import asyncio
import json
import os
from telethon import TelegramClient
from telethon.sessions import StringSession

API_ID = int(os.environ["TELEGRAM_API_ID"])
API_HASH = os.environ["TELEGRAM_API_HASH"]
SESSION_STRING = os.environ["TELEGRAM_SESSION"]

# Ganti dengan username/link channel publik yang ingin kamu ambil datanya (tanpa tanda @)
CHANNELS = ["@hafayutv", "@pelajarsunnahid"]


async def fetch_messages():
    async with TelegramClient(
        StringSession(SESSION_STRING), API_ID, API_HASH
    ) as client:
        all_posts = []

        for channel in CHANNELS:
            try:
                # Mengambil 10 pesan terbaru dari setiap channel
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

        # Urutkan postingan dari yang terbaru
        all_posts.sort(key=lambda x: x["date"], reverse=True)

        # Simpan ke dalam folder data/posts.json
        os.makedirs("data", exist_ok=True)
        with open("data/posts.json", "w", encoding="utf-8") as f:
            json.dump(all_posts, f, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    asyncio.run(fetch_messages())