// Author: Igor Dimitrijević (@igorskyflyer)

export type ZepCallback<T extends unknown[]> = (...args: T) => void;
export type ZepErrorHandler = (error: unknown) => void;
export type ZepEventHandler = () => void;

const ZEP_MAX_TIME = 2_147_483_647; // 32-bit signed int max
const ZEP_DEFAULT_TIME = 150;
const ZEP_EMPTY_HANDLER = () => {};

export class Zep<T extends unknown[] = unknown[]> {
  #timer: ReturnType<typeof setTimeout> | undefined;
  #args: T | undefined;
  #shouldCancel: boolean;
  #lastCalled: number;
  #invocations: number;
  #isRunning: boolean;
  #time: number;
  #executionCount: number;
  #isWaiting: boolean;
  #wasCancelled: boolean;
  #wasAborted: boolean;
  #cancelledCount: number;
  #abortedCount: number;
  #maxBurstCalls: number;
  #currentBurstCalls: number;
  #callback: ZepCallback<T>;
  #onCancelled: ZepEventHandler;
  #onAborted: ZepEventHandler;
  #onBeforeRun: ZepEventHandler;
  #onAfterRun: ZepEventHandler;
  #onCompleted: ZepEventHandler;
  #onError: ZepErrorHandler;

  /**
   * Creates a new instance of Zep.
   * @param callback The function/callback to debounce.
   * @param time The time limit (in ms) for the debouncing. Defaults to 150ms.
   * @throws Throws if any of the parameters is not valid.
   */
  constructor(callback: ZepCallback<T>, time: number = ZEP_DEFAULT_TIME) {
    if (typeof callback !== 'function') {
      throw new TypeError('Callback must be a function.');
    }

    if (typeof time !== 'number' || Number.isNaN(time)) {
      throw new TypeError('Time must be a number.');
    }

    if (time < 0 || time > ZEP_MAX_TIME) {
      throw new RangeError(`Time must be >= 0 and <= ${ZEP_MAX_TIME}ms.`);
    }

    this.#timer = undefined;
    this.#lastCalled = 0;
    this.#shouldCancel = false;
    this.#invocations = 0;
    this.#isRunning = false;
    this.#callback = callback;
    this.#time = time;
    this.#executionCount = 0;
    this.#isWaiting = false;
    this.#wasCancelled = false;
    this.#wasAborted = false;
    this.#cancelledCount = 0;
    this.#abortedCount = 0;
    this.#maxBurstCalls = 0;
    this.#currentBurstCalls = 0;

    this.#onCancelled = ZEP_EMPTY_HANDLER;
    this.#onAborted = ZEP_EMPTY_HANDLER;
    this.#onBeforeRun = ZEP_EMPTY_HANDLER;
    this.#onAfterRun = ZEP_EMPTY_HANDLER;
    this.#onCompleted = ZEP_EMPTY_HANDLER;
    this.#onError = ZEP_EMPTY_HANDLER;
  }

  #deleteTimer() {
    clearTimeout(this.#timer);

    this.#timer = undefined;
    this.#isRunning = false;
    this.#isWaiting = false;
    this.#shouldCancel = false;
  }

