# Discord Token Checker Bot

This is an **open-source** Discord bot that allows users to check the validity of multiple Discord tokens by uploading a `.txt` file.

## Add the Bot to Your Server
If you don't want to go through this whole setup you can also add our hosted bot bellow:
[Invite the Bot](https://discord.com/oauth2/authorize?client_id=1345469589651325059&permissions=8&integration_type=0&scope=bot)

## Features
- Checks if tokens are **valid** or **invalid**.
- Identifies if the account has **Nitro**, **email verification**, **phone verification**, and **2FA enabled**.
- Determines if the token can **boost** a server.
- Generates and sends a **summary report** to the user.
- Saves results into `.txt` files for easy access.
- **100% Safe** – This bot does **not** collect, store, or share any data.

## Installation Guide

### 1. Install Node.js
This bot requires **Node.js** to run. If you don't have it installed, follow this tutorial: [How to Install Node.js](https://www.youtube.com/watch?v=kQabFyl9r9I).

To check if Node.js is installed, run:
```
node -v
```

### 2. Clone the Repository
```sh
git clone https://github.com/ProjectIMA/token-checker-bot/
cd discord-token-checker
```

### 3. Install Dependencies
```sh
npm install
```

### 4. Set Up Environment Variables
Create a `.env` file and add the following:
```
DISCORD_BOT_TOKEN=your-bot-token
DISCORD_CLIENT_ID=your-client-id
```
Replace `your-bot-token` and `your-client-id` with your actual Discord bot credentials.

### 5. Start the Bot
```sh
node bot.js
```

## Usage Guide
1. Upload a `.txt` file with Discord tokens.
2. The bot will process them and return a report.
3. Results are sent to your DMs and saved as `.txt` files.

## **Privacy & Data Protection**
We take **privacy seriously**. This bot **does not collect, store, or share any user data**. All token verification is done locally on your machine, and no data is saved or transmitted elsewhere.

## License
This project is **open source**. Feel free to modify, share, and improve it.

---
**GitHub Repository:** [[https://github.com/ProjectIMA/token-checker-bot](https://github.com/ProjectIMA/token-checker-bot/)
