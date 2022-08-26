import { CommandInteraction } from 'discord.js'
import { Discord, Slash, SlashGroup, SlashOption } from 'discordx'
import { injectable } from 'tsyringe'
import { prisma } from '../../prisma/generated/prisma-client-js'
import { ORM } from '../persistence/ORM'

@SlashGroup({ name: 'chatdins', description: 'What did chat have for din-dins?' })
@SlashGroup('chatdins')
@injectable()
@Discord()
class Chatdins {
  public constructor(private client: ORM) {}


  @Slash('add', { description: 'Add link to your dinner' })
  async add(
    @SlashOption('link', { type: ApplicationCommandOptionType.String, required: true })
    link: string,
    interaction: CommandInteraction
  ) {
    // TODO: add error catching
    await this.client.chatDins.create({
      data: {
        link: link,
        owner: interaction.user.id,
        date: new Date(),
      },
    })
    interaction.reply(`Added ${link} to database`)
  }

  @Slash('latest', { description: 'Get latest dins' })
  async latest(interaction: CommandInteraction) {
    const latest = await this.client.chatDins.findMany({
      orderBy: [
        {
          date: 'desc',
        },
      ],
      take: 1,
    })

    if (latest.length < 1) {
      interaction.reply('No chatdins found')
    } else {
      interaction.reply(`Latest chatdins: ${latest[0].link}`)
    }
  }
}
