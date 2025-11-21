'use client';

import { InventoryItem } from '@/lib/types';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowDown, ArrowUp, AlertTriangle } from 'lucide-react';

interface InventoryTableProps {
    items: InventoryItem[];
    onStockIn: (item: InventoryItem) => void;
    onStockOut: (item: InventoryItem) => void;
}

export function InventoryTable({ items, onStockIn, onStockOut }: InventoryTableProps) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Updated</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.map((item) => {
                        return (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">{item.feed_name}</TableCell>
                                <TableCell>{item.feed_type}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        {item.quantity}
                                    </div>
                                </TableCell>
                                <TableCell>{item.unit}</TableCell>
                                <TableCell>
                                    <Badge variant={item.quantity === 0 ? 'destructive' : 'outline'}>
                                        {item.quantity === 0 ? 'Out of Stock' : 'In Stock'}
                                    </Badge>
                                </TableCell>
                                <TableCell>{new Date(item.updated_at).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-green-600 hover:text-green-700"
                                            onClick={() => onStockIn(item)}
                                        >
                                            <ArrowUp className="mr-1 h-4 w-4" /> In
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-red-600 hover:text-red-700"
                                            onClick={() => onStockOut(item)}
                                        >
                                            <ArrowDown className="mr-1 h-4 w-4" /> Out
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
