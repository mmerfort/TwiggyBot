import { ApplicationCommandOptionType, CommandInteraction } from 'discord.js'
import { Discord, SimpleCommand, SimpleCommandMessage, Slash, SlashOption } from 'discordx'
import { CommandReturn } from '../utils/Types'

@Discord()
class Eightball {
  protected replies = [
    'It is certain.',
    'It is decidedly so.',
    'Without a doubt.',
    'Yes definitely.',
    'You may rely on it.',
    'As I see it, yes.',
    'Most likely.',
    'Outlook good.',
    'Yes.',
    'Signs point to yes.',
    'Reply hazy, try again.',
    'Ask again later.',
    'Better not tell you now.',
    'Cannot predict now.',
    'Concentrate and ask again.',
    "Don't count on it.",
    'My reply is no.',
    'My sources say no.',
    'Outlook not so good.',
    'Very doubtful. ',
  ]

  private mention = false

  @SimpleCommand('eightball')
  simple(command: SimpleCommandMessage): CommandReturn {
    return command.message.reply(this.getMessage())
  }

  @Slash('eightball', { description: 'Eightball' })
  async slash(
    @SlashOption('message', { type: ApplicationCommandOptionType.String, required: false })
    message: string,
    interaction: CommandInteraction
  ): CommandReturn {
    let reply = this.getMessage()
    if (message) {
      reply = `${message} - ${reply}`
    }
    return interaction.reply(reply)
  }

  private getMessage(): string {
    return this.replies[Math.floor(Math.random() * this.replies.length)]
  }
}
