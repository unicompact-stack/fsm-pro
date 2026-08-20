import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Task } from '../../types';
import { STATUS_CONFIG, formatTime } from '../../utils/statusUtils';
import { 
  ArrowLeft, 
  Clock, 
  MapPin, 
  CheckSquare, 
  Square, 
  Camera, 
  AlertTriangle, 
  ChevronRight, 
  ShieldCheck,
  PauseCircle,
  Play,
  PackageCheck,
  CheckCircle2,
  FileCheck2
} from 'lucide-react';

interface WorkExecutionScreenProps {
  task: Task;
  onBack: () => void;
  onOpenPhotos: () => void;
  onOpenIssueModal: () => void;
  onProceedToCompletion: () => void;
}

export const WorkExecutionScreen: React.FC<WorkExecutionScreenProps> = ({
  task,
  onBack,
  onOpenPhotos,
  onOpenIssueModal,
  onProceedToCompletion,
}) => {
  const { toggleChecklistItem, updateTaskStatus, showToast } = useApp();

  // Timer calculation
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  useEffect(() => {
    const startTime = task.actualStart ? new Date(task.actualStart).getTime() : Date.now();
    const interval = setInterval(() => {
      const diff = Math.max(0, Math.floor((Date.now() - startTime) / 1000));
      setElapsedSeconds(diff);
    }, 1000);

    return () => clearInterval(interval);
  }, [task.actualStart]);

  const formatTimer = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const totalChecklist = task.checklist.length;
  const completedChecklist = task.checklist.filter((c) => c.isCompleted).length;
  const requiredTotal = task.checklist.filter((c) => c.isRequired).length;
  const requiredCompleted = task.checklist.filter((c) => c.isRequired && c.isCompleted).length;
  const progressPercent = totalChecklist > 0 ? Math.round((completedChecklist / totalChecklist) * 100) : 0;
  const isAllRequiredDone = requiredCompleted === requiredTotal;

  const handleFinishAttempt = () => {
    if (!isAllRequiredDone) {
      showToast(`Внимание: необходимо выполнить все ${requiredTotal} обязательных этапов чек-листа!`);
      return;
    }
    onProceedToCompletion();
  };

  return (
    <div className="flex flex-col h-full bg-[#F4F7FA] relative">
      
      {/* App Bar */}
      <div className="bg-white px-4 py-3 border-b border-slate-100 flex items-center justify-between shadow-xs shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <span className="text-[11px] font-bold text-slate-400 block -mb-0.5">
              {task.number}
            </span>
            <h2 className="font-bold text-sm text-[#263238] truncate max-w-[200px]">
              {task.title}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#168BEA] pulse-active" />
          <span className="text-xs font-bold text-[#168BEA]">В работе</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-28">
        
        {/* Live Timer & GPS Card */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-[22px] p-5 text-white shadow-xl shadow-slate-900/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Clock className="w-4 h-4 text-[#168BEA]" />
              <span>Время выполнения на объекте:</span>
            </div>
            <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-md font-mono text-emerald-400">
              ● ТАЙМЕР АКТИВЕН
            </span>
          </div>

          <div className="text-3xl font-mono font-black tracking-wider text-center text-white">
            {formatTimer(elapsedSeconds)}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/10 text-xs">
            <div className="flex items-center gap-1.5 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span className="text-[11px] truncate">GPS: 55.75124, 37.61842</span>
            </div>
            <div className="text-right text-slate-400 text-[11px]">
              Старт: {task.actualStart ? formatTime(task.actualStart) : '—'}
            </div>
          </div>
        </div>

        {/* Progress bar card */}
        <div className="bg-white rounded-[20px] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700">Прогресс выполнения</span>
            <span className="font-bold text-[#168BEA]">{completedChecklist} из {totalChecklist} ({progressPercent}%)</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#168BEA] transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>Обязательные: {requiredCompleted}/{requiredTotal}</span>
            {isAllRequiredDone ? (
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Обязательные закрыты
              </span>
            ) : (
              <span className="text-rose-500 font-semibold">
                Осталось обязательных: {requiredTotal - requiredCompleted}
              </span>
            )}
          </div>
        </div>

        {/* Interactive Checklist */}
        <div className="bg-white rounded-[20px] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <CheckSquare className="w-4 h-4 text-[#168BEA]" />
              Технологический чек-лист
            </h3>
            <span className="text-[11px] text-slate-400">
              Нажмите для отметки
            </span>
          </div>

          <div className="space-y-2">
            {task.checklist.map((item, index) => {
              return (
                <div
                  key={item.id}
                  onClick={() => toggleChecklistItem(task.id, item.id)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none active:scale-[0.99] ${
                    item.isCompleted
                      ? 'bg-emerald-50/60 border-emerald-200/80 text-emerald-950'
                      : 'bg-slate-50 border-slate-200/70 hover:bg-slate-100/70 text-slate-800'
                  }`}
                >
                  <button type="button" className="mt-0.5 shrink-0">
                    {item.isCompleted ? (
                      <CheckSquare className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-400" />
                    )}
                  </button>

                  <div className="flex-1 space-y-0.5">
                    <div className="text-xs font-medium leading-snug flex items-center flex-wrap gap-1">
                      <span className={item.isCompleted ? 'line-through text-slate-500' : 'text-slate-800 font-semibold'}>
                        {index + 1}. {item.title}
                      </span>
                      {item.isRequired && (
                        <span className="text-[10px] text-rose-500 font-bold bg-rose-50 px-1.5 py-0.2 rounded">
                          * Обязательно
                        </span>
                      )}
                    </div>
                    {item.completedAt && (
                      <div className="text-[10px] text-emerald-700">
                        Выполнено в {formatTime(item.completedAt)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Photo & Material short links */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onOpenPhotos}
            className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col items-center justify-center gap-1.5 hover:bg-blue-50/50 hover:border-blue-200 transition-all active:scale-95 text-center"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#168BEA] flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <span className="font-bold text-xs text-slate-800">Фотоотчёт</span>
            <span className="text-[10px] text-slate-400">{task.photos.length} фото загружено</span>
          </button>

          <button
            onClick={onOpenIssueModal}
            className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col items-center justify-center gap-1.5 hover:bg-amber-50/50 hover:border-amber-200 transition-all active:scale-95 text-center"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <span className="font-bold text-xs text-slate-800">Проблема / Пауза</span>
            <span className="text-[10px] text-slate-400">Связаться с офисом</span>
          </button>
        </div>

      </div>

      {/* Sticky Bottom Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md px-4 py-3 border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] flex items-center gap-2 z-20">
        
        <button
          onClick={onOpenIssueModal}
          className="p-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95 transition-all"
          title="Пауза"
        >
          <PauseCircle className="w-5 h-5 text-amber-600" />
        </button>

        <button
          onClick={onOpenPhotos}
          className="p-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95 transition-all relative"
          title="Камера"
        >
          <Camera className="w-5 h-5 text-[#168BEA]" />
          {task.photos.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#168BEA] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {task.photos.length}
            </span>
          )}
        </button>

        <button
          onClick={handleFinishAttempt}
          className={`flex-1 font-bold py-3.5 px-4 rounded-[26px] shadow-lg flex items-center justify-center gap-2 text-sm active:scale-98 transition-all ${
            isAllRequiredDone
              ? 'bg-[#2CCB70] hover:bg-[#25b563] text-white shadow-emerald-500/25'
              : 'bg-slate-800 hover:bg-slate-900 text-white shadow-slate-900/15'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          Завершить и сформировать отчёт
        </button>

      </div>

    </div>
  );
};
