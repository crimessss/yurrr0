import fetch from 'node-fetch';
import IcecastParser from 'icecast-parser';
import { config } from 'dotenv';

config();

export class MusicPlayer {
  constructor() {
    this.queue = [];
    this.isPlaying = false;
    this.currentTrack = null;
    this.streamParser = null;
    this.streamUrl = `${process.env.ICECAST_HOST}:${process.env.ICECAST_PORT}/${process.env.ICECAST_MOUNT}`;
  }

  addToQueue(track) {
    this.queue.push(track);
    return this.queue.length;
  }

  removeFromQueue(index) {
    if (index >= 0 && index < this.queue.length) {
      return this.queue.splice(index, 1)[0];
    }
    return null;
  }

  async play(bot) {
    if (this.isPlaying) return false;
    
    this.isPlaying = true;
    
    try {
      await bot.playEmote('dance');
      
      // Initialize Icecast stream parser with authentication
      this.streamParser = new IcecastParser({
        url: this.streamUrl,
        keepListen: true,
        autoUpdate: true,
        metadataInterval: 5000,
        auth: {
          username: process.env.ICECAST_USERNAME,
          password: process.env.ICECAST_PASSWORD
        }
      });

      this.streamParser.on('metadata', async (metadata) => {
        if (metadata.StreamTitle) {
          await bot.chat(`Now playing: ${metadata.StreamTitle}`);
        }
      });

      this.streamParser.on('stream', async (stream) => {
        await bot.chat('Connected to Icecast stream successfully!');
      });

      this.streamParser.on('error', async (error) => {
        console.error('Stream error:', error);
        await bot.chat('Stream error occurred. Attempting to reconnect...');
        this.reconnect(bot);
      });

    } catch (error) {
      console.error('Error playing stream:', error);
      this.isPlaying = false;
      await bot.chat('Failed to connect to stream. Please check server status.');
    }
  }

  async reconnect(bot) {
    this.stop();
    setTimeout(async () => {
      await this.play(bot);
    }, 5000);
  }

  stop() {
    if (this.streamParser) {
      this.streamParser.stop();
      this.streamParser = null;
    }
    this.isPlaying = false;
  }

  getStreamStatus() {
    return this.isPlaying;
  }

  async validateStreamConnection() {
    try {
      const response = await fetch(this.streamUrl, {
        method: 'HEAD',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${process.env.ICECAST_USERNAME}:${process.env.ICECAST_PASSWORD}`).toString('base64')
        },
        timeout: 5000
      });
      return response.ok;
    } catch (error) {
      console.error('Stream validation error:', error);
      return false;
    }
  }
}