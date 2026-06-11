export interface ShoppingItem {
  id: string;
  name: string;
  checked: boolean;
  category?: string;
  createdAt: Date;
}

export type Language = 'ru' | 'en';

export type FilterType = 'all' | 'want' | 'cooked';

export interface Theme {
  bgCard: string;
  bgMain: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  inputBg: string;
  accentGradient: string;
  buttonPrimary: string;
}

export const lightTheme: Theme = {
  bgCard: 'bg-white',
  bgMain: 'bg-gray-50',
  border: 'border-gray-200',
  textPrimary: 'text-gray-900',
  textSecondary: 'text-gray-600',
  inputBg: 'bg-gray-50 border-gray-300',
  accentGradient: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white',
  buttonPrimary: 'bg-blue-500 hover:bg-blue-600 text-white',
};

export const darkTheme: Theme = {
  bgCard: 'bg-gray-800',
  bgMain: 'bg-gray-900',
  border: 'border-gray-700',
  textPrimary: 'text-white',
  textSecondary: 'text-gray-400',
  inputBg: 'bg-gray-700 border-gray-600',
  accentGradient: 'bg-gradient-to-r from-blue-600 to-blue-700 text-white',
  buttonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
};
