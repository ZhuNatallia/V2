import { useState, useCallback } from 'react';
import { ShoppingListView } from './components/ShoppingListView';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';
import { ThemeProvider, useTheme } from './i18n/ThemeContext';
import { ShoppingItem } from './types';
import { Sun, Moon, Languages } from 'lucide-react';

function AppContent() {
  const { language, setLanguage } = useLanguage();
  const { theme, isDark, toggleTheme } = useTheme();
  const [items, setItems] = useState<ShoppingItem[]>([]);

  // Добавление элемента с уникальным ID через crypto.randomUUID()
  const handleAdd = useCallback((name: string) => {
    const newItem: ShoppingItem = {
      id: crypto.randomUUID(), // Уникальный ID для каждого элемента
      name,
      checked: false,
      createdAt: new Date(),
    };
    setItems((prev) => [...prev, newItem]);
  }, []);

  // Переключение статуса checked
  const handleToggle = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  }, []);

  // Удаление одного элемента по уникальному ID
  const handleRemove = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // Очистка всего списка
  const handleClear = useCallback(() => {
    setItems([]);
  }, []);

  return (
    <div className={`min-h-screen ${theme.bgMain} ${theme.textPrimary}`}>
      {/* Header */}
      <header className={`${theme.bgCard} border-b ${theme.border} sticky top-0 z-10`}>
        <div className='max-w-md mx-auto p-4 flex items-center justify-between'>
          <h1 className='text-xl font-bold'>
            {language === 'ru' ? '🛒 Список покупок' : '🛒 Shopping List'}
          </h1>
          <div className='flex items-center gap-2'>
            <button
              onClick={() => setLanguage(language === 'ru' ? 'en' : 'ru')}
              className='p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors'
              title='Switch language'
            >
              <Languages className='w-5 h-5' />
            </button>
            <button
              onClick={toggleTheme}
              className='p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors'
              title='Toggle theme'
            >
              {isDark ? <Sun className='w-5 h-5' /> : <Moon className='w-5 h-5' />}
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className='py-4'>
        <ShoppingListView
          items={items}
          onToggle={handleToggle}
          onRemove={handleRemove}
          onClear={handleClear}
          onAdd={handleAdd}
        />
      </main>

      {/* Footer */}
      <footer className={`max-w-md mx-auto p-4 text-center ${theme.textSecondary} text-sm`}>
        {language === 'ru'
          ? `Всего: ${items.length} | Готово: ${items.filter(i => i.checked).length}`
          : `Total: ${items.length} | Done: ${items.filter(i => i.checked).length}`}
      </footer>
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;
