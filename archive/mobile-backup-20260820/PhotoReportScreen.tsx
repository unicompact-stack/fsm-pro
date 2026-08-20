import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Task, PhotoCategory, TaskPhoto } from '../../types';
import { PHOTO_CATEGORY_CONFIG, formatDateTime } from '../../utils/statusUtils';
import { 
  ArrowLeft, 
  Camera, 
  Upload, 
  Trash2, 
  Maximize2, 
  X, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Sparkles,
  Plus,
  MessageSquare,
  AlertCircle,
  Image as ImageIcon
} from 'lucide-react';

interface PhotoReportScreenProps {
  task: Task;
  onBack: () => void;
}

// Sample realistic preset photos for instant testing
const SAMPLE_PRESETS: { url: string; label: string; category: PhotoCategory }[] = [
  {
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80',
    label: 'Оконный проем до работ',
    category: 'before',
  },
  {
    url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&auto=format&fit=crop&q=80',
    label: 'Общий вид помещения',
    category: 'before',
  },
  {
    url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
    label: 'Монтаж и выравнивание рамы',
    category: 'process',
  },
  {
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80',
    label: 'Итоговый результат с откосами',
    category: 'result',
  },
  {
    url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=80',
    label: 'Герметизация швов снаружи',
    category: 'result',
  },
  {
    url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=80',
    label: 'Панорамный вид готового объекта',
    category: 'result',
  },
];

