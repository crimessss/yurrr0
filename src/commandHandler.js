export class CommandHandler {
  constructor(player) {
    this.player = player;
    this.prefix = '!';
    this.commands = {
      play: this.play.bind(this),
      stop: this.stop.bind(this),
      status: this.status.bind(this),
      help: this.help.bind(this)
    };
  }

  async handleCommand(message, user, bot) {
    if (!message.startsWith(this.prefix)) return;

    const args = message.slice(this.prefix.length).trim().split(' ');
    const command = args.shift().toLowerCase();

    if (this.commands[command]) {
      await this.commands[command](args, user, bot);
    }
  }

  async play(args, user, bot) {
    const isValid = await this.player.validateStreamConnection();
    if (!isValid) {
      await bot.chat('Unable to connect to stream. Please check if the server is online.');
      return;
    }

    if (this.player.getStreamStatus()) {
      await bot.chat('Stream is already playing!');
      return;
    }

    await bot.chat('Connecting to stream...');
    await this.player.play(bot);
  }

  async stop(args, user, bot) {
    this.player.stop();
    await bot.chat('Stream playback stopped');
  }

  async status(args, user, bot) {
    const isPlaying = this.player.getStreamStatus();
    await bot.chat(isPlaying ? 'Stream is currently playing' : 'Stream is stopped');
  }

  async help(args, user, bot) {
    const helpMessage = `Available commands:
    !play - Start playing the Icecast stream
    !stop - Stop the stream
    !status - Check stream status
    !help - Show this help message`;
    
    await bot.chat(helpMessage);
  }
}