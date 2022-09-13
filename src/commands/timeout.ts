import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonStyle,
  CommandInteraction,
  Formatters,
  Guild,
  GuildMember,
  GuildMemberRoleManager,
  MessageActionRowComponentBuilder,
  PermissionFlagsBits,
  User,
} from 'discord.js'
import {
  Discord,
  Guard,
  SimpleCommand,
  SimpleCommandMessage,
  SimpleCommandOption,
  SimpleCommandOptionType,
  Slash,
  SlashOption,
} from 'discordx'
import { IsSuperUser, memberIsSU } from '../guards/RoleChecks'
import { CommandReturn } from '../utils/Types'

@Discord()
abstract class Timeout {
  private gozId = '104819134017118208'

  hasPermission(command: SimpleCommandMessage | CommandInteraction, target?: GuildMember): boolean {
    let guild: Guild | null
    let memberRoles: GuildMemberRoleManager | undefined
    let userId: string

    if (command instanceof SimpleCommandMessage) {
      guild = command.message.guild
      memberRoles = command.message.member?.roles
      userId = command.message.author.id
    } else {
      guild = command.guild
      userId = command.user.id
      const _memberRoles = command.member?.roles
      if (_memberRoles instanceof Array) {
        return false
      }
      memberRoles = _memberRoles
    }

    if (target) {
      memberRoles = target.roles
      userId = target.user.id
    }

    const highestBotRole = guild?.members?.me?.roles.highest
    const highestMemberRole = memberRoles?.highest
    if (!highestBotRole || !highestMemberRole) {
      return false
    }
    return userId !== guild?.ownerId && highestBotRole.comparePositionTo(highestMemberRole) > 0
  }

  sudokuDuration(): number {
    return Math.floor(Math.random() * (690 - 420 + 1)) + 420
  }

  async sudoku(member: GuildMember | null, message?: string): Promise<string> {
    const time = this.sudokuDuration()
    await member?.timeout(time * 1000, "Sudoku'd").catch(console.error)
    const msg = message && message.length < 150 ? `\n${Formatters.quote(message)}` : ''

    // If the Sudoku-ee is a Super User send them a DM with a button to remove the timeout
    if (memberIsSU(member)) {
      const jailbreaker2000 = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId('pardon-btn')
          .setLabel('Break out of Jail')
          .setEmoji('⛏')
          .setStyle(ButtonStyle.Danger)
      )
      await member?.createDM().then((dm) => {
        dm.send({
          content: `It's dangerous to go alone! Take this.`,
          components: [jailbreaker2000],
        })
        const jailbreakCollector = dm.createMessageComponentCollector({ max: 1 })
        jailbreakCollector.on('collect', (i) => {
          jailbreaker2000.components[0].setDisabled(true)
          i.update({ components: [jailbreaker2000] })
          member?.timeout(null)
        })
      })
    }

    return `${member}, you're timed out for ${time} seconds.${msg}`
  }

  @SimpleCommand('sudoku', { argSplitter: '\n' })
  async sudokuCommand(
    // message: everything after the command and before a new line
    @SimpleCommandOption('message', {
      type: SimpleCommandOptionType.String,
      description: 'Your last message before committing sudoku',
    })
    message: string | undefined,
    command: SimpleCommandMessage
  ): CommandReturn {
    if (!this.hasPermission(command)) {
      return
    }

    return command.message.channel.send(await this.sudoku(command.message.member, message))
  }

  @Slash('sudoku', { description: 'Commit sudoku' })
  async sudokuInteraction(
    @SlashOption('message', {
      type: ApplicationCommandOptionType.String,
      description: 'Your last message before committing sudoku',
      required: false,
    })
    message: string | undefined,
    interaction: CommandInteraction
  ): CommandReturn {
    if (!(interaction.member instanceof GuildMember) || !this.hasPermission(interaction)) {
      return interaction.reply({
        content: 'I cannot time you out.',
        ephemeral: true,
      })
    }

    return interaction.reply(await this.sudoku(interaction.member, message))
  }

  @SimpleCommand('timeout')
  @Guard(IsSuperUser)
  async timeoutCommand(
    @SimpleCommandOption('user', { type: SimpleCommandOptionType.User }) user: GuildMember | User | undefined,
    @SimpleCommandOption('duration', { type: SimpleCommandOptionType.Number }) duration: number | undefined,
    command: SimpleCommandMessage
  ): CommandReturn {
    if (!(user instanceof GuildMember) || !this.hasPermission(command, user)) {
      return
    }

    if (!duration) {
      return command.message.channel.send('Duration has to be a number.')
    }

    // Max timeout is 10 days
    if (duration > 10 * 24 * 60 * 60 * 1000) {
      return
    }

    await user.timeout(duration * 1000, `${command.message.author} used timeout command`)
    if (command.message.author.id === this.gozId) {
      return command.message.channel.send('In the name of the Moon, I shall punish you!')
    }
  }

  @Slash('timeout', { defaultMemberPermissions: PermissionFlagsBits.ModerateMembers })
  async timeoutInteraction(
    @SlashOption('user', { type: ApplicationCommandOptionType.User, description: 'User you want to timeout' })
    user: GuildMember,
    @SlashOption('duration', {
      type: ApplicationCommandOptionType.Integer,
      description: 'Duration of the timeout in seconds',
    })
    duration: number,
    interaction: CommandInteraction
  ): CommandReturn {
    if (!(interaction.member instanceof GuildMember) || !this.hasPermission(interaction, user)) {
      return interaction.reply({ content: 'Cannot timeout user.', ephemeral: true })
    }

    if (!duration) {
      return interaction.reply({ content: 'Duration has to be a number.', ephemeral: true })
    }

    // Max timeout is 10 days
    if (duration > 10 * 24 * 60 * 60 * 1000) {
      return interaction.reply({ content: 'Duration exceeds the 10 days limit.', ephemeral: true })
    }

    await user.timeout(duration * 1000, `${interaction.user} used timeout command`)
    if (interaction.user.id === this.gozId) {
      return interaction.reply('In the name of the Moon, I shall punish you!')
    } else {
      return interaction.reply({ content: `${user} has been timed out for ${duration} seconds`, ephemeral: true })
    }
  }
}
