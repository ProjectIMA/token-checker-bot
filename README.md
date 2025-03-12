Your `README.md` is already well-written and comprehensive! However, I noticed a few areas where we can improve clarity, formatting, and consistency. Here's the updated version:

---

# Discord Token Checker Bot

This is an **open-source** Discord bot that allows users to check the validity of multiple Discord tokens by uploading a `.txt` file.

## Add the Bot to Your Server (Optional)
If you don't want to go through the setup process, you can add our hosted bot below:
[Invite the Bot](https://discord.com/oauth2/authorize?client_id=1345469589651325059&permissions=8&integration_type=0&scope=bot)

---

## Features
- Checks if tokens are **valid** or **invalid**.
- Identifies if the account has **Nitro**, **email verification**, **phone verification**, and **2FA enabled**.
- Determines if the token can **boost** a server.
- Generates and sends a **summary report** to the user.
- Saves results into `.txt` files for easy access.
- **100% Safe** – This bot does **not** collect, store, or share any data.

---

## Full Setup Guide

### 1. Install Node.js
This bot requires **Node.js** to run. If you don't have it installed, follow this tutorial: [How to Install Node.js](https://www.youtube.com/watch?v=kQabFyl9r9I).

To check if Node.js is installed, open a terminal or command prompt and run:
```sh
node -v
```
If Node.js is installed, you will see a version number.

---

### 2. Install Git (Optional but Recommended)
If you don’t have Git installed, download and install it from [git-scm.com](https://git-scm.com/downloads).

To check if Git is installed, run:
```sh
git --version
```
If installed, it will show the version number.

---

### 3. Clone the Repository
Open a terminal or command prompt and run:
```sh
git clone https://github.com/ProjectIMA/token-checker-bot.git
cd token-checker-bot
```
If you don’t have Git, you can manually download the ZIP file from GitHub and extract it.

---

### 4. Install Dependencies
Inside the `token-checker-bot` folder, run:
```sh
npm install
```
This will install all required dependencies for the bot.

#### Required Dependencies:
- **discord.js** (Main Discord API library)
- **discord.js-selfbot-v13** (For selfbot authentication)
- **dotenv** (For environment variables management)
- **axios** (For making API requests)
- **moment** (For date/time formatting)
- **chalk** (For colorful terminal output)

---

### 5. Set Up Environment Variables
Create a new file named `.env` in the `token-checker-bot` folder and add the following:
```env
DISCORD_BOT_TOKEN=your-bot-token
DISCORD_CLIENT_ID=your-client-id
```
Replace `your-bot-token` and `your-client-id` with your actual Discord bot credentials.

---

### 6. Enable Privileged Intents (Important)
1. Go to the [Discord Developer Portal](https://discord.com/developers/applications).
2. Click on your bot application.
3. Navigate to **Bot** settings.
4. Enable **Presence Intent**, **Server Members Intent**, and **Message Content Intent**.
5. Save the changes.

---

### 7. Start the Bot
Run the bot with the following command:
```sh
npm start
```
If everything is set up correctly, you should see a message saying the bot is online.

---

### 8. Invite Your Bot to a Server
To add your bot to a Discord server, use this invite link (replace `your-client-id` with your actual client ID):
```
https://discord.com/oauth2/authorize?client_id=your-client-id&permissions=8&scope=bot
```

---

## Usage Guide
1. Upload a `.txt` file with Discord tokens.
2. The bot will process them and return a report.
3. Results are sent to your DMs and saved as `.txt` files.

---

## Privacy & Data Protection
We take **privacy seriously**. This bot **does not collect, store, or share any user data**. All token verification is done locally on your machine, and no data is saved or transmitted elsewhere.

---

## License
This project is **open source**. Feel free to modify, share, and improve it.

---
**GitHub Repository:** [https://github.com/ProjectIMA/token-checker-bot](https://github.com/ProjectIMA/token-checker-bot/)

---

### Key Improvements:
1. **Consistent Formatting**:
   - Added section dividers (`---`) for better readability.
   - Improved spacing and alignment.

2. **Updated Dependencies**:
   - Added `chalk` to the list of required dependencies.

3. **Simplified Commands**:
   - Replaced `npm install discord.js discord.js-selfbot-v13 dotenv axios moment` with `npm install` since all dependencies are listed in `package.json`.

4. **Clarified Instructions**:
   - Added more context to the "Enable Privileged Intents" section.
   - Simplified the "Start the Bot" section to use `npm start`.

5. **Fixed Grammar and Typos**:
   - Improved sentence structure and fixed minor typos.

---
