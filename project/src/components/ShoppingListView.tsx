import { useState, useRef } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../i18n/ThemeContext';
import { ShoppingItem } from '../types';
import { Check, Trash2, Share2, Copy, CheckCircle, Plus, Mic, ShoppingBag } from 'lucide-react';

interface ShoppingListViewProps {
  items: ShoppingItem[];
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  onAdd: (name: string) => void;
}

export function ShoppingListView({ items, onToggle, onRemove, onClear, onAdd }: ShoppingListViewProps) {
  const { language, t } = useLanguage();
  const { theme } = useTheme();
  const [newItem, setNewItem] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAddItem = () => {
    if (newItem.trim()) {
      onAdd(newItem.trim());
      setNewItem('');
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddItem();
    }
  };

  // Voice input simulation
  const handleVoiceInput = async () => {
    setIsRecording(true);

    // Simulate recording for 2 seconds
    // In production, would use Web Speech API:
    // const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    // recognition.lang = language === 'ru' ? 'ru-RU' : language === 'de' ? 'de-DE' : 'en-US';
    // recognition.start();

    await new Promise((r) => setTimeout(r, 2000));

    // Simulate transcribed text
    const simulatedText = language === 'ru'
      ? 'Сливки 33%, ягоды для украшения'
      : language === 'de'
        ? 'Sahne 33%, Beeren zum Garnieren'
        : 'Heavy cream 33%, berries for decoration';

    // Animate typing effect
    setIsRecording(false);

    // Add items one by one
    const items = simulatedText.split(',').map(s => s.trim()).filter(Boolean);
    for (const item of items) {
      await new Promise((r) => setTimeout(r, 300));
      onAdd(item);
    }
  };

  const generateExportText = () => {
    const lines = items.map((item) => {
      const qty = item.quantity ? `${item.quantity} ` : '';
      const unit = item.unit || '';
      const checked = item.checked ? '✓ ' : '';
      return `${checked}• ${qty}${unit} ${item.ingredientName}`;
    });

    const header = language === 'ru'
      ? '🛒 Список покупок:'
      : language === 'de'
        ? '🛒 Einkaufsliste:'
        : '🛒 Shopping List:';

    return `${header}\n\n${lines.join('\n')}`;
  };

  const exportToClipboard = async () => {
    const text = generateExportText();
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareViaWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: t('shoppingList'),
          text: generateExportText(),
        });
      } catch {
        // User cancelled or error
      }
    } else {
      exportToClipboard();
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      {/* Input Field with Voice */}
      <div className={`${theme.bgCard} rounded-xl shadow-sm border ${theme.border} p-4`}>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                language === 'ru' ? 'Добавить продукт в список...' :
                language === 'de' ? 'Produkt zur Liste hinzufügen...' :
                'Add product to list...'
              }
              className={`w-full px-4 py-3 pr-24 ${theme.inputBg} ${theme.inputText} rounded-lg border-2 ${theme.borderAccent} focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm ${theme.inputPlaceholder}`}
            />

            {/* Voice input button inside input */}
            <button
              onClick={handleVoiceInput}
              disabled={isRecording}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-all ${
                isRecording
                  ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-300'
                  : `${theme.bgSecondary} hover:bg-red-50 text-gray-400 hover:text-red-500`
              }`}
              title={language === 'ru' ? 'Нажмите, чтобы надиктовать продукты' : language === 'de' ? 'Klicken Sie, um Produkte zu diktieren' : 'Click to dictate products'}
            >
              <Mic className={`w-4 h-4 ${isRecording ? 'animate-pulse' : ''}`} />
            </button>
          </div>

          <button
            onClick={handleAddItem}
            disabled={!newItem.trim()}
            className={`p-3 ${theme.accentGradient} ${theme.accentHover} text-white rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all`}
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Voice hint */}
        <p className={`text-xs ${theme.textSecondary} mt-2 text-center`}>
          {isRecording ? (
            <span className="text-red-500 font-medium flex items-center justify-center gap-1">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              {language === 'ru' ? 'Запись...' : language === 'de' ? 'Aufnahme...' : 'Recording...'}
            </span>
          ) : (
            <>
              <Mic className="w-3 h-3 inline mr-1" />
              {language === 'ru' ? 'Нажмите на микрофон, чтобы надиктовать продукты' :
               language === 'de' ? 'Klicken Sie auf das Mikrofon, um Produkte zu diktieren' :
               'Click microphone to dictate products'}
            </>
          )}
        </p>
      </div>

      {/* Empty State */}
      {items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8">
          <div className={`w-24 h-24 bg-gradient-to-br from-amber-100 to-rose-100 rounded-full flex items-center justify-center mb-4`}>
            <ShoppingBag className="w-12 h-12 text-amber-400" />
          </div>
          <p className={`${theme.textSecondary} text-lg`}>{t('shoppingListEmpty')}</p>
          <p className={`text-sm ${theme.textSecondary} mt-2`}>
            {language === 'ru' ? 'Добавьте продукты выше' :
             language === 'de' ? 'Fügen Sie oben Produkte hinzu' :
             'Add products above'}
          </p>
        </div>
      )}

      {/* Items List */}
      {items.length > 0 && (
        <>
          {/* Export Buttons */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={shareViaWebShare}
              className={`flex-1 py-3 ${theme.accentGradient} ${theme.accentHover} text-white rounded-xl font-medium shadow-md flex items-center justify-center gap-2 transition-all`}
            >
              <Share2 className="w-5 h-5" />
              {t('exportingToTelegram')}
            </button>
            <button
              onClick={exportToClipboard}
              className={`px-4 py-3 ${theme.bgSecondary} ${theme.inputText} rounded-xl font-medium flex items-center justify-center gap-2 transition-colors border ${theme.border}`}
            >
              {copied ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>

          {/* Shopping List */}
          <div className={`${theme.bgCard} rounded-xl shadow-sm border ${theme.border} overflow-hidden`}>
            <ul className={`divide-y ${theme.id === 'dark' ? 'divide-zinc-700' : 'divide-gray-100'}`}>
              {items.map((item, index) => (
                <li
                  key={item.id}
                  className={`flex items-center gap-3 p-4 transition-all ${
                    item.checked ? (theme.id === 'dark' ? 'bg-zinc-700/50' : 'bg-gray-50') : ''
                  }`}
                >
                  {/* Number or checkbox */}
                  <button
                    onClick={() => onToggle(item.id)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                      item.checked
                        ? 'bg-green-500 border-green-500'
                        : `border-gray-300 hover:border-orange-400 ${theme.bgSecondary}`
                    }`}
                  >
                    {item.checked ? (
                      <Check className="w-4 h-4 text-white" />
                    ) : (
                      <span className={`text-xs font-bold ${theme.textSecondary}`}>{index + 1}</span>
                    )}
                  </button>

                  {/* Item text */}
                  <span
                    className={`flex-1 transition-all ${
                      item.checked ? (theme.id === 'dark' ? 'text-zinc-500 line-through' : 'text-gray-400 line-through') : theme.textPrimary
                    }`}
                  >
                    {item.quantity && (
                      <span className={`font-bold ${theme.textAccent} mr-1`}>
                        {item.quantity % 1 === 0 ? item.quantity : item.quantity.toFixed(1)} {item.unit}
                      </span>
                    )}
                    {item.ingredientName}
                  </span>

                  {/* Delete button */}
                  <button
                    onClick={() => onRemove(item.id)}
                    className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50/10 rounded-full transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Clear Button */}
          <button
            onClick={() => {
              if (window.confirm(language === 'ru' ? 'Очистить весь список?' : language === 'de' ? 'Liste löschen?' : 'Clear all items?')) {
                onClear();
              }
            }}
            className={`w-full py-3 ${theme.bgSecondary} ${theme.inputText} rounded-xl font-medium transition-colors flex items-center justify-center gap-2 border ${theme.border}`}
          >
            <Trash2 className="w-5 h-5" />
            {t('clearList')}
          </button>

          {/* Summary */}
          <div className={`text-center text-sm ${theme.textSecondary}`}>
            {items.filter((i) => i.checked).length} / {items.length}{' '}
            {language === 'ru' ? 'куплено' : language === 'de' ? 'gekauft' : 'purchased'}
          </div>
        </>
      )}
    </div>
  );
}
