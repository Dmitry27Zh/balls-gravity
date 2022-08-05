const TIMEOUT = 1000

const throttle = (cb, timeout = TIMEOUT, ...initialArgs) => {
  let isCooldown = false
  let savedArgs, savedThis

  const wrapper = function (...args) {
    if (isCooldown) {
      savedArgs = args
      savedThis = this
      return
    }

    isCooldown = true
    cb.call(this, ...initialArgs, ...args)

    setTimeout(() => {
      isCooldown = false

      if (savedArgs) {
        wrapper.call(savedThis, ...initialArgs, ...savedArgs)
        savedArgs = savedThis = null
      }
    }, timeout)
  }

  return wrapper
}

export { throttle }
