import React, { useState } from 'react';
import { Task } from '../../types';
import { useApp } from '../../context/AppContext';
import { X, AlertTriangle, PackageSearch, HelpCircle, PauseCircle, Send } from 'lucide-react';

interface IssueModalProps {
  task: Task;
  onClose: () => void;
}

export const IssueModal: React.FC<IssueModalProps> = ({ task, onClose }) => {
  const { updateTaskStatus, showToast } = useApp();
  const [selectedType, setSelectedType] = useState<'pause' | 'material' | 'approval' | 'help'>('material');
  const [comment, setComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      showToast('Пожалуйста, опишите причину проблемы');
      return;
    }

    // По спецификации только 5 статусов: проблема НЕ меняет статус задачи,
    // а фиксируется комментарием в истории для диспетчера.
    const typeLabel = {
      material: 'Не хватает материалов',
      approval: 'Требуется согласование',
      pause: 'Приостановить работу',
      help: 'Связь с диспетчером',
    }[selectedType];

    updateTaskStatus(task.id, task.status, `[${typeLabel}] ${comment}`);
    showToast('Сообщение отправлено диспетчеру');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-4 bg-amber-500 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-white" />
            <h3 className="font-bold text-base">Сообщить о проблеме</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">Тип обращения / статус:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedType('material')}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col gap-1 ${
                  selectedType === 'material'
                    ? 'border-orange-500 bg-orange-50 text-orange-950 font-bold ring-2 ring-orange-500/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <PackageSearch className="w-4 h-4 text-orange-500" />
                <span className="text-xs">Не хватает материалов</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedType('approval')}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col gap-1 ${
                  selectedType === 'approval'
                    ? 'border-amber-500 bg-amber-50 text-amber-950 font-bold ring-2 ring-amber-500/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <HelpCircle className="w-4 h-4 text-amber-500" />
                <span className="text-xs">Требуется согласование</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedType('pause')}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col gap-1 ${
                  selectedType === 'pause'
                    ? 'border-yellow-500 bg-yellow-50 text-yellow-950 font-bold ring-2 ring-yellow-500/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <PauseCircle className="w-4 h-4 text-yellow-600" />
                <span className="text-xs">Приостановить работу</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedType('help')}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col gap-1 ${
                  selectedType === 'help'
                    ? 'border-blue-500 bg-blue-50 text-blue-950 font-bold ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <AlertTriangle className="w-4 h-4 text-blue-500" />
                <span className="text-xs">Связь с диспетчером</span>
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">Подробное описание ситуации:</label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Например: Закончилась пена Soudal, либо клиент просит изменить трассу кабеля..."
              className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#168BEA] resize-none"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              Отправить
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
