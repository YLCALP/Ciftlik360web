'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { Animal } from '@/lib/types';

const formSchema = z.object({
    sold_price: z.string().refine((val) => !isNaN(Number(val.replace(/\./g, '').replace(',', '.'))), {
        message: 'Sayı olmalıdır',
    }),
    sold_date: z.date(),
});

type SellAnimalFormValues = z.infer<typeof formSchema>;

interface SellAnimalDialogProps {
    animal: Animal | null;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (data: { sold_price: number; sold_date: string }) => Promise<void>;
}

export function SellAnimalDialog({ animal, isOpen, onClose, onConfirm }: SellAnimalDialogProps) {
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<SellAnimalFormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            sold_price: '',
            sold_date: new Date(),
        },
    });

    const formatCurrency = (value: string) => {
        if (!value) return '';
        const number = parseFloat(value.replace(/\./g, '').replace(',', '.'));
        if (isNaN(number)) return value;
        return new Intl.NumberFormat('tr-TR').format(number);
    };

    const handleSubmit = async (values: SellAnimalFormValues) => {
        setIsLoading(true);
        try {
            const soldPrice = parseFloat(values.sold_price.replace(/\./g, '').replace(',', '.'));
            const soldDate = values.sold_date.toISOString().split('T')[0];

            await onConfirm({ sold_price: soldPrice, sold_date: soldDate });
            form.reset();
            onClose();
        } catch (error) {
            console.error('Error selling animal:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            form.reset();
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Hayvan Sat - {animal?.tag_number} ({animal?.species})
                    </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="sold_price"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Satış Fiyatı</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="Satış fiyatını girin"
                                            onChange={(e) => {
                                                const rawValue = e.target.value.replace(/\./g, '');
                                                if (!isNaN(Number(rawValue))) {
                                                    field.onChange(formatCurrency(rawValue));
                                                }
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="sold_date"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Satış Tarihi</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "PPP", { locale: tr })
                                                    ) : (
                                                        <span>Tarih seçin</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) =>
                                                    date > new Date() || date < new Date("1900-01-01")
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                                İptal
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? 'Satılıyor...' : 'Satışı Onayla'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
