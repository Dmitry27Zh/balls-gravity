const wrappers = document.querySelectorAll('.balls')

const GRAVITY_GAP = 80
// const LEAVE_GAP = 70;
const layerBallsLimits = [
  [0, 7],
  [7, 18],
]
// const MAX_SEARCH_ITERATIONS_COUNT = 4;

let ballsOffsetList = [
  { y: 0.04, x: 0.81 },
  { y: 0.85, x: 0.7 },
  { y: 0.95, x: -0.19 },
  { y: 0.18, x: -0.61 },
  { y: -0.63, x: -0.8 },
  { y: -0.8, x: -0.04 },
  { y: -0.75, x: 0.85 },
  { y: -0.3, x: 1.63 },
  { y: 0.64, x: 1.63 },
  { y: 1.55, x: 1.39 },
  { y: 1.84, x: 0.38 },
  { y: 1.9, x: -0.54 },
  { y: 1.06, x: -1.1 },
  { y: 0.33, x: -1.64 },
  { y: -0.52, x: -1.87 },
  { y: -1.5, x: -1.44 },
  { y: -1.8, x: -0.6 },
  { y: -1.71, x: 0.38 },
]

// const isMouseLeave = ({clientX, clientY}, {left, top, right, bottom}) => left - clientX > LEAVE_GAP ||
//   top - clientY > LEAVE_GAP || clientX - right > LEAVE_GAP || clientY - bottom > LEAVE_GAP;

const getBallsDistance = (firstBall, secondBall) => {
  return Math.hypot(firstBall.offsetLeft - secondBall.offsetLeft, firstBall.offsetTop - secondBall.offsetTop)
}

const getLayerBallsList = (limitsList, transformedBalls, ball) => {
  return limitsList.map((limits) => {
    const layerBalls = transformedBalls.slice(limits[0], limits[1])
    return layerBalls.map((layerBall) => {
      return {
        ball: layerBall,
        distance: getBallsDistance(layerBall, ball),
      }
    })
  })
}

// const getClosestBall1 = (layerBallsList) => {
//   layerBallsList.forEach((layerBalls) => layerBalls.sort((first, second) => first.distance - second.distance));
//   const maxLayerLength = Math.max(...layerBallsList.map((layerBalls) => layerBalls.length));

//   for (let i = 0; i < MAX_SEARCH_ITERATIONS_COUNT; i++) {
//     for (let layerBalls of layerBallsList) {
//       const layerBall = layerBalls[i];
//       if (layerBall && isBallVirtual(layerBall.ball)) return layerBall.ball;
//     }
//   }
// };

const getClosestBall = (layerBallsList) => {
  for (let layerBalls of layerBallsList) {
    layerBalls.sort((first, second) => first.distance - second.distance)

    for (let layerBall of layerBalls) {
      if (checkBallVirtuality(layerBall.ball)) return layerBall.ball
    }
  }
}

const getClosestTransformedBallIndex = (transformedBalls, ball, layerLimitsList) => {
  const layerBallsList = getLayerBallsList(layerLimitsList, transformedBalls, ball)
  return transformedBalls.indexOf(getClosestBall(layerBallsList))
}

const addTransformedBall = (transformedBalls, currentX, currentY, layerLimitsList, ball) => {
  if (transformedBalls.filter(checkBallVirtuality).length === 0) return
  if (ball.classList.contains('animated')) return
  const closestBallIndex = getClosestTransformedBallIndex(transformedBalls, ball, layerLimitsList)
  if (closestBallIndex === -1) return
  const virtualBall = transformedBalls.splice(closestBallIndex, 1, ball)
  virtualBall[0].remove()
}

const checkBallTransformNeed = (transformedBalls, el) => !transformedBalls.includes(el) && el.matches('.balls__item')

const updateTranformedBalls = (transformedBalls, currentX, currentY, layerLimitsList) => {
  const ballsToTransform = document.elementsFromPoint(currentX, currentY).filter((el) => {
    return checkBallTransformNeed(transformedBalls, el)
  })

  ballsToTransform.sort((first, second) => {
    const distance1 = Math.hypot(first.offsetLeft - currentX, first.offsetTop - currentY)
    const distance2 = Math.hypot(second.offsetLeft - currentX, second.offsetTop - currentY)
    return distance1 - distance2
  })

  ballsToTransform.forEach(addTransformedBall.bind(null, transformedBalls, currentX, currentY, layerLimitsList))
}
const checkBallVirtuality = (ball) => ball.hasAttribute('data-duplicate')

const resetBall = (ball) => {
  if (checkBallVirtuality(ball)) {
    ball.remove()
  }
}

const moveBall = (ball, move) => {
  ball.style.top = `${ball.offsetTop - move.y}px`
  ball.style.left = `${ball.offsetLeft - move.x}px`
  ball.style.zIndex = 2
}

const checkBallDistance = (distance) => {
  return Math.hypot(distance.x, distance.y) < GRAVITY_GAP
}

const checkTransformNeed = (isVirtual, distance) => {
  return isVirtual || checkBallDistance(distance)
}

const moveBalls = (ballsToMove, move, wrap, layerLimitsList) => {
  // updateTranformedBalls(ballsToTransform, moveEvt.clientX, moveEvt.clientY, layerLimitsList)

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
  virtualBall.setAttribute('data-duplicate', '')
  // virtualBall.style.visibility = 'hidden'
  virtualBall.style.background = 'red'
  return virtualBall
}

const addVirtualBalls = (wrap, startCoords, offsetList, ballsToMove) => {
  const wrapCoords = wrap.getBoundingClientRect()
  const position = {
    top: startCoords.y - wrapCoords.top,
    left: startCoords.x - wrapCoords.left,
  }
  const quantity = offsetList.length

  for (let i = 0; i < quantity; i++) {
    const ball = createVirtualBall(wrap)
    wrap.append(ball)
    ballsToMove.push(ball)
    ball.style.top = `${position.top + offsetList[i].y * ball.offsetWidth - 0.5 * ball.offsetHeight}px`
    ball.style.left = `${position.left + offsetList[i].x * ball.offsetWidth - 0.5 * ball.offsetWidth}px`
  }
}

const init = (wrap, layerLimitsList, offsetList) => {
  let startCoords = {}
  const ballsToMove = []

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

    moveBalls(ballsToMove, move, wrap, layerLimitsList)
    startCoords.x = moveEvt.x
    startCoords.y = moveEvt.y
  }

  const onMouseLeave = () => {
    ballsToMove.forEach((ball) => {
      resetBall(ball)
    })
  }

  wrap.addEventListener('mouseenter', onMouseEnter)
  wrap.addEventListener('mousemove', onMouseMove)
  wrap.addEventListener('mouseleave', onMouseLeave)
  wrap.addEventListener('transitionstart', (e) => e.target.classList.add('animated'))
  wrap.addEventListener('transitionend', (e) => e.target.classList.remove('animated'))
}

export const initBalls = () => wrappers.forEach((wrapper) => init(wrapper, layerBallsLimits, ballsOffsetList))
