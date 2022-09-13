import { CommandInteraction } from 'discord.js'
import { Discord, SimpleCommand, SimpleCommandMessage, Slash } from 'discordx'

import { ClientCredentialsAuthProvider } from '@twurple/auth'
import { ApiClient } from '@twurple/api'
import { CommandReturn } from '../utils/Types'

const formatTimeString = (duration: number) => {
  const seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24),
    days = Math.floor((duration / (1000 * 60 * 60 * 24)) % 365)

  const daysStr = days > 0 ? days + 'd ' : ''
  const hoursStr = String(hours).padStart(2, '0') + 'h '
  const minutesStr = String(minutes).padStart(2, '0') + 'm '
  const secondsStr = String(seconds).padStart(2, '0') + 's'

  return daysStr + hoursStr + minutesStr + secondsStr
}

@Discord()
class LastStream {
  private client: ApiClient

  constructor() {
    const twitchSecret: string = process.env.TWITCH_SECRET ?? ''
    const twitchClientID: string = process.env.TWITCH_CLIENT_ID ?? ''

    if (twitchSecret === '' || twitchClientID === '') {
      throw new Error('TWITCH_SECRET and TWITCH_CLIENT_ID must both be set.')
    }

    const authProvider = new ClientCredentialsAuthProvider(twitchClientID, twitchSecret)
    this.client = new ApiClient({ authProvider })
  }

  @SimpleCommand('flaststream')
  async simple(command: SimpleCommandMessage): CommandReturn {
    const lastStream = await this.getLastStream()
    if (lastStream == -1) {
      return command.message.reply({
        content: 'Bananasaurus_Rex is streaming right now',
        allowedMentions: { repliedUser: false },
      })
    }
    if (lastStream === null) {
      return command.message.reply({ content: 'Something went wrong', allowedMentions: { repliedUser: false } })
    }
    return command.message.reply({
      content: `Bananasaurus_Rex was last seen streaming ${formatTimeString(lastStream)} ago`,
      allowedMentions: { repliedUser: false },
    })
  }

  @Slash('flaststream', { description: "Get time since Rex's last stream" })
  async slash(interaction: CommandInteraction): CommandReturn {
    await interaction.deferReply()

    const lastStream = await this.getLastStream()

    if (lastStream == -1) {
      return interaction.followUp("Bananasaurus_Rex's stream is currently live. Why are you checking for it here?")
    }
    if (lastStream === null) {
      return interaction.followUp('Something went wrong')
    }
    return interaction.followUp(`Bananasaurus_Rex was last seen streaming ${formatTimeString(lastStream)} seconds ago`)
  }

  // Joke versions
  @SimpleCommand('flatstream')
  async simpleFlat(command: SimpleCommandMessage): CommandReturn {
    return command.message.channel.send('🐊')
  }

  @SimpleCommand('fartstream')
  async simpleFart(command: SimpleCommandMessage): CommandReturn {
    await command.message.channel.send('💨')
  }

  private async getLastStream(): Promise<number | null> {
    const rex = await this.client.users.getUserByName('bananasaurus_rex')
    if (!rex) {
      // Something went wrong here
      return null
    }

    const stream = await rex.getStream()
    if (stream !== null) {
      // Currently streaming
      return -1
    }

    const { data: videos } = await this.client.videos.getVideosByUser(rex.id, { type: 'archive' })
    if (videos.length == 0) {
      return null
    }
    const { creationDate, durationInSeconds } = videos[0]
    return Date.now() - creationDate.setSeconds(creationDate.getSeconds() + durationInSeconds)
  }
}
