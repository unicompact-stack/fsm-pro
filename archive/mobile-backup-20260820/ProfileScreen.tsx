import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { STATUS_CONFIG } from '../../utils/statusUtils';
import { 
  User as UserIcon, 
  Phone, 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  SearchCheck, 
  ClipboardList,
  Wifi,
  WifiOff,
  LogOut,
  ChevronRight,
  MessageSquare,
  RotateCcw
} from 'lucide-react';

interface ProfileScreenProps {
  onOpenChat: () => void;
}

/**
 * ProfileScreen — раздел «Профиль» в мобильной части мастера.
 * Показывает личные данные, специализацию, статус и статистику по задачам.
 */
export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onOpenChat }) => {
  const { 
    currentUser, 
    users,
    tasks, 
    currentRole, 
    setCurrentRole, 
    isOnline, 
    setIsOnline, 
    resetDemoState,
    setHasChosenRole,
    showToast 
  } = useApp();

  const stats = useMemo(() => {
    const myTasks = tasks.filter(t => 
      t.assignedUserId === currentUser.id || t.createdBy === currentUser.fullName
    );
    return {
      total: myTasks.length,
      inProgress: myTasks.filter(t => t.status === 'in_progress').length,
      underReview: myTasks.filter(t => t.status === 'under_review').length,
      completed: myTasks.filter(t => t.status === 'completed').length,
    };
  }, [tasks, currentUser]);

  const statusLabel = {
    available: 'Свободен',
    busy: 'Занят',
    offline: 'Не в сети',
  }[currentUser.status] || currentUser.status;

  const statusColor = {
    available: 'bg-emerald-500',
    busy: 'bg-[#168BEA]',
    offline: 'bg-slate-400',
  }[currentUser.status] || 'bg-slate-400';

  return (
    <div className="w-full h-full overflow-y-auto bg-[#F4F7FA] pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#168BEA] to-[#0D62A7] text-white px-5 pt-6 pb-8 rounded-b-3xl">
        <div className="font-bold text-sm opacity-90">FSM PRO · Профиль</div>
        <div className="flex items-center gap-4 mt-4">
          <div className="relative">
            <img 
              src={currentUser.avatar} 
              alt={currentUser.fullName} 
              className="w-16 h-16 rounded-2xl object-cover border-2 border-white/40 shadow-lg"
            />
            <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ${statusColor} border-2 border-white`} />
          </div>
          <div className="min-w-0">
            <div className="font-black text-lg leading-tight truncate">{currentUser.fullName}</div>
            <div className="text-xs text-white/80 mt-0.5">
              {currentUser.specializations.join(' · ')}
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-[11px]">
              <span className={`px-2 py-0.5 rounded-full font-bold ${statusColor === 'bg-emerald-500' ? 'bg-emerald-500/30 text-emerald-100' : statusColor === 'bg-[#168BEA]' ? 'bg-[#168BEA]/40 text-sky-100' : 'bg-slate-500/40 text-slate-200'}`}>
                {statusLabel}
              </span>
              <span className="text-white/60">• {currentUser.phone}</span>
            </div>
          </div>
        </div>

        {/* Online Toggle */}
        <button
          onClick={() => setIsOnline(!isOnline)}
          className={`mt-4 flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
            isOnline 
              ? 'bg-emerald-500/20 text-emerald-100 border border-emerald-400/40' 
              : 'bg-rose-500/20 text-rose-100 border border-rose-400/40'
          }`}
        >
          {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
          <span>{isOnline ? 'В сети — данные синхронизируются' : 'Автономный режим (Offline-first)'}</span>
        </button>
      </div>

      {/* My Stats */}
      <div className="px-4 mt-5">
        <h3 className="font-black text-sm text-slate-800 mb-3 px-1">Моя статистика</h3>
        <div className="grid grid-cols-4 gap-2.5">
          <div className="bg-white rounded-2xl border border-slate-200 p-3 text-center shadow-xs">
            <ClipboardList className="w-4 h-4 text-slate-400 mx-auto" />
            <div className="text-xl font-black text-slate-900 mt-1">{stats.total}</div>
            <div className="text-[10px] text-slate-500 font-medium">Всего</div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-3 text-center shadow-xs">
            <Clock className="w-4 h-4 text-[#168BEA] mx-auto" />
            <div className="text-xl font-black text-[#168BEA] mt-1">{stats.inProgress}</div>
            <div className="text-[10px] text-slate-500 font-medium">В работе</div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-3 text-center shadow-xs">
            <SearchCheck className="w-4 h-4 text-[#9546D8] mx-auto" />
            <div className="text-xl font-black text-[#9546D8] mt-1">{stats.underReview}</div>
            <div className="text-[10px] text-slate-500 font-medium">На проверке</div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-3 text-center shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-[#2CCB70] mx-auto" />
            <div className="text-xl font-black text-[#2CCB70] mt-1">{stats.completed}</div>
            <div className="text-[10px] text-slate-500 font-medium">Выполнено</div>
          </div>
        </div>
      </div>

      {/* Чат с диспетчером — связь с руководителем */}
      <div className="px-4 mt-5">
        <button
          onClick={onOpenChat}
          className="w-full bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center gap-3 hover:border-[#168BEA]/40 hover:shadow-md transition-all active:scale-[0.98]"
        >
          <div className="p-2.5 rounded-xl bg-[#168BEA]/10 text-[#168BEA]">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div className="flex-1 text-left">
            <div className="font-bold text-sm text-slate-900">Чат с диспетчером</div>
            <div className="text-[11px] text-slate-500">Задать вопрос, уточнить задачу, отправить комментарий</div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300" />
        </button>
      </div>

      {/* Info Cards */}
      <div className="px-4 mt-5 space-y-3">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#168BEA]/10 text-[#168BEA]">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-bold uppercase">Телефон</div>
              <div className="text-sm font-semibold text-slate-900">{currentUser.phone}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#9546D8]/10 text-[#9546D8]">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-bold uppercase">Специализация</div>
              <div className="text-sm font-semibold text-slate-900">{currentUser.specializations.join(', ')}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-100 text-slate-600">
              <UserIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-bold uppercase">Роль в системе</div>
              <div className="text-sm font-semibold text-slate-900">
                {currentRole === 'technician' ? 'Исполнитель (мастер)' : currentRole === 'dispatcher' ? 'Диспетчер' : 'Администратор'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Workers */}
      <div className="px-4 mt-5">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="font-bold text-xs text-slate-800">Рабочие в демо</div>
              <div className="text-[10px] text-slate-500">Сейчас в коде доступно {users.filter(u => u.role === 'technician').length} мастера</div>
            </div>
            <div className="text-[10px] text-slate-400">без базы данных</div>
          </div>
          <div className="space-y-2">
            {users.filter(u => u.role === 'technician').map((worker) => (
              <div key={worker.id} className={`flex items-center justify-between rounded-xl px-3 py-2 border ${worker.id === currentUser.id ? 'bg-sky-50 border-sky-200' : 'bg-slate-50 border-slate-200'}`}>
                <div>
                  <div className="text-sm font-semibold text-slate-900">{worker.fullName}</div>
                  <div className="text-[11px] text-slate-500">{worker.specializations.join(' · ')}</div>
                </div>
                <div className="text-[11px] font-bold text-slate-500">{worker.id === currentUser.id ? 'Сейчас выбран' : 'Демо'}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Role Switch for Demo */}
      <div className="px-4 mt-5">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="font-bold text-xs text-slate-800">Переключение демо-ролей</div>
            <div className="text-[10px] text-slate-400">для просмотра экрана</div>
          </div>
          <div className="flex gap-2">
            {(['technician', 'dispatcher', 'admin'] as const).map(role => (
              <button
                key={role}
                onClick={() => {
                  setCurrentRole(role);
                  showToast(`Роль переключена на ${role === 'technician' ? 'мастера' : role === 'dispatcher' ? 'диспетчера' : 'администратора'}`);
                }}
                className={`flex-1 py-2 rounded-xl text-[11px] font-bold transition-all ${
                  currentRole === role 
                    ? 'bg-[#168BEA] text-white shadow' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {role === 'technician' ? 'Мастер' : role === 'dispatcher' ? 'Диспетчер' : 'Админ'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reset Demo */}
      <div className="px-4 mt-5">
        <button
          onClick={() => {
            localStorage.removeItem('fsm_role_selected');
            setHasChosenRole(false);
            resetDemoState();
            showToast('Все демо-данные очищены, можно начинать заново');
          }}
          className="w-full rounded-2xl border border-rose-200 bg-rose-50 text-rose-700 font-bold py-3.5 flex items-center justify-center gap-2 hover:bg-rose-100 transition-all active:scale-[0.98]"
        >
          <RotateCcw className="w-4 h-4" /> Сбросить демо и начать заново
        </button>
      </div>
    </div>
  );
};