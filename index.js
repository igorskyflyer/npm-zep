/**
 * @callback ZepCallback
 * @param {...*} args
 */

class Zep {
  /**
   * Creates a new instance of Zep, this is where you should define your function/callback that will be debounced - when needed. If you don’t define the time parameter or time <= 0 your callback will be called immediately without ever being debounced. You can have as many arguments in your callback function as you want.
   * @param {ZepCallback} callback
   * @param {number} [time=1000]
   */
  constructor(callback, time) {
    /**
     * @private
     * @type {NodeJS.Timeout}
     */
    // @ts-ignore

    this._timer = 0
    /** @private */
    this._shouldCancel = false
    /** @private */
    this._shouldAbort = false
    /** @private */
    this._isRunning = false
    /** @private */
    this._callback = callback
    /** @private */
    this._time = time
    /** @private */
    this._timersCount = 0
    /** @private */
    this._executionCount = 0
    /** @private */
    this._isWaiting = false
    /** @private */
    this._isRunning = false
    /** @private */
    this._calls = 0
    /** @private */
    this._resolvedCalls = -1
  }

  /**
   * Returns the number of created Timers.
   * @returns {number}
   */
  get timersCount() {
    return this._timersCount
  }

  /**
   * Returns the number of callback executions.
   * @returns {number}
   */
  get executionCount() {
    return this._executionCount
  }

  /**
   * Indicates whether Zep is waiting for a Timer to finish its execution, if true, Zep.run() won’t create new Timers when called.
   * @returns {boolean}
   */
  get isWaiting() {
    return this._isWaiting
  }

  /**
   * Indicates whether a Timer is currently running your callback.
   * @returns {boolean}
   */
  get isRunning() {
    return this._isRunning
  }

  /**
   * Indicates whether the execution of Zep.run() was cancelled. Execution can be cancelled by calling Zep.cancel().
   * @returns {boolean}
   */
  get wasCancelled() {
    return this._shouldCancel
  }

  /**
   * Indicates whether the execution of Zep.run() was aborted. Execution can be aborted by calling Zep.abort().
   * @returns {boolean}
   */
  get wasAborted() {
    return this._shouldAbort
  }

  /**
   * A callback to call when the execution of Zep.run() has been cancelled.
   * @param {Function} callback
   * @returns {void}
   */
  set onCancelled(callback) {
    /**
     * @private
     */
    this._onCancelled = callback
  }

  /**
   * A callback to call when the execution of Zep.run() has been aborted.
   * @param {Function} callback
   */
  set onAborted(callback) {
    /**
     * @private
     */
    this._onAborted = callback
  }

  /**
   * Stops the execution but NOT the current running Timer - if applicable.
   * @see {@link abort}
   * @returns {void}
   */
  cancel() {
    this._shouldCancel = true
  }

  /**
   * Aborts the execution, stops Zep completely and - if applicable - the current running Timer without waiting for it to finish its execution.
   * @see {@link cancel}
   * @returns {void}
   */
  abort() {
    this._shouldAbort = true
  }

  /**
   * Writes Zep statistical information to the console.
   * @returns {void}
   */
  writeStats() {
    console.log(
      `[Zep]: calls: ${this._calls}, timers created: ${this._timersCount}, callback executions: ${this._executionCount}.`
    )
  }

  /**
   * Runs your callback defined in the constructor if necessary or else debounces it. You can pass as many arguments to this method and they will be available in your callback. This method should be passed as the event handler.
   * @param {...any} [args]
   * @returns {void}
   */
  run() {
    if (typeof this._callback !== 'function') {
      return
    }

    this._calls++

    if (!this._time) {
      this._callback.apply(this, arguments)
      this._executionCount++
    } else {
      if (!this._isWaiting) {
        if (this._shouldAbort) {
          clearTimeout(this._timer)

          if (typeof this._onAborted === 'function') {
            this._onAborted()
          }

          return
        }

        if (!this._timer) {
          this._isRunning = true
          this._isWaiting = true
          this._timersCount++

          this._timer = setTimeout(() => {
            if (this._shouldAbort) {
              clearTimeout(this._timer)

              if (typeof this._onAborted === 'function') {
                this._onAborted()
              }

              return
            }

            this._callback.apply(this, arguments)
            this._executionCount++
            clearTimeout(this._timer)
            this._isWaiting = false
            // @ts-ignore
            this._timer = 0
            this._isRunning = false

            if (this._shouldCancel) {
              if (typeof this._onCancelled === 'function') {
                this._onCancelled()
              }

              return
            }
          }, this._time)
        }
      }
    }
  }
}

module.exports = Zep
