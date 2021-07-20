## `Zep()`

<sub>Your personal (de)bouncer 💪🦸‍♂️</sub>

<br>

🧠 `Zep()` is a zero-dependency, efficient debounce module. ⏰

> Why `Zep()`? Because `Zep()` allows you to create time-invoked callbacks but with _deferred_ execution! `Zep()` does debouncing in a **very efficient** manner by only creating 1 Timer\* - provided by `setInterval`. Some use cases are: when you are processing user input but want to wait until they have finished typing or you are using a 3rd-party API that calls an event handler too often - you can throttle those calls or when your event handler does intensive computing and you want to minimize workload. It limits the rate at which a function/handler can be fired/triggered, thus increasing performance/responsiveness of your product.

<sub>\* other debounce functions/modules create dozens, even hundreds of Timers in order to provide the same functionality.</sub>

<br>

> Note, since `v.3.0.0`, setters for event handling properties were converted to methods that accept your event handler and return the current instance of `Zep()`, useful for chained calls, see [ZepEventHandler](#zep-eventhandler) and its benefits.

<br>

### Usage

Install it by running:

```shell
npm i "@igor.dvlpr/zep"
```

<br>

### API

<br>

**Types**

```ts
type ZepCallback {
	self: Zep,
	args: ...*
}
```

<br>

<a id="zep-eventhandler"></a>

```ts
type ZepEventHandler {
	self: Zep
}
```

<br>

```ts
type ZepErrorHandler {
	self: Zep,
	error: Error
}
```

<br>

**Methods**

<br>

```js
constructor(callback: ZepCallback, [time: number]): Zep
```

Creates a new instance of `Zep()`, this is where you should define your function/callback that will be debounced - when needed. If you don't define the `time` parameter or `time <= 0` your `callback` will be called immediately without ever being debounced. You can have as many arguments in your `callback` function as you want.

Since `v.4.0.0` event handlers have changed. Their first parameter is always `self: Zep` which is a self-reference to the current Zep object that triggered the event handler.

```js
const Zep = require('@igor.dvlpr/zep')

// pass an arrow function
const zep = new Zep((self, value, item) => {
  // code to limit its execution rate
}, 1500)

function myFunction(self, value) {
  /* some code */
}

// or an existing function
const zep = new Zep(myFunction, 1500)

//  You can have as many arguments in your callback function as you want.
```

 <br>

`onCancelled(handler: ZepEventHandler): Zep` - a handler to call when the execution of `Zep.run()` has been cancelled. See also, [`Zep.cancel()`](#zep-cancel).

<br>

`onAborted(handler: ZepEventHandler): Zep` - a handler to call when the execution of `Zep.run()` has been aborted. See also, [`Zep.abort()`](#zep-abort).

<br>

`onBeforeRun(handler: ZepEventHandler): Zep` - a handler to call before each call to your `callback`.

<br>

`onAfterRun(handler: ZepEventHandler): Zep` - a handler to call after each call to your `callback`.

<br>

`onCompleted(handler: ZepEventHandler): Zep` - a handler to call after `Zep()` has finished running `===` no more calls to the `Zep.run()` in the given time-frame.

<br>

`onError(handler: ZepEventHandler, error: Error): Zep` - a handler to call when an error has occurred during execution.

<br>

<a id="zep-abort"></a>

`abort(): void` - aborts the execution, stops Zep completely and - if applicable - the current running Timer without waiting for it to finish its execution. See also [`Zep.cancel()`](#zep-cancel).

<br>

<a id="zep-cancel"></a>

`cancel(): void` - stops the execution but **NOT** the current running Timer - if applicable. See also [`Zep.abort()`](#zep-abort).

<br>

`run(...args): void` - runs your `callback` defined in the constructor if necessary or else debounces it. You can pass as many arguments to this method and they will be available in your `callback`. This method should be passed as the event handler.

<br>

`writeStats(): void` - writes `Zep()` statistical information to the `console`, sample output,

> `[Zep]`: invocations: 500, callback executions: 32, saving of 93.60% calls.

☝ Means that the event was triggered **500** times but `Zep()` debounced it and only executed its handler **32** times instead, the handler was called **93.60%** less than without using `Zep()`.

<br>
<br>

**Properties**

`executionCount: number` - returns the number of callback executions.

<br>

`isWaiting: boolean` - indicates whether `Zep()` is waiting for a Timer to finish its execution, if `true`, `Zep.run()` won't create new Timers when called.

<br>

`isRunning: boolean` - indicates whether a Timer is currently running your `callback`.

<br>

`wasCancelled: boolean` - indicates whether the execution of `Zep.run()` was cancelled. Execution can be cancelled by calling [`Zep.cancel()`](#zep-cancel).

<br>

`wasAborted: boolean` - indicates whether the execution of `Zep.run()` was aborted. Execution can be aborted by calling [`Zep.abort()`](#zep-abort).

<br>

### Example

```js
const Zep = require('@igor.dvlpr/zep')


// pass an arrow function
const zep = new Zep((self, value, item) => {
  // code to limit its execution rate
}, 1500)

// then pass Zep's run() method to the event instead the original function

// code
const picker = vscode.window.createQuickPick()

// this is by default triggered each time a user types a character inside the QuickPick
 picker.onDidChangeValue((e) => {
	 zep.run(e)
 }

// due to the nature of JavaScript the following WON'T WORK,
// when you pass a class method as a parameter that
// method will get detached from the class and lose its track of <this>,
// which will be globalThis/undefined, thus resulting in an error,
 picker.onDidChangeValue(zep.run)

 // but you could use any of the 2 techniques

 // ****
 function changeHandler() {
	 zep.run()
 }

 // and then use that wrapper-function
 picker.onDidChangeValue(changeHandler)
  // ****

	// or

// ****
const changeHandler = zep.run.bind(zep)
 picker.onDidChangeValue(changeHandler)
  // ****

 // by using Zep we can wait for the user to finish their input
 // if they haven't typed a single letter = the onDidChangeValue wasn't
 // triggered for 1500ms (1.5s) we assume they finished typing

// more code
```
