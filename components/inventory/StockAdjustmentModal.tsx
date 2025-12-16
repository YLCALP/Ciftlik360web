'use client';

import { useState } from 'react';
import { InventoryItem } from '@/lib/types';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface StockAdjustmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (quantity: number, type: 'Stokta' | 'StokYok') => void;
    item: InventoryItem | null;
    type: 'Stokta' | 'StokYok';
}

export function StockAdjustmentModal({
    isOpen,
    onClose,
    onConfirm,
    item,
    type,
}: StockAdjustmentModalProps) {
    const [quantity, setQuantity] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numQuantity = parseFloat(quantity);

        if (isNaN(numQuantity) || numQuantity <= 0) {
            setError('Geçerli bir adet giriniz');
            return;
        }

        if (type === 'StokYok' && item && numQuantity > item.quantity) {
            setError(`Mevcut stokdan fazla stok çıkamazsınız (${item.quantity} ${item.unit})`);
            return;
        }

        onConfirm(numQuantity, type);
        setQuantity('');
        setError(null);
        onClose();
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setQuantity('');
            setError(null);
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {type === 'Stokta' ? 'Stok Ekle' : 'Stok Çıkar'} - {item?.feed_name}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="quantity">Adet ({item?.unit})</Label>
                        <Input
                            id="quantity"
                            type="number"
                            min="0"
                            step="0.01"
                            value={quantity}
                            onChange={(e) => {
                                setQuantity(e.target.value);
                                setError(null);
                            }}
                            placeholder="Adet Giriniz"
                            required
                        />
                        {error && (
                            <p className="text-sm text-destructive">{error}</p>
                        )}
                        {type === 'StokYok' && item && (
                            <p className="text-xs text-muted-foreground">
                                Mevcut Stok: {item.quantity} {item.unit}
                            </p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                            İptal
                        </Button>
                        <Button type="submit">Onayla</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
