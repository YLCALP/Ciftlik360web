import { useState } from 'react';
import { Transaction } from '@/lib/types';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ArrowUpDown } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/format';

interface TransactionListProps {
    transactions: Transaction[];
}

type SortConfig = {
    key: keyof Transaction | null;
    direction: 'asc' | 'desc';
};

export function TransactionList({ transactions }: TransactionListProps) {
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });

    const handleSort = (key: keyof Transaction) => {
        setSortConfig((current) => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
        }));
    };

    const translateCategory = (category: string) => {
        const translations: Record<string, string> = {
            'animal_sale': 'Hayvan Satışı',
            'animal_purchase': 'Hayvan Alımı',
            'feed': 'Yem',
            'medicine': 'İlaç',
            'equipment': 'Ekipman',
            'labor': 'İşçilik',
            'other': 'Diğer',
        };
        return translations[category] || category.replace('_', ' ');
    };

    const sortedTransactions = [...transactions].sort((a, b) => {
        if (!sortConfig.key) return 0;

        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue === bValue) return 0;
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        const comparison = aValue < bValue ? -1 : 1;
        return sortConfig.direction === 'asc' ? comparison : -comparison;
    });

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead onClick={() => handleSort('date')} className="cursor-pointer hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-2">
                                Tarih
                                <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                            </div>
                        </TableHead>
                        <TableHead>Açıklama</TableHead>
                        <TableHead onClick={() => handleSort('category')} className="cursor-pointer hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-2">
                                Kategori
                                <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                            </div>
                        </TableHead>
                        <TableHead onClick={() => handleSort('type')} className="cursor-pointer hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-2">
                                Tür
                                <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                            </div>
                        </TableHead>
                        <TableHead onClick={() => handleSort('amount')} className="text-right cursor-pointer hover:bg-muted/50 transition-colors">
                            <div className="flex items-center justify-end gap-2">
                                Tutar
                                <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                            </div>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                            <TableCell className="tnum">{formatDate(transaction.date)}</TableCell>
                            <TableCell>
                                {transaction.description}
                                {transaction.is_automatic && (
                                    <Badge variant="outline" className="ml-2 text-xs">Otomatik</Badge>
                                )}
                            </TableCell>
                            <TableCell className="capitalize">{translateCategory(transaction.category)}</TableCell>
                            <TableCell>
                                <Badge
                                    className={cn(
                                        'border-transparent',
                                        transaction.type === 'Gelir'
                                            ? 'bg-chart-1/15 text-chart-1'
                                            : 'bg-chart-5/15 text-chart-5'
                                    )}
                                >
                                    {transaction.type === 'Gelir' ? 'Gelir' : 'Gider'}
                                </Badge>
                            </TableCell>
                            <TableCell
                                className={cn(
                                    'text-figure text-right text-sm',
                                    transaction.type === 'Gelir' ? 'text-chart-1' : 'text-chart-5'
                                )}
                            >
                                {transaction.type === 'Gelir' ? '+' : '-'}
                                {formatCurrency(transaction.amount)}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
