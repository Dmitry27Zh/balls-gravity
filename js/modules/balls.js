const wrappers = document.querySelectorAll('.balls')

const Gravity = {
  DISTANCE: 250,
  TIMEOUT: 200,
}

const LAYER_BALLS_LIMITS = [
  [0, 7],
  [7, 18],
]
// const MAX_SEARCH_ITERATIONS_COUNT = 4;

const BallsOffsetList = [
  { Y: 0.04, X: 0.81 },
  { Y: 0.85, X: 0.7 },
  { Y: 0.95, X: -0.19 },
  { Y: 0.18, X: -0.61 },
  { Y: -0.63, X: -0.8 },
  { Y: -0.8, X: -0.04 },
  { Y: -0.75, X: 0.85 },
  { Y: -0.3, X: 1.63 },
  { Y: 0.64, X: 1.63 },
  { Y: 1.55, X: 1.39 },
  { Y: 1.84, X: 0.38 },
  { Y: 1.9, X: -0.54 },
  { Y: 1.06, X: -1.1 },
  { Y: 0.33, X: -1.64 },
  { Y: -0.52, X: -1.87 },
  { Y: -1.5, X: -1.44 },
  { Y: -1.8, X: -0.6 },
  { Y: -1.71, X: 0.38 },
]

const getBallsDistance = (firstBall, secondBall) => {
  return Math.hypot(firstBall.offsetLeft - secondBall.offsetLeft, firstBall.offsetTop - secondBall.offsetTop)
}

const checkBallDistance = (ball) => {
  return Math.hypot(ball.dataset.x - ball.dataset.initX, ball.dataset.y - ball.dataset.initY) <= Gravity.DISTANCE
}

const resetBall = (ball) => {
  if (checkBallVirtuality(ball)) {
    ball.remove()
    ball.classList.remove('moving')
  } else {
    setTimeout(() => ball.classList.remove('moving'), Gravity.TIMEOUT) // transitionend doesn't work in some cases
    ball.style.top = ball.style.left = null
    ball.dataset.x = ball.dataset.y = ''
    ball.dataset.initX = ball.dataset.initY = ''
  }
}

const getPairsByAscendingDistance = (ballsToMove, closestBalls) => {
  const pairs = ballsToMove.reduce((result, ball, index) => {
    if (checkBallVirtuality(ball)) {
      const currentPairs = closestBalls
        .map((closestBall) => ({
          virtualBall: ball,
          closestBall,
          index,
          distance: getBallsDistance(ball, closestBall),
        }))
        .filter(({ distance }) => distance <= Gravity.DISTANCE)

      result.push(...currentPairs)
    }

    return result
  }, [])

  return pairs.sort((a, b) => a.distance - b.distance)
}

const stopBallsMoving = (ballsToMove) => {
  ballsToMove.forEach((ball, index) => {
    if (!checkBallVirtuality(ball) && !checkBallDistance(ball)) {
      addVirtualBall(ball.parentElement, ballsToMove, ball.dataset.x, ball.dataset.y, index)
      resetBall(ball)
    }
  })
}

const updateBallsToMove = (ballsToMove, currentX, currentY, layerLimitsList) => {
  stopBallsMoving(ballsToMove)
  const closestBalls = document.elementsFromPoint(currentX, currentY).filter((el) => el.matches('.balls__item'))
  const pairsByAscendingDistance = getPairsByAscendingDistance(ballsToMove, closestBalls)

  pairsByAscendingDistance.forEach(({ virtualBall, closestBall, index }) => {
    if (checkBallMoving(virtualBall) && !checkBallMoving(closestBall)) {
      addBallToMove(closestBall, ballsToMove, closestBall.offsetLeft, closestBall.offsetTop, index)
      resetBall(virtualBall)
      setBallPosition(closestBall, virtualBall.dataset.x, virtualBall.dataset.y)
    }
  })
}

const checkBallVirtuality = (ball) => ball.hasAttribute('data-virtual')

const setBallPosition = (ball, x, y) => {
  ball.style.top = `${y}px`
  ball.style.left = `${x}px`
  ball.dataset.x = x
  ball.dataset.y = y
}

const moveBall = (ball, move) => {
  const ballCoords = {
    x: ball.dataset.x - move.x,
    y: ball.dataset.y - move.y,
  }

  setBallPosition(ball, ballCoords.x, ballCoords.y)
}

const moveBalls = (ballsToMove, move, moveEvt, layerLimitsList) => {
  updateBallsToMove(ballsToMove, moveEvt.clientX, moveEvt.clientY, layerLimitsList)
  ballsToMove.forEach((ball) => moveBall(ball, move))
}

const checkBallMoving = (ball) => ball.classList.contains('moving')

const addBallToMove = (ball, ballsToMove, initX, initY, index = ballsToMove.length) => {
  ballsToMove[index] = ball
  ball.classList.add('moving')
  ball.dataset.initX = initX
  ball.dataset.initY = initY
}

const createVirtualBall = (wrap) => {
  const virtualBall = wrap.firstElementChild.cloneNode()
  virtualBall.setAttribute('data-virtual', '')
  virtualBall.style.visibility = 'hidden'
  return virtualBall
}

const addVirtualBall = (wrap, ballsToMove, initX, initY, index) => {
  const ball = createVirtualBall(wrap)
  wrap.append(ball)
  addBallToMove(ball, ballsToMove, initX, initY, index)
  setBallPosition(ball, initX, initY)
}

const addVirtualBalls = (wrap, startCoords, offsetList, ballsToMove) => {
  const wrapCoords = wrap.getBoundingClientRect()
  const pointerCoords = {
    x: startCoords.x - wrapCoords.left,
    y: startCoords.y - wrapCoords.top,
  }
  const ball = wrap.firstElementChild
  const quantity = offsetList.length

  for (let i = 0; i < quantity; i++) {
    const ballCoords = {
      x: pointerCoords.x + offsetList[i].X * ball.offsetWidth - 0.5 * ball.offsetWidth,
      y: pointerCoords.y + offsetList[i].Y * ball.offsetWidth - 0.5 * ball.offsetHeight,
    }

    addVirtualBall(wrap, ballsToMove, ballCoords.x, ballCoords.y)
  }
}

const init = (wrap, offsetList, layerLimitsList) => {
  let startCoords = {}
  let ballsToMove = []

  const onMouseEnter = (enterEvt) => {
    startCoords.x = enterEvt.clientX
    startCoords.y = enterEvt.clientY
    addVirtualBalls(wrap, startCoords, offsetList, ballsToMove)
  }

  const onMouseMove = (moveEvt) => {
    const move = {
      x: startCoords.x - moveEvt.x,
      y: startCoords.y - moveEvt.y,
    }

    moveBalls(ballsToMove, move, moveEvt, wrap, layerLimitsList)
    startCoords.x = moveEvt.x
    startCoords.y = moveEvt.y
  }

  const onMouseLeave = () => {
    ballsToMove.forEach((ball) => {
      resetBall(ball)
    })

    ballsToMove = []
  }

  wrap.addEventListener('mouseenter', onMouseEnter)
  wrap.addEventListener('mousemove', onMouseMove)
  wrap.addEventListener('mouseleave', onMouseLeave)
}

export const initBalls = () => wrappers.forEach((wrapper) => init(wrapper, BallsOffsetList, LAYER_BALLS_LIMITS))
