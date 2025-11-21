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
    onConfirm: (quantity: number, type: 'in' | 'out') => void;
    item: InventoryItem | null;
    type: 'in' | 'out';
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
            setError('Please enter a valid quantity');
            return;
        }

        if (type === 'out' && item && numQuantity > item.quantity) {
            setError(`Cannot remove more than available stock (${item.quantity} ${item.unit})`);
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
                        {type === 'in' ? 'Stock In' : 'Stock Out'} - {item?.feed_name}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="quantity">Quantity ({item?.unit})</Label>
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
                            placeholder="Enter quantity"
                            required
                        />
                        {error && (
                            <p className="text-sm text-destructive">{error}</p>
                        )}
                        {type === 'out' && item && (
                            <p className="text-xs text-muted-foreground">
                                Available: {item.quantity} {item.unit}
                            </p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit">Confirm</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
