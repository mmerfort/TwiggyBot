import { ApplicationCommandOptionType, CommandInteraction } from 'discord.js'
import {
  Discord,
  SimpleCommand,
  SimpleCommandMessage,
  SimpleCommandOption,
  SimpleCommandOptionType,
  Slash,
  SlashOption,
} from 'discordx'
import { spongeCase } from 'sponge-case'
import { CommandReturn } from '../utils/Types'

@Discord()
class Spongebob {
  private mainChannel = '103678524375699456'

  @SimpleCommand('sb', { description: 'Spongebobify text', argSplitter: '\n' })
  async simple(
    @SimpleCommandOption('text', { type: SimpleCommandOptionType.String }) text: string | undefined,
    command: SimpleCommandMessage
  ): CommandReturn {
    if (!text) {
      return command.message.reply({
        content: 'Usage: >sb <text> (More than 200 characters only outside of the main channel)',
        allowedMentions: { repliedUser: false },
      })
    }
    if (text.length > 200 && command.message.channel.id === this.mainChannel) {
      return command.message.reply({
        content: 'Messages longer than 200 characters are only allowed outside of the main channel.',
        allowedMentions: { repliedUser: false },
      })
    }
    return command.message.reply({ content: spongeCase(text), allowedMentions: { repliedUser: false } })
  }

  @Slash('sb', { description: 'Spongebobify text' })
  async slash(
    @SlashOption('text', { type: ApplicationCommandOptionType.String })
    message: string,
    interaction: CommandInteraction
  ): CommandReturn {
    if (message.length > 200 && interaction.channel?.id === this.mainChannel) {
      return interaction.reply({
        content: 'Messages longer than 200 characters are only allowed outside of the main channel.',
        ephemeral: true,
      })
    }
    return interaction.reply(spongeCase(message))
  }
}
