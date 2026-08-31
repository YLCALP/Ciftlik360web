import { ArrowDown, ArrowUp, BadgeTurkishLira } from 'lucide-react';
import { Transaction } from '@/lib/types';
import { StatBand } from '@/components/shared/StatCard';
import { formatCurrency } from '@/lib/format';

interface FinanceStatsProps {
    transactions: Transaction[];
}

export function FinanceStats({ transactions }: FinanceStatsProps) {
    const totalIncome = transactions.filter((t) => t.type === 'Gelir').reduce((acc, t) => acc + t.amount, 0);
    const totalExpense = transactions.filter((t) => t.type === 'Gider').reduce((acc, t) => acc + t.amount, 0);
    const netBalance = totalIncome - totalExpense;

    return (
        <StatBand
            items={[
                {
                    label: 'Toplam Gelir',
                    value: formatCurrency(totalIncome),
                    icon: ArrowUp,
                    tone: 'positive',
                },
                {
                    label: 'Toplam Gider',
                    value: formatCurrency(totalExpense),
                    icon: ArrowDown,
                    tone: 'negative',
                },
                {
                    label: 'Net Bakiye',
                    value: formatCurrency(netBalance),
                    icon: BadgeTurkishLira,
                    tone: netBalance >= 0 ? 'positive' : 'negative',
                },
            ]}
        />
    );
}
