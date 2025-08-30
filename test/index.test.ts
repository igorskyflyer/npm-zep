// Author: Igor Dimitrijević (@igorskyflyer)

import { assert, describe, test } from 'vitest'
import { Zep } from '../src/index.js'

// simulates multiple consecutive calls to a handler
function simulate(
  handler: Zep,
  iterations: number,
  time: number,
  param: number = -1
) {
  let i: number = 0

  const interval: NodeJS.Timeout = setInterval(() => {
    if (i === iterations) {
      clearInterval(interval)
      return
    }

    i++
    handler.run(param)
  }, time)
}

describe('🧪 Zep() tests 🧪', () => {
  test('should be > 3', () => {
    const zep: Zep = new Zep(() => {}, 200).onCompleted(() => {
      assert.isAbove(zep.executionCount, 3)
    })

    simulate(zep, 10, 100)
  })

  test('should be > 10', () => {
    let test: number = 0

    const zep: Zep = new Zep((value: number) => {
      test += value
    }, 200).onCompleted(() => {
      assert.isAbove(test, 10)
    })

    simulate(zep, 10, 100, 5)
  })
})
