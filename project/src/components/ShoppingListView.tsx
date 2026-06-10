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

			// ИСПРАВЛЕННАЯ ЛОГИКА: разбиваем текст на массив слов
			const separators = /[,+]|\s+и\s+|\s+und\s+|\s+and\s+/gi;
			const parsedItems = speechToText
				.split(separators)
				.map((s: string) => s.trim())
				.filter((s: string) => s.length > 0);

			// Добавляем каждый элемент отдельно
			parsedItems.forEach((item: string) => onAdd(item));
		};

		recognition.start();
	};

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

			const measure = `${formattedQty}${formattedUnit}`.trim();
			const measureStr = measure ? `${measure} ` : '';
			const name = item.ingredientName || (item as any).name || '';

			if (forTelegram && item.checked) {
				return `~${checked}${measureStr}${name}~`;
			}
			return `${checked}${measureStr}${name}`;
		});

		return `${header}\n\n${lines.join('\n')}`;
	};

	const exportToClipboard = async () => {
		const text = generateExportText(false).replace(/\*/g, '');
		await navigator.clipboard.writeText(text);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div className='max-w-md mx-auto p-4 space-y-4'>
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
									? 'Добавить продукт...'
									: language === 'de'
										? 'Produkt hinzufügen...'
										: 'Add product...'
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

			{items.length > 0 && (
				<>
					<div className='space-y-2 mb-4'>
						<button
							onClick={exportToClipboard}
							className={`w-full py-3 ${theme.bgSecondary} ${theme.inputText} rounded-xl font-medium flex items-center justify-center gap-2 transition-colors border ${theme.border}`}
						>
							{copied ? (
								<>
									<CheckCircle className='w-5 h-5 text-green-500' />
									<span>{language === 'ru' ? 'Скопировано!' : 'Kopiert!'}</span>
								</>
							) : (
								<>
									<Copy className='w-5 h-5' />
									<span>
										{language === 'ru'
											? 'Скопировать список'
											: 'Liste kopieren'}
									</span>
								</>
							)}
						</button>
					</div>

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
										onClick={() => onToggle(item.id)}
										className={`flex items-center gap-3 p-4 cursor-pointer select-none transition-all hover:bg-gray-50/50 dark:hover:bg-zinc-700/30 ${item.checked ? (theme.id === 'dark' ? 'bg-zinc-700/50' : 'bg-gray-50') : ''}`}
									>
										<div
											className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${item.checked ? 'bg-green-500 border-green-500 text-white' : `border-gray-300 dark:border-zinc-500 ${theme.bgSecondary}`}`}
										>
											{item.checked ? (
												<Check className='w-4 h-4 stroke-[3]' />
											) : (
												<span className='text-[10px] font-bold text-gray-400 dark:text-zinc-400'>
													{index + 1}
												</span>
											)}
										</div>
										<span
											className={`flex-1 transition-all ${item.checked ? 'text-gray-400 dark:text-zinc-500 line-through' : theme.textPrimary}`}
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
				</>
			)}
		</div>
	);
}
