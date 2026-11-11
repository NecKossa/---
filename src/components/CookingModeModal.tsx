import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Volume2,
  VolumeX,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
  CheckCircle,
  Plus,
  RotateCcw,
  ChefHat,
  Type,
  Bell,
  Utensils
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Recipe } from '../types/index.ts';
import { tts } from '../utils/tts.ts';

interface CookingModeModalProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
  onAddMissingToShopping: (recipe: Recipe) => void;
  onFinishMeal: (recipe: Recipe) => void;
}

export const CookingModeModal: React.FC<CookingModeModalProps> = ({
  recipe,
  isOpen,
  onClose,
  onAddMissingToShopping,
  onFinishMeal,
}) => {
  if (!isOpen || !recipe) return null;

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [fontSizeLevel, setFontSizeLevel] = useState<'normal' | 'large' | 'huge'>('large');
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [missingAdded, setMissingAdded] = useState(false);

  // Kitchen countdown timer
  const currentStep = recipe.steps[currentStepIndex] || {
    stepNumber: 1,
    instruction: 'Приступайте к приготовлению',
    durationMinutes: 5,
  };

  const initialSeconds = (currentStep.durationMinutes || 3) * 60;
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Reset timer on step change
  useEffect(() => {
    setTimeLeft((currentStep.durationMinutes || 3) * 60);
    setIsTimerRunning(false);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
  }, [currentStepIndex, currentStep.durationMinutes]);

  // Timer tick
  useEffect(() => {
    if (isTimerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current!);
            setIsTimerRunning(false);
            // Audio alert via TTS
            tts.speak('Время шага истекло! Проверьте готовность блюда.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimerRunning]);

  // Voice narration when step changes if autoSpeak is on
  useEffect(() => {
    if (autoSpeak) {
      speakCurrentStep();
    }
    return () => {
      tts.stop();
    };
  }, [currentStepIndex, autoSpeak]);

  const speakCurrentStep = () => {
    tts.stop();
    const textToRead = `Шаг ${currentStep.stepNumber}. ${currentStep.instruction}. ${
      currentStep.tip ? `Совет шефа: ${currentStep.tip}` : ''
    }`;
    setIsSpeaking(true);
    tts.speak(textToRead, {
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const handleStopSpeech = () => {
    tts.stop();
    setIsSpeaking(false);
  };

  const handleNextStep = () => {
    if (currentStepIndex < recipe.steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleFinishCooking = () => {
    tts.stop();
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch {
      // Confetti fallback
    }
    tts.speak('Поздравляем! Блюдо успешно приготовлено. Приятного аппетита!');
    onFinishMeal(recipe);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Font size classes for hands-free reading
  const instructionFontClass = {
    normal: 'text-lg sm:text-xl md:text-2xl leading-relaxed',
    large: 'text-2xl sm:text-3xl md:text-4xl leading-snug font-bold',
    huge: 'text-3xl sm:text-4xl md:text-5xl leading-tight font-extrabold tracking-tight',
  }[fontSizeLevel];

  const missingIngredients = recipe.ingredients.filter((i) => !i.inFridge);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Режим пошагового приготовления"
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6"
    >
      <div className="w-full max-w-5xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl shadow-2xl flex flex-col max-h-[96vh] overflow-hidden">
        {/* Top bar */}
        <div className="px-5 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between gap-4 bg-stone-50/70 dark:bg-stone-850">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Режим «Свободные руки»
              </span>
              <h2 className="text-base sm:text-lg font-extrabold text-stone-900 dark:text-stone-100 line-clamp-1">
                {recipe.title}
              </h2>
            </div>
          </div>

          {/* Quick controls: Font size, TTS, Close */}
          <div className="flex items-center gap-2">
            {/* Font size toggler */}
            <div className="hidden sm:flex items-center p-1 rounded-xl bg-stone-200/70 dark:bg-stone-800 border border-stone-300 dark:border-stone-700">
              <Type className="w-3.5 h-3.5 text-stone-500 mx-1" />
              {(['normal', 'large', 'huge'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setFontSizeLevel(level)}
                  className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    fontSizeLevel === level
                      ? 'bg-white dark:bg-stone-700 text-emerald-600 dark:text-emerald-300 shadow-xs'
                      : 'text-stone-600 dark:text-stone-400'
                  }`}
                  title={`Размер шрифта: ${level}`}
                >
                  {level === 'normal' ? 'A' : level === 'large' ? 'A+' : 'A++'}
                </button>
              ))}
            </div>

            {/* TTS Speech narration button */}
            <button
              onClick={isSpeaking ? handleStopSpeech : speakCurrentStep}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                isSpeaking
                  ? 'bg-rose-500 text-white animate-pulse shadow-sm'
                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 hover:bg-emerald-200'
              }`}
              title={isSpeaking ? 'Остановить голос' : 'Озвучить шаг'}
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span className="hidden md:inline">{isSpeaking ? 'Остановить голос' : 'Озвучить шаг'}</span>
            </button>

            {/* Close button */}
            <button
              onClick={() => {
                tts.stop();
                onClose();
              }}
              aria-label="Закрыть режим приготовления"
              className="p-2 rounded-xl text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-stone-100 dark:bg-stone-800 h-1.5">
          <div
            className="bg-emerald-500 h-1.5 transition-all duration-300"
            style={{
              width: `${((currentStepIndex + 1) / recipe.steps.length) * 100}%`,
            }}
          />
        </div>

        {/* Main Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 flex flex-col justify-between gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Step Content */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                  Шаг {currentStepIndex + 1} из {recipe.steps.length}
                </span>

                {/* Auto-speech toggle */}
                <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-500 dark:text-stone-400 select-none">
                  <input
                    type="checkbox"
                    checked={autoSpeak}
                    onChange={(e) => setAutoSpeak(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 accent-emerald-600 cursor-pointer"
                  />
                  <span>Авто-озвучка при переходе</span>
                </label>
              </div>

              {/* Big Readable Instruction */}
              <div className="p-6 sm:p-8 rounded-3xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700/60 shadow-xs min-h-[160px] flex items-center">
                <p className={`text-stone-900 dark:text-stone-50 ${instructionFontClass}`}>
                  {currentStep.instruction}
                </p>
              </div>

              {/* Chef Tip */}
              {currentStep.tip && (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wide">
                      Секрет шеф-повара:
                    </span>
                    <p className="text-sm text-amber-800 dark:text-amber-300 mt-0.5">
                      {currentStep.tip}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Kitchen Timer & Missing Products Sidebar */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              {/* Interactive Kitchen Timer */}
              <div className="p-5 rounded-3xl bg-stone-900 text-white dark:bg-stone-850 dark:border dark:border-stone-700 shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-stone-300 uppercase tracking-wider">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    <span>Таймер шага</span>
                  </div>
                  {timeLeft === 0 && (
                    <span className="flex items-center gap-1 text-xs font-bold text-amber-400 animate-bounce">
                      <Bell className="w-3.5 h-3.5" /> Готово!
                    </span>
                  )}
                </div>

                <div className="text-center py-2 font-mono text-4xl sm:text-5xl font-black tracking-widest text-emerald-400 drop-shadow-md">
                  {formatTimer(timeLeft)}
                </div>

                {/* Timer Controls */}
                <div className="flex items-center justify-center gap-2 mt-3">
                  <button
                    onClick={() => setIsTimerRunning((prev) => !prev)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer ${
                      isTimerRunning
                        ? 'bg-amber-500 hover:bg-amber-600 text-stone-950'
                        : 'bg-emerald-500 hover:bg-emerald-600 text-stone-950'
                    }`}
                  >
                    {isTimerRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                    <span>{isTimerRunning ? 'Пауза' : 'Старт'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsTimerRunning(false);
                      setTimeLeft((currentStep.durationMinutes || 3) * 60);
                    }}
                    className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors cursor-pointer"
                    title="Сбросить таймер"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setTimeLeft((prev) => prev + 60)}
                    className="px-2.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-mono font-bold transition-colors cursor-pointer"
                    title="Добавить минуту"
                  >
                    +1 мин
                  </button>
                </div>
              </div>

              {/* Missing ingredients in modal with 1-click shopping list add */}
              {missingIngredients.length > 0 && (
                <div className="p-4 rounded-3xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                      Не хватает для блюда:
                    </span>
                    <button
                      onClick={() => {
                        onAddMissingToShopping(recipe);
                        setMissingAdded(true);
                        setTimeout(() => setMissingAdded(false), 2500);
                      }}
                      disabled={missingAdded}
                      className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {missingAdded ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                          <span>В покупках</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ В список</span>
                        </>
                      )}
                    </button>
                  </div>
                  <ul className="text-xs text-stone-600 dark:text-stone-400 space-y-1">
                    {missingIngredients.map((item, idx) => (
                      <li key={idx} className="flex justify-between">
                        <span>• {item.name}</span>
                        <span className="font-mono text-stone-500">{item.amount}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Controls & Finish */}
          <div className="pt-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between gap-3">
            <button
              onClick={handlePrevStep}
              disabled={currentStepIndex === 0}
              className="flex items-center gap-2 px-4 sm:px-6 py-3 rounded-2xl border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-sm transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Предыдущий шаг</span>
            </button>

            {currentStepIndex < recipe.steps.length - 1 ? (
              <button
                onClick={handleNextStep}
                className="flex items-center gap-2 px-6 sm:px-8 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md shadow-emerald-600/30 transition-all cursor-pointer active:scale-98"
              >
                <span>Следующий шаг</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleFinishCooking}
                className="flex items-center gap-2 px-6 sm:px-8 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/30 transition-all cursor-pointer active:scale-98"
              >
                <Utensils className="w-4 h-4" />
                <span>Блюдо готово! Записать в КБЖУ</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