export const PhotoReportScreen: React.FC<PhotoReportScreenProps> = ({ task, onBack }) => {
  const { addPhoto, deletePhoto, showToast } = useApp();
  const [activeCategory, setActiveCategory] = useState<PhotoCategory>('before');
  const [selectedPhotoForView, setSelectedPhotoForView] = useState<TaskPhoto | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPhotoComment, setNewPhotoComment] = useState('');
  const [newPhotoUrl, setNewPhotoUrl] = useState(SAMPLE_PRESETS[0].url);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const categories: PhotoCategory[] = ['before', 'process', 'result', 'defects', 'materials', 'documents'];

  const photosInCategory = task.photos.filter((p) => p.category === activeCategory);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      addPhoto(task.id, {
        taskId: task.id,
        url: dataUrl,
        category: activeCategory,
        comment: newPhotoComment || 'Снимок с камеры устройства',
        fileSizeKb: Math.round(file.size / 1024),
      });
      setShowAddModal(false);
      setNewPhotoComment('');
    };
    reader.readAsDataURL(file);
  };

  const handleAddPresetPhoto = () => {
    addPhoto(task.id, {
      taskId: task.id,
      url: newPhotoUrl,
      category: activeCategory,
      comment: newPhotoComment || PHOTO_CATEGORY_CONFIG[activeCategory].label,
      fileSizeKb: 480,
    });
    setShowAddModal(false);
    setNewPhotoComment('');
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
            <h2 className="font-bold text-base text-[#263238]">Фотоотчёт</h2>
            <p className="text-[11px] text-slate-400">
              Всего загружено: {task.photos.length} фото
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 bg-[#168BEA] hover:bg-[#1277c9] text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all"
        >
          <Camera className="w-3.5 h-3.5" />
          Добавить
        </button>
      </div>

      {/* Category Filter Ribbon */}
      <div className="bg-white px-4 py-2.5 border-b border-slate-100 flex gap-2 overflow-x-auto no-scrollbar shrink-0">
        {categories.map((cat) => {
          const config = PHOTO_CATEGORY_CONFIG[cat];
          const count = task.photos.filter((p) => p.category === cat).length;
          const isSelected = activeCategory === cat;
          const isComplete = count >= config.minRequired;

          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-2xl whitespace-nowrap text-xs transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-[#168BEA] text-white font-bold shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{config.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isSelected
                    ? 'bg-white/25 text-white'
                    : isComplete && config.minRequired > 0
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {count}
                {config.minRequired > 0 ? `/${config.minRequired}` : ''}
              </span>
            </button>
          );
        })}
      </div>

      {/* Category Requirement Hint Bar */}
      <div className="px-4 py-2 bg-blue-50/80 border-b border-blue-100 flex items-center justify-between text-xs text-blue-900">
        <span className="truncate">{PHOTO_CATEGORY_CONFIG[activeCategory].desc}</span>
        {PHOTO_CATEGORY_CONFIG[activeCategory].minRequired > 0 && (
          <span className="font-bold shrink-0 ml-2">
            Мин: {PHOTO_CATEGORY_CONFIG[activeCategory].minRequired} шт.
          </span>
        )}
      </div>

      {/* Photos Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {photosInCategory.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-200/60 shadow-xs space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#168BEA] flex items-center justify-center mx-auto">
              <Camera className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-sm text-slate-800">
              Нет фотографий в категории «{PHOTO_CATEGORY_CONFIG[activeCategory].label}»
            </h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Сделайте снимок с камеры смартфона или выберите готовые фото-пресеты для проверки.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-2 bg-[#168BEA] text-white px-4 py-2 rounded-xl text-xs font-bold shadow hover:bg-blue-600 transition-all inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Сделать первое фото
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {photosInCategory.map((photo) => (
              <div
                key={photo.id}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs group relative flex flex-col"
              >
                {/* Image Thumbnail */}
                <div
                  onClick={() => setSelectedPhotoForView(photo)}
                  className="relative aspect-4/3 cursor-pointer overflow-hidden bg-slate-100"
                >
                  <img
                    src={photo.url}
                    alt={photo.comment || 'Photo'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                    <span className="text-[10px] text-white font-medium flex items-center gap-1">
                      <Maximize2 className="w-3 h-3" /> На весь экран
                    </span>
                  </div>

                  {/* Sync status badge */}
                  <span
                    className={`absolute top-2 left-2 text-[9px] px-1.5 py-0.5 rounded-md font-bold text-white shadow ${
                      photo.syncStatus === 'synced' ? 'bg-emerald-500/90' : 'bg-amber-500/90'
                    }`}
                  >
                    {photo.syncStatus === 'synced' ? '✓ На сервере' : '⏳ В очереди'}
                  </span>

                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePhoto(task.id, photo.id);
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-rose-500/90 hover:bg-rose-600 text-white rounded-lg shadow active:scale-90 transition-all"
                    title="Удалить фото"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>

                {/* Caption / Metadata */}
                <div className="p-2.5 flex-1 flex flex-col justify-between space-y-1">
                  <p className="text-[11px] font-semibold text-slate-800 line-clamp-2">
                    {photo.comment || 'Без комментария'}
                  </p>
                  <div className="text-[9px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100">
                    <span>{formatDateTime(photo.createdAt).split(',')[1]}</span>
                    <span>{photo.fileSizeKb} КБ</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Photo Modal / Sheet */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full shadow-2xl overflow-hidden p-5 space-y-4 animate-in slide-in-from-bottom duration-300">
            
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-[#168BEA]" />
                <h3 className="font-bold text-sm text-slate-900">
                  Добавить фото: {PHOTO_CATEGORY_CONFIG[activeCategory].label}
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Photo Selection / Camera upload */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Источник фото:</label>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3.5 rounded-2xl border-2 border-dashed border-[#168BEA]/40 bg-blue-50/50 hover:bg-blue-50 flex flex-col items-center justify-center gap-1.5 transition-all text-center"
                >
                  <Camera className="w-5 h-5 text-[#168BEA]" />
                  <span className="text-xs font-bold text-[#168BEA]">Камера / Галерея</span>
                  <span className="text-[10px] text-slate-400">Файл со смартфона</span>
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFileUpload}
                />

                <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-1 text-center">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <span className="text-xs font-bold text-slate-800">Быстрый шаблон</span>
                  <span className="text-[10px] text-slate-400">Демо-фото объекта</span>
                </div>
              </div>
            </div>

            {/* Presets List */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Или выберите образец снимка:</label>
              <div className="grid grid-cols-3 gap-2">
                {SAMPLE_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setNewPhotoUrl(preset.url);
                      setNewPhotoComment(preset.label);
                    }}
                    className={`aspect-4/3 rounded-xl overflow-hidden border-2 transition-all relative group ${
                      newPhotoUrl === preset.url ? 'border-[#168BEA] ring-2 ring-blue-400' : 'border-transparent opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                    {newPhotoUrl === preset.url && (
                      <div className="absolute inset-0 bg-[#168BEA]/30 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Comment input */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Комментарий к снимку:</label>
              <input
                type="text"
                value={newPhotoComment}
                onChange={(e) => setNewPhotoComment(e.target.value)}
                placeholder="Например: Проверка вертикали оконной рамы..."
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#168BEA]"
              />
            </div>

            {/* Submit */}
            <button
              onClick={handleAddPresetPhoto}
              className="w-full bg-[#168BEA] hover:bg-[#1277c9] text-white font-bold py-3 rounded-2xl text-xs shadow-lg shadow-blue-500/25 active:scale-98 transition-all"
            >
              Загрузить в отчёт (WebP 480 КБ)
            </button>

          </div>
        </div>
      )}

      {/* Fullscreen Photo Lightbox Modal */}
      {selectedPhotoForView && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 animate-in fade-in">
          {/* Top Bar */}
          <div className="flex items-center justify-between text-white border-b border-white/10 pb-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                {PHOTO_CATEGORY_CONFIG[selectedPhotoForView.category].label}
              </span>
              <p className="text-xs text-slate-300 mt-0.5">
                {selectedPhotoForView.comment || 'Фотоотчёт'}
              </p>
            </div>
            <button
              onClick={() => setSelectedPhotoForView(null)}
              className="p-2 text-white/80 hover:text-white rounded-full bg-white/10 hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Full Photo */}
          <div className="flex-1 flex items-center justify-center p-2">
            <img
              src={selectedPhotoForView.url}
              alt="Fullscreen"
              className="max-h-[70vh] max-w-full object-contain rounded-2xl shadow-2xl"
            />
          </div>

          {/* Bottom EXIF & Metadata Bar */}
          <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-3.5 text-xs text-slate-300 border border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div>
              <span className="text-[10px] text-slate-400 block">Дата и время:</span>
              <span className="font-semibold text-white">{formatDateTime(selectedPhotoForView.createdAt)}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Автор:</span>
              <span className="font-semibold text-white">{selectedPhotoForView.createdBy}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Геолокация:</span>
              <span className="font-semibold text-white">55.75124, 37.61842</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Статус синхронизации:</span>
              <span className="font-semibold text-emerald-400">
                {selectedPhotoForView.syncStatus === 'synced' ? '✓ Сохранено в S3' : '⏳ В локальном буфере'}
              </span>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
