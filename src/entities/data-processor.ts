import pino, { Logger } from 'pino'
import { DataProcessorOptions, DataProcessorOptionsInterface } from '../options'
import { DataProcessingResult } from '../types'

/**
 * Data processor
 */
export abstract class DataProcessor {
  private readonly options: DataProcessorOptions
  public readonly logger: Logger

  constructor(options: DataProcessorOptionsInterface = {}) {
    this.options = new DataProcessorOptions(options)

    this.logger =
      this.options.logger ??
      pino({
        name: this.options.name,
        level: this.options.logLevel,
        formatters: {
          level: (label): object => {
            return { level: label }
          },
        },
      })
  }

  public get name(): string {
    return this.options.name
  }

  /**
   * Process data
   */
  protected abstract async process(data: object): Promise<{ success: boolean }>

  /**
   * Run
   */
  public async run(data: object): Promise<DataProcessingResult> {
    try {
      const start = Date.now()
      const { success = true } = await this.process(data)
      const end = Date.now()

      this.logger.debug({ msg: 'SUCCESS', data })
      if (success) return { success: true, executionTime: (end - start) / 1000 }
      else throw new Error()
    } catch (err) {
      this.logger.debug({ msg: 'FAILURE', data })
      return { success: false }
    }
  }
}