  #clearArgs() {
    this.#args = undefined;
  }

  #schedule(delay: number) {
    this.#timer = setTimeout(() => {
      if (this.#shouldCancel) {
        this.#wasCancelled = true;
        this.#cancelledCount++;

        this.#deleteTimer();
        this.#clearArgs();
        this.#onCancelled();

        return;
      }

      const elapsed = performance.now() - this.#lastCalled;

      if (elapsed < this.#time) {
        this.#schedule(Math.max(1, this.#time - elapsed));
        return;
      }

      this.#deleteTimer();
      this.#isWaiting = false;
      this.#execute();
    }, delay);
  }

  #execute() {
    /* v8 ignore next 3 */
    if (this.#args === undefined) {
      return;
    }

    this.#onBeforeRun();

    this.#isRunning = true;

    try {
      this.#callback(...this.#args);
    } catch (e) {
      if (this.#onError === ZEP_EMPTY_HANDLER) {
        queueMicrotask(() => {
          throw e;
        });
      } else {
        this.#onError(e);
      }
    } finally {
      this.#isRunning = false;
      this.#executionCount++;

      if (!this.#isWaiting) {
        this.#currentBurstCalls = 0;
        this.#clearArgs();
      }
    }

    this.#onAfterRun();
    this.#onCompleted();
  }

  /**
   * Returns the number of callback executions.
   */
  get executionCount(): number {
    return this.#executionCount;
  }

  /**
   * Indicates whether Zep is waiting for a Timer to finish its execution.
   *
   * If true, Zep.run() won’t create new Timers when called.
   */
  get isWaiting(): boolean {
    return this.#isWaiting;
  }

  /**
   * Indicates whether a Timer is currently running the `callback` provided in the constructor.
   */
  get isRunning(): boolean {
    return this.#isRunning;
  }

  /**
   * Indicates whether the execution of Zep.run() was cancelled.
   *
   * Execution can be cancelled by calling Zep.cancel().
   */
  get wasCancelled(): boolean {
    return this.#wasCancelled;
  }

  /**
   * Indicates whether the execution of Zep.run() was aborted.
   *
   * Execution can be aborted by calling Zep.abort().
   */
  get wasAborted(): boolean {
    return this.#wasAborted;
  }

  /**
   * Returns the number of callback invocations.
   */
  get invocations(): number {
    return this.#invocations;
  }

  /**
   * Returns the number of cancelled executions.
   */
  get cancelledCount(): number {
    return this.#cancelledCount;
  }

  /**
   * Returns the number of aborted executions.
   */
  get abortedCount(): number {
    return this.#abortedCount;
  }

  /**
   * Returns the number of maximum burst calls.
   */
  get maxBurstCalls(): number {
    return this.#maxBurstCalls;
  }

  /**
   * Returns the number of current burst calls.
   */
  get currentBurstCalls(): number {
    return this.#currentBurstCalls;
  }

  /**
   * A handler to call when the execution of Zep.run() has been cancelled.
   */
  onCancelled(handler: ZepEventHandler): Zep<T> {
    if (typeof handler === 'function') {
      this.#onCancelled = handler;
    } else {
      this.#onCancelled = ZEP_EMPTY_HANDLER;
    }

    return this;
  }

  /**
   * A handler to call when the execution of Zep.run() has been aborted.
   */
  onAborted(handler: ZepEventHandler): Zep<T> {
    if (typeof handler === 'function') {
      this.#onAborted = handler;
    } else {
      this.#onAborted = ZEP_EMPTY_HANDLER;
    }

    return this;
  }

  /**
   * A handler to call before Zep.run().
   */
  onBeforeRun(handler: ZepEventHandler): Zep<T> {
    if (typeof handler === 'function') {
      this.#onBeforeRun = handler;
    } else {
      this.#onBeforeRun = ZEP_EMPTY_HANDLER;
    }

    return this;
  }

  /**
   * A handler to call after Zep.run().
   */
  onAfterRun(handler: ZepEventHandler): Zep<T> {
    if (typeof handler === 'function') {
      this.#onAfterRun = handler;
    } else {
      this.#onAfterRun = ZEP_EMPTY_HANDLER;
    }

    return this;
  }

  /**
   * A handler to call after `Zep()` has finished running, i.e. no more calls to the `Zep.run()` method have been issued in the given time-frame.
   */
  onCompleted(handler: ZepEventHandler): Zep<T> {
    if (typeof handler === 'function') {
      this.#onCompleted = handler;
    } else {
      this.#onCompleted = ZEP_EMPTY_HANDLER;
    }

    return this;
  }

  /**
   * A handler to call when an error has occurred during execution.
   */
  onError(handler: ZepErrorHandler): Zep<T> {
    if (typeof handler === 'function') {
      this.#onError = handler;
    } else {
      this.#onError = ZEP_EMPTY_HANDLER;
    }

    return this;
  }

  /**
   * Automatically releases all resources, clears active timers,
   * and unbinds handlers to prevent memory leaks when the instance
   * goes out of scope. Supports the explicit resource management
   * (`using` declaration) to clean up instances automatically
   * when exiting scope.
   */
  [Symbol.dispose](): void {
    this.#deleteTimer();
    this.#clearArgs();

    this.#onCancelled = ZEP_EMPTY_HANDLER;
    this.#onAborted = ZEP_EMPTY_HANDLER;
    this.#onBeforeRun = ZEP_EMPTY_HANDLER;
    this.#onAfterRun = ZEP_EMPTY_HANDLER;
    this.#onCompleted = ZEP_EMPTY_HANDLER;
    this.#onError = ZEP_EMPTY_HANDLER;
  }

  /**
   * Resets all internal counters, flags, and metrics, and stops any active timer.
   */
  reset(): void {
    this.#deleteTimer();
    this.#clearArgs();

    this.#invocations = 0;
    this.#executionCount = 0;
    this.#cancelledCount = 0;
    this.#abortedCount = 0;
    this.#maxBurstCalls = 0;
    this.#currentBurstCalls = 0;
    this.#wasCancelled = false;
    this.#wasAborted = false;
  }

  /**
   * Stops the execution but NOT the current running Timer - if applicable.
   * @see abort
   */
  cancel(): void {
    if (this.#timer) {
      this.#shouldCancel = true;
    }
  }

  /**
   * Aborts the execution, stops Zep completely and - if applicable - the current running Timer without waiting for it to finish its execution.
   * @see cancel
   */
  abort(): void {
    if (this.#timer) {
      this.#deleteTimer();
      this.#clearArgs();

      this.#wasAborted = true;
      this.#abortedCount++;

      this.#onAborted();
    }
  }

  /**
   * Writes Zep's statistical information to the console, including invocations, executions, saved call percentage, active/peak burst metrics, and cancellation/abort counts.
   */
  writeStats(): void {
    let percentageSaved: string;

    if (this.#executionCount && this.#invocations) {
      percentageSaved = (
        100 -
        (this.#executionCount / this.#invocations) * 100
      ).toFixed(2);
    } else if (this.#invocations > 0 && this.#executionCount === 0) {
      percentageSaved = '100.00';
    } else {
      percentageSaved = '0.00';
    }

    // biome-ignore lint/suspicious/noConsole: needed for DX
    console.log(
      `🧠 [Zep Metrics Report]\n` +
        `├── Invocations  : ${this.#invocations}\n` +
        `├── Executions   : ${this.#executionCount} (${percentageSaved}% saved)\n` +
        `├── Active Burst : ${this.#currentBurstCalls} pending\n` +
        `├── Peak Burst   : ${this.#maxBurstCalls} max squashed\n` +
        `└── Terminations : ${this.#cancelledCount} cancels, ${this.#abortedCount} aborts`,
    );
  }

  /**
   * Runs the callback defined in the constructor if necessary or else debounces it.
   */
  run(...args: T): Zep<T> {
    let justCancelled = false;

    if (this.#shouldCancel) {
      this.#wasCancelled = true;
      this.#cancelledCount++;

      this.#deleteTimer();
      this.#clearArgs();
      this.#onCancelled();

      justCancelled = true;
    }

    if (!(this.#isWaiting || this.#isRunning)) {
      this.#currentBurstCalls = 0;
    }

    this.#args = args;
    this.#invocations++;
    this.#currentBurstCalls++;

    if (this.#currentBurstCalls > this.#maxBurstCalls) {
      this.#maxBurstCalls = this.#currentBurstCalls;
    }

    if (!justCancelled) {
      this.#wasCancelled = false;
    }

    this.#wasAborted = false;
    this.#shouldCancel = false;

    if (this.#time === 0) {
      this.#execute();
      return this;
    }

    this.#lastCalled = performance.now();
    this.#isWaiting = true;

    if (!this.#timer) {
      this.#schedule(this.#time);
    }

    return this;
  }
}
