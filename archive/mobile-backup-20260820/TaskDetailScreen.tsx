import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Task, TaskStatus } from '../../types';
import { STATUS_CONFIG, PRIORITY_CONFIG, formatDate, formatTime, formatDateTime } from '../../utils/statusUtils';
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Navigation, 
  Calendar, 
  Clock, 
  User, 
  Package, 
  Plus, 
  Camera, 
  MessageSquare, 
  Play, 
  Pause, 
  CheckCircle2, 
  AlertTriangle,
  MoreVertical,
  Layers,
  FileText,
  UserCheck
} from 'lucide-react';

interface TaskDetailScreenProps {
  task: Task;
  onBack: () => void;
  onStartExecution: () => void;
  onOpenPhotos: () => void;
  onOpenRouteMap: () => void;
  onOpenIssueModal: () => void;
  onOpenActPreview: () => void;
}

export const TaskDetailScreen: React.FC<TaskDetailScreenProps> = ({
  task,
  onBack,
  onStartExecution,
  onOpenPhotos,
  onOpenRouteMap,
  onOpenIssueModal,
  onOpenActPreview,
}) => {
  const { currentRole, updateTaskStatus, updateMaterialQty, addMaterial, users, reassignTask, showToast } = useApp();
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [newMatName, setNewMatName] = useState('');
  const [newMatQty, setNewMatQty] = useState(1);
  const [newMatUnit, setNewMatUnit] = useState('шт.');
  const [showReassignModal, setShowReassignModal] = useState(false);

  const statusConfig = STATUS_CONFIG[task.status] || STATUS_CONFIG.new;
  const priorityConfig = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;

  const handleAddMaterialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMatName.trim()) return;
    addMaterial(task.id, {
      name: newMatName.trim(),
      plannedQty: Number(newMatQty),
      actualQty: Number(newMatQty),
      unit: newMatUnit,
      warehouseStatus: 'issued',
    });
    setNewMatName('');
    setNewMatQty(1);
    setShowAddMaterial(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#F4F7FA] relative">
      
      {/* Top App Bar */}
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
            <h2 className="font-bold text-sm text-[#263238] truncate max-w-[180px] sm:max-w-[240px]">
              {task.title}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Badge */}
          <span
            className={`text-xs px-3 py-1 rounded-full font-bold shadow-xs ${statusConfig.badgeBg} ${statusConfig.badgeText}`}
          >
            {statusConfig.label}
          </span>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-28">
        
        {/* Block 1: Description & Work Info */}
        <div className="bg-white rounded-[20px] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#168BEA] uppercase tracking-wider bg-blue-50 px-2.5 py-0.5 rounded-lg">
              {task.workType}
            </span>
            <span className={`text-[11px] px-2 py-0.5 rounded-md font-semibold ${priorityConfig.bg} ${priorityConfig.text}`}>
              Приоритет: {priorityConfig.label}
            </span>
          </div>

          <p className="text-sm text-slate-700 leading-relaxed font-normal">
            {task.description}
          </p>

          {task.dispatcherComment && (
            <div className="bg-amber-50/80 border border-amber-200/60 rounded-xl p-2.5 text-xs text-amber-900 flex items-start gap-2">
              <MessageSquare className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Комментарий диспетчера:</span>
                {task.dispatcherComment}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
            <div>
              <span className="text-[11px] text-slate-400 block">Создано:</span>
              <span className="font-medium text-slate-700">{formatDate(task.createdAt)}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Плановый срок:</span>
              <span className="font-medium text-slate-700">
                {formatDate(task.plannedStart)}, {formatTime(task.plannedStart)} – {formatTime(task.plannedEnd)}
              </span>
            </div>
          </div>
        </div>

        {/* Block 2: Address & Interactive Navigation */}
        <div className="bg-white rounded-[20px] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100/80 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Адрес и заказчик
            </h4>
            <button
              onClick={onOpenRouteMap}
              className="text-xs font-bold text-[#168BEA] hover:underline flex items-center gap-1"
            >
              <Navigation className="w-3.5 h-3.5" />
              Построить маршрут
            </button>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#168BEA] flex items-center justify-center shrink-0 mt-0.5">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <div className="font-bold text-sm text-slate-800">{task.address.full}</div>
              <div className="flex flex-wrap gap-1.5 text-xs text-slate-500">
                {task.address.entrance && (
                  <span className="bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                    Подъезд: <b className="text-slate-700">{task.address.entrance}</b>
                  </span>
                )}
                {task.address.floor && (
                  <span className="bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                    Этаж: <b className="text-slate-700">{task.address.floor}</b>
                  </span>
                )}
                {task.address.apartment && (
                  <span className="bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                    Кв./Офис: <b className="text-slate-700">{task.address.apartment}</b>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Customer info & Call button */}
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/70 flex items-center justify-between">
            <div>
              <div className="font-bold text-xs text-slate-800">{task.customer.name}</div>
              <div className="text-[11px] text-slate-500">{task.customer.phone}</div>
            </div>
            <a
              href={`tel:${task.customer.phone.replace(/[^0-9+]/g, '')}`}
              className="flex items-center gap-1.5 bg-[#2CCB70] hover:bg-[#25b563] text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all"
            >
              <Phone className="w-3.5 h-3.5" />
              Вызов
            </a>
          </div>
        </div>

        {/* Block 3: Assigned Technician */}
        <div className="bg-white rounded-[20px] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100/80 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Ответственный специалист
            </h4>
            {(currentRole === 'dispatcher' || currentRole === 'admin') && (
              <button
                onClick={() => setShowReassignModal(true)}
                className="text-xs font-bold text-[#9546D8] hover:underline flex items-center gap-1"
              >
                <UserCheck className="w-3.5 h-3.5" />
                Изменить
              </button>
            )}
          </div>

          {task.assignedUser ? (
            <div className="flex items-center gap-3">
              <img
                src={task.assignedUser.avatar}
                alt={task.assignedUser.fullName}
                className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shadow-xs"
              />
              <div className="flex-1">
                <h5 className="font-bold text-sm text-slate-900">{task.assignedUser.fullName}</h5>
                <div className="text-xs text-slate-500">{task.assignedUser.phone}</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {task.assignedUser.specializations.map((spec, i) => (
                    <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 text-center bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
              Специалист ещё не назначен на данное задание
            </div>
          )}
        </div>

        {/* Block 4: Materials */}
        <div className="bg-white rounded-[20px] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-[#168BEA]" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Материалы ({task.materials.length})
              </h4>
            </div>
            <button
              onClick={() => setShowAddMaterial(!showAddMaterial)}
              className="text-xs font-bold text-[#168BEA] hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Добавить
            </button>
          </div>

          {/* Add material mini form */}
          {showAddMaterial && (
            <form onSubmit={handleAddMaterialSubmit} className="p-3 bg-blue-50/60 rounded-2xl border border-blue-200/80 space-y-2">
              <span className="text-xs font-bold text-blue-900 block">Новый материал:</span>
              <input
                type="text"
                placeholder="Наименование (напр., Кабель 3x2.5)"
                value={newMatName}
                onChange={(e) => setNewMatName(e.target.value)}
                className="w-full text-xs p-2 rounded-xl bg-white border border-blue-200 focus:outline-none focus:ring-1 focus:ring-[#168BEA]"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Кол-во"
                  value={newMatQty}
                  onChange={(e) => setNewMatQty(Number(e.target.value))}
                  className="w-24 text-xs p-2 rounded-xl bg-white border border-blue-200"
                />
                <input
                  type="text"
                  placeholder="Ед. изм (шт, м, кг)"
                  value={newMatUnit}
                  onChange={(e) => setNewMatUnit(e.target.value)}
                  className="w-24 text-xs p-2 rounded-xl bg-white border border-blue-200"
                />
                <button
                  type="submit"
                  className="flex-1 bg-[#168BEA] text-white text-xs font-bold rounded-xl hover:bg-blue-600 transition-all"
                >
                  Сохранить
                </button>
              </div>
            </form>
          )}

          <div className="space-y-2">
            {task.materials.map((mat) => (
              <div
                key={mat.id}
                className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5 max-w-[60%]">
                  <div className="font-semibold text-slate-800 truncate">{mat.name}</div>
                  <div className="text-[11px] text-slate-400">
                    План: {mat.plannedQty} {mat.unit} • {mat.warehouseStatus === 'issued' ? 'Выдано со склада' : 'Ожидает склад'}
                  </div>
                </div>

                {/* Actual qty counter */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => updateMaterialQty(task.id, mat.id, Math.max(0, (mat.actualQty || 0) - 1))}
                    className="w-7 h-7 rounded-lg bg-white border border-slate-300 font-bold text-slate-600 flex items-center justify-center active:scale-90"
                  >
                    -
                  </button>
                  <span className="font-bold text-slate-900 min-w-8 text-center">
                    {mat.actualQty !== undefined ? mat.actualQty : mat.plannedQty}
                  </span>
                  <button
                    onClick={() => updateMaterialQty(task.id, mat.id, (mat.actualQty || 0) + 1)}
                    className="w-7 h-7 rounded-lg bg-white border border-slate-300 font-bold text-slate-600 flex items-center justify-center active:scale-90"
                  >
                    +
                  </button>
                  <span className="text-[11px] text-slate-400 font-medium ml-0.5">{mat.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Block 5: Quick Photo Preview Bar */}
        <div className="bg-white rounded-[20px] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-[#168BEA]" />
            <div>
              <h4 className="font-bold text-xs text-slate-800">Фотоотчёт</h4>
              <p className="text-[11px] text-slate-400">
                Загружено {task.photos.length} фото
              </p>
            </div>
          </div>
          <button
            onClick={onOpenPhotos}
            className="px-3 py-1.5 bg-blue-50 text-[#168BEA] hover:bg-blue-100 rounded-xl text-xs font-bold transition-all"
          >
            Перейти к фото
          </button>
        </div>

        {/* Block 6: Completed Act button (if completed or under review) */}
        {(task.status === 'completed' || task.status === 'under_review') && (
          <button
            onClick={onOpenActPreview}
            className="w-full p-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 active:scale-98 transition-all"
          >
            <FileText className="w-4 h-4" />
            Просмотреть Акт выполненных работ
          </button>
        )}

      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md px-4 py-3 border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] flex items-center gap-2 z-20">
        
        {/* Secondary action: Pause / Problem */}
        <button
          onClick={onOpenIssueModal}
          className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95 transition-all"
          title="Сообщить о проблеме / Пауза"
        >
          <AlertTriangle className="w-5 h-5 text-amber-600" />
        </button>

        {/* Secondary action: Photos */}
        <button
          onClick={onOpenPhotos}
          className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95 transition-all relative"
          title="Фотоотчёт"
        >
          <Camera className="w-5 h-5 text-[#168BEA]" />
          {task.photos.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#168BEA] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {task.photos.length}
            </span>
          )}
        </button>

        {/* Primary Action Button */}
        {task.status === 'new' || task.status === 'assigned' ? (
          <button
            onClick={() => {
              updateTaskStatus(task.id, 'in_progress', 'Мастер нажал "Начать работу" на объекте');
              onStartExecution();
            }}
            className="flex-1 bg-[#168BEA] hover:bg-[#1277c9] text-white font-bold py-3.5 px-4 rounded-[26px] shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 text-sm active:scale-98 transition-all"
          >
            <Play className="w-4 h-4 fill-white" />
            Начать работу
          </button>
        ) : task.status === 'in_progress' ? (
          <button
            onClick={onStartExecution}
            className="flex-1 bg-[#2CCB70] hover:bg-[#25b563] text-white font-bold py-3.5 px-4 rounded-[26px] shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 text-sm active:scale-98 transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            Выполнение и чек-лист
          </button>
        ) : (
          <button
            onClick={onStartExecution}
            className="flex-1 bg-slate-800 hover:bg-slate-900 text-white font-bold py-3.5 px-4 rounded-[26px] shadow-md flex items-center justify-center gap-2 text-sm active:scale-98 transition-all"
          >
            Просмотр протокола работ
          </button>
        )}

      </div>

      {/* Reassign Modal */}
      {showReassignModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 animate-in zoom-in-95">
            <h3 className="font-bold text-sm text-slate-900">Назначить специалиста</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {users.filter(u => u.role === 'technician').map(u => (
                <button
                  key={u.id}
                  onClick={() => {
                    reassignTask(task.id, u.id);
                    setShowReassignModal(false);
                  }}
                  className={`w-full p-3 rounded-2xl border flex items-center gap-3 text-left transition-all ${
                    task.assignedUserId === u.id ? 'border-[#168BEA] bg-blue-50/50' : 'hover:bg-slate-50'
                  }`}
                >
                  <img src={u.avatar} alt={u.fullName} className="w-9 h-9 rounded-full object-cover" />
                  <div>
                    <div className="font-bold text-xs text-slate-900">{u.fullName}</div>
                    <div className="text-[10px] text-slate-500">{u.specializations.join(', ')}</div>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowReassignModal(false)}
              className="w-full py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl"
            >
              Отмена
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
