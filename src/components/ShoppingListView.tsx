import React, { useState } from 'react';
import {
  ShoppingBag,
  Plus,
  Trash2,
  Check,
  Copy,
  ExternalLink,
  Truck,
  Sparkles,
  CheckCircle2,
  Send,
  Zap,
  ArrowRight
} from 'lucide-react';
import { ShoppingItem, DeliveryService } from '../types/index.ts';
import { DELIVERY_SERVICES } from '../data/demoData.ts';

interface ShoppingListViewProps {
  items: ShoppingItem[];
  onToggleItem: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onAddItem: (name: string, amount: string, category: string) => void;
  onClearCompleted: () => void;
  onClearAll: () => void;
}

export const ShoppingListView: React.FC<ShoppingListViewProps> = ({
  items,
  onToggleItem,
  onDeleteItem,
  onAddItem,
  onClearCompleted,
  onClearAll,
}) => {
  const [newItemName, setNewItemName] = useState('');
  const [newItemAmount, setNewItemAmount] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Овощи и зелень');
  const [selectedService, setSelectedService] = useState<DeliveryService>(DELIVERY_SERVICES[0]);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced'>('idle');
  const [copiedMessage, setCopiedMessage] = useState(false);

  const activeItems = items.filter((i) => !i.checked);
  const completedItems = items.filter((i) => i.checked);
  const estimatedCost = activeItems.length * 125; // Average supermarket ruble cost

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    onAddItem(newItemName.trim(), newItemAmount.trim() || '1 шт', newItemCategory);
    setNewItemName('');
    setNewItemAmount('');
  };

  const handleSyncDelivery = () => {
    setSyncStatus('syncing');
    setTimeout(() => {
      setSyncStatus('synced');
    }, 1200);
  };

  const copyShoppingListText = () => {
    if (items.length === 0) return;
    const text = [
      '🛒 Список покупок из «Шеф-Фридж»:',
      ...activeItems.map((i) => `• ${i.name} — ${i.amount}${i.fromRecipeTitle ? ` (для «${i.fromRecipeTitle}»)` : ''}`),
      '',
      `Всего позиций: ${activeItems.length}`,
      `Примерная сумма: ~${estimatedCost} ₽`,
    ].join('\n');

    navigator.clipboard.writeText(text);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2500);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md">
              Умные покупки
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Список недостающих продуктов
          </h1>
          <p className="text-sm text-emerald-100 mt-1 max-w-xl">
            Сюда попадают ингредиенты из выбранных рецептов. Вы можете синхронизировать корзину с любимым сервисом экспресс-доставки.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-5 text-center shrink-0 min-w-[200px]">
          <span className="block text-xs uppercase tracking-wider text-emerald-200 font-bold">
            Ориентировочная сумма
          </span>
          <span className="text-3xl font-black font-mono mt-0.5 block">
            ~{estimatedCost} ₽
          </span>
          <span className="text-[11px] text-emerald-200/90 block mt-1">
            {activeItems.length} {activeItems.length === 1 ? 'продукт' : 'продуктов'} к покупке
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Items List & Add Form */}
        <div className="lg:col-span-7 space-y-6">
          {/* Add custom item form */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 sm:p-6 shadow-sm">
            <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm mb-3 flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Добавить продукт в список
            </h3>
            <form onSubmit={handleAdd} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="Название (например, «Греческий йогурт»)"
                  className="sm:col-span-6 px-4 py-2.5 rounded-xl text-xs sm:text-sm border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <input
                  type="text"
                  value={newItemAmount}
                  onChange={(e) => setNewItemAmount(e.target.value)}
                  placeholder="Количество (200 г / 1 уп)"
                  className="sm:col-span-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <select
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value)}
                  className="sm:col-span-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Овощи и зелень">Овощи и зелень</option>
                  <option value="Молочные продукты">Молочные продукты</option>
                  <option value="Мясо и птица">Мясо и птица</option>
                  <option value="Бакалея и специи">Бакалея и соусы</option>
                  <option value="Выпечка и хлеб">Выпечка и хлеб</option>
                  <option value="Другое">Другое</option>
                </select>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!newItemName.trim()}
                  className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Добавить</span>
                </button>
              </div>
            </form>
          </div>

          {/* List Controls & Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={copyShoppingListText}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {copiedMessage ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedMessage ? 'Скопировано!' : 'Скопировать список'}</span>
              </button>

              {completedItems.length > 0 && (
                <button
                  onClick={onClearCompleted}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors cursor-pointer"
                >
                  Удалить купленные ({completedItems.length})
                </button>
              )}
            </div>

            {items.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-xs text-rose-500 hover:underline cursor-pointer"
              >
                Очистить все
              </button>
            )}
          </div>

          {/* Active Items */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-3">
            <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm flex items-center justify-between">
              <span>Нужно купить ({activeItems.length})</span>
            </h3>

            {activeItems.length === 0 ? (
              <div className="text-center py-8 text-stone-400 dark:text-stone-500">
                <ShoppingBag className="w-10 h-10 mx-auto mb-2 stroke-1" />
                <p className="text-sm font-semibold">Список покупок пуст</p>
                <p className="text-xs">Все продукты есть в вашем холодильнике!</p>
              </div>
            ) : (
              <div className="divide-y divide-stone-100 dark:divide-stone-800">
                {activeItems.map((item) => (
                  <div
                    key={item.id}
                    className="py-3 flex items-center justify-between gap-3 group"
                  >
                    <label className="flex items-center gap-3 cursor-pointer flex-1 select-none">
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => onToggleItem(item.id)}
                        className="w-5 h-5 rounded-md text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
                      />
                      <div>
                        <span className="font-semibold text-stone-900 dark:text-stone-100 text-sm block">
                          {item.name}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
                          <span>{item.amount}</span>
                          <span>•</span>
                          <span>{item.category}</span>
                          {item.fromRecipeTitle && (
                            <>
                              <span>•</span>
                              <span className="text-emerald-600 dark:text-emerald-400 truncate max-w-[180px]">
                                из «{item.fromRecipeTitle}»
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </label>

                    <button
                      onClick={() => onDeleteItem(item.id)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                      title="Удалить"
                      aria-label={`Удалить ${item.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Already Bought Items */}
          {completedItems.length > 0 && (
            <div className="bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 sm:p-6">
              <h3 className="font-bold text-stone-500 dark:text-stone-400 text-xs uppercase tracking-wider mb-3">
                Уже куплено ({completedItems.length})
              </h3>
              <div className="space-y-2">
                {completedItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-1.5">
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => onToggleItem(item.id)}
                        className="w-4 h-4 rounded text-emerald-600 accent-emerald-600 cursor-pointer"
                      />
                      <span className="text-xs text-stone-400 dark:text-stone-500 line-through">
                        {item.name} ({item.amount})
                      </span>
                    </label>
                    <button
                      onClick={() => onDeleteItem(item.id)}
                      className="text-stone-400 hover:text-rose-500 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Delivery Service Synchronization */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 sm:p-7 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Truck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="font-extrabold text-stone-900 dark:text-stone-100 text-lg">
                Синхронизация с доставкой
              </h2>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mb-5">
              Экспортируйте недостающие продукты прямо в корзину любого популярного сервиса в 1 клик
            </p>

            {/* Delivery Service Selection */}
            <div className="space-y-2.5 mb-6">
              {DELIVERY_SERVICES.map((service) => {
                const isSelected = selectedService.id === service.id;
                return (
                  <div
                    key={service.id}
                    onClick={() => {
                      setSelectedService(service);
                      setSyncStatus('idle');
                    }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-xs'
                        : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{service.logo}</span>
                      <div>
                        <span className="font-bold text-sm text-stone-900 dark:text-stone-100 block">
                          {service.name}
                        </span>
                        <span className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1">
                          <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                          Доставка: {service.deliveryTime}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isSelected && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sync Action & Feedback Card */}
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-600 dark:text-stone-400 font-medium">Сервис:</span>
                <span className="font-bold text-stone-900 dark:text-stone-100">{selectedService.name}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-600 dark:text-stone-400 font-medium">Позиций для передачи:</span>
                <span className="font-bold font-mono text-stone-900 dark:text-stone-100">{activeItems.length} шт</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-600 dark:text-stone-400 font-medium">Ориентировочно:</span>
                <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">~{estimatedCost} ₽</span>
              </div>

              {syncStatus === 'synced' ? (
                <div className="p-3.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Корзина сформирована в {selectedService.name}!</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Все {activeItems.length} позиций сопоставлены в каталоге. Курьер сможет привезти заказ за {selectedService.deliveryTime}.
                  </p>
                  <a
                    href="https://eda.yandex.ru"
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors shadow-xs"
                  >
                    <span>Перейти к оформлению заказа</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ) : (
                <button
                  onClick={handleSyncDelivery}
                  disabled={activeItems.length === 0 || syncStatus === 'syncing'}
                  className="w-full py-3 px-4 rounded-xl font-extrabold text-xs sm:text-sm bg-stone-900 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  {syncStatus === 'syncing' ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin text-emerald-400" />
                      <span>Сопоставление товаров в каталоге...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Синхронизировать с {selectedService.name}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
