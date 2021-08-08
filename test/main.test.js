import { assert as chai } from 'chai'
import { Zep } from '../src/main.js'

// simulates multiple consecutive calls to a handler
function simulate(handler, iterations, time, param = -1) {
  let i = 0

  const interval = setInterval(() => {
    if (i == iterations) {
      clearInterval(interval)
      return
    }

    i++
    handler.run(param)
  }, time)
}

describe('🧪 Zep tests 🧪', () => {
  it('should be > 3', (done) => {
    const handler = new Zep(() => {}, 200).onCompleted((self) => {
      done()
      chai.isAbove(self.executionCount, 3)
    })

    simulate(handler, 10, 100)
  })

  it('should be > 10', (done) => {
    let test = 0

    const handler = new Zep((self, value) => {
      test += value
    }, 200).onCompleted(() => {
      done()
      chai.isAbove(test, 10)
    })

    simulate(handler, 10, 100, 5)
  })
})
