import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Task } from '../../types';
import {
  ArrowLeft, Camera, MessageSquare, Send, CheckCircle2, X, Plus, Trash2, ListChecks,
} from 'lucide-react';

interface Props {
  task: Task;
  onBack: () => void;
  onDone: () => void;
}

export const WorkScreen: React.FC<Props> = ({ task, onBack, onDone }) => {
  const {
    addPhoto, deletePhoto, updateTaskStatus, showToast, authMode,
    toggleChecklistItem, addChecklistItem, removeChecklistItem,
  } = useApp();
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newItem, setNewItem] = useState('');
  const isDemo = authMode === 'demo';

  const handleAddPhoto = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          addPhoto(task.id, {
            taskId: task.id,
            url: ev.target?.result as string,
            category: 'result',
            comment: '',
            fileSizeKb: Math.round(file.size / 1024),
          });
          showToast('Фото добавлено');
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 500));
    updateTaskStatus(task.id, 'under_review', comment || 'Работа выполнена, отправлено на проверку');
    showToast('Отправлено на проверку');
    setIsSubmitting(false);
    onDone();
  };

  const doneCount = task.checklist.filter((c) => c.isCompleted).length;

  return (
    <div className="h-full overflow-y-auto bg-[#F4F7FA]">
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3">
        <button onClick={onBack} className="p-2 -ml-2 rounded-xl hover:bg-slate-100">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <div className="text-xs text-amber-600 font-bold">ВЫПОЛНЕНИЕ</div>
          <div className="text-sm font-bold text-slate-900">{task.number}</div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {isDemo && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
            <div className="text-xs text-amber-600 font-bold mb-1">Учебный режим</div>
            <div className="text-sm text-amber-800">Выполни работу и отправь на проверку</div>
          </div>
        )}

        {/* ===== ЧЕК-ЛИСТ ===== */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-[#168BEA]" />
              <span className="text-xs font-bold text-slate-500">Чек-лист работ</span>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${doneCount === task.checklist.length && task.checklist.length > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
              {doneCount}/{task.checklist.length}
            </span>
          </div>

          {task.checklist.length === 0 && (
            <div className="text-xs text-slate-400 py-2">Чек-лист пуст — добавьте пункты ниже.</div>
          )}

          <div className="space-y-2">
            {task.checklist.map((item) => (
              <div key={item.id} className="flex items-start gap-2.5">
                <button
                  onClick={() => toggleChecklistItem(task.id, item.id)}
                  className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                    item.isCompleted ? 'bg-[#2CCB70] border-[#2CCB70]' : 'border-slate-300 bg-white'
                  }`}
                >
                  {item.isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm ${item.isCompleted ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                    {item.title}
                    {item.isRequired && <span className="ml-1 text-[10px] text-amber-500 font-bold">обяз.</span>}
                  </div>
                </div>
                <button
                  onClick={() => removeChecklistItem(task.id, item.id)}
                  className="p-1 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Добавить свой пункт */}
          <div className="mt-3 flex gap-2">
            <input
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newItem.trim()) {
                  addChecklistItem(task.id, newItem);
                  setNewItem('');
                }
              }}
              placeholder="Добавить свой пункт чек-листа..."
              className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-[#168BEA]"
            />
            <button
              onClick={() => {
                if (newItem.trim()) {
                  addChecklistItem(task.id, newItem);
                  setNewItem('');
                }
              }}
              className="px-3 py-2 rounded-xl bg-[#168BEA] text-white font-bold flex items-center gap-1 active:scale-95 transition-transform"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ===== ФОТО ===== */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100">
          <div className="flex items-center gap-2 mb-3">
            <Camera className="w-4 h-4 text-[#168BEA]" />
            <span className="text-xs font-bold text-slate-500">Фото ({task.photos.length})</span>
          </div>

          {task.photos.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
              {task.photos.map((photo) => (
                <div key={photo.id} className="relative shrink-0">
                  <img src={photo.url} alt="" className="w-24 h-24 object-cover rounded-xl" />
                  <div className="absolute top-1 left-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  </div>
                  <button
                    onClick={() => deletePhoto(task.id, photo.id)}
                    className="absolute top-1 right-1 w-5 h-5 bg-black/60 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={handleAddPhoto}
            className="w-full border-2 border-dashed border-slate-300 rounded-2xl p-5 text-center active:scale-[0.98] transition-transform hover:border-[#168BEA]"
          >
            <Camera className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <div className="text-sm font-bold text-slate-700">Добавить фото</div>
            <div className="text-xs text-slate-400 mt-1">Нажми, чтобы сделать или выбрать фото</div>
          </button>
        </div>

        {/* ===== КОММЕНТАРИЙ ===== */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-500">Комментарий</span>
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Опиши, что было сделано..."
            className="w-full h-24 text-sm text-slate-900 placeholder-slate-400 resize-none focus:outline-none"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full bg-[#2CCB70] text-white font-bold py-4 rounded-2xl active:scale-[0.98] transition-transform shadow-lg shadow-green-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Send className="w-5 h-5" />
          {isSubmitting ? 'Отправка...' : 'Отправить на проверку'}
        </button>
      </div>
    </div>
  );
};
