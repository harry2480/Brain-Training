import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Brain, Calculator, Palette, Grid3X3, RotateCcw, 
  Trophy, Home, Check, X, Clock, Hash, Hand as HandIcon
} from 'lucide-react';

// --- Custom Hand Icons (SVG) ---
// アイコンサイズも少し大きく調整して視認性を向上

const RockHand = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M7.5 11c-1.5 0-2.5 1-2.5 2.5v5c0 1.5 1 2.5 2.5 2.5h9c1.5 0 2.5-1 2.5-2.5v-5c0-1.5-1-2.5-2.5-2.5h-9z" />
    <path d="M6 13c-1.5 0-2-1-2-2.5V8a2.5 2.5 0 0 1 5 0v3" />
    <path d="M9 11V6a2.5 2.5 0 0 1 5 0v5" />
    <path d="M13 11V7a2.5 2.5 0 0 1 5 0v4" />
    <path d="M6 15h12" opacity="0.5"/>
  </svg>
);

const ScissorsHand = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 20V8a2 2 0 0 0-2-2h-1a2 2 0 0 0-2 2v4" />
    <path d="M12 12V3a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v10" />
    <path d="M15.5 21H8a3 3 0 0 1-3-3v-3a4 4 0 0 1 4-4h2" />
    <path d="M16 21a2 2 0 0 0 2-2" />
    <path d="M6 15l2 1" />
  </svg>
);

const PaperHand = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
    <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
    <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
    <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
  </svg>
);


// --- Components ---
// Buttonの高さを増やし、テキストサイズを大きく設定

