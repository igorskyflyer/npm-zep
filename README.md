## Zep

<sub>Your personal (de)bouncer 💪🦸‍♂️</sub>

<br>

🧠 `Zep` is an efficient debounce module. ⏰

> Why `Zep`? Because `Zep` allows you to create a time-invoked callbacks but with _deferred_ execution! Each time `Zep` is called it will either create a new timer (provided by the JavaScript's built-in `setTimeout` function) or wait for a previously created timer to finish its execution = call its callback, so instead of creating dozens, even hundreds of timers in some cases, only a fraction of that number of timers will be created. Basically, it works like `setTimeout()` and `setInterval()` are combined. Some use cases, e.g. when you are processing user input but want to wait until they have finished typing or you are using a 3rd-party API that calls an event handler too often, you can throttle those calls or when your event handler does intensive computing and you want to minimize workload. It limits the rate at which a function/handler can be fired/triggered, thus increasing performance.

<br>

### Usage

Install it by running:

```shell
npm i "@igor.dvlpr/zep"
```

<br>

### API

<br>

**Methods**

<br>

```js
constructor(callback: Function, [time: number]): Zep
```

Creates a new instance of `Zep`, this is where you should define your function/callback that will be debounced - when needed. If you don't define the `time` parameter or `time <= 0` your `callback` will be called immediately without ever being debounced. You can have as many arguments in your `callback` function as you want.

```js
const Zep = require('@igor.dvlpr/zep')

// pass an arrow function
const zep = new Zep((value, item) => {
  // code to limit its execution rate
}, 1500)

function myFunction(value) {
  /* some code */
}

// or an existing function
const zep = new Zep(myFunction, 1500)

//  You can have as many arguments in your callback function as you want.
```

 <br>

`abort(): void` - aborts the execution, stops Zep completely and - if applicable - the current running Timer without waiting for it to finish its execution. See also [`cancel()`]().

<br>

`cancel(): void` - stops the execution but **NOT** the current running Timer - if applicable. See also [`abort()`]().

<br>

`run(...args): void` - runs your `callback` defined in the constructor if necessary or else debounces it. You can pass as many arguments to this method and they will be available in your `callback`. This method should be passed as the event handler.

<br>

`writeStats(): void` - writes `Zep` statistical information to the `console`, sample output,

> ` [Zep]`: calls: 86, timers created: 15, callback executions: 15.

☝ Means that the event was triggered **86** times but `Zep` debounced it and only executed its handler **15** times instead, the handler was called **~82.56%** less than without using it.

<br>
<br>

**Properties**

`timersCount: number` - returns the number of created Timers.

<br>

`executionCount: number` - returns the number of callback executions.

<br>

`isWaiting: boolean` - indicates whether `Zep` is waiting for a Timer to finish its execution, if `true`, `Zep.run()` won't create new Timers when called.

<br>

`isRunning: boolean` - indicates whether a Timer is currently running your `callback`.

<br>

`wasCancelled: boolean` - indicates whether the execution of `Zep.run()` was cancelled. Execution can be cancelled by calling [`Zep.cancel()`]().

<br>

`wasAborted: boolean` - indicates whether the execution of `Zep.run()` was aborted. Execution can be aborted by calling [`Zep.abort()`]().

<br>

`onCancelled: Function` - a callback to call when the execution of `Zep.run()` has been cancelled. See also, [`Zep.cancel()`]().

<br>

`onAborted: Function` - a callback to call when the execution of `Zep.run()` has been aborted. See also, [`Zep.abort()`]().

<br>

### Example

```js
const Zep = require('@igor.dvlpr/zep')



// then pass Zep's run() method to the event instead the original function

// code
const picker = vscode.window.createQuickPick()

// this is by default triggered each time a user types a character inside the QuickPick
 picker.onDidChangeValue((e) => {
	 zep.run(e)
 }
 // by using Zep we can wait for the user to finish their input
 // if they haven't typed a single letter = the onDidChangeValue wasn't triggered for 1500ms (1.5s) we assume they finished typing

// more code
```
