import React, { useState, useRef } from 'react';
import { Camera, Upload, Sparkles, Plus, Trash2, Check, RefreshCw, AlertCircle, Info } from 'lucide-react';
import { FRIDGE_PRESETS, FridgePreset } from '../data/demoData.ts';

interface FridgeScannerProps {
  currentImage: string | null;
  onImageSelected: (base64: string, preset?: FridgePreset) => void;
  isAnalyzing: boolean;
  ingredients: string[];
  onAddIngredient: (name: string) => void;
  onRemoveIngredient: (index: number) => void;
  fridgeSummary?: string;
  storageTips?: string[];
  onGenerateRecipes: () => void;
}

export const FridgeScanner: React.FC<FridgeScannerProps> = ({
  currentImage,
  onImageSelected,
  isAnalyzing,
  ingredients,
  onAddIngredient,
  onRemoveIngredient,
  fridgeSummary,
  storageTips,
  onGenerateRecipes,
}) => {
  const [newIngredient, setNewIngredient] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onImageSelected(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIngredient.trim()) return;
    onAddIngredient(newIngredient.trim());
    setNewIngredient('');
  };

  return (
    <section className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 sm:p-7 shadow-sm transition-all duration-200">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
        {/* Upload & Preview Zone */}
        <div className="w-full lg:w-5/12 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Camera className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Снимок содержимого
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Сделайте фото полок или загрузите изображение
              </p>
            </div>
            {currentImage && (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isAnalyzing}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Сменить фото
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFile(e.target.files[0]);
              }
            }}
          />

          {currentImage ? (
            <div className="relative rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-700 bg-stone-950 aspect-video sm:aspect-4/3 group shadow-inner">
              <img
                src={currentImage}
                alt="Содержимое холодильника"
                className="w-full h-full object-cover"
              />

              {/* Scanning visual overlay */}
              {isAnalyzing && (
                <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-[2px] flex flex-col items-center justify-center p-4">
                  <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] animate-pulse top-1/2 -translate-y-1/2" />
                  <div className="bg-stone-900/90 border border-emerald-500/40 rounded-2xl px-5 py-3 text-center shadow-2xl">
                    <Sparkles className="w-6 h-6 text-emerald-400 mx-auto animate-spin mb-2" />
                    <p className="text-sm font-semibold text-emerald-100">
                      ИИ Gemini анализирует продукты...
                    </p>
                    <p className="text-xs text-emerald-300/80 mt-1">
                      Распознаем овощи, молочные продукты и мясо
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`rounded-2xl border-2 border-dashed p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
                  : 'border-stone-300 dark:border-stone-700 hover:border-emerald-500/60 dark:hover:border-emerald-500/60 bg-stone-50/50 dark:bg-stone-800/40'
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mb-3 shadow-inner">
                <Upload className="w-7 h-7" />
              </div>
              <p className="text-sm font-semibold text-stone-800 dark:text-stone-200">
                Нажмите для загрузки или перетащите фото
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-xs">
                Поддерживаются JPG, PNG, WEBP. Камера смартфона открывается автоматически
              </p>
            </div>
          )}

          {/* Quick Preset Selector for instant testing */}
          <div>
            <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider block mb-2">
              Или протестируйте готовый пример:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {FRIDGE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => onImageSelected(preset.imageUrl, preset)}
                  disabled={isAnalyzing}
                  className="flex flex-col items-center p-2 rounded-xl border border-stone-200 dark:border-stone-700 hover:border-emerald-500/80 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 text-center transition-all cursor-pointer text-xs"
                >
                  <span className="text-xl mb-1">{preset.thumbnail}</span>
                  <span className="font-semibold text-stone-800 dark:text-stone-200 line-clamp-1">
                    {preset.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Recognized Ingredients & Controls */}
        <div className="w-full lg:w-7/12 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Распознанные ингредиенты ({ingredients.length})
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                ИИ автоматически составил список продуктов. Вы можете дополнить его
              </p>
            </div>

            <button
              onClick={onGenerateRecipes}
              disabled={ingredients.length === 0 || isAnalyzing}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Обновить рецепты</span>
            </button>
          </div>

          {/* Fridge Summary banner */}
          {fridgeSummary && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-3">
              <Info className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-emerald-900 dark:text-emerald-200 leading-relaxed">
                {fridgeSummary}
              </div>
            </div>
          )}

          {/* Ingredients Tag Cloud */}
          <div className="min-h-[140px] p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700/60">
            {ingredients.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-stone-400 dark:text-stone-500">
                <AlertCircle className="w-8 h-8 mb-2 stroke-1" />
                <p className="text-sm font-medium">Продукты еще не распознаны</p>
                <p className="text-xs">Загрузите фотографию или выберите один из пресетов слева</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {ingredients.map((item, index) => (
                  <div
                    key={`${item}-${index}`}
                    className="group inline-flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-xl bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 text-stone-800 dark:text-stone-100 text-xs sm:text-sm shadow-xs font-medium transition-all hover:border-emerald-400"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{item}</span>
                    <button
                      onClick={() => onRemoveIngredient(index)}
                      className="p-1 rounded-md text-stone-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                      title="Удалить продукт"
                      aria-label={`Удалить ${item}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add custom ingredient input */}
          <form onSubmit={handleManualAdd} className="flex gap-2">
            <input
              type="text"
              value={newIngredient}
              onChange={(e) => setNewIngredient(e.target.value)}
              placeholder="Добавить продукт вручную (например, «Сметана 15%»)"
              className="flex-1 px-4 py-2.5 rounded-xl text-xs sm:text-sm border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-stone-400"
            />
            <button
              type="submit"
              disabled={!newIngredient.trim()}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-800 disabled:opacity-40 transition-all flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Добавить</span>
            </button>
          </form>

          {/* Storage tips */}
          {storageTips && storageTips.length > 0 && (
            <div className="mt-1 pt-3 border-t border-stone-200 dark:border-stone-800">
              <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider block mb-1.5">
                💡 Советы шефа по хранению:
              </span>
              <ul className="text-xs text-stone-600 dark:text-stone-300 space-y-1">
                {storageTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
