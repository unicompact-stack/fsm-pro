import React, { useState } from 'react';
import { Task } from '../../types';
import { X, Navigation, Phone, MapPin, Compass, ExternalLink, Car, Layers } from 'lucide-react';

interface RouteMapModalProps {
  task: Task;
  onClose: () => void;
}

export const RouteMapModal: React.FC<RouteMapModalProps> = ({ task, onClose }) => {
  const [mapProvider, setMapProvider] = useState<'yandex' | '2gis' | 'osm'>('yandex');

  const openExternalNavigator = (app: 'yandex' | '2gis' | 'google') => {
    const { lat, lng } = task.address;
    let url = '';
    if (app === 'yandex') {
      url = `https://yandex.ru/maps/?rtext=~${lat},${lng}&rtt=auto`;
    } else if (app === '2gis') {
      url = `https://2gis.ru/routeSearch/rsType/car/to/${lng},${lat}`;
    } else {
      url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    }
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#168BEA] flex items-center justify-center text-white">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Маршрут на объект</h3>
              <p className="text-[11px] text-slate-400">18 минут (8.4 км) без пробок</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Map Canvas / Simulated Interactive Map */}
        <div className="relative h-64 bg-slate-200 overflow-hidden select-none">
          {/* Simulated Map Visuals */}
          <div className="absolute inset-0 bg-[#E8ECEF] flex items-center justify-center">
            {/* Map Roads Vector SVG */}
            <svg className="w-full h-full opacity-60" viewBox="0 0 400 300" preserveAspectRatio="none">
              <path d="M0,50 Q120,80 200,50 T400,120" stroke="#CBD5E1" strokeWidth="14" fill="none" />
              <path d="M50,0 Q80,150 120,300" stroke="#CBD5E1" strokeWidth="12" fill="none" />
              <path d="M320,0 L300,300" stroke="#CBD5E1" strokeWidth="10" fill="none" />
              <path d="M0,220 L400,180" stroke="#CBD5E1" strokeWidth="16" fill="none" />
              {/* Active Blue Route */}
              <path d="M70,240 Q130,190 200,160 T310,95" stroke="#168BEA" strokeWidth="6" strokeLinecap="round" strokeDasharray="8 4" fill="none" />
            </svg>

            {/* User Location Marker (Master) */}
            <div className="absolute left-[65px] top-[230px] flex flex-col items-center">
              <div className="w-5 h-5 rounded-full bg-[#168BEA] border-2 border-white shadow-lg pulse-active" />
              <span className="text-[9px] font-bold bg-slate-900 text-white px-1.5 py-0.5 rounded shadow mt-1">
                Вы здесь
              </span>
            </div>

            {/* Destination Marker */}
            <div className="absolute left-[300px] top-[75px] flex flex-col items-center animate-bounce">
              <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg border-2 border-white">
                <MapPin className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold bg-rose-600 text-white px-2 py-0.5 rounded shadow mt-0.5">
                Объект #{task.number}
              </span>
            </div>
          </div>

          {/* Map Layer Switcher */}
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md rounded-xl p-1 shadow-md border border-slate-200/80 flex gap-1 text-[11px] font-bold">
            <button
              onClick={() => setMapProvider('yandex')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                mapProvider === 'yandex' ? 'bg-[#168BEA] text-white shadow' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Яндекс Карты
            </button>
            <button
              onClick={() => setMapProvider('2gis')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                mapProvider === '2gis' ? 'bg-[#168BEA] text-white shadow' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              2ГИС
            </button>
            <button
              onClick={() => setMapProvider('osm')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                mapProvider === 'osm' ? 'bg-[#168BEA] text-white shadow' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              OSM
            </button>
          </div>

          {/* Compass / Traffic Badge */}
          <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur rounded-xl px-2.5 py-1 text-[10px] font-semibold text-slate-700 shadow border">
            🚦 Пробки: 3 балла
          </div>
        </div>

        {/* Address & Contacts Card */}
        <div className="p-4 space-y-4 overflow-y-auto">
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-5 h-5 text-[#168BEA] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-slate-900">{task.address.full}</h4>
                <div className="flex flex-wrap gap-2 mt-1.5 text-xs text-slate-600">
                  {task.address.entrance && (
                    <span className="bg-white px-2 py-0.5 rounded-md border border-slate-200">
                      Подъезд: <b className="text-slate-800">{task.address.entrance}</b>
                    </span>
                  )}
                  {task.address.floor && (
                    <span className="bg-white px-2 py-0.5 rounded-md border border-slate-200">
                      Этаж: <b className="text-slate-800">{task.address.floor}</b>
                    </span>
                  )}
                  {task.address.apartment && (
                    <span className="bg-white px-2 py-0.5 rounded-md border border-slate-200">
                      Кв./Офис: <b className="text-slate-800">{task.address.apartment}</b>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {task.customer.comment && (
              <div className="text-xs bg-amber-50 border border-amber-200/60 p-2 rounded-xl text-amber-900">
                💬 {task.customer.comment}
              </div>
            )}
          </div>

          {/* Client phone bar */}
          <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-[#168BEA] font-bold flex items-center justify-center text-sm">
                {task.customer.name.substring(0, 1)}
              </div>
              <div>
                <div className="font-bold text-xs text-slate-900">{task.customer.name}</div>
                <div className="text-[11px] text-slate-500">{task.customer.phone}</div>
              </div>
            </div>
            <a
              href={`tel:${task.customer.phone.replace(/[^0-9+]/g, '')}`}
              className="flex items-center gap-1.5 bg-[#2CCB70] hover:bg-[#25b563] text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
            >
              <Phone className="w-3.5 h-3.5" />
              Позвонить
            </a>
          </div>

          {/* Action buttons: launch in native navs */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Открыть в навигаторе:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => openExternalNavigator('yandex')}
                className="flex items-center justify-center gap-2 bg-[#FC3F1D] text-white font-bold py-2.5 px-3 rounded-xl text-xs shadow hover:opacity-90 active:scale-95 transition-all"
              >
                <Navigation className="w-4 h-4" />
                Яндекс Навигатор
              </button>
              <button
                onClick={() => openExternalNavigator('2gis')}
                className="flex items-center justify-center gap-2 bg-[#2DA832] text-white font-bold py-2.5 px-3 rounded-xl text-xs shadow hover:opacity-90 active:scale-95 transition-all"
              >
                <Car className="w-4 h-4" />
                2ГИС Маршрут
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
