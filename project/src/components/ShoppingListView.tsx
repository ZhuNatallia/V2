import { useState, useRef } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../i18n/ThemeContext';
import { ShoppingItem } from '../types';
import {
	Check,
	Trash2,
	Share2,
	Copy,
	CheckCircle,
	Plus,
	Mic,
	ShoppingBag,
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

	// Функция перевода единиц измерения
	const formatUnit = (unit: string) => {
		if (!unit) return '';
		const u = unit.toLowerCase().trim();
		if (language === 'ru') {
			if (u === 'g') return 'г';
			if (u === 'kg') return 'кг';
			if (u === 'ml') return 'мл';
			if (u === 'l') return 'л';
			if (u === 'pcs') return 'шт';
			if (u === 'tsp') return 'ч.л.';
			if (u === 'tbsp') return 'ст.л.';
			if (u === 'cup') return 'ст.';
		}
		if (language === 'de') {
			if (u === 'pcs') return 'Stk.';
			if (u === 'tsp') return 'TL';
			if (u === 'tbsp') return 'EL';
			if (u === 'cup') return 'Becher';
		}
		return unit;
	};

	const handleVoiceInput = () => {
		const SpeechRecognition =
			(window as any).SpeechRecognition ||
			(window as any).webkitSpeechRecognition;
		if (!SpeechRecognition) return;

		const recognition = new SpeechRecognition();
		recognition.lang =
			language === 'ru' ? 'ru-RU' : language === 'de' ? 'de-DE' : 'en-US';

		recognition.onstart = () => setIsRecording(true);
		recognition.onerror = () => setIsRecording(false);
		recognition.onend = () => setIsRecording(false);

		recognition.onresult = (event: any) => {
			const speechToText = event.results[0][0].transcript;
			const separators = /[,+]| и | und | and /gi;
			const parsedItems = speechToText
				.split(separators)
				.map((s: string) => s.trim())
				.filter(Boolean);
			parsedItems.forEach((item: string) => onAdd(item));
		};

		recognition.start();
	};

	// ГЕНЕРАЦИЯ ТЕКСТА С ПРАВИЛЬНЫМИ ПРОБЕЛАМИ И ПЕРЕВОДОМ
	const generateExportText = (forTelegram = false) => {
		const header =
			language === 'ru'
				? '🛒 *Список покупок:*'
				: language === 'de'
					? '🛒 *Einkaufsliste:*'
					: '🛒 *Shopping List:*';

		const lines = items.map((item) => {
			const checked = item.checked ? '✓ ' : '• ';
			const formattedQty = item.quantity
				? item.quantity % 1 === 0
					? item.quantity
					: item.quantity.toFixed(1)
				: '';
			const formattedUnit = item.unit ? formatUnit(item.unit) : '';

			// Склеиваем число и единицу БЕЗ пробела (50g), но делаем пробел ПЕРЕД названием продукта
			const measure = `${formattedQty}${formattedUnit}`.trim();
			const measureStr = measure ? `${measure} ` : '';
			const name = item.ingredientName || (item as any).name || '';

			// Если экспорт для ТГ и товар куплен — можно применить зачеркивание форматированием ТГ
			if (forTelegram && item.checked) {
				return `~${checked}${measureStr}${name}~`;
			}
			return `${checked}${measureStr}${name}`;
		});

		return `${header}\n\n${lines.join('\n')}`;
	};

	const exportToClipboard = async () => {
		// Для буфера обмена убираем спецсимволы жирности ТГ (*)
		const text = generateExportText(false).replace(/\*/g, '');
		await navigator.clipboard.writeText(text);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const shareViaWebShare = async () => {
		const text = generateExportText(true);

		// Проверяем, мобилка это или десктоп. Если десктоп (особенно Windows) — navigator.share не даёт юзеру Telegram.
		// Поэтому если это десктопная ОС, сразу открываем прямую ссылку на Telegram Share.
		const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

		if (navigator.share && isMobile) {
			try {
				await navigator.share({
					title: t('shoppingList') || 'Shopping List',
					text: text,
				});
				return;
			} catch {
				// фолбек при отмене
			}
		}

		// Прямой экспорт в Telegram (откроет приложение или web.telegram.org)
		const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(text)}`;
		window.open(tgUrl, '_blank');
	};

	return (
		<div className='max-w-md mx-auto p-4 space-y-4'>
			{/* Input Field with Voice */}
			<div
				className={`${theme.bgCard} rounded-xl shadow-sm border ${theme.border} p-4`}
			>
				<div className='flex items-center gap-2'>
					<div className='relative flex-1'>
						<input
							ref={inputRef}
							type='text'
							value={newItem}
							onChange={(e) => setNewItem(e.target.value)}
							onKeyDown={handleKeyDown}
							placeholder={
								language === 'ru'
									? 'Добавить продукт в список...'
									: language === 'de'
										? 'Produkt zur Liste hinzufügen...'
										: 'Add product to list...'
							}
							className={`w-full px-4 py-3 pr-24 ${theme.inputBg} ${theme.inputText} rounded-lg border-2 ${theme.borderAccent} focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm ${theme.inputPlaceholder}`}
						/>

						<button
							onClick={handleVoiceInput}
							disabled={isRecording}
							className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-all ${
								isRecording
									? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-300'
									: `${theme.bgSecondary} hover:bg-red-50 text-gray-400 hover:text-red-500`
							}`}
						>
							<Mic className='w-4 h-4' />
						</button>
					</div>

					<button
						onClick={handleAddItem}
						disabled={!newItem.trim()}
						className={`p-3 ${theme.accentGradient} ${theme.accentHover} text-white rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all`}
					>
						<Plus className='w-5 h-5' />
					</button>
				</div>
			</div>

			{/* Items List */}
			{items.length > 0 && (
				<>
					{/* Блок экспорта в мессенджеры */}
					<div className='space-y-2 mb-4'>
						{/* Кнопка копирования */}
						<button
							onClick={exportToClipboard}
							className={`w-full py-3 ${theme.bgSecondary} ${theme.inputText} rounded-xl font-medium flex items-center justify-center gap-2 transition-colors border ${theme.border}`}
						>
							{copied ? (
								<>
									<CheckCircle className='w-5 h-5 text-green-500' />
									<span>
										{language === 'ru'
											? 'Скопировано в буфер!'
											: 'In Zwischenablage kopiert!'}
									</span>
								</>
							) : (
								<>
									<Copy className='w-5 h-5' />
									<span>
										{language === 'ru'
											? 'Скопировать весь список'
											: 'Liste kopieren'}
									</span>
								</>
							)}
						</button>

						{/* Сетка кнопок мессенджеров */}
						<div className='grid grid-cols-4 gap-2'>
							{/* Telegram */}
							<button
								onClick={() => {
									const text = generateExportText(true);
									const url = `https://t.me/share/url?url=${encodeURIComponent(text)}`;
									window.open(url, '_blank');
								}}
								className='py-2.5 bg-[#26A5E4] hover:bg-[#2297CD] text-white rounded-xl font-medium shadow-sm flex flex-col items-center justify-center text-xs gap-1 transition-all'
								title='Telegram'
							>
								<Share2 className='w-4 h-4' />
								<span>TG</span>
							</button>

							{/* WhatsApp */}
							<button
								onClick={() => {
									const text = generateExportText(false).replace(/\*/g, '');
									const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
									window.open(url, '_blank');
								}}
								className='py-2.5 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-xl font-medium shadow-sm flex flex-col items-center justify-center text-xs gap-1 transition-all'
								title='WhatsApp'
							>
								<ShoppingBag className='w-4 h-4' />
								<span>WA</span>
							</button>

							{/* Viber */}
							<button
								onClick={() => {
									const text = generateExportText(false).replace(/\*/g, '');
									const url = `viber://forward?text=${encodeURIComponent(text)}`;
									window.open(url, '_blank');
								}}
								className='py-2.5 bg-[#7360F2] hover:bg-[#6150D8] text-white rounded-xl font-medium shadow-sm flex flex-col items-center justify-center text-xs gap-1 transition-all'
								title='Viber'
							>
								<Mic className='w-4 h-4' />
								<span>Viber</span>
							</button>

							{/* FB Messenger */}
							<button
								onClick={() => {
									const text = generateExportText(false).replace(/\*/g, '');
									exportToClipboard();
									alert(
										language === 'ru'
											? 'Список скопирован! Вставьте его в Messenger.'
											: 'Kopiert! Bitte in Messenger einfügen.',
									);
									window.open('https://www.messenger.com/', '_blank');
								}}
								className='py-2.5 bg-[#006AFF] hover:bg-[#005CE5] text-white rounded-xl font-medium shadow-sm flex flex-col items-center justify-center text-xs gap-1 transition-all'
								title='Messenger'
							>
								<Check className='w-4 h-4' />
								<span>FB</span>
							</button>
						</div>
					</div>

					{/* Shopping List */}
					<div
						className={`${theme.bgCard} rounded-xl shadow-sm border ${theme.border} overflow-hidden`}
					>
						<ul
							className={`divide-y ${theme.id === 'dark' ? 'divide-zinc-700' : 'divide-gray-100'}`}
						>
							{items.map((item, index) => {
								const name = item.ingredientName || (item as any).name || '';
								const formattedQty = item.quantity
									? item.quantity % 1 === 0
										? item.quantity
										: item.quantity.toFixed(1)
									: '';
								const formattedUnit = item.unit ? formatUnit(item.unit) : '';

								return (
									<li
										key={item.id}
										// Сделали всю строку кликабельной для удобства вычеркивания!
										onClick={() => onToggle(item.id)}
										className={`flex items-center gap-3 p-4 cursor-pointer select-none transition-all hover:bg-gray-50/50 dark:hover:bg-zinc-700/30 ${
											item.checked
												? theme.id === 'dark'
													? 'bg-zinc-700/50'
													: 'bg-gray-50'
												: ''
										}`}
									>
										{/* Очевидный чекбокс вместо просто цифры */}
										<div
											className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${
												item.checked
													? 'bg-green-500 border-green-500 text-white'
													: `border-gray-300 dark:border-zinc-500 ${theme.bgSecondary}`
											}`}
										>
											{item.checked ? (
												<Check className='w-4 h-4 stroke-[3]' />
											) : (
												// Мягкая цифра внутри чекбокса, которая при ховере может меняться
												<span className='text-[10px] font-bold text-gray-400 dark:text-zinc-400'>
													{index + 1}
												</span>
											)}
										</div>

										{/* Текст продукта */}
										<span
											className={`flex-1 transition-all ${
												item.checked
													? 'text-gray-400 dark:text-zinc-500 line-through'
													: theme.textPrimary
											}`}
										>
											{item.quantity && (
												<span
													className={`font-bold ${theme.textAccent} mr-1.5`}
												>
													{formattedQty}
													{formattedUnit}
												</span>
											)}
											{name}
										</span>

										{/* Кнопка удаления (останавливаем всплытие клика, чтобы не триггерить onToggle) */}
										<button
											onClick={(e) => {
												e.stopPropagation();
												onRemove(item.id);
											}}
											className='p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50/10 rounded-full transition-colors'
										>
											<Trash2 className='w-4 h-4' />
										</button>
									</li>
								);
							})}
						</ul>
					</div>

					{/* Clear Button */}
					<button
						onClick={() => {
							if (
								window.confirm(
									language === 'ru'
										? 'Очистить весь список?'
										: 'Liste löschen?',
								)
							) {
								onClear();
							}
						}}
						className={`w-full py-3 ${theme.bgSecondary} ${theme.inputText} rounded-xl font-medium transition-colors flex items-center justify-center gap-2 border ${theme.border}`}
					>
						<Trash2 className='w-5 h-5' />
						{t('clearList')}
					</button>
				</>
			)}
		</div>
	);
}
