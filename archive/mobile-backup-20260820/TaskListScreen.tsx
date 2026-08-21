import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Task, TaskStatus } from '../../types';
import { STATUS_CONFIG, PRIORITY_CONFIG, formatDate, formatTime } from '../../utils/statusUtils';
import { 
  Bell, 
  RotateCw, 
  Search, 
  MapPin, 
  Clock, 
  User, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle,
  Filter,
  Wifi,
  WifiOff
} from 'lucide-react';

interface TaskListScreenProps {
  onSelectTask: (taskId: string) => void;
  onOpenSyncModal: () => void;
}

type FilterTab = 'all' | 'in_progress' | 'overdue' | 'new' | 'completed';

export const TaskListScreen: React.FC<TaskListScreenProps> = ({ onSelectTask, onOpenSyncModal }) => {
  const { 
    tasks, 
    currentUser, 
    currentRole, 
    notificationsCount, 
    clearNotifications, 
    isOnline, 
    offlineQueue, 
    isSyncing, 
    syncOfflineQueue,
    showToast 
  } = useApp();

  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Role filter: technicians only see their assigned tasks or unassigned new tasks
      if (currentRole === 'technician') {
        if (task.assignedUserId && task.assignedUserId !== currentUser.id) {
          return false;
        }
      }

      // Tab filter
      if (activeTab === 'in_progress' && task.status !== 'in_progress') {
        return false;
      }
      if (activeTab === 'overdue' && !task.isOverdue) {
        return false;
      }
      if (activeTab === 'new' && task.status !== 'new' && task.status !== 'assigned') {
        return false;
      }
      if (activeTab === 'completed' && task.status !== 'completed' && task.status !== 'under_review') {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(q);
        const matchesNumber = task.number.toLowerCase().includes(q);
        const matchesAddress = task.address.full.toLowerCase().includes(q);
        const matchesCustomer = task.customer.name.toLowerCase().includes(q);
        if (!matchesTitle && !matchesNumber && !matchesAddress && !matchesCustomer) {
          return false;
        }
      }

      return true;
    });
  }, [tasks, currentRole, currentUser, activeTab, searchQuery]);

  const tabs: { id: FilterTab; label: string; count?: number }[] = [
    { id: 'all', label: 'Все' },
    { 
      id: 'in_progress', 
      label: 'В работе',
      count: tasks.filter(t => t.status === 'in_progress').length 
    },
    { 
      id: 'overdue', 
      label: 'Просроченные',
      count: tasks.filter(t => t.isOverdue).length 
    },
    { 
      id: 'new', 
      label: 'Новые',
      count: tasks.filter(t => t.status === 'new' || t.status === 'assigned').length 
    },
    { 
      id: 'completed', 
      label: 'Завершённые',
      count: tasks.filter(t => t.status === 'completed' || t.status === 'under_review').length 
    },
  ];

  return (
    <div className="flex flex-col h-full bg-[#F4F7FA]">
      
      {/* Header */}
      <div className="bg-white px-5 pt-4 pb-3 border-b border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#263238] tracking-tight">
              Список задач
            </h1>
            <p className="text-xs text-[#7D8790]">
              {currentUser.fullName} • {filteredTasks.length} заданий
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Offline / Sync Indicator */}
            <button
              onClick={onOpenSyncModal}
              className={`p-2 rounded-2xl transition-all relative ${
                !isOnline
                  ? 'bg-rose-50 text-rose-600 border border-rose-200'
                  : offlineQueue.length > 0
                  ? 'bg-amber-50 text-amber-600 border border-amber-200'
                  : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
              }`}
              title="Статус синхронизации"
            >
              {isOnline ? (
                <Wifi className="w-4 h-4" />
              ) : (
                <WifiOff className="w-4 h-4" />
              )}
              {offlineQueue.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {offlineQueue.length}
                </span>
              )}
            </button>

            {/* Refresh button */}
            <button
              onClick={() => {
                syncOfflineQueue();
                showToast('Данные обновлены');
              }}
              disabled={isSyncing}
              className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all active:scale-95"
              title="Обновить"
            >
              <RotateCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-[#168BEA]' : ''}`} />
            </button>

            {/* Notification bell */}
            <button
              onClick={clearNotifications}
              className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all relative"
              title="Уведомления"
            >
              <Bell className="w-4 h-4" />
              {notificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {notificationsCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-3 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по названию, адресу, клиенту..."
            className="w-full pl-9 pr-4 py-2 bg-slate-100/90 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#168BEA] border border-transparent transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* Horizontal Filters Ribbon */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 no-scrollbar text-xs font-semibold">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#168BEA] text-white shadow-md shadow-blue-500/20 font-bold'
                    : 'bg-slate-100 text-[#7D8790] hover:bg-slate-200/80'
                }`}
              >
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Task List Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-200/60 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Filter className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-slate-700">Задач не найдено</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              По выбранным фильтрам и параметрам поиска нет подходящих заданий.
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const statusConfig = STATUS_CONFIG[task.status] || STATUS_CONFIG.new;
            const priorityConfig = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
            const completedCount = task.checklist.filter((c) => c.isCompleted).length;
            const totalChecklist = task.checklist.length;
            const isOverdue = task.isOverdue || false;

            return (
              <div
                key={task.id}
                onClick={() => onSelectTask(task.id)}
                className="bg-white rounded-[20px] p-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.08)] border border-slate-100 transition-all duration-200 cursor-pointer active:scale-[0.99] relative overflow-hidden group"
              >
                {/* Accent top line if high priority or overdue */}
                {task.priority === 'urgent' && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500" />
                )}

                {/* Top Row: Indicator + Number + Status */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {/* Status Dot */}
                    <div
                      className={`w-3 h-3 rounded-full shrink-0 ${
                        task.status === 'in_progress' ? 'pulse-active ring-2 ring-blue-400' : ''
                      }`}
                      style={{ backgroundColor: statusConfig.colorHex }}
                    />
                    <span className="text-[11px] font-bold text-slate-400 tracking-wide">
                      {task.number}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Priority Badge */}
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${priorityConfig.bg} ${priorityConfig.text}`}
                    >
                      {priorityConfig.label}
                    </span>

                    {/* Status Badge */}
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold shadow-xs ${statusConfig.badgeBg} ${statusConfig.badgeText}`}
                    >
                      {statusConfig.label}
                    </span>
                  </div>
                </div>

                {/* Job Title */}
                <h3 className="font-bold text-base text-[#263238] group-hover:text-[#168BEA] transition-colors leading-snug">
                  {task.title}
                </h3>

                {/* Address */}
                <div className="flex items-start gap-1.5 mt-1 text-xs text-[#7D8790]">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-1">{task.address.full}</span>
                </div>

                {/* Footer Info Row: Due time + Progress / Tech */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Clock className={`w-3.5 h-3.5 ${isOverdue ? 'text-rose-500 animate-pulse' : 'text-slate-400'}`} />
                    <span className={`text-[11px] ${isOverdue ? 'font-bold text-rose-600' : ''}`}>
                      {formatDate(task.plannedStart)}, {formatTime(task.plannedStart)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Checklist progress pill */}
                    {totalChecklist > 0 && (
                      <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-[#168BEA]" />
                        {completedCount}/{totalChecklist}
                      </span>
                    )}

                    {/* Assigned User Avatar */}
                    {task.assignedUser ? (
                      <div className="flex items-center gap-1">
                        <img
                          src={task.assignedUser.avatar}
                          alt={task.assignedUser.fullName}
                          className="w-5 h-5 rounded-full object-cover border border-slate-200"
                        />
                        <span className="text-[11px] text-slate-600 font-medium hidden sm:inline">
                          {task.assignedUser.fullName.split(' ')[0]}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded-lg">
                        Не назначен
                      </span>
                    )}

                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#168BEA] transition-colors" />
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
