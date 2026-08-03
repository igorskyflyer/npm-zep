<div align="center">
  <img src="https://raw.githubusercontent.com/igorskyflyer/npm-zep/refs/heads/main/media/zep.png" alt="Icon of Zep" width="256" height="256">
  <h1>Zep</h1>
  <a href="https://www.npmjs.com/package/@igorskyflyer/zep"><img src="https://img.shields.io/npm/v/@igorskyflyer/zep.svg" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/@igorskyflyer/zep"><img src="https://img.shields.io/npm/dt/@igorskyflyer/zep.svg" alt="npm downloads"></a>
  <a href="https://www.npmjs.com/package/@igorskyflyer/zep"><img src="https://img.shields.io/node/v/@igorskyflyer/zep.svg" alt="Node version"></a>
  <a href="https://github.com/igorskyflyer/npm-zep/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/@igorskyflyer/zep.svg" alt="License"></a>
  <a href="https://liberapay.com/igorskyflyer/donate"><img src="https://img.shields.io/liberapay/receives/igorskyflyer.svg?logo=liberapay"></a>
</div>

<br>

<blockquote align="center">Zero Dependencies • High Performance • Type-Safe • Built-In Metrics</blockquote>

<h4 align="center">
  <code>Zep</code> is a zero-dependency, state-driven, single-timer debounce library for JavaScript and TypeScript with built-in execution telemetry.
</h4>

<br>

## Table of Contents

