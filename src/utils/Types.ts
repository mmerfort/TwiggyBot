import { InteractionResponse, Message } from 'discord.js'

export type CommandReturn = Promise<InteractionResponse<boolean> | Message<boolean> | void>
