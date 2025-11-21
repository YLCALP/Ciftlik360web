'use client';

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

interface TransactionListProps {
    transactions: Transaction[];
}

export function TransactionList({ transactions }: TransactionListProps) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                            <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                            <TableCell>
                                {transaction.description}
                                {transaction.is_automatic && (
                                    <Badge variant="outline" className="ml-2 text-xs">Auto</Badge>
                                )}
                            </TableCell>
                            <TableCell className="capitalize">{transaction.category.replace('_', ' ')}</TableCell>
                            <TableCell>
                                <Badge
                                    variant={
                                        transaction.type === 'income' ? 'default' : 'destructive'
                                    }
                                    className={cn(
                                        transaction.type === 'income'
                                            ? 'bg-green-500 hover:bg-green-600'
                                            : 'bg-red-500 hover:bg-red-600'
                                    )}
                                >
                                    {transaction.type === 'income' ? 'Income' : 'Expense'}
                                </Badge>
                            </TableCell>
                            <TableCell
                                className={cn(
                                    'text-right font-medium',
                                    transaction.type === 'income'
                                        ? 'text-green-600'
                                        : 'text-red-600'
                                )}
                            >
                                {transaction.type === 'income' ? '+' : '-'}₺
                                {transaction.amount.toLocaleString('tr-TR')}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
