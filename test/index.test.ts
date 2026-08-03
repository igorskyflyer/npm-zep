// Author: Igor Dimitrijević (@igorskyflyer)
/** biome-ignore-all lint/suspicious/noExplicitAny: needed for tests */

import { afterEach, assert, beforeEach, describe, test, vi } from 'vitest';
import { Zep } from '../src/index.ts';

describe('🧪 Zep Unit Tests', () => {
  beforeEach(() => {
    vi.useFakeTimers({
      toFake: ['setTimeout', 'clearTimeout', 'Date', 'performance'],
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // --- Existing Tests (Enumerated) ---

  test('1. Basic Debouncing: delays execution and invokes with latest arguments', () => {
    let executions = 0;
    let finalArg = '';
    const zep = new Zep((arg: string) => {
      executions++;
      finalArg = arg;
    }, 200);

    zep.run('first');
    vi.advanceTimersByTime(100);
    zep.run('second');
    vi.advanceTimersByTime(100);
    zep.run('third');

    // Total elapsed: 200ms, but quiet window has not finished for 'third'
    assert.equal(executions, 0);

    vi.advanceTimersByTime(200);
    assert.equal(executions, 1);
    assert.equal(finalArg, 'third');
  });

  test('2. Zero Delay: executes synchronously and triggers full lifecycle', () => {
    let beforeFired = false;
    let afterFired = false;
    let completedFired = false;
    let callbackFired = false;

    const zep = new Zep(() => {
      callbackFired = true;
    }, 0)
      .onBeforeRun(() => {
        beforeFired = true;
      })
      .onAfterRun(() => {
        afterFired = true;
      })
      .onCompleted(() => {
        completedFired = true;
      });

    zep.run();

    assert.isTrue(callbackFired);
    assert.isTrue(beforeFired);
    assert.isTrue(afterFired);
    assert.isTrue(completedFired);
  });

  test('3. State Flags: transitions isWaiting and isRunning accurately', () => {
    let callbackExecuted = false;

    const zep = new Zep(() => {
      callbackExecuted = true;
      // Assert states inside active callback execution context
      assert.isFalse(zep.isWaiting);
      assert.isTrue(zep.isRunning);
    }, 200);

    zep.run();

    // Assert states during the debounce waiting period
    assert.isTrue(zep.isWaiting);
    assert.isFalse(zep.isRunning);

    vi.advanceTimersByTime(200);

    assert.isTrue(callbackExecuted);
    assert.isFalse(zep.isWaiting);
    assert.isFalse(zep.isRunning);
  });

  test('4. Graceful Cancel: deferred cancellation fires callback on next tick without callback execution', () => {
    let callbackFired = false;
    let cancelledFired = false;

    const zep = new Zep(() => {
      callbackFired = true;
    }, 200).onCancelled(() => {
      cancelledFired = true;
    });

    zep.run();
    zep.cancel();

    // Deferred: lifecycle states must remain unchanged before tick
    assert.isFalse(cancelledFired);
    assert.isFalse(zep.wasCancelled);

    vi.advanceTimersByTime(200);

    assert.isFalse(callbackFired);
    assert.isTrue(cancelledFired);
    assert.isTrue(zep.wasCancelled);
    assert.isFalse(zep.isWaiting);
    assert.isFalse(zep.isRunning);
  });

  test('5. Immediate Abort: tears down timer and clears states synchronously', () => {
    let callbackFired = false;
    let abortedFired = false;

    const zep = new Zep(() => {
      callbackFired = true;
    }, 200).onAborted(() => {
      abortedFired = true;
    });

    zep.run();
    zep.abort();

    // Synchronous execution checks
    assert.isTrue(abortedFired);
    assert.isTrue(zep.wasAborted);
    assert.isFalse(zep.isWaiting);
    assert.isFalse(zep.isRunning);

    // Verify timer does not fire on tick
    vi.advanceTimersByTime(200);
    assert.isFalse(callbackFired);
  });

  test('6. State Reset: consecutive executions clear previous cancellation/abort states', () => {
    const zep = new Zep(() => {}, 200);

    zep.run();
    zep.cancel();
    vi.advanceTimersByTime(200);
    assert.isTrue(zep.wasCancelled);

    zep.run();
    assert.isFalse(zep.wasCancelled);

    zep.abort();
    assert.isTrue(zep.wasAborted);

    zep.run();
    assert.isFalse(zep.wasAborted);
  });

  test('7. Error Boundary: catches errors safely and handles state reset', () => {
    let caughtError: unknown = null;

    const zep = new Zep(() => {
      throw new Error('Target callback crashed');
    }, 200).onError((err) => {
      caughtError = err;
    });

    zep.run();
    vi.advanceTimersByTime(200);

    assert.instanceOf(caughtError, Error);
    assert.equal((caughtError as Error).message, 'Target callback crashed');
    assert.isFalse(zep.isRunning);
    assert.isFalse(zep.isWaiting);
  });

  test('8. Metric Counters: accurately tracks execution counts and saves percentages', () => {
    const zep = new Zep(() => {}, 200);

    zep.run();
    zep.run();
    zep.run();

    vi.advanceTimersByTime(200);

    assert.equal(zep.executionCount, 1);
  });

  test('9. Variadic Arguments: forwards multiple arguments of different types', () => {
    let passedArgs: any[] = [];
    const zep = new Zep((...args: any[]) => {
      passedArgs = args;
    }, 0);

    zep.run('first', 42, { active: true }, [1, 2]);
    assert.deepEqual(passedArgs, ['first', 42, { active: true }, [1, 2]]);
  });

  test('10. Fluent API: registration methods return the Zep instance for chaining', () => {
    const zep = new Zep(() => {});
    const chained = zep
      .onCancelled(() => {})
      .onAborted(() => {})
      .onBeforeRun(() => {})
      .onAfterRun(() => {})
      .onCompleted(() => {})
      .onError(() => {});

    assert.equal(chained, zep);
  });

  test('11. Reentrancy: calling run inside callback schedules next run cleanly', () => {
    let count = 0;
    const zep = new Zep(() => {
      count++;
      if (count === 1) {
        zep.run();
      }
    }, 200);

    zep.run();
    vi.advanceTimersByTime(200);
    assert.equal(count, 1);
    assert.isTrue(zep.isWaiting);

    vi.advanceTimersByTime(200);
    assert.equal(count, 2);
    assert.isFalse(zep.isWaiting);
  });

  test('12. Invalid Handler Protection: fallback to empty handler when registration is invalid', async () => {
    let beforeRunFired = false;

    // Use a non-throwing callback to isolate hook fallback testing
    const zep = new Zep(() => {}, 0);

    // Pass valid handler first
    zep.onBeforeRun(() => {
      beforeRunFired = true;
    });

    // Overwrite with invalid types (bypassing compilation via type assertions)
    zep.onBeforeRun('invalid' as any);
    zep.onError(null as any);

    // Running must execute gracefully using ZEP_EMPTY_HANDLER fallbacks
    assert.doesNotThrow(() => zep.run());

    // Verify invalid input replaced the previous hook with ZEP_EMPTY_HANDLER
    assert.isFalse(beforeRunFired);
  });

  // --- New Coverage & Branch Expansion Tests ---

  test('13. Constructor Validations: enforces input types and range bounds', () => {
    assert.throws(
      // @ts-expect-error testing runtime throw on invalid callback
      () => new Zep(null),
      TypeError,
      'Callback must be a function.',
    );
    assert.throws(
      // @ts-expect-error testing runtime throw on invalid time
      () => new Zep(() => {}, '200'),
      TypeError,
      'Time must be a number.',
    );
    assert.throws(
      () => new Zep(() => {}, NaN),
      TypeError,
      'Time must be a number.',
    );
    assert.throws(() => new Zep(() => {}, -1), RangeError);
    assert.throws(() => new Zep(() => {}, 2_147_483_648), RangeError);
    assert.doesNotThrow(() => new Zep(() => {}, 0));
    assert.doesNotThrow(() => new Zep(() => {}, 2_147_483_647));
  });

  test('14. Symbol.dispose: cleans resources and unbinds handlers', () => {
    let abortedFired = false;
    let beforeFired = false;

    const zep = new Zep(() => {}, 200)
      .onAborted(() => {
        abortedFired = true;
      })
      .onBeforeRun(() => {
        beforeFired = true;
      });

    zep.run();
    zep[Symbol.dispose]();

    assert.isTrue(abortedFired);
    assert.isTrue(zep.wasAborted);

    // Verify handlers reset to ZEP_EMPTY_HANDLER after disposal
    zep.run();
    vi.advanceTimersByTime(200);
    assert.isFalse(beforeFired);
  });

  test('15. Unhandled Error Fallback: queues microtask throw when no onError provided', async () => {
    const error = new Error('Unhandled exception');
    const zep = new Zep(() => {
      throw error;
    }, 0);

    let uncaughtError: unknown = null;

    const uncaughtHandler = (err: unknown) => {
      uncaughtError = err;
    };

    process.on('uncaughtException', uncaughtHandler);

    try {
      zep.run();
      await Promise.resolve(); // drain microtask queue
      assert.equal(uncaughtError, error);
    } finally {
      process.removeListener('uncaughtException', uncaughtHandler);
    }
  });

  test('16. Timer Rescheduling: reschedules remaining delay if elapsed < time on timer tick', () => {
    let executed = false;
    const zep = new Zep(() => {
      executed = true;
    }, 200);

    zep.run();

    // Advance clock partially and simulate external drift in performance.now()
    vi.advanceTimersByTime(100);
    vi.spyOn(performance, 'now').mockReturnValue(50); // forces (elapsed < 200) inside timer tick

    vi.advanceTimersByTime(100); // 200ms elapsed on timer, but performance.now says only 50ms elapsed
    assert.isFalse(executed); // Must reschedule

    vi.restoreAllMocks();
    vi.advanceTimersByTime(200);
    assert.isTrue(executed);
  });

  test('17. Run Cancellation Edge: calling run when shouldCancel is set executes cancel immediately', () => {
    let cancelledFired = false;
    const zep = new Zep(() => {}, 200).onCancelled(() => {
      cancelledFired = true;
    });

    zep.run();
    zep.cancel();

    // Invoking run() while #shouldCancel is true triggers instant cancellation flush
    zep.run();

    assert.isTrue(cancelledFired);
    assert.isTrue(zep.wasCancelled);
    assert.equal(zep.cancelledCount, 1);
  });

  test('18. Reset and Statistical Getters: tracks burst metrics and clears state on reset', () => {
    const zep = new Zep(() => {}, 200);

    zep.run();
    zep.run();
    zep.run();

    assert.equal(zep.invocations, 3);
    assert.equal(zep.currentBurstCalls, 3);
    assert.equal(zep.maxBurstCalls, 3);

    zep.cancel();
    vi.advanceTimersByTime(200);
    assert.equal(zep.cancelledCount, 1);

    zep.run();
    zep.abort();
    assert.equal(zep.abortedCount, 1);

    zep.reset();

    assert.equal(zep.invocations, 0);
    assert.equal(zep.executionCount, 0);
    assert.equal(zep.cancelledCount, 0);
    assert.equal(zep.abortedCount, 0);
    assert.equal(zep.currentBurstCalls, 0);
    assert.equal(zep.maxBurstCalls, 0);
    assert.isFalse(zep.wasCancelled);
    assert.isFalse(zep.wasAborted);
  });

  test('19. writeStats Coverage: outputs accurate metric branches to console', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const zep = new Zep(() => {}, 200);

    // Branch 1: 0 invocations, 0 executions ("0.00% saved")
    zep.writeStats();
    assert.include(consoleSpy.mock.calls[0][0], '0.00% saved');

    // Branch 2: Invocations > 0, 0 executions ("100.00% saved")
    zep.run();
    zep.writeStats();
    assert.include(consoleSpy.mock.calls[1][0], '100.00% saved');

    // Branch 3: Executions > 0, dynamic percentage calculation
    vi.advanceTimersByTime(200);
    zep.run();
    zep.run();
    vi.advanceTimersByTime(200);
    zep.writeStats();
    assert.include(consoleSpy.mock.calls[2][0], '33.33% saved');

    consoleSpy.mockRestore();
  });

  test('20. Handler Validation: invalid arguments reset all handlers to fallback', () => {
    const zep = new Zep(() => {});

    // Overwrite all handlers with non-functions to hit all `else` branches
    zep.onCancelled('invalid' as any);
    zep.onAborted(42 as any);
    zep.onAfterRun({} as any);
    zep.onCompleted([] as any);
    zep.onError(true as any);

    // Verify calling handlers does not throw runtime TypeError
    assert.doesNotThrow(() => zep.cancel());
    assert.doesNotThrow(() => zep.abort());
  });

  test('21. Execute Guard: direct call to execute with clearArgs returns early', () => {
    const zep = new Zep(() => {}, 200);

    // Abort clears arguments synchronously (#clearArgs)
    zep.run();
    zep.abort();

    // Advancing timers attempts execution on cleared arguments (#args === undefined branch)
    assert.doesNotThrow(() => vi.advanceTimersByTime(200));
  });

  test('22. Timer Determinism: guarantees single active timer and exact scheduling count', () => {
    let createdTimers = 0;
    let clearedTimers = 0;

    // Intercept timer APIs locally without modifying runtime behavior
    const origSetTimeout = globalThis.setTimeout;
    const origClearTimeout = globalThis.clearTimeout;

    vi.spyOn(globalThis, 'setTimeout').mockImplementation((fn, ms) => {
      createdTimers++;
      return origSetTimeout(fn, ms);
    });

    vi.spyOn(globalThis, 'clearTimeout').mockImplementation((id) => {
      if (id !== undefined) {
        clearedTimers++;
      }
      return origClearTimeout(id);
    });

    try {
      const zep = new Zep(() => {}, 200);

      // Scenario A: Rapid burst must re-use the initial single timer
      zep.run();
      zep.run();
      zep.run();

      assert.equal(
        createdTimers,
        1,
        'Burst invocation created more than one timer',
      );

      // Advance clock partially and issue another run call
      vi.advanceTimersByTime(100);
      zep.run();

      // Still only 1 timer created so far (re-scheduled inside existing timer tick)
      assert.equal(createdTimers, 1);

      // Advance remaining window: initial timer tick reschedules remaining delay
      vi.advanceTimersByTime(100);
      assert.equal(
        createdTimers,
        2,
        'Rescheduling failed to spawn deterministic follow-up timer',
      );

      // Complete the rescheduled window
      vi.advanceTimersByTime(200);

      // Scenario B: Synchronous zero delay should bypass timer allocation completely
      const zeroZep = new Zep(() => {}, 0);
      zeroZep.run();

      assert.equal(
        createdTimers,
        2,
        'Zero-delay run allocated an unnecessary timer',
      );

      // Scenario C: Abort must explicitly release active timer handle
      zep.run();
      assert.equal(createdTimers, 3);

      zep.abort();
      assert.equal(clearedTimers, 2, 'Abort failed to clear the active timer');
    } finally {
      vi.restoreAllMocks();
    }
  });
});
