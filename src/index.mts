// Author: Igor Dimitrijević (@igorskyflyer)

import type { ZepCallback } from './types/ZepCallback.mjs'
import type { ZepErrorHandler } from './types/ZepErrorHandler.mjs'
import type { ZepEventHandler } from './types/ZepEventHandler.mjs'

export class Zep {
  #timer: number | NodeJS.Timeout
  #shouldCancel: boolean
  #shouldAbort: boolean
  #calls: number
  #isRunning: boolean
  #time: number | undefined
  #executionCount: number
  #isWaiting: boolean
  #wasCancelled: boolean
  #wasAborted: boolean
  #callback: ZepCallback
  #onCancelled: ZepEventHandler
  #onAborted: ZepEventHandler
  #onBeforeRun: ZepEventHandler
  #onAfterRun: ZepEventHandler
  #onCompleted: ZepEventHandler
  #onError: ZepErrorHandler

  /**
   * Creates a new instance of Zep.
   * @param callback The function/callback to debounce.
   * @param time The time limit (in ms) for the debouncing.
   */
  constructor(callback: ZepCallback, time?: number) {
    this.#timer = 0
    this.#shouldCancel = false
    this.#shouldAbort = false
    this.#calls = 0
    this.#isRunning = false
    this.#callback = callback
    this.#time = time
    this.#executionCount = 0
    this.#isWaiting = false
    this.#wasCancelled = false
    this.#wasAborted = false
  }

  #deleteTimer() {
    clearInterval(this.#timer)
    this.#timer = 0
  }

  /**
   * Returns the number of callback executions.
   */
  get executionCount(): number {
    return this.#executionCount
  }

  /**
   * Indicates whether Zep is waiting for a Timer to finish its execution, if true, Zep.run() won’t create new Timers when called.
   */
  get isWaiting(): boolean {
    return this.#isWaiting
  }

  /**
   * Indicates whether a Timer is currently running the provided callback.
   */
  get isRunning(): boolean {
    return this.#isRunning
  }

  /**
   * Indicates whether the execution of Zep.run() was cancelled. Execution can be cancelled by calling Zep.cancel().
   */
  get wasCancelled(): boolean {
    return this.#wasCancelled
  }

  /**
   * Indicates whether the execution of Zep.run() was aborted. Execution can be aborted by calling Zep.abort().
   */
  get wasAborted(): boolean {
    return this.#wasAborted
  }

  /**
   * A handler to call when the execution of Zep.run() has been cancelled.
   */
  onCancelled(handler: ZepEventHandler): Zep {
    this.#onCancelled = handler
    return this
  }

  /**
   * A handler to call when the execution of Zep.run() has been aborted.
   */
  onAborted(handler: ZepEventHandler): Zep {
    this.#onAborted = handler
    return this
  }

  /**
   * A handler to call before Zep.run().
   */
  onBeforeRun(handler: ZepEventHandler): Zep {
    this.#onBeforeRun = handler
    return this
  }

  /**
   * A handler to call after Zep.run().
   */
  onAfterRun(handler: ZepEventHandler): Zep {
    this.#onAfterRun = handler
    return this
  }

  /**
   * A handler to call when the execution of Zep.run() has been completed - no more calls to the Zep.run() were provided in the defined time limit.
   */
  onCompleted(handler: ZepEventHandler): Zep {
    this.#onCompleted = handler
    return this
  }

  /**
   * A handler to call when an error has occurred during execution.
   */
  onError(handler: ZepErrorHandler): Zep {
    this.#onError = handler
    return this
  }

  /**
   * Stops the execution but NOT the current running Timer - if applicable.
   * @see abort
   */
  cancel(): void {
    this.#shouldCancel = true
  }

  /**
   * Aborts the execution, stops Zep completely and - if applicable - the current running Timer without waiting for it to finish its execution.
   * @see cancel
   */
  abort(): void {
    this.#shouldAbort = true
  }

  /**
   * Writes Zep statistical information to the console.
   */
  writeStats(): void {
    let percentageSaved: string

    // handles undefined and 0
    if (this.#executionCount && this.#calls) {
      percentageSaved = (
        100 -
        (this.#executionCount / this.#calls) * 100
      ).toFixed(2)
    } else {
      percentageSaved = '0'
    }

    console.log(
      `🧠 [Zep]: invocations: ${this.#calls}, callback executions: ${this.#executionCount}, saving ${percentageSaved}% of calls.`
    )
  }

  /**
   * Runs the callback defined in the constructor if necessary or else debounces it.
   */
  run(...args: any[]): Zep {
    if (typeof this.#callback !== 'function') {
      return this
    }

    if (this.#shouldAbort) {
      this.#deleteTimer()

      this.#isRunning = false
      this.#shouldAbort = false
      this.#wasAborted = true

      if (typeof this.#onAborted === 'function') {
        this.#onAborted()
      }

      // don't let the execution continue!
      return this
    }

    const self: Zep = this

    this.#calls++

    this.#wasCancelled = false
    this.#wasAborted = false

    this.#isWaiting = true
    this.#isRunning = true

    if (!this.#time) {
      try {
        this.#callback(...args)
      } catch (e) {
        if (typeof this.#onError === 'function') {
          this.#onError(e)
        }
      }

      this.#executionCount++
      this.#isWaiting = false
      this.#isRunning = false
      return this
    }

    if (!this.#timer) {
      this.#timer = setInterval(() => {
        if (!this.#isRunning) {
          this.#deleteTimer()

          this.#isWaiting = false
          this.#isRunning = false

          if (!this.#wasCancelled && typeof this.#onCompleted === 'function') {
            this.#onCompleted()
          }

          return
        }

        if (this.#shouldCancel && typeof this.#onCancelled === 'function') {
          this.#isRunning = false
          this.#shouldCancel = false
          this.#wasCancelled = true

          this.#onCancelled.call(self)
        }

        if (typeof this.#onBeforeRun === 'function') {
          this.#onBeforeRun()
        }

        try {
          this.#callback(...args)
        } catch (e) {
          if (typeof this.#onError === 'function') {
            this.#onError(e)
          }
        }

        if (typeof this.#onAfterRun === 'function') {
          this.#onAfterRun()
        }

        this.#executionCount++

        this.#isWaiting = false
        this.#isRunning = false
      }, this.#time)
    }
    return this
  }
}
