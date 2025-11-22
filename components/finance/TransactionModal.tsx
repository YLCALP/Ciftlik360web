'use client';

import { useState, useEffect } from 'react';
import { Transaction } from '@/lib/types';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (transaction: Omit<Transaction, 'id' | 'created_at' | 'user_id'>) => void;
    forcedType?: 'income' | 'expense';
}

export function TransactionModal({
    isOpen,
    onClose,
    onConfirm,
    forcedType,
}: TransactionModalProps) {
    const [formData, setFormData] = useState({
        date: format(new Date(), 'yyyy-MM-dd'),
        description: '',
        amount: 0,
        type: forcedType || 'expense',
        category: 'other',
        notes: '',
    });

    // Update state when forcedType changes or modal opens
    useEffect(() => {
        if (isOpen && forcedType) {
            setFormData(prev => ({ ...prev, type: forcedType }));
        }
    }, [isOpen, forcedType]);

    const formatCurrency = (value: string) => {
        if (!value) return '';
        // Remove non-digits
        const number = value.replace(/\D/g, '');
        // Add dots as thousands separators
        return number.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    const handleChange = (field: string, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfirm(formData);
        setFormData({
            date: format(new Date(), 'yyyy-MM-dd'),
            description: '',
            amount: 0,
            type: forcedType || 'expense',
            category: 'other',
            notes: '',
        });
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Transaction</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="date">Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full pl-3 text-left font-normal",
                                            !formData.date && "text-muted-foreground"
                                        )}
                                    >
                                        {formData.date ? (
                                            format(new Date(formData.date), "PPP")
                                        ) : (
                                            <span>Pick a date</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={formData.date ? new Date(formData.date) : undefined}
                                        onSelect={(date) => handleChange('date', date ? format(date, 'yyyy-MM-dd') : '')}
                                        disabled={(date) =>
                                            date > new Date() || date < new Date("1900-01-01")
                                        }
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount</Label>
                            <Input
                                id="amount"
                                value={formatCurrency(formData.amount.toString())}
                                onChange={(e) => {
                                    const rawValue = e.target.value.replace(/\./g, '');
                                    if (!isNaN(Number(rawValue))) {
                                        handleChange('amount', Number(rawValue));
                                    }
                                }}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="type">Type</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value) =>
                                    handleChange('type', value)
                                }
                                disabled={!!forcedType}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="income">Income</SelectItem>
                                    <SelectItem value="expense">Expense</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select
                                value={formData.category}
                                onValueChange={(value) =>
                                    handleChange('category', value)
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="animal_sale">Animal Sale</SelectItem>
                                    <SelectItem value="animal_purchase">Animal Purchase</SelectItem>
                                    <SelectItem value="feed">Feed</SelectItem>
                                    <SelectItem value="medicine">Medicine</SelectItem>
                                    <SelectItem value="equipment">Equipment</SelectItem>
                                    <SelectItem value="labor">Labor</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Input
                            id="description"
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes (Optional)</Label>
                        <Input
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => handleChange('notes', e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit">Save Transaction</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
