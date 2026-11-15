import { useMemo, useState } from 'react';
import type { Card } from '../../scripts/lib/types';
import { cardById } from '../lib/data';
import { href } from '../lib/router';
import { buildQuiz, type Question } from '../lib/quiz';

/** 一道選擇題：選了立刻顯示對錯與正解；answered 由外面管，方便「重做」整組 */
export function QuizQuestion({ q, no, picked, onPick }: { q: Question; no?: number; picked?: string; onPick: (id: string) => void }) {
  const done = picked !== undefined;
  const right = picked === q.answer;
  const answerName = cardById.get(q.answer)?.name_zh ?? q.answer;
  return (
    <div className="quiz-q" role="group" aria-label={no ? `第 ${no} 題` : '題目'}>
      <p className="quiz-prompt">
        {no ? <span className="quiz-no">{no}</span> : null}
        {q.prompt}
      </p>
      <blockquote className="quiz-stem">{q.stem}</blockquote>
      <div className="quiz-options">
        {q.options.map((o) => {
          const cls = !done ? '' : o.id === q.answer ? ' right' : o.id === picked ? ' wrong' : ' dim';
          return (
            <button key={o.id} type="button" className={`quiz-opt${cls}`} disabled={done} aria-pressed={o.id === picked} onClick={() => onPick(o.id)}>
              {o.label}
              {done && o.id === q.answer && <span className="quiz-mark">　✓ 正解</span>}
              {done && o.id === picked && o.id !== q.answer && <span className="quiz-mark">　✗ 你選的</span>}
            </button>
          );
        })}
      </div>
      {done && (
        <p className={`quiz-result ${right ? 'ok' : 'no'}`} role="status">
          {right ? '答對了！' : `答錯了，正解是「${answerName}」。`}
          {q.todayId && (
            <>
              {' '}
              <a href={href('today', q.todayId)}>看這個梗的說明</a>
            </>
          )}
        </p>
      )}
    </div>
  );
}

/** 卡片頁的「考考自己」：最多 3 題，資料不夠出題就整區不顯示 */
export function Quiz({ card }: { card: Card }) {
  const qs = useMemo(() => buildQuiz(card), [card]);
  const [picked, setPicked] = useState<Record<number, string>>({});
  if (!qs.length) return null;
  const n = Object.keys(picked).length;
  const score = qs.filter((q, i) => picked[i] === q.answer).length;
  return (
    <section className="quiz" id="sec-quiz">
      <h2>考考自己</h2>
      <p className="muted small">{qs.length} 題小測驗，題目是從這張卡的資料自動出的；選了馬上看對錯，不計分、不用怕錯。</p>
      {qs.map((q, i) => (
        <QuizQuestion key={q.kind} q={q} no={i + 1} picked={picked[i]} onPick={(id) => setPicked((p) => ({ ...p, [i]: id }))} />
      ))}
      {n > 0 && (
        <p className="quiz-foot">
          {n === qs.length && <strong>答對 {score} / {qs.length} 題。</strong>}{' '}
          <button type="button" className="quiz-redo" onClick={() => setPicked({})}>重做</button>
        </p>
      )}
    </section>
  );
}

/** 供卡片頁判斷要不要把「考考自己」放進本頁內容 */
export const hasQuiz = (card: Card) => buildQuiz(card).length > 0;
