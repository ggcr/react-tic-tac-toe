import * as React from 'react'
import useLocalStorage from './useLocalStorage'
import './style.css'

const rows = 3
const cols = 3


function Board() {
  const [squares, setSquares] = useLocalStorage('board', Array(9).fill(null))
  const [initial, setInitial] = useLocalStorage('randInitial', generateRandomInitial())
  const [gameHistory, setGameHistory] = useLocalStorage(Array(Array(9).fill(null)))
  const [gameIdx, setGameIdx] = useLocalStorage('gameIdx', 0)

  const nextValue = calculateNextValue(squares, initial)
  const [winner, ] = calculateWinner(squares)
  const status = calculateStatus(winner, squares, nextValue ?? null)

  // This is the function your square click handler will call. `square` should
  // be an index. So if they click the center square, this will be `4`.
  function selectSquare(square) {
    if(winner !== null || squares[square] !== null || gameIdx+1 < gameHistory.length) {
      return
    }
    let squaresCopy = [...squares]
    squaresCopy[square] = nextValue
    setSquares(squaresCopy)

    setGameHistory([...gameHistory, squaresCopy])
    setGameIdx(gameIdx+1)
  }

  function previous() {
    setSquares(gameHistory[gameIdx-1])
    setGameIdx(gameIdx-1)
  }

  function next() {
    setGameIdx(gameIdx+1)
    setSquares(gameHistory[gameIdx+1])
  }

  function restart() {
    setSquares(Array(9).fill(null))
    window.localStorage.removeItem('randInitial')
    setInitial(generateRandomInitial())
    setGameIdx(0)
    setGameHistory(Array(Array(9).fill(null)))
  }

  function renderSquare(i) {
    return (
      <button className="square" onClick={() => selectSquare(i)}>
        {squares[i]}
      </button>
    )
  }

  return (
    <div className="container">
      <div>
        <div className="status">{status}</div>
        <div className="board-row">
          {renderSquare(0)}
          {renderSquare(1)}
          {renderSquare(2)}
        </div>
        <div className="board-row">
          {renderSquare(3)}
          {renderSquare(4)}
          {renderSquare(5)}
        </div>
        <div className="board-row">
          {renderSquare(6)}
          {renderSquare(7)}
          {renderSquare(8)}
        </div>
        <button className="restart" onClick={restart}>
          restart
        </button>
        <br/>
        <button disabled={gameIdx < 1} className="previous" onClick={previous}>
          previous
        </button>
        <button disabled={gameIdx+1 >= gameHistory.length} className="next" onClick={next}>
          next
        </button>
      </div>
      <div className="state-params">
        <div>
          GameHistory:
          {gameHistory[gameIdx-1]}
          <br/>
          Len: 
          {gameHistory.length}
        </div>
        <div>
          GameIdx: 
          {gameIdx}
        </div>
        <div>
          Initial: 
          {initial}
        </div>
      </div>
    </div>
  )
}

function calculateNextValue(squares, initial) {
  let count = [0,0] // [X,O]
  for(let i=0; i < rows; i++) {
    for(let j=0; j < cols; j++) {
      const val = squares[i*rows+j]
      if(val === 'X') {
        count[0] += 1
      } else if (val === 'O') {
        count[1] += 1
      }
    }
  }
  return (count[0] === count[1]) 
  ? initial
  : ((count[0] < count[1]) ? 'X' : 'O')
}

function generateRandomInitial() {
  return ['X', 'O'][Math.floor(Math.random()*2)]
}

function calculateWinner(squares) {
  // horizontal
  for(let i=0; i < rows; i+=1) {
    if(squares[i*rows+(cols-1)] !== null
    & squares[i*rows+(cols-1)] === squares[i*rows+(cols-2)] 
    & squares[i*rows+(cols-1)] === squares[i*rows+(cols-3)]) {
      return [squares[i*rows+(cols-1)], [[i,(cols-3)], [i,(cols-1)]]]
    }
  }
  
  // vertical
  for(let j=0; j < cols; j+=1) {
    if(squares[(rows-1)*rows+j] !== null
    & squares[(rows-1)*rows+j] === squares[(rows-2)*rows+j] 
    & squares[(rows-1)*rows+j] === squares[(rows-3)*rows+j]) {
      return [squares[(rows-1)*rows+j], [[(rows-3),j], [(rows-1),j]]]
    }
  }
  
  // this method assumes we are working with a square matrix of any order
  let center = (rows*cols % 2 === 1) ? squares[((rows*cols+1)/2)-1] : squares[(rows*cols)/2-1]
  
  // diagonal
  if(center !== null) {
    if(center === squares[(rows-3)*rows+(cols-3)] 
    & center === squares[(rows-1)*rows+(cols-1)]) {
      return [center, [[(rows-3),(cols-3)], [(rows-1),(cols-1)]]]
    }
    if(center === squares[(rows-3)*rows+(cols-1)] 
    & center === squares[(rows-1)*rows+(cols-3)]) {
      return [center, [[(rows-3),(cols-1)], [(rows-1),(cols-3)]]]
    }
  }
  
  return [null, null]
}

function calculateStatus(winner, squares, nextValue) {
  return winner
    ? `Winner: ${winner}`
    : squares.every(Boolean)
    ? `Scratch: Cat's game`
    : `Next player: ${nextValue}`
}

function Game() {
  return (
    <div className="game">
      <div className="game-board">
        <Board />
      </div>
    </div>
  )
}

function App() {
  return <Game />
}

export default App
