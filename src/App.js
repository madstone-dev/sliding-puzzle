import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRedo } from "@fortawesome/free-solid-svg-icons";
import { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";

const EMPTY_TILE = -1;
const EASY = {
  tiles: [EMPTY_TILE],
  cut: 3,
};
const NORMAL = {
  tiles: [EMPTY_TILE],
  cut: 4,
};
const HARD = {
  tiles: [EMPTY_TILE],
  cut: 5,
};
for (let i = 0; i < 24; i++) {
  if (i < 8) {
    EASY.tiles.push(i);
  }
  if (i < 15) {
    NORMAL.tiles.push(i);
  }
  HARD.tiles.push(i);
}

const getWindowDimensions = () => {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height,
  };
};

function App() {
  const resetPuzzle = useCallback((difficulty) => {
    setFinish(false);
    let ok = false;
    let randomSet;
    while (!ok) {
      let inversion = 0;
      randomSet = difficulty.tiles.sort(() => Math.random() - Math.random());
      randomSet.forEach((item, index) => {
        for (let i = index; i < randomSet.length; i++) {
          if (item > randomSet[i]) {
            inversion++;
          }
        }
      });
      const N = difficulty.cut;
      if (N % 2 !== 0) {
        if (inversion % 2 === 0) {
          ok = true;
        }
      } else {
        const fromBottom =
          difficulty.cut - Math.floor(randomSet.indexOf(EMPTY_TILE) / 4);
        if (fromBottom % 2 === 0 && inversion % 2 !== 0) {
          ok = true;
        }
        if (fromBottom % 2 !== 0 && inversion % 2 === 0) {
          ok = true;
        }
      }
    }
    return randomSet;
  }, []);
  const [difficulty, setDifficulty] = useState(EASY);

  const getMaxSize = () => {
    return Math.min(500, getWindowDimensions().width - 30);
  };

  const [maxSize, setMaxsize] = useState(getMaxSize());
  const [boardSize, setBoardSize] = useState({
    width: maxSize,
    height: maxSize,
  });

  const getTileSize = () => {
    return {
      width: `${parseInt(boardSize.width / difficulty.cut)}px`,
      height: `${parseInt(boardSize.height / difficulty.cut)}px`,
    };
  };

  const [tileSize, setTileSize] = useState(getTileSize());
  const boardGrid = {
    gridTemplateRows: `${"1fr ".repeat(difficulty.cut)}`,
    gridTemplateColumns: `${"1fr ".repeat(difficulty.cut)}`,
    overflow: "hidden",
    maxWidth: `${boardSize.width}px`,
    maxHeight: `${boardSize.width}px`,
  };

  const fileInput = useRef();
  const [board, setBoard] = useState([]);
  const [image, setImage] = useState("");
  const [finish, setFinish] = useState(false);
  let answer = [...board].sort((a, b) => a - b);
  answer.shift();
  answer.push(-1);

  const moveTile = (index) => {
    let copiedBoard = [...board];
    if (board[index - difficulty.cut] === EMPTY_TILE) {
      copiedBoard[index - difficulty.cut] = copiedBoard[index];
      copiedBoard[index] = EMPTY_TILE;
      setBoard(copiedBoard);
      return;
    }
    if (board[index + difficulty.cut] === EMPTY_TILE) {
      copiedBoard[index + difficulty.cut] = copiedBoard[index];
      copiedBoard[index] = EMPTY_TILE;
      setBoard(copiedBoard);
      return;
    }
    if (board[index - 1] === EMPTY_TILE) {
      copiedBoard[index - 1] = copiedBoard[index];
      copiedBoard[index] = EMPTY_TILE;
      setBoard(copiedBoard);
      return;
    }
    if (board[index + 1] === EMPTY_TILE) {
      copiedBoard[index + 1] = copiedBoard[index];
      copiedBoard[index] = EMPTY_TILE;
      setBoard(copiedBoard);
      return;
    }
  };

  const resizeWindow = () => {
    setMaxsize(getMaxSize());
  };

  const getRatio = (img) => Math.min(maxSize / img.width, maxSize / img.height);

  useEffect(() => {
    window.addEventListener("resize", resizeWindow);
    return () => {
      window.removeEventListener("resize", resizeWindow);
    };
  }, []);

  useEffect(() => {
    setBoardSize({
      width: maxSize,
      height: maxSize,
    });
  }, [maxSize]);

  useEffect(() => {
    setTileSize(getTileSize());
  }, [boardSize, difficulty]);

  useEffect(() => {
    const newPuzzle = resetPuzzle(difficulty);
    setBoard(newPuzzle);
    if (fileInput.current) {
      const files = fileInput.current.files;
      if (files[0]) {
        const url = URL.createObjectURL(files[0]);
        const img = new Image();
        img.onload = () => {
          const ratio = getRatio(img);
          setBoardSize({
            width: ratio * img.width,
            height: ratio * img.height,
          });
        };
        img.src = url;
      }
    }
  }, [difficulty, resetPuzzle]);

  useEffect(() => {
    let result = true;
    answer.forEach((item, index) => {
      if (item !== board[index]) {
        result = false;
        return;
      }
    });
    if (result) {
      setFinish(true);
    }
  }, [board, answer]);

  useEffect(() => {
    if (finish) {
      alert("축하합니다!");
    }
  }, [finish]);

  const fileChange = (e) => {
    const files = e.target.files;
    if (files[0]) {
      const url = URL.createObjectURL(files[0]);
      const img = new Image();
      img.onload = () => {
        const ratio = getRatio(img);
        setBoardSize({ width: ratio * img.width, height: ratio * img.height });
        setImage(url);
      };
      img.src = url;
    }
  };

  const removeImage = () => {
    if (fileInput.current) {
      fileInput.current.value = null;
      setImage(null);
    }
  };

  const setNewPuzzle = () => {
    const newPuzzle = resetPuzzle(difficulty);
    setBoard(newPuzzle);
  };

  return (
    <div className="wrapper">
      <h1>슬라이딩 퍼즐 😀</h1>
      <div className="wrapper__board">
        {image && (
          <div
            style={{
              display: "flex",
              justifyContent: "end",
            }}
          >
            <button
              className="btn btn__delete"
              style={{ marginBottom: "8px" }}
              onClick={() => removeImage()}
            >
              이미지 제거
            </button>
          </div>
        )}
        <div className="board" style={boardGrid}>
          {board.map((tile, index) => {
            return (
              <div
                key={index}
                className={`${tile === EMPTY_TILE ? "empty" : "tile"}`}
                style={tileSize}
                onClick={() => {
                  !finish && moveTile(index);
                }}
              >
                {tile !== EMPTY_TILE && image && (
                  <div
                    className="tile__bg"
                    style={{
                      backgroundImage: `url(${image})`,
                      backgroundPositionY: `${
                        (parseInt(tile / difficulty.cut) *
                          -1 *
                          boardSize.height) /
                        difficulty.cut
                      }px`,
                      backgroundPositionX: `${
                        ((tile % difficulty.cut) * -1 * boardSize.width) /
                        difficulty.cut
                      }px`,
                      width: `${boardSize.width}px`,
                      height: `${boardSize.height}px`,
                    }}
                  ></div>
                )}
                {tile !== EMPTY_TILE ? tile + 1 : ""}
                {finish && tile === EMPTY_TILE && (
                  <span
                    className="reset"
                    onClick={() => {
                      setNewPuzzle();
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faRedo}
                      style={{ marginBottom: "4px" }}
                    />
                    <div>Reset</div>
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div>
        <label>
          <span
            className="btn btn__action"
            style={{
              display: "block",
              margin: "2rem 0px",
            }}
          >
            이미지를 업로드 해보세요 !
          </span>
          <input
            ref={fileInput}
            type="file"
            accept=".jpg, .png"
            onChange={fileChange}
            className="file_input"
          />
        </label>
      </div>
      {image && <img src={image} width="160" />}
      <div className="wrapper__buttons">
        <div
          style={{
            fontWeight: 600,
            marginBottom: "8px",
          }}
        >
          난이도 선택
        </div>
        <div>
          <button
            className="btn btn__action"
            style={{ marginRight: "8px" }}
            onClick={() => {
              setDifficulty(EASY);
            }}
          >
            쉬움
          </button>
          <button
            className="btn btn__action"
            style={{ marginRight: "8px" }}
            onClick={() => {
              setDifficulty(NORMAL);
            }}
          >
            보통
          </button>
          <button
            className="btn btn__action"
            onClick={() => {
              setDifficulty(HARD);
            }}
          >
            어려움
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
