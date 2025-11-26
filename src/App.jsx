// src/App.jsx
import { useState } from "react";
import { questions } from "./questions";
import "./App.css";

const SCALE_LABELS = {
  1: "1: 全くそう思わない",
  2: "2: あまりそう思わない",
  3: "3: どちらとも言えない",
  4: "4: そう思う",
  5: "5: とてもそう思う",
};

const ROLE_LABELS = {
  PD: "PD（プロジェクトデザイナー）",
  PM: "PM（プロジェクトマネージャー）",
  Dev: "Dev（エンジニア）",
};

const ROLE_DESCRIPTIONS = {
  PD: "コンセプトや体験設計、全体のストーリーづくりが得意なタイプ。",
  PM: "ゴールやスケジュールを定めて、チームを動かすのが得意なタイプ。",
  Dev: "技術で課題を解決し、手を動かして価値を生み出すのが得意なタイプ。",
};

function calcScores(answers) {
  const scores = { PD: 0, PM: 0, Dev: 0 };

  questions.forEach((q) => {
    const ans = answers[q.id];
    if (!ans) return;
    scores.PD += q.weight.PD * ans;
    scores.PM += q.weight.PM * ans;
    scores.Dev += q.weight.Dev * ans;
  });

  return scores;
}

function getTopRoles(scores) {
  const entries = Object.entries(scores);
  const max = Math.max(...entries.map(([, v]) => v));
  return entries
    .filter(([, v]) => v === max)
    .map(([key]) => key);
}

function App() {
  const [step, setStep] = useState("intro"); // "intro" | "questions" | "result"
  const [answers, setAnswers] = useState({});
  const [scores, setScores] = useState(null);

  const handleChange = (id, value) => {
    setAnswers((prev) => ({ ...prev, [id]: Number(value) }));
  };

  const handleSubmit = () => {
    // 全問必須にするならここでチェック
    const numAnswered = Object.keys(answers).length;
    if (numAnswered < questions.length) {
      if (
        !window.confirm(
          `未回答の質問があります（${questions.length - numAnswered}問）。このまま診断しますか？`
        )
      ) {
        return;
      }
    }
    const s = calcScores(answers);
    setScores(s);
    setStep("result");
  };

  const handleReset = () => {
    setAnswers({});
    setScores(null);
    setStep("intro");
  };

  const renderIntro = () => (
    <div className="card">
      <h1>PD / PM / Dev ロール診断</h1>
      <p>
        性格や志向性から、あなたが
        <strong>「PD / PM / Dev のどのロールに向いているか」</strong>
        の傾向をざっくり診断します。
      </p>
      <ul>
        <li>直感でサクッと答えてOK</li>
        <li>所要時間：3〜5分</li>
        <li>結果はあくまで参考程度のライトな診断です</li>
      </ul>
      <button className="primary" onClick={() => setStep("questions")}>
        診断をはじめる
      </button>
    </div>
  );

  const renderQuestions = () => (
    <div className="card">
      <h1>質問に答えてください</h1>
      <p className="subtitle">
        直感で一番近いものを選んでください（1: 全くそう思わない 〜 5: とてもそう思う）
      </p>

      <ol className="question-list">
        {questions.map((q) => (
          <li key={q.id} className="question-item">
            <p className="question-text">{q.text}</p>
            <div className="options">
              {Object.entries(SCALE_LABELS).map(([value, label]) => (
                <label key={value} className="option-label">
                  <input
                    type="radio"
                    name={`q-${q.id}`}
                    value={value}
                    checked={answers[q.id] === Number(value)}
                    onChange={(e) => handleChange(q.id, e.target.value)}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </li>
        ))}
      </ol>

      <div className="actions">
        <button onClick={handleReset}>はじめからやり直す</button>
        <button className="primary" onClick={handleSubmit}>
          結果を見る
        </button>
      </div>
    </div>
  );

  const renderResult = () => {
    if (!scores) return null;

    const topRoles = getTopRoles(scores);

    return (
      <div className="card">
        <h1>診断結果</h1>

        <p className="subtitle">あなたに向いていそうなロールは…</p>

        <div className="top-roles">
          {topRoles.map((role) => (
            <div key={role} className="top-role">
              <h2>{ROLE_LABELS[role]}</h2>
              <p>{ROLE_DESCRIPTIONS[role]}</p>
            </div>
          ))}
        </div>

        <h3>スコア詳細</h3>
        <div className="score-grid">
          {Object.entries(scores).map(([role, value]) => (
            <div key={role} className="score-card">
              <div className="score-label">{ROLE_LABELS[role]}</div>
              <div className="score-value">{value}</div>
            </div>
          ))}
        </div>

        <p className="hint">
          ※ この診断はあくまで傾向を見るためのものであり、あなたの可能性を制限するものではありません。
        </p>

        <div className="actions">
          <button onClick={handleReset}>もう一度診断する</button>
        </div>
      </div>
    );
  };

  return (
    <div className="app">
      {step === "intro" && renderIntro()}
      {step === "questions" && renderQuestions()}
      {step === "result" && renderResult()}
    </div>
  );
}

export default App;