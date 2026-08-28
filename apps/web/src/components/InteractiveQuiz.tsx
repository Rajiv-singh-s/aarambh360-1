'use client';

import React, { useState } from 'react';
import { CheckCircle2, XCircle, Sparkles, HelpCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function InteractiveQuiz() {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const question = {
    subject: 'Indian Polity & Governance',
    difficulty: 'Prelims Standard (Moderate)',
    text: 'With reference to the "Writ Jurisdiction" in India, consider the following statements:',
    statements: [
      '1. The writ of Prohibition is available only against judicial and quasi-judicial authorities.',
      '2. The Supreme Court under Article 32 cannot issue writs for any purpose other than fundamental rights enforcement.',
      '3. High Courts under Article 226 have narrower territorial jurisdiction than the Supreme Court.'
    ],
    questionPrompt: 'Which of the statements given above is/are correct?',
    options: [
      '1 and 2 only',
      '2 and 3 only',
      '1 and 3 only',
      '1, 2 and 3'
    ],
    correctIndex: 0, // Option A: 1 and 2 only
    explanation: 'Statement 1 is correct (Prohibition is issued only against judicial/quasi-judicial bodies to prevent exceeding jurisdiction). Statement 2 is correct (Article 32 is exclusively for Part III Fundamental Rights). Statement 3 is incorrect because under Article 226(2), High Courts can issue writs outside their state territory if the cause of action arises within their state.'
  };

  const handleSelect = (idx: number) => {
    if (!hasSubmitted) {
      setSelectedOption(idx);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 md:p-8 max-w-2xl mx-auto shadow-2xl relative overflow-hidden">
      {/* Header tags */}
      <div className="flex items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
            {question.subject}
          </span>
          <span className="px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
            Daily Live Question
          </span>
        </div>
        <span className="text-xs text-slate-400 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          Active Recall Demo
        </span>
      </div>

      {/* Question Text */}
      <div className="space-y-3 mb-6">
        <p className="text-base sm:text-lg font-semibold text-white leading-relaxed">
          {question.text}
        </p>
        <div className="space-y-1.5 pl-2 text-sm text-slate-300">
          {question.statements.map((stmt, i) => (
            <p key={i} className="leading-snug">{stmt}</p>
          ))}
        </div>
        <p className="text-sm font-semibold text-indigo-300 pt-1">
          {question.questionPrompt}
        </p>
      </div>

      {/* Options */}
      <div className="space-y-3 mb-6">
        {question.options.map((opt, idx) => {
          let optionStyle = "border-slate-800 bg-slate-900/60 text-slate-200 hover:border-slate-700";
          if (selectedOption === idx && !hasSubmitted) {
            optionStyle = "border-indigo-500 bg-indigo-500/15 text-white";
          }
          if (hasSubmitted) {
            if (idx === question.correctIndex) {
              optionStyle = "border-emerald-500 bg-emerald-500/20 text-emerald-300 font-semibold";
            } else if (selectedOption === idx && idx !== question.correctIndex) {
              optionStyle = "border-red-500 bg-red-500/20 text-red-300";
            } else {
              optionStyle = "border-slate-800/40 bg-slate-950/40 text-slate-500";
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={hasSubmitted}
              className={`w-full text-left p-3.5 sm:p-4 rounded-xl border transition-all duration-150 flex items-center justify-between ${optionStyle}`}
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-400">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="text-sm">{opt}</span>
              </div>
              {hasSubmitted && idx === question.correctIndex && (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              )}
              {hasSubmitted && selectedOption === idx && idx !== question.correctIndex && (
                <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Submit / Explanation */}
      {!hasSubmitted ? (
        <button
          onClick={() => {
            if (selectedOption !== null) setHasSubmitted(true);
          }}
          disabled={selectedOption === null}
          className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
            selectedOption !== null
              ? 'bg-gradient-to-r from-indigo-600 to-pink-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          Check Answer & Explanation
        </button>
      ) : (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <span className="font-bold text-white block mb-1 text-xs uppercase tracking-wider text-indigo-400">
              Detailed Explanation:
            </span>
            {question.explanation}
          </div>
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-400">Want 50+ fresh UPSC questions daily?</span>
            <Link
              href="/#download"
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              Get Aarambh360 App <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