const Button = ({ children, onClick, className = "", variant = "primary", disabled = false }) => {
  const baseStyle = "w-full font-bold py-4 px-6 rounded-2xl shadow-md transition-all transform active:scale-95 flex items-center justify-center gap-3 text-xl"; // py-4, text-xlに変更
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300",
    secondary: "bg-white text-gray-900 border-4 border-gray-300 hover:bg-gray-100 disabled:bg-gray-100", // 文字色を濃く、枠線を太く
    success: "bg-green-600 text-white hover:bg-green-700 disabled:bg-green-300", // 色味を少し濃く
    danger: "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300",
    warning: "bg-yellow-400 text-yellow-900 hover:bg-yellow-500 disabled:bg-yellow-200",
    rock: "bg-gray-600 text-white hover:bg-gray-700 border-b-4 border-gray-800 active:border-b-0 active:translate-y-1",
    paper: "bg-white text-gray-900 border-4 border-gray-400 hover:bg-gray-50 border-b-8 active:border-b-4 active:translate-y-1",
    scissors: "bg-orange-500 text-white hover:bg-orange-600 border-b-4 border-orange-700 active:border-b-0 active:translate-y-1",
  };

  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyle} ${variants[variant] || variants.primary} ${className}`}
    >
      {children}
    </button>
  );
};

// --- Game Logic Hooks (ロジックはV3と同じ) ---

const useMathGame = (onGameOver) => {
  const [problem, setProblem] = useState({ q: "", a: 0 });
  const [options, setOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isActive && timeLeft === 0) {
      setIsActive(false);
      onGameOver(score);
    }
  }, [isActive, timeLeft, onGameOver, score]);

  const generateProblem = () => {
    const operators = ['+', '-', '*'];
    const operator = operators[Math.floor(Math.random() * operators.length)];
    let a, b, answer;

    if (operator === '*') {
      a = Math.floor(Math.random() * 9) + 2;
      b = Math.floor(Math.random() * 9) + 2;
      answer = a * b;
    } else {
      a = Math.floor(Math.random() * 50) + 1;
      b = Math.floor(Math.random() * 50) + 1;
      if (operator === '-' && a < b) [a, b] = [b, a];
      answer = operator === '+' ? a + b : a - b;
    }

    const opts = new Set([answer]);
    while (opts.size < 4) {
      const offset = Math.floor(Math.random() * 10) - 5;
      const val = answer + offset;
      if (val >= 0 && val !== answer) opts.add(val);
    }

    setProblem({ q: `${a} ${operator === '*' ? '×' : operator} ${b}`, a: answer });
    setOptions(Array.from(opts).sort(() => Math.random() - 0.5));
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setIsActive(true);
    generateProblem();
  };

  const handleAnswer = (val) => {
    if (val === problem.a) {
      setScore(s => s + 10);
      generateProblem();
    } else {
      setScore(s => Math.max(0, s - 5));
    }
  };

  return { problem, options, score, timeLeft, isActive, startGame, handleAnswer };
};

const useColorGame = (onGameOver) => {
  const [current, setCurrent] = useState({ text: "", color: "", isMatch: false });
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isActive, setIsActive] = useState(false);

  const colors = [
    { name: "あか", class: "text-red-600" }, // 色味を少し濃く調整
    { name: "あお", class: "text-blue-600" },
    { name: "みどり", class: "text-green-600" },
    { name: "きいろ", class: "text-yellow-500" }, // 黄色は背景白だと見づらいので少し暗めに
    { name: "くろ", class: "text-gray-900" },
  ];

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isActive && timeLeft === 0) {
      setIsActive(false);
      onGameOver(score);
    }
  }, [isActive, timeLeft, onGameOver, score]);

  const generateRound = () => {
    const shouldMatch = Math.random() > 0.5;
    const textIdx = Math.floor(Math.random() * colors.length);
    let colorIdx = textIdx;
    if (!shouldMatch) {
      while (colorIdx === textIdx) {
        colorIdx = Math.floor(Math.random() * colors.length);
      }
    }
    setCurrent({
      text: colors[textIdx].name,
      color: colors[colorIdx].class,
      isMatch: shouldMatch
    });
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setIsActive(true);
    generateRound();
  };

  const handleAnswer = (userSaysMatch) => {
    if (userSaysMatch === current.isMatch) {
      setScore(s => s + 10);
      generateRound();
    } else {
      setScore(s => Math.max(0, s - 10));
      generateRound();
    }
  };

  return { current, score, timeLeft, isActive, startGame, handleAnswer };
};

const useMemoryGame = (onGameOver) => {
  const [sequence, setSequence] = useState([]);
  const [userSequence, setUserSequence] = useState([]);
  const [gameState, setGameState] = useState('idle');
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);

  const generateSequence = (lvl) => {
    const count = Math.min(3 + Math.floor(lvl / 2), 8);
    const newSeq = [];
    while (newSeq.length < count) {
      const idx = Math.floor(Math.random() * 9);
      if (!newSeq.includes(idx)) newSeq.push(idx);
    }
    return newSeq;
  };

  const startGame = () => {
    setScore(0);
    setLevel(1);
    startLevel(1);
  };

  const startLevel = (lvl) => {
    const seq = generateSequence(lvl);
    setSequence(seq);
    setUserSequence([]);
    setGameState('showing');
    
    // 表示時間を少し長めに調整（シニア向け）
    const showTime = Math.max(1200 - (lvl * 50), 600); 
    setTimeout(() => {
      setGameState('playing');
    }, showTime);
  };

  const handleClick = (idx) => {
    if (gameState !== 'playing') return;
    if (sequence.includes(idx)) {
       if (userSequence.includes(idx)) return;
       const newUserSeq = [...userSequence, idx];
       setUserSequence(newUserSeq);
       if (newUserSeq.length === sequence.length) {
         setScore(s => s + (sequence.length * 10));
         setGameState('success');
         setTimeout(() => {
           setLevel(l => l + 1);
           startLevel(level + 1);
         }, 800);
       }
    } else {
      setGameState('idle');
      onGameOver(score);
    }
  };

  return { sequence, userSequence, gameState, score, level, startGame, handleClick };
};

const useRPSGame = (onGameOver) => {
  const [enemyHand, setEnemyHand] = useState(0); 
  const [instruction, setInstruction] = useState(0); 
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isActive && timeLeft === 0) {
      setIsActive(false);
      onGameOver(score);
    }
  }, [isActive, timeLeft, onGameOver, score]);

  const generateRound = () => {
    setEnemyHand(Math.floor(Math.random() * 3));
    setInstruction(Math.floor(Math.random() * 3));
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setIsActive(true);
    generateRound();
  };

  const handleAnswer = (playerHand) => {
    let isCorrect = false;
    if (instruction === 0) { // Win
      if ((enemyHand === 0 && playerHand === 2) || 
          (enemyHand === 1 && playerHand === 0) || 
          (enemyHand === 2 && playerHand === 1)) isCorrect = true;
    } else if (instruction === 1) { // Lose
      if ((enemyHand === 0 && playerHand === 1) || 
          (enemyHand === 1 && playerHand === 2) || 
          (enemyHand === 2 && playerHand === 0)) isCorrect = true;
    } else { // Draw
      if (enemyHand === playerHand) isCorrect = true;
    }

    if (isCorrect) {
      setScore(s => s + 10);
      generateRound();
    } else {
      setScore(s => Math.max(0, s - 10));
      generateRound();
    }
  };

  return { enemyHand, instruction, score, timeLeft, isActive, startGame, handleAnswer };
};

const useNumberGame = (onGameOver) => {
  const [numbers, setNumbers] = useState([]);
  const [currentTarget, setCurrentTarget] = useState(1);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(40);
  const [isActive, setIsActive] = useState(false);
  const [maxNum] = useState(16);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isActive && timeLeft === 0) {
      setIsActive(false);
      onGameOver(score);
    }
  }, [isActive, timeLeft, onGameOver, score]);

  const generateGrid = () => {
    const nums = Array.from({ length: maxNum }, (_, i) => i + 1);
    setNumbers(nums.sort(() => Math.random() - 0.5));
    setCurrentTarget(1);
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(40);
    setIsActive(true);
    generateGrid();
  };

  const handleClick = (num) => {
    if (!isActive) return;
    
    if (num === currentTarget) {
      setScore(s => s + 1); 
      if (currentTarget === maxNum) {
        setScore(s => s + 20);
        generateGrid();
      } else {
        setCurrentTarget(n => n + 1);
      }
    }
  };

  return { numbers, currentTarget, score, timeLeft, isActive, startGame, handleClick };
};

// --- Screens (UIデザインをシニア向けに調整) ---

const MenuScreen = ({ onSelectGame, highScores }) => {
  const games = [
    { id: 'math', title: '計算アタック', icon: Calculator, desc: '計算力を鍛える', color: 'blue' },
    { id: 'color', title: '色彩ジャッジ', icon: Palette, desc: '判断力を鍛える', color: 'purple' },
    { id: 'memory', title: '瞬間メモリー', icon: Grid3X3, desc: '記憶力を鍛える', color: 'orange' },
    { id: 'rps', title: '後出しジャンケン', icon: PaperHand, desc: '瞬発力を鍛える', color: 'pink' },
    { id: 'number', title: '数字早押し', icon: Hash, desc: '視野を広げる', color: 'teal' },
  ];

  const colorClasses = {
    blue: "border-blue-500 text-blue-800",
    purple: "border-purple-500 text-purple-800",
    orange: "border-orange-500 text-orange-800",
    pink: "border-pink-500 text-pink-800",
    teal: "border-teal-500 text-teal-800",
  };

  const iconColors = {
    blue: "text-blue-600",
    purple: "text-purple-600",
    orange: "text-orange-600",
    pink: "text-pink-600",
    teal: "text-teal-600",
  }

  return (
    <div className="flex flex-col gap-5 max-w-md mx-auto w-full animate-fade-in h-full overflow-y-auto pb-6">
      <div className="text-center space-y-2 mb-2 pt-4">
        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center justify-center gap-3">
          <Brain className="w-10 h-10 text-indigo-700" />
          脳トレ・ジム
        </h1>
        <p className="text-gray-600 text-lg font-bold">5つのゲームで脳を活性化！</p>
      </div>

      <div className="grid gap-4">
        {games.map(game => (
          <button 
            key={game.id}
            onClick={() => onSelectGame(game.id)}
            className={`bg-white p-5 rounded-2xl shadow-lg border-l-[12px] hover:bg-gray-50 transition-all text-left group flex justify-between items-center ${colorClasses[game.color]}`}
          >
            <div className="flex items-center gap-5">
              <div className={`p-3 rounded-full bg-gray-100`}>
                <game.icon className={`w-8 h-8 ${iconColors[game.color]}`} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900">
                  {game.title}
                </h3>
                <p className="text-gray-600 text-base font-bold mt-1">{game.desc}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

const GameHeader = ({ title, score, timeLeft, onExit, color }) => (
  <div className="flex flex-col gap-4 mb-4 shrink-0">
    <div className="flex justify-between items-center bg-white p-2 rounded-xl shadow-sm">
        <button onClick={onExit} className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors">
            <Home className="w-6 h-6 text-gray-700" />
            <span className="font-bold text-gray-700 text-lg">戻る</span>
        </button>
        <h2 className={`text-2xl font-black ${color}`}>{title}</h2>
    </div>
    <div className="flex justify-between items-end bg-white p-4 rounded-2xl shadow-md border-2 border-gray-100">
        <div className="flex flex-col">
            <span className="text-sm text-gray-500 font-bold tracking-wider">のこり時間</span>
            <div className={`text-4xl font-mono font-black flex items-center gap-2 ${timeLeft <= 5 ? 'text-red-600 animate-pulse' : 'text-gray-900'}`}>
                <Clock className="w-8 h-8" /> {timeLeft}
            </div>
        </div>
        <div className="flex flex-col items-end">
            <span className="text-sm text-gray-500 font-bold tracking-wider">スコア</span>
            <span className="text-4xl font-mono font-black text-gray-900">{score}</span>
        </div>
    </div>
  </div>
);

const MathGame = ({ onEnd, onExit }) => {
  const { problem, options, score, timeLeft, startGame, handleAnswer } = useMathGame(onEnd);
  useEffect(() => { startGame(); }, []);
  return (
    <div className="flex flex-col h-full">
      <GameHeader title="計算アタック" score={score} timeLeft={timeLeft} onExit={onExit} color="text-blue-700" />
      <div className="flex-1 flex flex-col justify-center items-center gap-10 py-4">
        <div className="text-7xl font-black text-gray-900 tracking-wider drop-shadow-sm">{problem.q}</div>
        <div className="grid grid-cols-2 gap-4 w-full">
          {options.map((opt, i) => (
            <button 
              key={i} 
              onClick={() => handleAnswer(opt)} 
              className="bg-white border-b-[6px] border-blue-200 active:border-b-0 active:translate-y-1 h-28 text-5xl font-black rounded-2xl shadow-md text-gray-800 hover:text-blue-700 hover:bg-blue-50 transition-all"
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const ColorGame = ({ onEnd, onExit }) => {
  const { current, score, timeLeft, isActive, startGame, handleAnswer } = useColorGame(onEnd);
  useEffect(() => { startGame(); }, []);
  return (
    <div className="flex flex-col h-full">
      <GameHeader title="色彩ジャッジ" score={score} timeLeft={timeLeft} onExit={onExit} color="text-purple-700" />
      <div className="flex-1 flex flex-col justify-center items-center gap-6 py-4">
        <div className="bg-white rounded-[2rem] p-6 shadow-md border-2 border-gray-100 w-full flex flex-col items-center justify-center min-h-[200px]">
           <div className={`text-8xl font-black ${current.color} drop-shadow-sm`}>{current.text}</div>
        </div>
        <p className="text-center text-gray-700 font-bold text-xl leading-relaxed">
          文字の意味と<br/><span className="text-2xl border-b-4 border-purple-300">色</span>は合ってる？
        </p>
        <div className="flex gap-4 w-full mt-4">
          <Button variant="danger" onClick={() => handleAnswer(false)} disabled={!isActive} className="h-32 text-3xl flex-col"><X className="w-12 h-12" />ちがう</Button>
          <Button variant="success" onClick={() => handleAnswer(true)} disabled={!isActive} className="h-32 text-3xl flex-col"><Check className="w-12 h-12" />あってる</Button>
        </div>
      </div>
    </div>
  );
};

const MemoryGame = ({ onEnd, onExit }) => {
  const { sequence, userSequence, gameState, score, level, startGame, handleClick } = useMemoryGame(onEnd);
  useEffect(() => { startGame(); }, []);
  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-6 shrink-0 bg-white p-3 rounded-xl shadow-sm">
        <button onClick={onExit} className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"><Home className="w-6 h-6 text-gray-700" /><span className="font-bold text-gray-700 text-lg">戻る</span></button>
        <div className="flex gap-6 pr-2">
            <div className="flex flex-col items-center"><span className="text-sm text-gray-500 font-bold">レベル</span><span className="text-2xl font-black text-orange-600">{level}</span></div>
            <div className="flex flex-col items-center"><span className="text-sm text-gray-500 font-bold">スコア</span><span className="text-2xl font-black text-gray-900">{score}</span></div>
        </div>
      </div>
      <div className="flex-1 flex flex-col justify-center items-center gap-6">
        <div className="text-center h-10">
            {gameState === 'showing' && <span className="text-orange-600 text-3xl font-black animate-pulse">場所を覚えて！</span>}
            {gameState === 'playing' && <span className="text-green-700 text-3xl font-black">同じ場所を押して</span>}
            {gameState === 'success' && <span className="text-blue-700 text-3xl font-black">正解！</span>}
        </div>
        <div className="grid grid-cols-3 gap-4 p-6 bg-gray-200 rounded-3xl shadow-inner w-full max-w-[360px]">
          {Array.from({ length: 9 }).map((_, i) => {
            const isTarget = sequence.includes(i);
            const isSelected = userSequence.includes(i);
            let cellClass = "bg-white border-b-4 border-gray-300";
            if (gameState === 'showing' && isTarget) cellClass = "bg-orange-500 border-orange-700 shadow-[0_0_20px_rgba(249,115,22,0.8)] scale-95";
            else if (isSelected) cellClass = "bg-green-600 border-green-800 scale-95";
            return <button key={i} onClick={() => handleClick(i)} disabled={gameState !== 'playing'} className={`aspect-square rounded-2xl transition-all duration-200 transform ${cellClass} shadow-md active:scale-90`} />;
          })}
        </div>
      </div>
    </div>
  );
};

const NumberGame = ({ onEnd, onExit }) => {
  const { numbers, currentTarget, score, timeLeft, isActive, startGame, handleClick } = useNumberGame(onEnd);
  useEffect(() => { startGame(); }, []);

  return (
    <div className="flex flex-col h-full">
      <GameHeader title="数字早押し" score={score} timeLeft={timeLeft} onExit={onExit} color="text-teal-700" />
      <div className="flex-1 flex flex-col justify-center items-center gap-6">
         <div className="flex items-center gap-4 bg-teal-50 px-8 py-4 rounded-full border-2 border-teal-200 shadow-sm">
             <span className="text-teal-900 text-xl font-bold">次は</span>
             <span className="text-5xl font-black text-teal-700">{currentTarget}</span>
         </div>
         <div className="grid grid-cols-4 gap-3 w-full aspect-square p-2">
             {numbers.map((num) => {
                 const isClicked = num < currentTarget;
                 return (
                     <button
                        key={num}
                        onClick={() => handleClick(num)}
                        disabled={!isActive || isClicked}
                        className={`rounded-2xl font-black text-3xl shadow-md transition-all duration-100 flex items-center justify-center ${isClicked ? 'bg-gray-100 text-gray-300 scale-95 shadow-inner' : 'bg-white text-gray-900 border-b-[6px] border-gray-300 active:border-b-0 active:translate-y-1 hover:bg-gray-50'}`}
                     >
                         {num}
                     </button>
                 )
             })}
         </div>
      </div>
    </div>
  );
};

const RPSGame = ({ onEnd, onExit }) => {
  const { enemyHand, instruction, score, timeLeft, isActive, startGame, handleAnswer } = useRPSGame(onEnd);
  
  useEffect(() => { startGame(); }, []);

  const handIcons = [<RockHand className="w-24 h-24" />, <ScissorsHand className="w-24 h-24" />, <PaperHand className="w-24 h-24" />];
  const instructions = [
      { text: "勝って！", color: "text-red-700", bg: "bg-red-50 border-red-300 ring-4 ring-red-100" },
      { text: "負けて！", color: "text-blue-700", bg: "bg-blue-50 border-blue-300 ring-4 ring-blue-100" },
      { text: "あいこで！", color: "text-green-700", bg: "bg-green-50 border-green-300 ring-4 ring-green-100" }
  ];

  return (
    <div className="flex flex-col h-full">
      <GameHeader title="後出しジャンケン" score={score} timeLeft={timeLeft} onExit={onExit} color="text-pink-700" />
      
      <div className="flex-1 flex flex-col items-center justify-between py-2">
        {/* Enemy Area */}
        <div className="flex flex-col items-center gap-2">
            <span className="text-gray-500 font-bold text-lg">相手の手</span>
            <div className="w-40 h-40 bg-white rounded-full flex items-center justify-center border-[6px] border-gray-200 shadow-md">
                <div className="text-gray-800">
                    {handIcons[enemyHand]}
                </div>
            </div>
        </div>

        {/* Instruction */}
        <div className={`px-12 py-5 rounded-3xl border-4 font-black text-4xl tracking-widest shadow-lg ${instructions[instruction].bg} ${instructions[instruction].color} transition-colors duration-300`}>
            {instructions[instruction].text}
        </div>

        {/* Player Area */}
        <div className="w-full">
            <span className="text-gray-500 font-bold text-lg text-center block mb-3">あなたの手</span>
            <div className="grid grid-cols-3 gap-3">
                <Button variant="rock" onClick={() => handleAnswer(0)} disabled={!isActive} className="h-28 flex-col text-lg pt-2">
                    <RockHand className="w-10 h-10 mb-1" /> グー
                </Button>
                <Button variant="scissors" onClick={() => handleAnswer(1)} disabled={!isActive} className="h-28 flex-col text-lg pt-2">
                    <ScissorsHand className="w-10 h-10 mb-1" /> チョキ
                </Button>
                <Button variant="paper" onClick={() => handleAnswer(2)} disabled={!isActive} className="h-28 flex-col text-lg pt-2">
                    <PaperHand className="w-10 h-10 mb-1" /> パー
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
};

const ResultScreen = ({ score, onRetry, onHome }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full animate-fade-in text-center p-6 bg-white/80 rounded-3xl">
        <div className="mb-8 animate-bounce"><Trophy className="w-24 h-24 text-yellow-500" /></div>
        <h2 className="text-7xl font-black text-gray-900 mb-2">{score}</h2>
        <p className="text-gray-600 text-xl font-bold tracking-widest mb-12">点数</p>
        <div className="flex flex-col gap-5 w-full">
            <Button onClick={onRetry} variant="primary" className="text-2xl h-20"><RotateCcw className="w-8 h-8" /> もう一度やる</Button>
            <Button onClick={onHome} variant="secondary" className="text-2xl h-20"><Home className="w-8 h-8" /> メニューに戻る</Button>
        </div>
    </div>
  );
};

// --- Main App ---

export default function BrainTrainingAppSenior() {
  const [screen, setScreen] = useState('menu');
  const [lastGame, setLastGame] = useState(null);
  const [lastScore, setLastScore] = useState(0);
  const [highScores, setHighScores] = useState({ math: 0, color: 0, memory: 0, rps: 0, number: 0 });

  useEffect(() => {
      const saved = localStorage.getItem('brain-gym-senior-scores');
      if (saved) { try { setHighScores(JSON.parse(saved)); } catch (e) {} }
  }, []);

  const saveScore = (gameId, score) => {
    const newHighScores = { ...highScores, [gameId]: Math.max(highScores[gameId] || 0, score) };
    setHighScores(newHighScores);
    localStorage.setItem('brain-gym-senior-scores', JSON.stringify(newHighScores));
    setLastScore(score);
    setLastGame(gameId);
    setScreen('result');
  };

  const handleRetry = () => {
      if (lastGame) setScreen(lastGame);
      else setScreen('menu');
  };

  const renderScreen = () => {
    switch (screen) {
      case 'menu': return <MenuScreen onSelectGame={(g) => { setScreen(g); setLastGame(g); }} highScores={highScores} />;
      case 'math': return <MathGame onEnd={(s) => saveScore('math', s)} onExit={() => setScreen('menu')} />;
      case 'color': return <ColorGame onEnd={(s) => saveScore('color', s)} onExit={() => setScreen('menu')} />;
      case 'memory': return <MemoryGame onEnd={(s) => saveScore('memory', s)} onExit={() => setScreen('menu')} />;
      case 'rps': return <RPSGame onEnd={(s) => saveScore('rps', s)} onExit={() => setScreen('menu')} />;
      case 'number': return <NumberGame onEnd={(s) => saveScore('number', s)} onExit={() => setScreen('menu')} />;
      case 'result': return <ResultScreen score={lastScore} onRetry={handleRetry} onHome={() => setScreen('menu')} />;
      default: return <MenuScreen onSelectGame={setScreen} highScores={highScores} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-200 font-sans text-gray-900 flex justify-center items-center p-2">
        {/* コンテナサイズを大きくし、背景色も白っぽくして見やすく */}
        <div className="w-full max-w-lg bg-white min-h-[700px] h-[90vh] rounded-[2rem] shadow-2xl overflow-hidden relative flex flex-col p-6 border-4 border-white">
            {renderScreen()}
        </div>
        <style>{`
          @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          .animate-fade-in { animation: fade-in 0.4s ease-out forwards; }
        `}</style>
    </div>
  );
}

