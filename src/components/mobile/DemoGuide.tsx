import React, { useState } from 'react';
import { X, Lightbulb, ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * DemoGuide — обучающий «подсказчик» в демо-режиме.
 * Плавающая кнопка + пошаговая инструкция, куда нажимать.
 */
export const DemoGuide: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  const steps = [
    { title: 'Посмотри витрину задач', text: 'Во вкладке «Все задачи» видны все работы: кто что делает и какие свободны. Нажми «Взяться за задачу», чтобы взять её себе.' },
    { title: 'Открой задачу', text: 'Нажми на карточку задачи, чтобы увидеть адрес, клиента и чек-лист работ.' },
    { title: 'Начни работу', text: 'Нажми «Начать работу» — откроется экран выполнения.' },
    { title: 'Отмечай чек-лист', text: 'В экране выполнения отмечай выполненные пункты чек-листа. Можешь добавить свои пункты кнопкой «+».' },
    { title: 'Добавь фото', text: 'Нажми «Добавить фото», чтобы сделать снимок. Неверное фото можно удалить крестиком.' },
    { title: 'Отправь на проверку', text: 'Напиши комментарий и нажми «Отправить на проверку». Руководитель увидит отчёт в своей панели.' },
  ];

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 z-50 w-12 h-12 rounded-full bg-amber-400 text-amber-950 shadow-xl shadow-amber-500/30 flex items-center justify-center active:scale-90 transition-transform"
      >
        <Lightbulb className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed inset-x-4 bottom-24 z-50">
      <div className="max-w-md mx-auto bg-white rounded-3xl shadow-2xl border border-amber-200 overflow-hidden">
        <div className="bg-amber-400 text-amber-950 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            <span className="text-xs font-black uppercase tracking-wide">Гид по приложению</span>
          </div>
          <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-amber-500/50">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-6 h-6 rounded-full bg-[#168BEA] text-white text-xs font-bold flex items-center justify-center shrink-0">
              {step + 1}
            </span>
            <span className="text-xs text-slate-400 font-bold">Шаг {step + 1} из {steps.length}</span>
          </div>
          <h3 className="text-sm font-black text-slate-900 mb-1">{steps[step].title}</h3>
          <p className="text-sm text-slate-600 leading-relaxed">{steps[step].text}</p>

          <div className="flex items-center justify-between mt-4">
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" /> Назад
            </button>
            {step < steps.length - 1 ? (
              <button
                onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-[#168BEA] text-white text-xs font-bold"
              >
                Далее <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setOpen(false)}
                className="px-3 py-2 rounded-xl bg-[#2CCB70] text-white text-xs font-bold"
              >
                Понятно
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
