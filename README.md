<h1 align="center"><code>Zep()</code></h1>

<sub>Your personal (de)bouncer 💪🦸‍♂️</sub>

<br>

<p align="center">
	🧠 Zep is a zero-dependency, efficient debounce module. ⏰
</p>

<br>

> [!NOTE]
> Why `Zep()`? Because `Zep()` allows you to create time-invoked callbacks but with _deferred_ execution! `Zep()` does debouncing in a **very efficient** manner by only creating 1 Timer \* - provided by `setInterval`. Some use cases are: when you are processing user input but want to wait until they have finished typing or you are using a 3rd-party API that calls an event handler too often - you can throttle those calls or when your event handler does intensive computing and you want to minimize workload. It limits the rate at which a function/handler can be fired/triggered, thus increasing performance/responsiveness of your product.
>

<sub>\* other debounce functions/modules create dozens, even hundreds of Timers in order to provide the same functionality.</sub>

<br>
<br>

<div align="center">
	<blockquote>
		<br>
		<h4>💖 Support further development</h4>
		<span>I work hard for every project, including this one and your support means a lot to me!
		<br>
		Consider buying me a coffee. ☕
		<br>
		<strong>Thank you for supporting my efforts! 🙏😊</strong></span>
		<br>
		<br>
		<a href="https://ko-fi.com/igorskyflyer" target="_blank"><img src="https://raw.githubusercontent.com/igorskyflyer/igorskyflyer/main/assets/ko-fi.png" alt="Donate to igorskyflyer" width="150"></a>
		<br>
		<br>
		<a href="https://github.com/igorskyflyer"><em>@igorskyflyer</em></a>
		<br>
		<br>
		<br>
	</blockquote>
</div>

<br>

## 🕵🏼 Usage

Install it by executing:

```shell
npm i "@igor.dvlpr/zep"
```

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
import { Zep } from '@igor.dvlpr/zep'

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

A handler to call after `Zep()` has finished running `===` no more calls to the `Zep.run()` in the given time-frame.

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

Aborts the execution, stops Zep completely and - if applicable - the current running Timer without waiting for it to finish its execution. See also [`Zep.cancel()`](#zep-cancel).

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

Indicates whether a Timer is currently running your `callback`.

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

### ✨ Example

<br>

`zep.ts`
```ts
import { Zep } from '@igor.dvlpr/zep'


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

---

## 📝 Changelog

> ✨ Changelog is available here: [CHANGELOG.md](https://github.com/igorskyflyer/npm-zep/blob/main/CHANGELOG.md).

---

## 🪪 License

Licensed under the MIT license which is available here, [MIT license](https://github.com/igorskyflyer/npm-zep/blob/main/LICENSE).

---

## 🧬 Related

[]()

> __

[]()

> __

[]()

> __

[]()

> __

[]()

> __

---

<br>

Provided by **Igor Dimitrijević** ([*@igorskyflyer*](https://github.com/igorskyflyer/)).
