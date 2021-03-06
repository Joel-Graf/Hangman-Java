function Hangman() {
  const [game, setGame] = useState({});
  const [word, setWord] = useState("");
  const [wordArray, setWordArray] = useState([]);
  const [anonWordArray, setAnonWordArray] = useState([]);
  const [inputLetter, setInputLetter] = useState("");
  const [inputLettersHistory, setInputLettersHistory] = useState([]);
  const [lifes, setLifes] = useState(99);
  const [remaningAttempts, setRemaningAttempts] = useState(5);

  useEffect(() => {
    getGameInProgress();
  }, []);

  useEffect(() => {
    if (!anonWordArray.length) return;

    const isGameWon = anonWordArray.every((letter) => letter != " _ ");
    if (isGameWon) {
      alert("Parabéns!!");
      correctWord();
    }
  }, [anonWordArray]);

  useEffect(() => {
    if (remaningAttempts <= 0) {
      alert("Que pena!!");
      incorrectWord();
    }
  }, [remaningAttempts]);

  function getGameInProgress() {
    return fetch("game/game_in_progress")
      .then((res) => res.json())
      .then((game) => {
        if (game != {}) {
          updateGame(game);
        }
      })
      .catch((err) => {
        alert("Erro: ", err);
        getGameInProgress();
      });
  }

  function correctWord() {
    return fetch("game/correct_word")
      .then((res) => {
        return new Promise((resolve, reject) => {
          res
            .json()
            .then((res) => resolve(res))
            .catch(() => {
              resolve({});
            });
        });
      })
      .then((game) => {
        if (game.id) {
          updateGame(game);
        } else {
          alert("Você Ganhou!!!!");
          getGameInProgress();
        }
      })
      .catch((err) => {
        alert("Erro: ", err);
        correctWord();
      });
  }

  function incorrectWord() {
    return fetch("game/incorrect_word")
      .then((res) => {
        return new Promise((resolve, reject) => {
          res
            .json()
            .then((res) => resolve(res))
            .catch(() => {
              resolve({});
            });
        });
      })
      .then((game) => {
        if (game.id) {
          updateGame(game);
        } else {
          alert("Você Perdeu!!!");
          getGameInProgress();
        }
      })
      .catch((err) => {
        alert("Erro: ", err);
        incorrectWord();
      });
  }

  function updateGame(game) {
    const _word = game.word.word;
    const _life = game.playerLife;
    setWord(_word);
    setWordArray(wordToArray(_word));
    setAnonWordArray(wordToAnonArray(_word));
    setInputLetter("");
    setInputLettersHistory([]);
    setLifes(_life);
    setRemaningAttempts(5);
    setGame(game);
  }

  function wordToArray(word) {
    return word.split("");
  }

  function wordToAnonArray(word) {
    const anonWordArray = word.split("");
    return anonWordArray.map(() => " _ ");
  }

  function handleInput(letter) {
    const isLetter = /([a-zA-Z])\b/g.test(letter);
    if (!isLetter) {
      setInputLetter("");
      return alert("Input Inválido! Somente letras.");
    }

    letter = letter.toUpperCase();
    if (inputLettersHistory.includes(letter)) {
      setInputLetter("");
      return alert("Input Inválido! Letra já inserida.");
    }

    const _anonWordArray = anonWordArray;
    let foundLetter = false;
    wordArray.forEach((wordLetter, index) => {
      if (wordLetter == letter) {
        _anonWordArray[index] = letter;
        foundLetter = true;
      }
    });

    if (!foundLetter) {
      const _remaningAttempts = remaningAttempts - 1;
      setRemaningAttempts(_remaningAttempts);
    }

    setInputLetter("");
    setInputLettersHistory([...inputLettersHistory, letter]);
    setAnonWordArray([..._anonWordArray]);
  }

  return (
    <div className="game">
      <div className="header">
        <h4>Vidas: {lifes}</h4>
        <h2>Tentativas Restantes: {remaningAttempts}</h2>
        <h3>
          Palavras inseridas:{" "}
          {inputLettersHistory.map((letter, index) => (
            <span key={`${letter}:${index}`}>{letter.toUpperCase()}</span>
          ))}
        </h3>
      </div>

      <div className="display">
        <h1>
          {anonWordArray.map((letter, index) => (
            <span style={{ marginLeft: 6 }} key={letter + `${index}`}>
              {" "}
              {`${letter}`}{" "}
            </span>
          ))}
        </h1>
      </div>

      <form
        className="form"
        onSubmit={(e) => {
          e.preventDefault();
          handleInput(inputLetter);
        }}
      >
        <input
          className="form-input"
          maxLength={1}
          value={inputLetter}
          onChange={(e) => setInputLetter(e.target.value)}
        />
      </form>
    </div>
  );
}

const domContainer = document.querySelector("#app");
ReactDOM.render(<Hangman />, domContainer);
