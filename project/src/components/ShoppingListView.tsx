import { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../i18n/ThemeContext';
import { ShoppingItem } from '../types';
import {
	Trash2,
	Copy,
	Plus,
	Mic,
	MessageCircle,
	Send,
	Share2,
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

	const getItemName = (item: any) =>
		item.name || item.ingredientName || 'Продукт';

	const handleVoiceInput = () => {
		const SpeechRecognition =
			(window as any).SpeechRecognition ||
			(window as any).webkitSpeechRecognition;
		if (!SpeechRecognition) return;
		const recognition = new SpeechRecognition();
		recognition.lang = language === 'ru' ? 'ru-RU' : 'en-US';
		recognition.onstart = () => setIsRecording(true);
		recognition.onend = () => setIsRecording(false);
		recognition.onresult = (event: any) => {
			const speechToText = event.results[0][0].transcript;
			const parsedItems = speechToText.split(/[,+\s]и\s+|[,+\s]+/gi);
			parsedItems.forEach((item: string) => {
				if (item.trim()) onAdd(item.trim());
			});
		};
		recognition.start();
	};

	const generateExportText = () => {
		const header =
			language === 'ru' ? '🛒 *Список покупок:*' : '🛒 *Shopping List:*';
		const lines = items.map(
			(item, index) => `${index + 1}. ${getItemName(item)}`,
		);
		return `${header}\n\n${lines.join('\n')}`;
	};

	return (
		<div className='max-w-md mx-auto p-4 space-y-4'>
			<div className={`${theme.bgCard} p-4 rounded-xl border ${theme.border}`}>
				<div className='flex items-center gap-2'>
					<input
						value={newItem}
						onChange={(e) => setNewItem(e.target.value)}
						className={`flex-1 p-2 rounded-lg border ${theme.inputBg}`}
						placeholder='Добавить...'
					/>
					<button
						onClick={handleVoiceInput}
						className={`p-2 rounded-full ${isRecording ? 'bg-red-500' : 'bg-gray-200'}`}
					>
						<Mic className='w-4 h-4' />
					</button>
					<button
						onClick={() => {
							if (newItem.trim()) onAdd(newItem);
							setNewItem('');
						}}
						className={`p-2 rounded-lg ${theme.accentGradient}`}
					>
						<Plus className='w-5 h-5' />
					</button>
				</div>
			</div>

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
						className='w-full py-2 bg-gray-100 rounded-lg flex items-center justify-center gap-2 text-sm'
					>
						<Copy className='w-4 h-4' />{' '}
						{copied ? 'Скопировано!' : 'Копировать список'}
					</button>

					<div className='grid grid-cols-4 gap-2'>
						<button
							onClick={() =>
								window.open(
									`https://t.me/share/url?url=${encodeURIComponent(generateExportText())}`,
								)
							}
							className='p-2 flex justify-center bg-blue-500 text-white rounded-lg'
						>
							<Send size={18} />
						</button>
						<button
							onClick={() =>
								window.open(
									`https://api.whatsapp.com/send?text=${encodeURIComponent(generateExportText())}`,
								)
							}
							className='p-2 flex justify-center bg-green-500 text-white rounded-lg'
						>
							<MessageCircle size={18} />
						</button>
						<button
							onClick={() =>
								window.open(
									`viber://forward?text=${encodeURIComponent(generateExportText())}`,
								)
							}
							className='p-2 flex justify-center bg-purple-500 text-white rounded-lg'
						>
							<Share2 size={18} />
						</button>
						<button
							onClick={() => window.open('https://www.facebook.com/')}
							className='p-2 flex justify-center bg-blue-700 text-white rounded-lg'
						>
							<MessageCircle size={18} />
						</button>
					</div>
				</div>
			)}

			<ul className='space-y-2'>
				{items.map((item) => (
					<li
						// Гарантируем уникальность ключа
						key={item.id || Math.random().toString()}
						className='flex items-center justify-between p-3 bg-white border rounded-lg shadow-sm'
					>
						{/* ... ваш код ... */}
						<button
							onClick={(e) => {
								e.stopPropagation();
								onRemove(item.id); // Теперь это удалит только один элемент
							}}
							className='text-red-500 p-2'
						>
							<Trash2 className='w-4 h-4' />
						</button>
					</li>
				))}
			</ul>

			{items.length > 0 && (
				<button
					onClick={onClear}
					className='w-full py-2 text-red-500 border border-red-200 rounded-lg text-sm'
				>
					Очистить всё
				</button>
			)}
		</div>
	);
}
