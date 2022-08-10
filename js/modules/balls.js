const wrappers = document.querySelectorAll('.balls')

const GRAVITY_GAP = 80
const layerBallsLimits = [
  [0, 7],
  [7, 18],
]
// const MAX_SEARCH_ITERATIONS_COUNT = 4;

let BallsOffsetList = [
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

let counter = 0

const updateBallsToMove = (ballsToMove, currentX, currentY, layerLimitsList) => {
  const closestBalls = document.elementsFromPoint(currentX, currentY).filter((el) => el.matches('.balls__item'))
  counter++
  if (counter >= 2) return

  const pairs = ballsToMove.reduce((result, ball, index) => {
    if (checkBallVirtuality(ball)) {
      const currentPairs = closestBalls.map((closestBall) => ({
        virtualBall: ball,
        closestBall,
        index,
        distance: getBallsDistance(ball, closestBall),
      }))

      result.push(...currentPairs)
    }

    return result
  }, [])

  const pairsByAscendingDistance = pairs.sort((a, b) => a.distance - b.distance).slice(0, 1)
  console.log(pairsByAscendingDistance)

  pairsByAscendingDistance.forEach(({ virtualBall, closestBall, index, distance }) => {
    virtualBall.style.outline = '3px solid purple'
    closestBall.style.outline = '3px solid purple'
    closestBall.style.zIndex = 3
    setBallPosition(closestBall, virtualBall.dataset.x, virtualBall.dataset.y)
    virtualBall.remove()
    addBallToMove(closestBall, ballsToMove, index)
  })
}

const checkBallVirtuality = (ball) => ball.hasAttribute('data-virtual')

const resetBall = (ball) => {
  if (checkBallVirtuality(ball)) {
    ball.remove()
  } else {
    ball.style.top = ball.style.left = null
    ball.dataset.x = ball.dataset.y = ''
    ball.dataset.initX = ball.dataset.initY = ''
    ball.classList.remove('moving')
    ball.removeAttribute('style')
  }
}

const setBallPosition = (ball, x, y) => {
  ball.style.top = `${y}px`
  ball.style.left = `${x}px`
  ball.dataset.x = x
  ball.dataset.y = y
}

const moveBall = (ball, move) => {
  const ballCoords = {
    x: ball.dataset.initX - move.x,
    y: ball.dataset.initY - move.y,
  }

  setBallPosition(ball, ballCoords.x, ballCoords.y)
}

const checkBallDistance = (distance) => {
  return Math.hypot(distance.x, distance.y) < GRAVITY_GAP
}

const checkTransformNeed = (isVirtual, distance) => {
  return isVirtual || checkBallDistance(distance)
}

const moveBalls = (ballsToMove, move, moveEvt, wrap, layerLimitsList) => {
  updateBallsToMove(ballsToMove, moveEvt.clientX, moveEvt.clientY, layerLimitsList)

  ballsToMove.forEach((ball) => {
    const isTransformNeed = checkTransformNeed(checkBallVirtuality(ball), move)

    if (true) {
      moveBall(ball, move)
    } else {
      resetBall(ball, balls, wrap)
    }
  })
}

const createVirtualBall = (wrap) => {
  const virtualBall = wrap.firstElementChild.cloneNode()
  virtualBall.setAttribute('data-virtual', '')
  // virtualBall.style.visibility = 'hidden'
  virtualBall.style.background = 'red'
  return virtualBall
}

const addBallToMove = (ball, ballsToMove, index = ballsToMove.length) => {
  ballsToMove[index] = ball
  ball.classList.add('moving')
  ball.dataset.initX = ball.dataset.x
  ball.dataset.initY = ball.dataset.y
}

const addVirtualBalls = (wrap, startCoords, offsetList, ballsToMove) => {
  const wrapCoords = wrap.getBoundingClientRect()
  const pointerCoords = {
    x: startCoords.x - wrapCoords.left,
    y: startCoords.y - wrapCoords.top,
  }
  const quantity = offsetList.length

  for (let i = 0; i < quantity; i++) {
    const ball = createVirtualBall(wrap)
    wrap.append(ball)

    const ballCoords = {
      x: pointerCoords.x + offsetList[i].X * ball.offsetWidth - 0.5 * ball.offsetWidth,
      y: pointerCoords.y + offsetList[i].Y * ball.offsetWidth - 0.5 * ball.offsetHeight,
    }

    setBallPosition(ball, ballCoords.x, ballCoords.y)
    addBallToMove(ball, ballsToMove)
  }
}

const init = (wrap, layerLimitsList, offsetList) => {
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
    // startCoords.x = moveEvt.x
    // startCoords.y = moveEvt.y
  }

  const onMouseLeave = () => {
    ballsToMove.forEach((ball) => {
      resetBall(ball)
      ballsToMove = []
    })
  }

  wrap.addEventListener('mouseenter', onMouseEnter)
  wrap.addEventListener('mousemove', onMouseMove)
  wrap.addEventListener('mouseleave', onMouseLeave)
}

export const initBalls = () => wrappers.forEach((wrapper) => init(wrapper, layerBallsLimits, BallsOffsetList))
