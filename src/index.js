import { Highrise } from 'highrise-js-sdk';
import { config } from 'dotenv';
import { MusicPlayer } from './musicPlayer.js';
import { CommandHandler } from './commandHandler.js';

config();

class MusicBot {
  constructor() {
    this.bot = new Highrise(process.env.BOT_TOKEN);
    this.player = new MusicPlayer();
    this.commandHandler = new CommandHandler(this.player);
  }

  async start() {
    try {
      await this.bot.connect(process.env.ROOM_ID);
      console.log('Bot connected successfully!');
      
      this.bot.on('chat', async (user, message) => {
        await this.commandHandler.handleCommand(message, user, this.bot);
      });

      console.log('Bot is ready and listening for commands!');
    } catch (error) {
      console.error('Failed to connect:', error);
    }
  }
}

const bot = new MusicBot();
bot.start();