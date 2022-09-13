import { CommandInteraction } from 'discord.js'
import { Discord, SimpleCommand, SimpleCommandMessage, Slash } from 'discordx'
import { CommandReturn } from '../utils/Types'

@Discord()
class Issues {
  private url = 'https://github.com/Brexbot/DiscordBot/issues'

  @SimpleCommand('issues')
  simple(command: SimpleCommandMessage): CommandReturn {
    return command.message.reply(this.url)
  }

  @Slash('issues', { description: "Output link to this bot's issues on GitHub" })
  async slash(interaction: CommandInteraction): CommandReturn {
    return interaction.reply(this.url)
  }
}
