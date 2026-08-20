import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TaskListScreen } from './TaskListScreen';
import { ProfileScreen } from './ProfileScreen';
import { ChatScreen } from './ChatScreen';
import { TaskDetailScreen } from './TaskDetailScreen';
import { WorkExecutionScreen } from './WorkExecutionScreen';
import { PhotoReportScreen } from './PhotoReportScreen';
import { CompletionScreen } from './CompletionScreen';
import { RouteMapModal } from './RouteMapModal';
import { IssueModal } from './IssueModal';
import { PdfActModal } from '../shared/PdfActModal';
import { OfflineQueueModal } from '../shared/OfflineQueueModal';
import { ClipboardList, UserCircle2 } from 'lucide-react';

type MobileScreen = 'list' | 'detail' | 'execution' | 'photos' | 'completion';
type MainTab = 'tasks' | 'profile';

/**
 * MobileFrame — полноэкранное рабочее место исполнителя.
 * Рамка «телефона» убрана: интерфейс адаптируется под любой экран
 * (компьютер, планшет, смартфон).
 *
 * По спецификации у бригады в телефоне только 2 раздела:
 * «Мои задачи» и «Профиль».
 */
export const MobileFrame: React.FC = () => {
  const { activeTaskId, setActiveTaskId, activeTask } = useApp();
  const [currentScreen, setCurrentScreen] = useState<MobileScreen>('list');
  const [mainTab, setMainTab] = useState<MainTab>('tasks');
  const [showChat, setShowChat] = useState(false);

  // Modals
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showActModal, setShowActModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);

  const handleSelectTask = (taskId: string) => {
    setActiveTaskId(taskId);
    setCurrentScreen('detail');
  };

  return (
    <div className="w-full h-full min-h-[calc(100vh-80px)]">
      {/* Мобильные экраны на всю ширину */}
      <div className="w-full h-full bg-[#F4F7FA] overflow-hidden flex flex-col relative select-none">
        {/* Active Screen Content */}
        <div className="flex-1 overflow-hidden relative">
          {/* Раздел «Профиль» */}
          {mainTab === 'profile' && !showChat && (
            <ProfileScreen onOpenChat={() => setShowChat(true)} />
          )}

          {/* Чат с диспетчером (из раздела «Профиль») */}
          {mainTab === 'profile' && showChat && (
            <ChatScreen onBack={() => setShowChat(false)} />
          )}

          {/* Раздел «Мои задачи» — внутренние экраны */}
          {mainTab === 'tasks' && currentScreen === 'list' && (
            <TaskListScreen
              onSelectTask={handleSelectTask}
              onOpenSyncModal={() => setShowSyncModal(true)}
            />
          )}

          {mainTab === 'tasks' && currentScreen === 'detail' && activeTask && (
            <TaskDetailScreen
              task={activeTask}
              onBack={() => setCurrentScreen('list')}
              onStartExecution={() => setCurrentScreen('execution')}
              onOpenPhotos={() => setCurrentScreen('photos')}
              onOpenRouteMap={() => setShowRouteModal(true)}
              onOpenIssueModal={() => setShowIssueModal(true)}
              onOpenActPreview={() => setShowActModal(true)}
            />
          )}

          {mainTab === 'tasks' && currentScreen === 'execution' && activeTask && (
            <WorkExecutionScreen
              task={activeTask}
              onBack={() => setCurrentScreen('detail')}
              onOpenPhotos={() => setCurrentScreen('photos')}
              onOpenIssueModal={() => setShowIssueModal(true)}
              onProceedToCompletion={() => setCurrentScreen('completion')}
            />
          )}

          {mainTab === 'tasks' && currentScreen === 'photos' && activeTask && (
            <PhotoReportScreen
              task={activeTask}
              onBack={() => setCurrentScreen(activeTask.status === 'in_progress' ? 'execution' : 'detail')}
            />
          )}

          {mainTab === 'tasks' && currentScreen === 'completion' && activeTask && (
            <CompletionScreen
              task={activeTask}
              onBack={() => setCurrentScreen('execution')}
              onDone={() => setCurrentScreen('list')}
              onOpenActPreview={() => setShowActModal(true)}
            />
          )}
        </div>

        {/* Floating Modals over full screen */}
        {showRouteModal && activeTask && (
          <RouteMapModal task={activeTask} onClose={() => setShowRouteModal(false)} />
        )}

        {showIssueModal && activeTask && (
          <IssueModal task={activeTask} onClose={() => setShowIssueModal(false)} />
        )}

        {showActModal && activeTask && (
          <PdfActModal task={activeTask} onClose={() => setShowActModal(false)} />
        )}

        {showSyncModal && (
          <OfflineQueueModal onClose={() => setShowSyncModal(false)} />
        )}

        {/* Нижняя навигация: 2 раздела (Мои задачи / Профиль) */}
        {!showChat && (
        <nav className="shrink-0 bg-white border-t border-slate-200 px-4 py-2.5 flex items-center justify-around gap-3">
          <button
            onClick={() => {
              setMainTab('tasks');
              setCurrentScreen('list');
            }}
            className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-2xl transition-all active:scale-95 ${
              mainTab === 'tasks' ? 'text-[#168BEA]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <ClipboardList className="w-5 h-5" />
            <span className="text-[10px] font-bold">Мои задачи</span>
          </button>

          <button
            onClick={() => {
              setMainTab('profile');
              setCurrentScreen('list');
            }}
            className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-2xl transition-all active:scale-95 ${
              mainTab === 'profile' ? 'text-[#168BEA]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <UserCircle2 className="w-5 h-5" />
            <span className="text-[10px] font-bold">Профиль</span>
          </button>
        </nav>
        )}
      </div>
    </div>
  );
};
