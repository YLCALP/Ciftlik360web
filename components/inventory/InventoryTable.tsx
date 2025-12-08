import { useState } from 'react';
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
import { ArrowDown, ArrowUp, AlertTriangle, ArrowUpDown } from 'lucide-react';

interface InventoryTableProps {
    items: InventoryItem[];
    onStockIn: (item: InventoryItem) => void;
    onStockOut: (item: InventoryItem) => void;
}

type SortConfig = {
    key: keyof InventoryItem | null;
    direction: 'asc' | 'desc';
};

export function InventoryTable({ items, onStockIn, onStockOut }: InventoryTableProps) {
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });

    const handleSort = (key: keyof InventoryItem) => {
        setSortConfig((current) => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
        }));
    };

    const sortedItems = [...items].sort((a, b) => {
        if (!sortConfig.key) return 0;

        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue === bValue) return 0;
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        const comparison = aValue < bValue ? -1 : 1;
        return sortConfig.direction === 'asc' ? comparison : -comparison;
    });

    const translateFeedType = (type: string) => {
        const translations: Record<string, string> = {
            'Feed': 'Yem',
            'Medicine': 'İlaç',
            'Supplement': 'Takviye',
            'Equipment': 'Ekipman',
            'Other': 'Diğer',
        };
        return translations[type] || type;
    };

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead onClick={() => handleSort('feed_name')} className="cursor-pointer hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-2">
                                Ürün Adı
                                <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                            </div>
                        </TableHead>
                        <TableHead onClick={() => handleSort('feed_type')} className="cursor-pointer hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-2">
                                Tür
                                <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                            </div>
                        </TableHead>
                        <TableHead onClick={() => handleSort('quantity')} className="cursor-pointer hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-2">
                                Miktar
                                <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                            </div>
                        </TableHead>
                        <TableHead>Birim</TableHead>
                        <TableHead>Durum</TableHead>
                        <TableHead onClick={() => handleSort('updated_at')} className="cursor-pointer hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-2">
                                Son Güncelleme
                                <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                            </div>
                        </TableHead>
                        <TableHead className="text-right">İşlemler</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedItems.map((item) => {
                        return (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">{item.feed_name}</TableCell>
                                <TableCell>{translateFeedType(item.feed_type)}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        {item.quantity}
                                    </div>
                                </TableCell>
                                <TableCell>{item.unit}</TableCell>
                                <TableCell>
                                    <Badge variant={item.quantity === 0 ? 'destructive' : 'outline'}>
                                        {item.quantity === 0 ? 'Stok Yok' : 'Stokta'}
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
                                            <ArrowUp className="mr-1 h-4 w-4" /> Giriş
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-red-600 hover:text-red-700"
                                            onClick={() => onStockOut(item)}
                                        >
                                            <ArrowDown className="mr-1 h-4 w-4" /> Çıkış
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
