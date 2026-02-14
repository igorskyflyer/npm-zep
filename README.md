<div align="center">
  <img src="https://raw.githubusercontent.com/igorskyflyer/npm-zep/main/media/zep.png" alt="Icon of Zep" width="256" height="256">
  <h1>Zep</h1>
</div>

<br>

<h4 align="center">
  🧠 <code>Zep</code>: a state-driven, single-timer debounce engine with built-in telemetry. 📉
</h4>

<br>
<br>

## 📃 Table of Contents

- 🎯 [**Motivation**](#motivation)
- 🤖 [**Features**](#features)
- 🕵🏼 [**Usage**](#usage)
- 📊 [**Performance**](#performance)
- 🤹🏼 [**API**](#api)
- 🚀 [**Examples**](#examples)
- 📝 [**Changelog**](#changelog)
- 🪪 [**License**](#license)
- 💖 [**Support**](#support)
- 👨🏻‍💻 [**Author**](#author)

<br>

## Motivation

### Why `Zep`? ⚡

Standard debounce functions are typically **"fire and forget,"** often leading to **Timer Thrashing** - the constant creation and destruction of timers during high-frequency events.

`Zep` is engineered as a **State Machine**. It utilizes a **single-timer architecture** that remains resident only while active, managing execution through internal state flags and triggering an automatic **cleanup** (via `clearInterval()`) the moment it's no longer needed.

- **Observability:** Built-in telemetry calculates the exact **efficiency gain** (e.g., `🧠 [Zep]: 500 invocations, 32 executions, saving 93.60% overhead`).
- **Lifecycle Hooks:** Precise control over the execution flow with `onBeforeRun()`, `onAfterRun()`, and `onCompleted()`.
- **Fluent Interface:** Clean, chainable API for declarative configuration.
- **Dual-mode Termination:** Choose between a graceful `cancel()` or an immediate `abort()`.

<br>

## Features

- ⚡ **Single-Timer Engine** - eliminates *"timer thrashing"* by using one persistent, state-managed interval instead of spawning hundreds of volatile timeouts
- 📊 **Built-in Telemetry** - real-time performance tracking. Monitor invocations vs. executions and see exactly how much execution overhead was saved
- 🚦 **State-Driven Architecture** - fine-grained visibility with `isWaiting` and `isRunning` flags, allowing an app to react to the debouncer's internal state
- 🎯 **Lifecycle Hooks** - a full suite of events (`onBefore`, `onAfter`, `onCompleted`, etc.) to orchestrate complex asynchronous workflows.
- 🛑 **Dual-Mode Termination** - choose between *Graceful Cancellation* (finishing the current run) or *Immediate Abort* (killing the timer and execution instantly)
- 🔄 **Fluent API** - chainable configuration for a clean, readable developer experience
- 🛡 **Zero-Dependency Safety** - no *"black box"* external code. Pure, **TypeScript**-native implementation with built-in error handling
- 🧩 **Flexible Timing**: handles events with or without delays, maintaining predictable execution
- 🗑️ **Automated Cleanup** - the single-timer engine intelligently self-terminates when the execution queue is empty, ensuring zero idle CPU usage
- 🚦 **UX-Ready State** - use the `isWaiting` flag to drive UI feedback (like *"Saving..."* or *"Typing..."*) without needing extra state variables

<br>

## Usage

Install it by executing any of the following, depending on your preferred package manager:

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

## Performance

|     **Feature**    |       **Standard Debounce**        |                     **Zep**                   |
|:------------------:|:----------------------------------:|:---------------------------------------------:|
| _Memory Footprint_ |   **High** (new timer per call)    | **Ultra-low** (single persistent timer)       |
| _Observability_    |       **None** (black box)         |   Built-in **Stats** & **Lifecycle** Hooks    |
| _Control_          |        **Basic** (`.cancel()`)     |     **Advanced** (`.abort()` vs. `.cancel()`) |
| _Dependencies_     | Often **bundled** (e.g., *Lodash*) |               **Zero** (0)                    |
| _Telemetry_        |            **None**                | **Built-in** stats + **console** output       |

<br>

## API

### Types

```ts
type ZepCallback = (...args: any[]) => void
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
constructor(callback: ZepCallback, time?: number): Zep
```

Creates a new instance of Zep.

- `callback` - the function/callback to debounce.
- `time` - the time limit (in **ms**) for the debouncing.

---

```ts
onCancelled(handler: ZepEventHandler): Zep
```

A handler to call when the execution of `Zep.run()` has been cancelled.  
See also [`Zep.cancel()`](#zep-cancel).

---

```ts
onAborted(handler: ZepEventHandler): Zep
```

A handler to call when the execution of `Zep.run()` has been aborted.  
See also [`Zep.abort()`](#zep-abort).

---

```ts
onBeforeRun(handler: ZepEventHandler): Zep
```

A handler to call before each call to your `callback`.

---

```ts
onAfterRun(handler: ZepEventHandler): Zep
```

A handler to call after each call to your `callback`.

---

```ts
onCompleted(handler: ZepEventHandler): Zep
```

A handler to call after `Zep()` has finished running, i.e. no more calls to the `Zep.run()` method have been issued in the given time-frame.

---

```ts
onError(handler: ZepErrorHandler): Zep
```

A handler to call when an error has occurred during execution.

---

<a id="zep-abort"></a>

```ts
abort(): void
```

Aborts the execution, stops Zep completely and - if applicable - the currently running Timer without waiting for it to finish its execution. See also [`Zep.cancel()`](#zep-cancel).

---

<a id="zep-cancel"></a>

```ts
cancel(): void
```

Stops the execution but **NOT** the current running Timer - if applicable. See also [`Zep.abort()`](#zep-abort).

---

```ts
run(...args): void
```

Runs the callback defined in the constructor if necessary or else debounces it.

---

```ts
writeStats(): void
```

Writes `Zep()` statistical information to the `console`, sample output,

```text
 🧠 [Zep]: invocations: 500, callback executions: 32, saving of 93.60% calls.
```

☝ Means that the event was triggered **500** times but `Zep()` debounced it and only executed its handler **32** times instead, the handler was called **93.60%** less than without using `Zep()`.

---

<br>

**Properties**

```ts
executionCount: number
```

Returns the number of callback executions.

---

```ts
isWaiting: boolean
```

Indicates whether `Zep()` is waiting for a Timer to finish its execution, if `true`, `Zep.run()` won't create new Timers when called.

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

<br>

## Examples
### 🚀 Basic Setup (Fluent API)
`Zep`'s chainable methods allow you to configure your logic and lifecycle hooks in a single, readable block.

`zep-basic.ts`
```ts
import { Zep } from '@igorskyflyer/zep'

const zep: Zep = new Zep((query: string) => {
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
`Zep` gives you granular control over the execution lifecycle that standard debounce wrappers lack.

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
Since `Zep` utilizes a resident single-timer to eliminate thrashing, it is a best practice to explicitly destroy the instance when the parent component unmounts. This prevents "ghost" executions and ensures immediate memory release.

<br>

**React (Functional Component)**
```ts
useEffect(() => {
  const zep = new Zep(myCallback, 1000)
  // ... logic
  return () => zep.abort() // Immediate hard-stop on unmount
}, [])
```

<br>

**Svelte**
```ts
import { onDestroy } from 'svelte'

const zep = new Zep(myCallback, 1000)

onDestroy(() => {
  zep.abort()
})
```

<br>

**Visual Studio Code Extension**
```ts
context.subscriptions.push({
  dispose: () => zep.abort()
})
```

<br>

### 📊 Real-world Telemetry
Use `writeStats()` to print the currents stats - the overhead saved.

`zep-stats.ts`
```ts
zep.writeStats()

// Sample Console Output:
// 🧠 [Zep]: invocations: 500, callback executions: 32, saving 93.60% of calls.
```

<br>

## Changelog

📑 The changelog is available here, [CHANGELOG.md](https://github.com/igorskyflyer/npm-zep/blob/main/CHANGELOG.md).

<br>

## License

Licensed under the MIT license which is available here, [MIT license](https://github.com/igorskyflyer/npm-zep/blob/main/LICENSE).

<br>

## Support

<div align="center">
  I work hard for every project, including this one and your support means a lot to me!
  <br>
  Consider buying me a coffee. ☕
  <br>
  <br>
  <a href="https://ko-fi.com/igorskyflyer" target="_blank"><img src="https://raw.githubusercontent.com/igorskyflyer/igorskyflyer/main/assets/ko-fi.png" alt="Donate to igorskyflyer" width="180" height="46"></a>
  <br>
  <br>
  <em>Thank you for supporting my efforts!</em> 🙏😊
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
Created by **Igor Dimitrijević** ([*@igorskyflyer*](https://github.com/igorskyflyer/)).
