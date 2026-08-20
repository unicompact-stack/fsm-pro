import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Task } from '../../types';
import { SignaturePad } from '../shared/SignaturePad';
import { 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Camera, 
  Package, 
  FileCheck, 
  Send, 
  Printer, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CompletionScreenProps {
  task: Task;
  onBack: () => void;
  onDone: () => void;
  onOpenActPreview: () => void;
}

export const CompletionScreen: React.FC<CompletionScreenProps> = ({
  task,
  onBack,
  onDone,
  onOpenActPreview,
}) => {
  const { completeTask, showToast } = useApp();
  const [signatureData, setSignatureData] = useState<string>(task.customerSignature || '');
  const [technicianComment, setTechnicianComment] = useState<string>(
    task.technicianComment || 'Работы выполнены в полном объеме согласно техническому регламенту. Заказчик претензий по качеству и срокам не имеет.'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompletedSuccess, setIsCompletedSuccess] = useState(false);

  // Validations
  const missingChecklist = task.checklist.filter((c) => c.isRequired && !c.isCompleted);
  const beforePhotos = task.photos.filter((p) => p.category === 'before');
  const resultPhotos = task.photos.filter((p) => p.category === 'result');
  const hasMinBeforePhotos = beforePhotos.length >= 2;
  const hasMinResultPhotos = resultPhotos.length >= 2;
  const isChecklistValid = missingChecklist.length === 0;
  const hasSignature = !!signatureData;

  const canComplete = isChecklistValid && hasMinBeforePhotos && hasMinResultPhotos && hasSignature;

  const handleFinishSubmit = () => {
    if (!canComplete) {
      if (!isChecklistValid) {
        showToast(`Отметьте все обязательные пункты чек-листа (${missingChecklist.length} не закрыто)`);
        return;
      }
      if (!hasMinBeforePhotos) {
        showToast('Необходимо минимум 2 фото "До начала работ"');
        return;
      }
      if (!hasMinResultPhotos) {
        showToast('Необходимо минимум 2 фото "Результат"');
        return;
      }
      if (!hasSignature) {
        showToast('Получите электронную подпись заказчика');
        return;
      }
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const success = completeTask(task.id, signatureData, technicianComment);
      setIsSubmitting(false);
      if (success) {
        setIsCompletedSuccess(true);
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {
          // ignore if canvas-confetti fails
        }
      }
    }, 400);
  };

  if (isCompletedSuccess) {
    return (
      <div className="flex flex-col h-full bg-[#F4F7FA] items-center justify-center p-6 text-center space-y-5 animate-in zoom-in-95">
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-xl font-black text-slate-900">Задание успешно сдано!</h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Итоговый отчёт № {task.number} и акт выполненных работ сформированы и переданы на проверку диспетчеру.
          </p>
        </div>

        <div className="w-full max-w-xs space-y-2 pt-2">
          <button
            onClick={onOpenActPreview}
            className="w-full bg-[#168BEA] hover:bg-[#1277c9] text-white py-3.5 px-4 rounded-2xl text-xs font-bold shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all active:scale-98"
          >
            <Printer className="w-4 h-4" />
            Просмотреть Акт (PDF)
          </button>

          <button
            onClick={onDone}
            className="w-full bg-slate-800 hover:bg-slate-900 text-white py-3.5 px-4 rounded-2xl text-xs font-bold transition-all active:scale-98"
          >
            Вернуться к списку задач
          </button>
        </div>
      </div>
    );
  }

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
            <h2 className="font-bold text-base text-[#263238]">Завершение задания</h2>
            <p className="text-[11px] text-slate-400">Проверка чек-листа и подпись</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-28">
        
        {/* Verification Checklist Card */}
        <div className="bg-white rounded-[20px] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#168BEA]" />
            Критерии приёмки задания
          </h3>

          <div className="space-y-2 text-xs">
            {/* Checklist Check */}
            <div className={`p-3 rounded-xl border flex items-center justify-between ${
              isChecklistValid ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' : 'bg-rose-50/70 border-rose-200 text-rose-900'
            }`}>
              <div className="flex items-center gap-2">
                {isChecklistValid ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-500" />}
                <span className="font-semibold">Обязательный чек-лист</span>
              </div>
              <span className="text-[11px] font-bold">
                {isChecklistValid ? 'Выполнен 100%' : `${missingChecklist.length} не выполнено`}
              </span>
            </div>

            {/* Photos Before Check */}
            <div className={`p-3 rounded-xl border flex items-center justify-between ${
              hasMinBeforePhotos ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' : 'bg-rose-50/70 border-rose-200 text-rose-900'
            }`}>
              <div className="flex items-center gap-2">
                {hasMinBeforePhotos ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-500" />}
                <span className="font-semibold">Фото «До начала работ»</span>
              </div>
              <span className="text-[11px] font-bold">
                {beforePhotos.length} из 2 мин.
              </span>
            </div>

            {/* Photos Result Check */}
            <div className={`p-3 rounded-xl border flex items-center justify-between ${
              hasMinResultPhotos ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' : 'bg-rose-50/70 border-rose-200 text-rose-900'
            }`}>
              <div className="flex items-center gap-2">
                {hasMinResultPhotos ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-500" />}
                <span className="font-semibold">Фото «Результат»</span>
              </div>
              <span className="text-[11px] font-bold">
                {resultPhotos.length} из 2 мин.
              </span>
            </div>

            {/* Materials consumption */}
            <div className="p-3 rounded-xl border border-blue-200 bg-blue-50/60 text-blue-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#168BEA]" />
                <span className="font-semibold">Расход материалов зафиксирован</span>
              </div>
              <span className="text-[11px] font-bold">{task.materials.length} поз.</span>
            </div>
          </div>
        </div>

        {/* Technician Comment */}
        <div className="bg-white rounded-[20px] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100 space-y-2">
          <label className="text-xs font-bold text-slate-700 block">
            Заключение и комментарий исполнителя:
          </label>
          <textarea
            rows={2}
            value={technicianComment}
            onChange={(e) => setTechnicianComment(e.target.value)}
            className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#168BEA] resize-none"
            placeholder="Укажите особенности выполненной работы..."
          />
        </div>

        {/* Electronic Customer Signature Canvas */}
        <div className="bg-white rounded-[20px] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100 space-y-2">
          <SignaturePad
            onSave={(dataUrl) => setSignatureData(dataUrl)}
            initialSignature={signatureData}
          />
          <p className="text-[10px] text-slate-400 text-center">
            Заказчик подтверждает приёмку работ в полном объёме без претензий
          </p>
        </div>

      </div>

      {/* Sticky Bottom Action */}
      <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md px-4 py-3 border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] flex items-center gap-2 z-20">
        <button
          onClick={handleFinishSubmit}
          disabled={isSubmitting}
          className={`w-full font-bold py-3.5 px-4 rounded-[26px] shadow-lg flex items-center justify-center gap-2 text-sm transition-all active:scale-98 ${
            canComplete
              ? 'bg-[#2CCB70] hover:bg-[#25b563] text-white shadow-emerald-500/25'
              : 'bg-slate-300 text-slate-500 cursor-not-allowed'
          }`}
        >
          <Send className="w-4 h-4" />
          {isSubmitting ? 'Отправка отчёта...' : 'Завершить и передать диспетчеру'}
        </button>
      </div>

    </div>
  );
};
