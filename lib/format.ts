import { format as formatDateFns } from 'date-fns';
import { tr } from 'date-fns/locale';

const currencyFormatter = new Intl.NumberFormat('tr-TR', {
    maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat('tr-TR');

/** Displays a Turkish Lira amount, e.g. formatCurrency(12500) -> "12.500₺". */
export function formatCurrency(value: number): string {
    return `${currencyFormatter.format(value)}₺`;
}

/** Displays a plain localized number, e.g. formatNumber(1234) -> "1.234". */
export function formatNumber(value: number): string {
    return numberFormatter.format(value);
}

const dateFormats = {
    short: 'd MMM yyyy',
    long: 'd MMMM yyyy',
    month: 'MMM',
    monthYear: 'MMM yyyy',
} as const;

/** Formats a date in Turkish, e.g. formatDate(iso, 'long') -> "31 Ağustos 2026". */
export function formatDate(value: string | Date, style: keyof typeof dateFormats = 'short'): string {
    const date = typeof value === 'string' ? new Date(value) : value;
    return formatDateFns(date, dateFormats[style], { locale: tr });
}
