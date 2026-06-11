import { useState, useMemo } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../i18n/ThemeContext';
import { ShoppingItem, FilterType } from '../types';
import {
  Trash2,
  Copy,
  Plus,
  Mic,
  MessageCircle,
  Send,
  Share2,
  Check,
  Filter,
} from 'lucide-react';

interface ShoppingListViewProps {
  items: ShoppingItem[];
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  onAdd: (name: string) => void;
}

export function ShoppingListView({
  items,
  onToggle,
  onRemove,
  onClear,
  onAdd,
}: ShoppingListViewProps) {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const [newItem, setNewItem] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [copied, setCopied] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');

  const getItemName = (item: ShoppingItem) =>
    item.name || 'Продукт';

  // Улучшенная функция голосового ввода
  const handleVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(language === 'ru' ? 'Голосовой ввод не поддерживается' : 'Voice input not supported');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === 'ru' ? 'ru-RU' : 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);

    recognition.onresult = (event: any) => {
      const speechToText = event.results[0][0].transcript.trim();

      // Улучшенный парсинг: разделяем по запятым, "и", "and", "+", переносам строк
      const parsedItems = speechToText
        .split(/,|\s+и\s+|\s+and\s+|\+|\n/)
        .map((item: string) => item.trim())
        .filter((item: string) => item.length > 0);

      // Добавляем каждый элемент с уникальным ID (в App.tsx через onAdd)
      parsedItems.forEach((item: string) => {
        onAdd(item);
      });
    };

    recognition.onerror = (event: any) => {
      setIsRecording(false);
      console.error('Speech recognition error:', event.error);
    };

    recognition.start();
  };

  const generateExportText = () => {
    const header =
      language === 'ru' ? '🛒 *Список покупок:*' : '🛒 *Shopping List:*';
    const lines = items.map(
      (item, index) => `${index + 1}. ${getItemName(item)}${item.checked ? ' ✓' : ''}`,
    );
    return `${header}\n\n${lines.join('\n')}`;
  };

  // Фильтрация элементов
  const filteredItems = useMemo(() => {
    switch (filter) {
      case 'want':
        return items.filter(item => !item.checked);
      case 'cooked':
        return items.filter(item => item.checked);
      default:
        return items;
    }
  }, [items, filter]);

  const filterButtons: { type: FilterType; label: string; count: number }[] = [
    { type: 'all', label: language === 'ru' ? 'Все' : 'All', count: items.length },
    { type: 'want', label: language === 'ru' ? 'Хочу приготовить' : 'Want to cook', count: items.filter(i => !i.checked).length },
    { type: 'cooked', label: language === 'ru' ? 'Приготовлено' : 'Cooked', count: items.filter(i => i.checked).length },
  ];

  return (
    <div className='max-w-md mx-auto p-4 space-y-4'>
      <div className={`${theme.bgCard} p-4 rounded-xl border ${theme.border}`}>
        <div className='flex items-center gap-2'>
          <input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newItem.trim()) {
                onAdd(newItem.trim());
                setNewItem('');
              }
            }}
            className={`flex-1 p-2 rounded-lg border ${theme.inputBg} ${theme.textPrimary}`}
            placeholder={language === 'ru' ? 'Добавить...' : 'Add item...'}
          />
          <button
            onClick={handleVoiceInput}
            className={`p-2 rounded-full transition-colors ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-200 hover:bg-gray-300'}`}
            title={language === 'ru' ? 'Голосовой ввод' : 'Voice input'}
          >
            <Mic className='w-4 h-4' />
          </button>
          <button
            onClick={() => {
              if (newItem.trim()) {
                onAdd(newItem.trim());
                setNewItem('');
              }
            }}
            className={`p-2 rounded-lg ${theme.accentGradient}`}
          >
            <Plus className='w-5 h-5' />
          </button>
        </div>
      </div>

      {/* Фильтры */}
      {items.length > 0 && (
        <div className={`${theme.bgCard} p-3 rounded-xl border ${theme.border}`}>
          <div className='flex items-center gap-2 mb-2'>
            <Filter className='w-4 h-4 text-gray-500' />
            <span className={`text-sm ${theme.textSecondary}`}>
              {language === 'ru' ? 'Фильтр:' : 'Filter:'}
            </span>
          </div>
          <div className='flex flex-wrap gap-2'>
            {filterButtons.map(({ type, label, count }) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  filter === type
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label} ({count})
              </button>
            ))}
          </div>
        </div>
      )}

      {items.length > 0 && (
        <div className='space-y-3'>
          <button
            onClick={() => {
              navigator.clipboard.writeText(
                generateExportText().replace(/\*/g, ''),
              );
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className='w-full py-2 bg-gray-100 rounded-lg flex items-center justify-center gap-2 text-sm hover:bg-gray-200 transition-colors'
          >
            <Copy className='w-4 h-4' />
            {copied
              ? (language === 'ru' ? 'Скопировано!' : 'Copied!')
              : (language === 'ru' ? 'Копировать список' : 'Copy list')}
          </button>

          <div className='grid grid-cols-4 gap-2'>
            <button
              onClick={() =>
                window.open(
                  `https://t.me/share/url?url=${encodeURIComponent(generateExportText())}`,
                )
              }
              className='p-2 flex justify-center bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors'
              title='Telegram'
            >
              <Send size={18} />
            </button>
            <button
              onClick={() =>
                window.open(
                  `https://api.whatsapp.com/send?text=${encodeURIComponent(generateExportText())}`,
                )
              }
              className='p-2 flex justify-center bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors'
              title='WhatsApp'
            >
              <MessageCircle size={18} />
            </button>
            <button
              onClick={() =>
                window.open(
                  `viber://forward?text=${encodeURIComponent(generateExportText())}`,
                )
              }
              className='p-2 flex justify-center bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors'
              title='Viber'
            >
              <Share2 size={18} />
            </button>
            <button
              onClick={() => window.open('https://www.facebook.com/')}
              className='p-2 flex justify-center bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors'
              title='Facebook'
            >
              <MessageCircle size={18} />
            </button>
          </div>
        </div>
      )}

      <ul className='space-y-2'>
        {filteredItems.map((item) => (
          <li
            key={item.id}
            className={`flex items-center justify-between p-3 ${theme.bgCard} border ${theme.border} rounded-lg shadow-sm transition-all ${
              item.checked ? 'opacity-60' : ''
            }`}
          >
            <div className='flex items-center gap-3 flex-1'>
              <button
                onClick={() => onToggle(item.id)}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                  item.checked
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-gray-300 hover:border-green-400'
                }`}
              >
                {item.checked && <Check className='w-4 h-4' />}
              </button>
              <span
                className={`${theme.textPrimary} ${
                  item.checked ? 'line-through text-gray-400' : ''
                }`}
              >
                {getItemName(item)}
              </span>
            </div>
            <button
              onClick={() => onRemove(item.id)}
              className='text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors'
            >
              <Trash2 className='w-4 h-4' />
            </button>
          </li>
        ))}
      </ul>

      {filteredItems.length === 0 && items.length > 0 && (
        <div className={`text-center py-8 ${theme.textSecondary}`}>
          {language === 'ru'
            ? 'Нет элементов в выбранной категории'
            : 'No items in selected category'}
        </div>
      )}

      {items.length > 0 && (
        <button
          onClick={onClear}
          className='w-full py-2 text-red-500 border border-red-200 rounded-lg text-sm hover:bg-red-50 transition-colors'
        >
          {language === 'ru' ? 'Очистить всё' : 'Clear all'}
        </button>
      )}
    </div>
  );
}
