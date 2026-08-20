import React, { useState, useEffect } from 'react';
import { Task, useDB } from '../../db';
import { useAuth } from '../../auth';
import { Calendar, Clock, MapPin, ChevronRight, AlertCircle, CheckCircle } from 'lucide-react';

interface TaskListScreenProps {
  onTaskSelect: (task: Task) => void;
  filter?: 'all' | 'pending' | 'in_progress' | 'completed';
}

export const TaskListScreen: React.FC<TaskListScreenProps> = ({ onTaskSelect, filter = 'all' }) => {
  const { user } = useAuth();
  const db = useDB();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, [filter, user]);

  const loadTasks = async () => {
    if (!user) return;
    setLoading(true);
    try {
      let userTasks = db.tasks.filter(t => t.assignedTo === user.id);
      
      if (filter !== 'all') {
        userTasks = userTasks.filter(t => t.status === filter);
      }

      // Sort: new tasks first, then by priority
      userTasks = userTasks.sort((a, b) => {
        // New unviewed tasks first
        if (a.isNew && !b.isNew) return -1;
        if (!a.isNew && b.isNew) return 1;
        
        // Then by priority
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        
        // Then by creation date
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      setTasks(userTasks);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskClick = async (task: Task) => {
    // Mark task as viewed (remove isNew flag)
    if (task.isNew) {
      const updatedTask: Task = {
        ...task,
        isNew: false,
        viewedAt: new Date().toISOString(),
      };
      db.updateTask(updatedTask);
    }
    onTaskSelect(task);
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent': return '🔴';
      case 'high': return '🟠';
      case 'medium': return '🟡';
      case 'low': return '🟢';
    }
  };

  const isNewTask = (task: Task): boolean => {
    // Task is new if it has isNew flag OR was created in the last 24 hours and not viewed
    if (task.isNew) return true;
    if (!task.viewedAt) {
      const created = new Date(task.createdAt);
      const now = new Date();
      const hoursDiff = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
      return hoursDiff < 24;
    }
    return false;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-gray-600">Нет задач</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map(task => {
        const isTaskNew = isNewTask(task);
        
        return (
          <div
            key={task.id}
            onClick={() => handleTaskClick(task)}
            className={`
              relative p-4 rounded-xl cursor-pointer transition-all duration-200
              hover:shadow-md active:scale-[0.98]
              ${isTaskNew 
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400 shadow-green-100' 
                : 'bg-white border border-gray-200'
              }
            `}
          >
            {/* Green "NEW" badge for new tasks */}
            {isTaskNew && (
              <div className="absolute -top-2 -right-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-green-500 text-white shadow-lg">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  NEW
                </span>
              </div>
            )}

            {/* Green left border indicator */}
            {isTaskNew && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-green-400 to-emerald-500 rounded-l-xl" />
            )}

            <div className={isTaskNew ? 'ml-1' : ''}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className={`font-semibold text-lg ${isTaskNew ? 'text-green-900' : 'text-gray-900'}`}>
                    {task.title}
                  </h3>
                  <p className={`text-sm mt-1 ${isTaskNew ? 'text-green-700' : 'text-gray-600'} line-clamp-2`}>
                    {task.description}
                  </p>
                </div>
                <ChevronRight className={`w-5 h-5 ${isTaskNew ? 'text-green-600' : 'text-gray-400'}`} />
              </div>

              <div className="flex items-center gap-3 mt-3 flex-wrap">
                <span className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(task.status)}`}>
                  {task.status === 'pending' && 'Ожидает'}
                  {task.status === 'in_progress' && 'В работе'}
                  {task.status === 'completed' && 'Завершено'}
                  {task.status === 'cancelled' && 'Отменено'}
                </span>

                <div className="flex items-center gap-1 text-xs text-gray-500">
                  {getPriorityIcon(task.priority)}
                  <span>
                    {task.priority === 'urgent' && 'Срочно'}
                    {task.priority === 'high' && 'Высокий'}
                    {task.priority === 'medium' && 'Средний'}
                    {task.priority === 'low' && 'Низкий'}
                  </span>
                </div>

                {task.dueDate && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(task.dueDate).toLocaleDateString('ru-RU')}</span>
                  </div>
                )}

                {task.location && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate max-w-[150px]">{task.location}</span>
                  </div>
                )}
              </div>

              {/* New task pulsing indicator */}
              {isTaskNew && (
                <div className="absolute top-2 right-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
