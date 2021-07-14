const chai = require('chai').assert
const Zep = require('..')

// simulates multiple consecutive calls to a handler
function simulate(handler, iterations, time, done, testCase, param = -1) {
  let i = 0

  const interval = setInterval(() => {
    if (i == iterations) {
      clearInterval(interval)
      done()
      testCase()
      return
    }

    i++
    handler.run(param)
  }, time)
}

describe('🧪 Zep tests 🧪', () => {
  it('should be < 10', (done) => {
    const handler = new Zep(() => {}, 1000)
    simulate(handler, 10, 100, done, () => {
      chai.isBelow(handler.timersCount, 10)
    })
  })

  it('should be true', (done) => {
    const handler = new Zep(() => {})
    simulate(handler, 10, 100, done, () => {
      chai.equal(handler.timersCount, 0)
    })
  })

  it('should be > 3', (done) => {
    const handler = new Zep(() => {}, 200)
    simulate(handler, 10, 100, done, () => {
      chai.isAbove(handler.executionCount, 3)
    })
  })

  it('should be > 10', (done) => {
    let test = 0

    const handler = new Zep((value) => {
      test += value
    }, 200)
    simulate(
      handler,
      10,
      100,
      done,
      () => {
        chai.isAbove(test, 5)
      },
      5
    )
  })
})
