<div align="center">
  <img src="https://raw.githubusercontent.com/igorskyflyer/npm-zep/main/media/zep.png" alt="Icon of Zep" width="256" height="256">
  <h1>Zep</h1>
</div>

<br>

<h4 align="center">
  🧠 Zep is a zero-dependency, efficient debounce module. ⏰
</h4>

<br>
<br>

## 📃 Table of Contents

- [Features](#-features)
- [Usage](#-usage)
- [API](#-api)
- [Examples](#️-examples)
- [Changelog](#-changelog)
- [Support](#-support)
- [License](#-license)
- [Related](#-related)
- [Author](#-author)

<br>
<br>

## 🤖 Features

- ⚡ Debounce control - smartly limits how often your callback runs
- 🛑 Cancel support - stop future runs but let the current one finish
- ⏹ Abort instantly - halt everything, even the running timer
- 🎯 Event hooks - before, after, completed, cancelled, aborted, error
- 📊 Stats tracking - logs calls, executions, and % saved
- ⏳ Wait detection - know when `Zep` is holding off execution
- 🚦 Run state flags - check if running, waiting, cancelled, or aborted
- 🛡 Error handling - custom handler for safe callback execution
- 🔄 Fluent API - chainable `.on()` methods for clean setup
- 🧩 Flexible timing - works with or without a debounce delay

<br>

> ### ℹ️ NOTE
>
> #### Why `Zep()`?
>
> Because `Zep()` allows you to create time-invoked callbacks but with _deferred_ execution! `Zep()` does debouncing in a **very efficient** manner by only creating 1 Timer (\*) - provided by `setInterval`. Some use cases are: when you are processing user input but want to wait until they have finished typing or you are using a 3rd-party API that calls an event handler too often - you can throttle those calls or when your event handler does intensive computing and you want to minimize workload. It limits the rate at which a function/handler can be fired/triggered, thus increasing performance/responsiveness of your product.
>

<sub>\* other debounce functions/modules create dozens, even hundreds of Timers in order to provide the same functionality.</sub>

<br>
<br>

## 🕵🏼 Usage

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
<br>

## 🤹🏼 API

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

<br>
<br>

`example.ts`
```ts
import { Zep } from '@igorskyflyer/zep'

// pass an arrow function
const zep: Zep = new Zep((value: string) => {
  // code to limit its execution rate
}, 1500)

function myFunction(value: string) {
  /* some code */
}

// or an existing function
const zep: Zep = new Zep(myFunction, 1500)

//  You can have as many arguments in your callback function as you want.
```

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
onError(handler: ZepEventHandler, error: Error): Zep
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

> `[Zep]`: invocations: 500, callback executions: 32, saving of 93.60% calls.

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
<br>

### 🗒️ Examples

`zep.ts`
```ts
import { Zep } from '@igorskyflyer/zep'


// pass an arrow function
const zep: Zep = new Zep((value: string) => {
  // code to limit its execution rate
}, 1500)

// then pass Zep's run() method to the event instead the original function

// code
const picker = vscode.window.createQuickPick()

// this is by default triggered each time a user types a character inside the QuickPick
 picker.onDidChangeValue((e: string) => {
	 zep.run(e)
 }

// due to the nature of JavaScript the following WON'T WORK,
// when you pass a class method as a parameter that
// method will get detached from the class and lose its track of <this>,
// which will be globalThis/undefined, thus resulting in an error,
 picker.onDidChangeValue(zep.run)

 // but you could use any of the 2 techniques

 // ****
 function changeHandler(): void {
	 zep.run()
 }

 // and then use that wrapper-function
 picker.onDidChangeValue(changeHandler)
  // ****

	// or

// ****
const changeHandler: Function = zep.run.bind(zep)
 picker.onDidChangeValue(changeHandler)
  // ****

 // by using Zep we can wait for the user to finish their input
 // if they haven't typed a single letter = the onDidChangeValue wasn't
 // triggered for 1500ms (1.5s) we assume they finished typing

// more code
```

<br>
<br>

## 📝 Changelog

📑 The changelog is available here, [CHANGELOG.md](https://github.com/igorskyflyer/npm-zep/blob/main/CHANGELOG.md).

<br>
<br>

## 🪪 License

Licensed under the MIT license which is available here, [MIT license](https://github.com/igorskyflyer/npm-zep/blob/main/LICENSE).

<br>
<br>

## 💖 Support

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
<br>

## 🧬 Related

[@igorskyflyer/scrollend-polyfill](https://www.npmjs.com/package/@igorskyflyer/scrollend-polyfill)

> _🛴 A performant and light (&lt; 1KB) JavaScript polyfill for the scrollend Event. ⛸️_

<br>

[@igorskyflyer/extendable-string](https://www.npmjs.com/package/@igorskyflyer/extendable-string)

> _🦀 ExtendableString allows you to create strings on steroids that have custom transformations applied to them, unlike common, plain strings.. 🪀_

<br>

[@igorskyflyer/zing](https://www.npmjs.com/package/@igorskyflyer/zing)

> _🐌 Zing is a C# style String formatter for JavaScript that empowers Strings with positional arguments - composite formatting. 🚀_

<br>

[@igorskyflyer/node-clone-js](https://www.npmjs.com/package/@igorskyflyer/node-clone-js)

> _🧬 A lightweight JavaScript utility allowing deep copy-by-value of nested objects, arrays and arrays of objects. 🪁_

<br>

[@igorskyflyer/upath](https://www.npmjs.com/package/@igorskyflyer/upath)

> _🎍 Provides a universal way of formatting file-paths in Unix-like and Windows operating systems as an alternative to the built-in path.normalize(). 🧬_

<br>
<br>
<br>

## 👨🏻‍💻 Author
Created by **Igor Dimitrijević** ([*@igorskyflyer*](https://github.com/igorskyflyer/)).
