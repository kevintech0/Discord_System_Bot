# Discord System Bot

A feature-rich Discord bot built with Discord.js v14, featuring ticket management, giveaways, invoicing, and role management systems.

## Table of Contents
- [Requirements](#requirements)
- [Installation](#installation)
- [Configuration](#configuration)
  - [Discord Developer Portal Setup](#discord-developer-portal-setup)
  - [Environment Variables](#environment-variables)
  - [MongoDB Setup](#mongodb-setup)
- [Running the Bot](#running-the-bot)
- [Features](#features)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## Requirements
Before you begin, ensure you have:

- **Node.js** v16.0.0 or higher ([Download](https://nodejs.org/))
- **npm** v6.0.0 or higher (comes with Node.js)
- A **Discord Server** for testing
- A **MongoDB Database** (free tier available at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- A **Discord Bot Application** (instructions below)

## Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/kevintech0/Discord_System_Bot.git
cd System_Bot
```

### Step 2: Install Dependencies

Install all required npm packages:

```bash
npm install
```

This will install:
- `discord.js` - Discord API library
- `mongoose` - MongoDB connection & ORM
- `dotenv` - Environment variable management
- And other required dependencies (see `package.json`)

### Step 3: Verify Installation

After installation, verify that all dependencies are correctly installed:

```bash
npm list
```

## Configuration

### Discord Developer Portal Setup

Follow these steps to create and configure your Discord bot:

#### 1. Create a Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name (e.g., "Nexode Bot")
3. Navigate to the "Bot" tab on the left
4. Click "Add Bot"

#### 2. Configure Bot Permissions

1. Go to the "Bot" tab
2. Under "TOKEN", click "Copy" to copy your bot token (you'll need this later)
3. Scroll down to "Intents" and enable the following:
   - ✅ PRESENCE INTENT
   - ✅ SERVER MEMBERS INTENT
   - ✅ MESSAGE CONTENT INTENT

4. Under "Gateway Intents", ensure these are enabled:
   - ✅ Privileged Gateway Intents (all 3 options)

#### 3. Set Bot Permissions and Invite URL

1. Go to the "OAuth2" tab
2. Select the "bot" scope
3. Select these permissions:
   - ✅ Administrator (or select specific permissions)
   - ✅ Send Messages
   - ✅ Read Messages/View Channels
   - ✅ Manage Channels
   - ✅ Manage Roles
   - ✅ Embed Links
   - ✅ Attach Files
   - ✅ Read Message History
   - ✅ Connect (for voice)
   - ✅ Speak (for voice)

4. Copy the generated invite URL at the bottom
5. Open it in your browser to invite the bot to your test server

#### 4. Get Required Discord IDs

To find Discord IDs, enable Developer Mode in Discord:
- User Settings → Advanced → Enable Developer Mode

Then right-click any user/channel/role and select "Copy User/Channel/Role ID"

Required IDs:
- **Your User ID** (for OWNER_IDS)
- **Error Logs Channel ID** (create a private channel for bot logs)
- **Ticket Category Channel IDs** (create 3 categories: Developer, Designer, Support)

### Environment Variables

#### 1. Create `.env` File

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Or on Windows:
```bash
copy .env.example .env
```

#### 2. Configure `.env` File

Open `.env` in your text editor and fill in the required values:

```env
# Discord Bot Token (from Discord Developer Portal)
DISCORD_TOKEN=your_bot_token_here

# Bot Settings
BOT_PREFIX=?

# Your Discord User ID(s) - comma-separated for multiple owners
OWNER_IDS=123456789012345678,987654321098765432

# Channel ID where bot errors are logged
ERROR_LOGS_CHANNEL=123456789012345678

# MongoDB Connection String (see MongoDB Setup section)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name

# Ticket Category Channel IDs (create these channels in your server)
TICKET_CATEGORY_DEVELOPER=123456789012345678
TICKET_CATEGORY_DESIGNER=123456789012345678
TICKET_CATEGORY_SUPPORT=123456789012345678

# Custom Emoji IDs (find these in your Discord server)
# You can customize these or use default Unicode emojis
EMOJI_NEXODE=<:Nexode_Purple:1430201537254133903>
EMOJI_DONE=<:n_done:1431067075916595210>
EMOJI_FAILED=<:n_failed:1431067072313692181>
EMOJI_ERROR=<:n_error:1431067073886556242>
EMOJI_LOADING=<a:n_loading:1430368974448627712>
EMOJI_ENABLED=<:enabled:1274048281671893144>
EMOJI_DISABLED=<:disabled:1274048277431451759>
EMOJI_STAR=<:n_star:1431066460071137370>
EMOJI_LINK=<:n_like:1431068325072343231>
```

**Important:** Never commit the `.env` file to version control. It's already in `.gitignore`.

### MongoDB Setup

The bot uses MongoDB for persistent data storage (tickets, invoices, giveaways, sellers).

#### Option 1: MongoDB Atlas (Recommended for beginners)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a new project
4. Click "Build a Cluster" and select the free tier
5. Wait for the cluster to be created
6. Click "Connect" and select "Connect Your Application"
7. Copy the connection string
8. Replace `<username>` and `<password>` with your database credentials
9. Replace `<mydatabase>` with your database name (e.g., "nexode-bot")
10. Add this to your `.env`:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nexode-bot
```

#### Option 2: Local MongoDB

If you want to run MongoDB locally:

1. Install MongoDB from [mongodb.com/download](https://www.mongodb.com/try/download/community)
2. Start the MongoDB service
3. In your `.env`, use:

```env
MONGODB_URI=mongodb://localhost:27017/nexode-bot
```

**Note:** The bot will automatically create the required collections in MongoDB.

## Running the Bot

### Start the Bot

After configuration, run:

```bash
npm start
```

You should see output like:
```
✓ Bot is ready! Logged in as BotName#0000
✓ Loaded X commands
✓ Loaded X event handlers
✓ Connected to MongoDB
```

### Development Mode (with auto-reload)

For development, use the watch mode to automatically restart on file changes:

```bash
npm run dev
```

### Stopping the Bot

Press `Ctrl + C` in the terminal to stop the bot.

## Features

### Bot Systems

- **Ticket Management System** - Create, manage, and close support tickets
- **Giveaway System** - Create and manage giveaways with automatic role/entry management
- **Invoice System** - Generate, track, and manage invoices
- **Profile Management** - User profile system for sellers and staff
- **Auto Moderation** - Automatic reactions, mentions, roles, and replies
- **Staff Tools** - Apply system, embed generator, role management, reminders

### Command Categories

| Category | Features |
|----------|----------|
| **Ticket** | create, claim, close, delete, rename, add/remove members, transcript |
| **Giveaway** | create, list, end, delete, reroll |
| **Invoice** | create, list, pay, cancel, rate seller, generate links |
| **Staff** | apply management, embed editor, roster, reminders |
| **Admin** | Dev commands, apply control, offer management |
| **Auto** | Automatic reactions, mentions, roles, replies, and tax calculations |

## Project Structure

```
System/
├── src/
│   ├── Bot.js                 # Main bot entry point
│   ├── Config.js              # Configuration (uses .env)
│   ├── Commands/              # Command files
│   │   ├── Dev/               # Developer commands
│   │   ├── Giveaway/          # Giveaway commands
│   │   ├── Invoice/           # Invoice commands
│   │   ├── Staff/             # Staff commands
│   │   └── Ticket/            # Ticket commands
│   ├── Database/              # Database schemas & models
│   ├── Events/                # Discord event handlers
│   │   ├── Auto/              # Automatic features
│   │   ├── Client/            # Client events
│   │   ├── Giveaway/          # Giveaway events
│   │   ├── Interactions/      # Button/menu interactions
│   │   ├── Invoices/          # Invoice events
│   │   ├── Messages/          # Message events
│   │   └── Ticket/            # Ticket events
│   ├── Handlers/              # Command/event handlers
│   ├── Structures/            # Bot client structure
│   ├── Utils/                 # Utility functions
│   ├── Json/                  # Local JSON database (empty by default)
│   └── Assets/                # Images and static files
├── .env.example               # Environment variables template
├── .gitignore                 # Git ignore rules
├── package.json               # Dependencies and scripts
└── README.md                  # This file
```

## Troubleshooting
### Bot Won't Start

**Error: "Cannot find module 'discord.js'"**
- Solution: Run `npm install` to install all dependencies

**Error: "DISCORD_TOKEN is invalid"**
- Check that your `.env` file exists and contains the correct token
- Verify the token hasn't expired/been regenerated in Discord Developer Portal
- Ensure no extra spaces or quotes around the token value

**Error: "Cannot connect to MongoDB"**
- Verify your MongoDB connection string in `.env`
- Check if MongoDB service is running (for local MongoDB)
- Ensure you've added your IP address to MongoDB Atlas whitelist
- Verify username and password are correct

### Bot Doesn't Respond to Commands

1. Check that the bot has the correct intents enabled in Discord Developer Portal
2. Verify the bot has ADMINISTRATOR permission in your test server
3. Check that commands are properly loaded - look for "Loaded X commands" in startup logs
4. Enable Discord Developer Mode and check channel/server IDs in error logs

### Database Issues

- Check that `.env` has a valid MONGODB_URI
- Verify MongoDB connection with the provided connection string
- Look for connection errors in console logs

### Missing Emojis

- If custom emojis don't appear, the emoji server IDs may have changed
- Remove emoji IDs from `.env` to use default Unicode emojis instead
- Or add your own custom emojis to your Discord server and update the IDs

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License - see the `LICENSE` file for details.

## Support

For issues or questions:
- Check the [Troubleshooting](#troubleshooting) section
- Review the `src/Utils/Logger.js` output for error messages
- Open an issue on GitHub

---

**Happy botting! 🎉**
