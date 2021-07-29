// @ts-check

/**
 * @callback ZepCallback
 * @param {Zep} self
 * @param {...*} args
 */

/**
 * @callback ZepEventHandler
 * @param {Zep} self
 */

/**
 * @callback ZepErrorHandler
 * @param {Zep} self
 * @param {Error} error
 */

class Zep {
  /**
   * Creates a new instance of Zep, this is where you should define your function/callback that will be debounced - when needed. If you don’t define the time parameter or time <= 0 your callback will be called immediately without ever being debounced. You can have as many arguments in your callback function as you want.
   * @param {ZepCallback} callback
   * @param {number} [time]
   */
  constructor(callback, time) {
    /**
     * @private
     * @type {NodeJS.Timeout}
     */
    // @ts-ignore
    this._timer = 0
    /**
     * @private
     *  @type {boolean}
     */
    this._shouldCancel = false
    /**
     * @private
     *  @type {boolean}
     */
    this._shouldAbort = false
    /**
     * @private
     *  @type {number}
     */
    this._calls = 0
    /**
     * @private
     *  @type {[]|undefined}
     */
    this._args = undefined
    /**
     * @private
     *  @type {boolean}
     */
    this._isRunning = false
    /**
     * @private
     *  @type {Function}
     */
    this._callback = callback
    /**
     * @private
     *  @type {number}
     */
    this._time = time
    /**
     * @private
     *  @type {number}
     */
    this._executionCount = 0
    /**
     * @private
     *  @type {boolean}
     */
    this._isWaiting = false
    /**
     * @private
     *  @type {boolean}
     */
    this._isRunning = false
    /**
     * @private
     *  @type {boolean}
     */
    this._wasCancelled = false
    /**
     * @private
     *  @type {boolean}
     */
    this._wasAborted = false
    /**
     * @private
     * @returns {void}
     */
    this._deleteTimer = () => {
      clearInterval(this._timer)
      // @ts-ignore
      this._timer = 0
    }
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
    return this._wasCancelled
  }

  /**
   * Indicates whether the execution of Zep.run() was aborted. Execution can be aborted by calling Zep.abort().
   * @returns {boolean}
   */
  get wasAborted() {
    return this._wasAborted
  }

  /**
   * A handler to call when the execution of Zep.run() has been cancelled.
   * @param {ZepEventHandler} handler
   * @returns {Zep}
   */
  onCancelled(handler) {
    /**
     * @private
     */
    this._onCancelled = handler
    return this
  }

  /**
   * A handler to call when the execution of Zep.run() has been aborted.
   * @param {ZepEventHandler} handler
   * @returns {Zep}
   */
  onAborted(handler) {
    /**
     * @private
     */
    this._onAborted = handler
    return this
  }

  /**
   * A handler to call before Zep.run().
   * @param {ZepEventHandler} handler
   * @returns {Zep}
   */
  onBeforeRun(handler) {
    /**
     * @private
     */
    this._onBeforeRun = handler
    return this
  }

  /**
   * A handler to call after Zep.run().
   * @param {ZepEventHandler} handler
   * @returns {Zep}
   */
  onAfterRun(handler) {
    /**
     * @private
     */
    this._onAfterRun = handler
    return this
  }

  /**
   * A handler to call when the execution of Zep.run() has been completed - no more calls to the Zep.run() where provided in the defined time limit.
   * @param {ZepEventHandler} handler
   * @returns {Zep}
   */
  onCompleted(handler) {
    /**
     * @private
     */
    this._onCompleted = handler
    return this
  }

  /**
   * A handler to call when an error has occurred during execution.
   * @param {ZepErrorHandler} handler
   * @returns {Zep}
   */
  onError(handler) {
    /**
     * @private
     */
    this._onError = handler
    return this
  }

  /**
   * Stops the execution but NOT the current running Timer - if applicable.
   * @see abort
   * @returns {void}
   */
  cancel() {
    this._shouldCancel = true
  }

  /**
   * Aborts the execution, stops Zep completely and - if applicable - the current running Timer without waiting for it to finish its execution.
   * @see cancel
   * @returns {void}
   */
  abort() {
    this._shouldAbort = true
  }

  /**
   * Writes Zep statistical information to the console.
   * @public
   * @returns {void}
   */
  writeStats() {
    let percentageSaved

    // handles undefined and 0
    if (this._executionCount && this._calls) {
      percentageSaved = (100 - (this._executionCount / this._calls) * 100).toFixed(2)
    } else {
      percentageSaved = 0
    }

    console.log(
      `[Zep]: invocations: ${this._calls}, callback executions: ${this._executionCount}, saving ${percentageSaved}% of calls.`
    )
  }

  /**
   * Runs your callback defined in the constructor if necessary or else debounces it. You can pass as many arguments to this method and they will be available in your callback. This method should be passed as the event handler.
   * @param {...any} [args]
   * @returns {Zep}
   */
  run() {
    if (typeof this._callback !== 'function') {
      return this
    }

    if (this._shouldAbort) {
      this._deleteTimer()

      this._isRunning = false
      this._shouldAbort = false
      this._wasAborted = true

      if (typeof this._onAborted === 'function') {
        this._onAborted(this)
      }

      // don't let the execution continue!
      return this
    }

    const self = this

    this._calls++
    this._args = Array.prototype.slice.call(arguments)

    this._wasCancelled = false
    this._wasAborted = false

    this._isWaiting = true
    this._isRunning = true

    if (!this._time) {
      try {
        this._callback(self, ...this._args)
      } catch (e) {
        if (typeof this._onError === 'function') {
          this._onError(self, e)
        }
      }

      this._executionCount++
      this._isWaiting = false
      this._isRunning = false
      return this
    } else {
      if (!this._timer) {
        this._timer = setInterval(() => {
          if (!this._isRunning) {
            this._deleteTimer()

            this._isWaiting = false
            this._isRunning = false

            if (!this._wasCancelled && typeof this._onCompleted === 'function') {
              this._onCompleted(self)
            }

            return
          }

          if (this._shouldCancel && typeof this._onCancelled === 'function') {
            this._isRunning = false
            this._shouldCancel = false
            this._wasCancelled = true

            this._onCancelled.call(self)
          }

          if (typeof this._onBeforeRun === 'function') {
            this._onBeforeRun(self)
          }

          try {
            this._callback(self, ...this._args)
          } catch (e) {
            if (typeof this._onError === 'function') {
              this._onError(self, e)
            }
          }

          if (typeof this._onAfterRun === 'function') {
            this._onAfterRun(self)
          }

          this._executionCount++

          this._isWaiting = false
          this._isRunning = false
        }, this._time)
      }
    }
    return this
  }
}

module.exports = Zep
