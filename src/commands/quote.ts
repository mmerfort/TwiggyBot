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
import { uwuify } from './uwu'
import fetch from 'node-fetch'
import { CommandReturn } from '../utils/Types'

interface Quote {
  id: number
  body: string
}

interface QuoteData {
  error: boolean
  type: number
  total: number
  data: Array<Quote>
}

@Discord()
class QuoteCommand {
  private endpoint = 'https://api.bufutda.com/bot/quote?channel=bananasaurus_rex'
  private quotes: Array<Quote> = []
  private lastFetch: Date = new Date()
  private cacheDuration = 30 * 60 * 1000 // 30 minutes in milliseconds

  @Slash('quote', { description: 'Get server quote' })
  private async quoteSlash(
    @SlashOption('quoteid', { type: ApplicationCommandOptionType.Integer, required: false })
    id: number | undefined,
    interaction: CommandInteraction
  ): CommandReturn {
    return this.generateMessage(id).then(
      async ([message, error]) => await interaction.reply({ content: message, ephemeral: error })
    )
  }

  @SimpleCommand('quote', { description: 'Get server quote', argSplitter: '\n' })
  private async quoteSimple(
    @SimpleCommandOption('id', { type: SimpleCommandOptionType.Number })
    id: number | undefined,
    command: SimpleCommandMessage
  ): CommandReturn {
    return this.generateMessage(id).then(
      async ([message, _]) => await command.message.reply({ content: message, allowedMentions: { repliedUser: false } })
    )
  }

  @Slash('quwuote', { description: 'Get sewvew quwuote' })
  private async quwuoteSlash(
    @SlashOption('quwuoteid', { type: ApplicationCommandOptionType.Integer, required: false })
    id: number | undefined,
    interaction: CommandInteraction
  ): CommandReturn {
    return this.generateMessage(id, uwuify).then(
      async ([message, error]) => await interaction.reply({ content: message, ephemeral: error })
    )
  }

  @SimpleCommand('quwuote', { description: 'Get sewvew quwuote', argSplitter: '\n' })
  private async quwuoteSimple(
    @SimpleCommandOption('id', { type: SimpleCommandOptionType.Number })
    id: number | undefined,
    command: SimpleCommandMessage
  ): CommandReturn {
    await this.generateMessage(id, uwuify).then(
      async ([message, _]) => await command.message.reply({ content: message, allowedMentions: { repliedUser: false } })
    )
  }

  private async generateMessage(quoteId?: number, modifier = (a: string) => a): Promise<[string, boolean]> {
    return await this.updateQuotes().then(async () => {
      let quote: Quote | undefined | null = undefined
      if (quoteId) {
        quote = this.quotes.find((quote) => quote.id == quoteId)
      } else {
        quote = this.getRandomQuote()
      }

      if (!quote) {
        if (quoteId) {
          return [modifier(`Unable to find quote #${quoteId}`), true]
        }
        return [modifier('Unable to get quote. Something went wrong.'), true]
      }
      return [modifier(`[${quote.id}] ${quote.body}`), false]
    })
  }

  private getRandomQuote(): Quote | null {
    if (this.quotes.length == 0) {
      return null
    }
    return this.quotes[Math.floor(Math.random() * this.quotes.length)]
  }

  private async updateQuotes(): Promise<void> {
    // Only get the quotes if there aren't any yet or the cache has expired
    if (this.quotes.length == 0 || this.lastFetch.getTime() + this.cacheDuration < Date.now()) {
      await this.fetchQuotes()
        .then((quotes) => {
          this.quotes = quotes.data
        })
        .catch(console.log)
        .finally(() => {
          // Setting lastFetch date to avoid bombarding Buf's server with requests
          this.lastFetch = new Date()
        })
    }
  }

  private async fetchQuotes(): Promise<QuoteData> {
    console.log('Fetching quotes from API')
    return await fetch(this.endpoint).then(async (resp) => {
      if (resp.ok) {
        return await resp.json()
      } else {
        return Promise.reject(`An error occurred while fetching quotes (status: ${resp.status} - ${resp.statusText}`)
      }
    })
  }
}
