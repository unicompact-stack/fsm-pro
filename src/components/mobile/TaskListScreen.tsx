import React from 'react';
import { useApp } from '../../context/AppContext';
import { MapPin, Phone, Clock, AlertTriangle, Hand, User } from 'lucide-react';
import { Task } from '../../types';

interface Props {
  onSelectTask: (taskId: string) => void;
  mode: 'all' | 'mine';
}

const STATUS_LABELS: Record<string, string> = {
  new: 'Новая',
  assigned: 'Назначена',
  in_progress: 'В работе',
  under_review: 'На проверке',
  completed: 'Выполнена',
};

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-emerald-100 text-emerald-700',
  assigned: 'bg-violet-100 text-violet-700',
  in_progress: 'bg-sky-100 text-sky-700',
  under_review: 'bg-amber-100 text-amber-700',
  completed: 'bg-emerald-100 text-emerald-700',
};

// Карточка задачи (общая для всех групп)
const TaskCard: React.FC<{ task: Task; onSelect: (id: string) => void; showAction: boolean }> = ({ task, onSelect, showAction }) => {
  const { currentUser, takeTask } = useApp();
  const isMine = task.assignedUserId === currentUser.id;
  const isFree = !task.assignedUserId;

  return (
    <div className="w-full bg-white rounded-2xl p-4 text-left border border-slate-100 shadow-sm">
      <button onClick={() => onSelect(task.id)} className="w-full text-left">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="text-xs font-bold text-slate-400">{task.number}</div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[task.status]}`}>
            {STATUS_LABELS[task.status]}
          </span>
        </div>

        <div className="text-sm font-bold text-slate-900 mb-2">{task.title}</div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          <span className="truncate">{task.address.full}</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
          <Phone className="w-3.5 h-3.5 text-slate-400" />
          <span>{task.customer.phone}</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{task.customer.name}</span>
        </div>

        {task.isOverdue && (
          <div className="flex items-center gap-1.5 mt-2 text-xs text-red-600 font-bold">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Просрочена</span>
          </div>
        )}

        {task.needsRework && (
          <div className="flex items-center gap-1.5 mt-2 text-xs text-red-600 font-bold">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Вернули на доработку — доработай и отправь снова</span>
          </div>
        )}
      </button>

      {showAction && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          {isFree ? (
            <button
              onClick={() => takeTask(task.id)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#2CCB70] text-white text-xs font-bold active:scale-[0.98] transition-transform shadow-sm shadow-green-500/20"
            >
              <Hand className="w-3.5 h-3.5" />
              Взяться за задачу
            </button>
          ) : (
            <div className={`flex items-center gap-1.5 text-xs font-medium ${isMine ? 'text-[#168BEA]' : 'text-slate-500'}`}>
              <User className="w-3.5 h-3.5" />
              {isMine ? 'Выполняете вы' : `Выполняет: ${task.assignedUser?.fullName || '—'}`}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const TaskListScreen: React.FC<Props> = ({ onSelectTask, mode }) => {
  const { tasks, currentUser } = useApp();

  // «Мои задачи» — только закреплённые за текущим работником
  if (mode === 'mine') {
    const myTasks = tasks.filter((t) => t.assignedUserId === currentUser.id);

    return (
      <div className="h-full overflow-y-auto bg-[#F4F7FA]">
        <div className="px-4 pt-4 pb-2">
          <h1 className="text-lg font-black text-slate-900">Мои задачи</h1>
          <p className="text-xs text-slate-500 mt-1">{myTasks.length} задач закреплено за вами</p>
        </div>

        <div className="px-4 pb-4 space-y-3">
          {myTasks.map((task) => (
            <TaskCard key={task.id} task={task} onSelect={onSelectTask} showAction={false} />
          ))}

          {myTasks.length === 0 && (
            <div className="text-center py-12 text-slate-400 text-sm">
              У вас пока нет закреплённых задач.
              <br />
              Загляните во вкладку «Все задачи» и возьмите свободную.
            </div>
          )}
        </div>
      </div>
    );
  }

  // «Все задачи» — витрина: свои отдельно, остальные — в рамке
  const mine = tasks.filter((t) => t.assignedUserId === currentUser.id && t.status !== 'completed');
  const others = tasks.filter((t) => t.assignedUserId !== currentUser.id && t.status !== 'completed');
  const freeCount = others.filter((t) => !t.assignedUserId).length;

  return (
    <div className="h-full overflow-y-auto bg-[#F4F7FA]">
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-lg font-black text-slate-900">Все задачи</h1>
        <p className="text-xs text-slate-500 mt-1">
          {freeCount} свободных · {mine.length + others.length} всего
        </p>
      </div>

      <div className="px-4 pb-4 space-y-4">
        {/* Мои задачи — без рамки */}
        {mine.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#168BEA]" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Выполняете вы</span>
            </div>
            <div className="space-y-3">
              {mine.map((task) => (
                <TaskCard key={task.id} task={task} onSelect={onSelectTask} showAction={false} />
              ))}
            </div>
          </div>
        )}

        {/* Чужие и свободные — в выделенной рамке */}
        <div className="rounded-3xl border-2 border-dashed border-slate-300 bg-white/60 p-3 shadow-[0_10px_30px_rgba(15,23,42,0.10)]">
          <div className="flex items-center justify-between mb-2 px-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Другие специалисты и свободные
              </span>
            </div>
            <span className="text-[10px] font-bold text-slate-400">{others.length}</span>
          </div>

          <div className="space-y-3">
            {others.map((task) => (
              <TaskCard key={task.id} task={task} onSelect={onSelectTask} showAction />
            ))}
          </div>

          {others.length === 0 && (
            <div className="text-center py-8 text-slate-400 text-sm">Свободных задач нет</div>
          )}
        </div>

        {mine.length === 0 && others.length === 0 && (
          <div className="text-center py-12 text-slate-400 text-sm">Нет активных задач</div>
        )}
      </div>
    </div>
  );
};