- ✨ [**Features**](#features)
- ⏱️ [**Benchmark**](#benchmark)
- 🕵🏼 [**Usage**](#usage)
- 🤹🏼 [**API**](#api)
- 🗒️ [**Examples**](#examples)
- ⚙️ [**Implementation**](#implementation)
- 🎯 [**Motivation**](#motivation)
- 📝 [**Changelog**](#changelog)
- 🪪 [**License**](#license)
- 💖 [**Support**](#support)
- 🧬 [**Related**](#related)
- 👨🏻‍💻 [**Author**](#author)

<br>

# Features

- 🌐 Universal runtime support: runs natively in Node.js, modern browsers, Bun, Deno, and Edge runtimes with zero platform dependencies.
- 🧠 Zero-dependency footprint: pure TypeScript implementation with zero external runtime packages or hidden overhead.
- ⏱️ Single-timer precision: handles high-frequency events using one drift-adjusted timer instead of destroying timers on every call.
- 📊 Built-in metrics: track exact invocations, execution counts, burst spikes, and percentage of saved calls in real time.
- 🚦 UX-ready state tracking: expose internal flags like `isWaiting` and `isRunning` directly to drive UI indicators.
- 🎯 Lifecycle event hooks: orchestrate complex flows with dedicated callbacks like `onBeforeRun`, `onAfterRun`, and `onCompleted`.
- 🔄 Fluent chainable API: configure instances using a declarative, method-chaining syntax for cleaner code setup.
- 🛡️ Execution control: cancel gracefully, abort immediately, or inspect state instantly with explicit control methods.
- 🚀 Zero-allocation reset: clear active timers, burst states, and metrics on demand to reuse instances safely.
- 💻 CLI and DX telemetry: log structured performance metrics directly to the console with one call.

<br>

## Benchmark

#### Instantiation Overhead

| Task | Latency (ns) | Throughput (ops/s) | Samples |
| :--- | :--- | :--- | :--- |
| `lodash.debounce` | 64.61 ± 2.02% | 12,165,240 ± 0.01% | 15,477,023 |
| `debounce` | 983.69 ± 13.59% | 2,331,392 ± 0.03% | 1,019,509 |
| **`Zep`** | **40.51 ± 0.07%** | **18,774,455 ± 0.02%** | **24,685,236** |

<br>

#### Invocation Burst (1,000 Calls)

| Task | Latency (ns) | Throughput (ops/s) | Samples |
| :--- | :--- | :--- | :--- |
| `lodash.debounce` | 62,915 ± 2.01% | 16,250 ± 0.08% | 15,895 |
| `debounce` | 62,292 ± 0.40% | 16,229 ± 0.08% | 16,054 |
| **`Zep`** | **61,332 ± 0.38%** | **16,475 ± 0.08%** | **16,305** |

<br>

\* *Benchmarked on AMD Ryzen 7 5825U using tinybench, on Node v26.5.1.*

<br>

## Usage

Install it by executing any of the following, depending on the preferred package manager:

```bash
bun add @igorskyflyer/zep
```

```bash
pnpm add @igorskyflyer/zep
```

```bash
yarn add @igorskyflyer/zep
```

```bash
npm i @igorskyflyer/zep
```

<br>

## API

### Types

```ts
type ZepCallback<T extends unknown[]> = (...args: T) => void
```

Used as a type for the callback provided in the constructor.

<br>

```ts
type ZepErrorHandler = (error: unknown) => void
```

Used as a type for the callback used in handling errors.

<br>

```ts
type ZepEventHandler = () => void
```

Used as a type for `Zep` events.

---

### Methods

```ts
constructor(callback: ZepCallback<T>, time?: number): Zep<T>
```

Creates a new instance of `Zep`.

- `callback` - the function/callback to debounce.
- `time` - the time limit (in **ms**) for the debouncing.

---

```ts
onCancelled(handler: ZepEventHandler): Zep<T>
```

A handler to call when the execution of `Zep.run()` has been cancelled.  
See also [`Zep.cancel()`](#zep-cancel).

---

```ts
onAborted(handler: ZepEventHandler): Zep<T>
```

A handler to call when the execution of `Zep.run()` has been aborted.  
See also [`Zep.abort()`](#zep-abort).

---

```ts
onBeforeRun(handler: ZepEventHandler): Zep<T>
```

A handler to call before each call to your `callback`.

---

```ts
onAfterRun(handler: ZepEventHandler): Zep<T>
```

A handler to call after each call to your `callback`.

---

```ts
onCompleted(handler: ZepEventHandler): Zep<T>
```

A handler to call after `Zep` has finished running, i.e. no more calls to the `Zep.run()` method have been issued in the given time-frame.

---

```ts
onError(handler: ZepErrorHandler): Zep<T>
```

A handler to call when an error has occurred during execution.

---

<a id="zep-abort"></a>

```ts
abort(): void
```

Aborts the execution, stops `Zep` completely and - if applicable - the currently running Timer without waiting for it to finish its execution. See also [`Zep.cancel()`](#zep-cancel).

---

<a id="zep-cancel"></a>

```ts
cancel(): void
```

Stops the execution but **NOT** the current running Timer - if applicable. See also [`Zep.abort()`](#zep-abort).

---

```ts
reset(): void
```

Resets all internal counters, flags, and metrics, and stops any active timer.

---

```ts
[Symbol.dispose](): void
```

Automatically releases all resources, clears active timers, and unbinds handlers to prevent memory leaks when the instance goes out of scope. Supports the explicit resource management (`using` declaration) to clean up instances automatically when exiting scope.

```ts
// Automatically invokes [Symbol.dispose]() when exiting block scope
{
  using zep = new Zep(callback, 500)
  zep.run()
} // zep.abort() and full resource cleanup triggered automatically here
```

---

```ts
run(...args: T): Zep<T>
```

Runs the callback defined in the constructor if necessary or else debounces it.

---

```ts
writeStats(): void
```

Writes `Zep` statistical information to the `console`, sample output:

```
🧠 [Zep Metrics Report]
├── Invocations  : 48
├── Executions   : 1 (97.92% saved)
├── Active Burst : 0 pending
├── Peak Burst   : 48 max squashed
└── Terminations : 0 cancels, 0 aborts
```

☝ Means that the event was triggered **48** times but `Zep` debounced it and only executed its handler **1** time instead, the handler was called **97.92%** less than without using `Zep`.

---

<br>

**Properties**

```ts
executionCount: number
```

Returns the number of callback executions.

---

```ts
invocations: number
```

Returns the number of callback invocations.

---

```ts
cancelledCount: number
```

Returns the number of cancelled executions.

---

```ts
abortedCount: number
```

Returns the number of aborted executions.

---

```ts
maxBurstCalls: number
```

Returns the number of maximum burst calls.

---

```ts
currentBurstCalls: number
```

Returns the number of current burst calls.

---

```ts
isWaiting: boolean
```

Indicates whether `Zep` is waiting for a Timer to finish its execution, if `true`, `Zep.run()` won't create new Timers when called.

---

```ts
isRunning: boolean
```

Indicates whether a Timer is currently running the `callback` provided in the constructor.

---

```ts
wasCancelled: boolean
```

Indicates whether the execution of `Zep.run()` was cancelled. Execution can be cancelled by calling [`Zep.cancel()`](#zep-cancel).

---

```ts
wasAborted: boolean
```

Indicates whether the execution of `Zep.run()` was aborted. Execution can be aborted by calling [`Zep.abort()`](#zep-abort).

---

<br>

## Examples
### 🚀 Basic Setup (Fluent API)
`Zep`'s chainable methods allow you to configure your logic and life-cycle hooks in a single, readable block.

`zep-basic.ts`
```ts
import { Zep } from '@igorskyflyer/zep'

const zep = new Zep((query: string) => {
  // Your expensive task here
  console.log(`Searching for: ${query}`)
}, 1500)
  .onBeforeRun(() => showLoadingSpinner())
  .onAfterRun(() => hideLoadingSpinner())
  .onCompleted(() => {
    // Quantify your performance wins in development
    if (process.env.NODE_ENV === 'development') {
      zep.writeStats()
    }
  })
  .onError((err) => handleErrors(err))
```

<br>

### 💡 Pro-Tip: UI Syncing
Since `Zep` exposes its internal state, you can bind your UI directly to the debouncer:

`zep-ui.ts`
```ts
// Example: Show a spinner only when Zep is waiting to execute
function renderUI() {
  myLoadingSpinner.visible = zep.isWaiting;
}
```

<br>

### ⌨️ Handling User Input (VS Code QuickPick)
Perfect for waiting until a user stops typing before triggering heavy operations.

`zep-vscode.ts`
```ts
const picker = vscode.window.createQuickPick()

// Cleanest approach: Use an arrow function to preserve 'this' context
picker.onDidChangeValue((value: string) => zep.run(value))
```

> [!TIP]
> Why the arrow function?
>
> Because `zep.run` is a class method, passing it directly causes it to lose its this context. Always wrap it in an arrow function or use `.bind(zep)`.
>

<br>

### 🏎️ Advanced Control: Abort vs. Cancel
`Zep` gives you granular control over the execution life-cycle that standard debounce wrappers lack.

`zep-advanced.ts`
```ts
// Scenario: User closes a UI component before the debounce finishes
closeButton.onClick(() => {
  // Option A: cancel() 
  // Prevents the next execution, but allows the currently running timer to resolve.
  zep.cancel()

  // Option B: abort() 
  // Immediate hard stop. Clears the timer and halts execution instantly.
  zep.abort()
})
```

<br>

### 🧹 Resource Management & Cleanup
Since `Zep` utilizes a resident single-timer to eliminate thrashing, explicitly disposing of the instance when a parent component unmounts prevents ghost executions and releases memory[cite: 3]. `Zep` natively supports `[Symbol.dispose]()` for silent, side-effect-free teardown[cite: 3, 4].

<br>

**React (Functional Component)**
```ts
useEffect(() => {
  const zep = new Zep(myCallback, 1000)
  // ... logic
  return () => zep[Symbol.dispose]() // Silent cleanup on unmount
}, [])
```

<br>

**Svelte**
```ts
import { onDestroy } from 'svelte'

const zep = new Zep(myCallback, 1000)

onDestroy(() => {
  zep[Symbol.dispose]()
})
```

<br>

**Visual Studio Code Extension**

```ts
// Direct compatibility with VS Code Disposable objects
context.subscriptions.push(zep)
```

> [!TIP]
> `[Symbol.dispose]()` vs `abort()`
> Use `zep.[Symbol.dispose]()` for unmounting/cleanup to silently purge timers and clear memory.  Use `zep.abort()` if you specifically want to halt execution and fire the `onAborted` life-cycle hook.  

<br>

### 📊 Real-world Telemetry
Use `writeStats()` to print the currents stats - the overhead saved.

`zep-stats.ts`
```ts
zep.writeStats()

// Sample Console Output:
// 🧠 [Zep Metrics Report]
// ├── Invocations  : 500
// ├── Executions   : 32 (93.60% saved)
// ├── Active Burst : 0 pending
// ├── Peak Burst   : 48 max squashed
// └── Terminations : 0 cancels, 0 aborts
```

<br>

## Implementation

Zep was engineered using a zero-dependency, pure ECMAScript core built around a state-driven architecture. Instead of instantiating and tearing down timers on every invocation, it manages execution timing through a single persistent timer reference to eliminate timer overhead. Internal state structures track call counts, active burst thresholds, and queued arguments directly in memory. The execution pipeline cleanly separates user-initiated cancellations from timer resets to guarantee no hanging callbacks, while a telemetry counter calculates metrics like saved call percentages on the fly. Finally, an integrated reporting module formats these live metrics into structured text output using native console primitives. By eliminating allocation churn and timer thrashing at the engine level, `Zep` achieves **18.7M ops/sec** during instantiation (`~54%` faster throughput than `lodash.debounce` and `8x` faster than `debounce`) with near-zero initial latency, all while executing high-frequency bursts without runtime regression.



<br>

## Motivation

Standard debounce implementations are passive fire-and-forget utilities. During high-frequency events, they cause constant Timer Thrashing by repeatedly creating and destroying timers, all while providing zero visibility into whether they are actually optimizing performance. `Zep` solves this by treating debouncing as a active, state-driven system. Built around a single-timer architecture that cleanly self-terminates when idle, `Zep` eliminates unnecessary timer overhead while exposing native telemetry, fine-grained lifecycle hooks, dual-mode cancellation, and a fluent interface. It gives developers precise execution control and real-time observability into exact overhead savings.

<br>

## Changelog

Read about the latest changes in the [**CHANGELOG**](https://github.com/igorskyflyer/npm-zep/blob/main/CHANGELOG.md).

<br>

## License

Licensed under the [**MIT license**](https://github.com/igorskyflyer/npm-zep/blob/main/LICENSE).

<br>

## Support

<div align="center">
  If this open-source project has saved you time or improved your workflow, consider supporting its continued development via <a href="https://liberapay.com/igorskyflyer/donate"><strong>LiberaPay</a> or <a href="https://ko-fi.com/igorskyflyer"><strong>Ko-Fi</strong></a>.
  <br>
  <br>
  <a href="https://liberapay.com/igorskyflyer/donate"><img alt=" Igor Dimitrijević (igorskyflyer) - Donate via Liberapay to Sustain Open-Source Projects" src="https://liberapay.com/assets/widgets/donate.svg" loading="lazy"></a> <a href="https://ko-fi.com/igorskyflyer"><img src="https://raw.githubusercontent.com/igorskyflyer/igorskyflyer/main/assets/ko-fi.png" alt="Support Igor Dimitrijević (igorskyflyer) - Donate via Ko-Fi to Sustain Open-Source Projects" width="120" height="30" loading="lazy"></a>
  <br>
  <br>
  <blockquote>
    Support helps fund new open-source tools, maintenance, and documentation, thank you!
  </blockquote>
</div>

<br>

## Related

[@igorskyflyer/scrollend-polyfill](https://www.npmjs.com/package/@igorskyflyer/scrollend-polyfill)

> _🛴 A performant and light (&lt; 1KB) JavaScript polyfill for the scrollend Event. ⛸️_

<br>

[@igorskyflyer/extendable-string](https://www.npmjs.com/package/@igorskyflyer/extendable-string)

> _🦀 ExtendableString allows you to create strings on steroids that have custom transformations applied to them, unlike common, plain strings.. 🪀_

<br>

[@igorskyflyer/zing](https://www.npmjs.com/package/@igorskyflyer/zing)

> _🐌 Zing is a C# style String formatter for JavaScript that empowers Strings with positional arguments - composite formatting. 🚀_

<br>

[@igorskyflyer/clone](https://www.npmjs.com/package/@igorskyflyer/clone)

> _🧬 A lightweight JavaScript utility allowing deep copy-by-value of nested objects, arrays and arrays of objects. 🪁_

<br>

[@igorskyflyer/upath](https://www.npmjs.com/package/@igorskyflyer/upath)

> _🎍 Provides a universal way of formatting file-paths in Unix-like and Windows operating systems as an alternative to the built-in path.normalize(). 🧬_

<br>

## Author
Created by **Igor Dimitrijević ([*@igorskyflyer*](https://github.com/igorskyflyer/))**.
