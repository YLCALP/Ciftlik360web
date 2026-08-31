'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Transaction, Animal } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Combobox } from '@/components/ui/combobox';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';

// Gelir kategorileri
const incomeCategories = [
    { value: 'hayvan_satisi', label: 'Hayvan Satışı' },
];

// Gider kategorileri
const expenseCategories = [
    { value: 'hayvan_alimi', label: 'Hayvan Alımı' },
    { value: 'yem', label: 'Yem' },
    { value: 'ilaclar', label: 'İlaçlar' },
    { value: 'ekipman', label: 'Ekipman' },
    { value: 'iscilik', label: 'İşçilik' },
    { value: 'diger', label: 'Diğer' },
];

// Form schema with zod
const formSchema = z.object({
    date: z.date(),
    description: z.string().min(1, 'Açıklama gereklidir'),
    amount: z.string().min(1, 'Tutar gereklidir').refine(
        (val) => {
            const num = Number(val.replace(/\./g, ''));
            return !isNaN(num) && num > 0;
        },
        { message: 'Geçerli bir tutar girin' }
    ),
    type: z.string().min(1, 'Tür gereklidir'),
    category: z.string().min(1, 'Kategori gereklidir'),
    notes: z.string().optional(),
    animal_id: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (transaction: Omit<Transaction, 'id' | 'created_at' | 'user_id'>) => void;
    forcedType?: 'Gelir' | 'Gider';
}

export function TransactionModal({
    isOpen,
    onClose,
    onConfirm,
    forcedType,
}: TransactionModalProps) {
    const [activeAnimals, setActiveAnimals] = useState<Animal[]>([]);
    const [loadingAnimals, setLoadingAnimals] = useState(false);

    const supabase = createClient();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            date: new Date(),
            description: '',
            amount: '',
            type: forcedType || 'Gider',
            category: '',
            notes: '',
            animal_id: '',
        },
    });

    const watchType = form.watch('type');
    const watchCategory = form.watch('category');

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            form.reset({
                date: new Date(),
                description: '',
                amount: '',
                type: forcedType || 'Gider',
                category: forcedType === 'Gelir' ? 'hayvan_satisi' : '',
                notes: '',
                animal_id: '',
            });
            fetchActiveAnimals();
        }
    }, [isOpen, forcedType]);

    // Reset category when type changes
    useEffect(() => {
        const defaultCategory = watchType === 'Gelir' ? 'hayvan_satisi' : '';
        form.setValue('category', defaultCategory);
        form.setValue('animal_id', '');
    }, [watchType]);

    async function fetchActiveAnimals() {
        setLoadingAnimals(true);
        try {
            const { data, error } = await supabase
                .from('animals')
                .select('*')
                .eq('status', 'Aktif')
                .order('tag_number', { ascending: true });

            if (error) throw error;
            setActiveAnimals(data || []);
        } catch (error) {
            console.error('Error fetching animals:', error);
        } finally {
            setLoadingAnimals(false);
        }
    }

    const formatCurrency = (value: string) => {
        if (!value) return '';
        const number = value.replace(/\D/g, '');
        return number.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    const handleSubmit = (data: FormValues) => {
        const transactionData: any = {
            date: format(data.date, 'yyyy-MM-dd'),
            description: data.description,
            amount: Number(data.amount.replace(/\./g, '')),
            type: data.type,
            category: data.category,
            notes: data.notes || '',
        };

        // Add animal_id if hayvan_satisi is selected
        if (data.category === 'hayvan_satisi' && data.animal_id) {
            transactionData.animal_id = data.animal_id;
        }

        onConfirm(transactionData);
        form.reset();
        onClose();
    };

    // Get categories based on type
    const categories = watchType === 'Gelir' ? incomeCategories : expenseCategories;

    // Convert animals to combobox options
    const animalOptions = activeAnimals.map(animal => ({
        value: animal.id,
        label: `${animal.tag_number}${animal.name ? ` - ${animal.name}` : ''} (${animal.species})`,
    }));

    // Custom validation for animal_id when category is hayvan_satisi
    const validateAndSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Check if animal is required but not selected
        if (watchCategory === 'hayvan_satisi' && !form.getValues('animal_id')) {
            form.setError('animal_id', {
                type: 'manual',
                message: 'Satılan hayvan gereklidir'
            });
            return;
        }

        form.handleSubmit(handleSubmit)(e);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>İşlem Ekle</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={validateAndSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tarih</FormLabel>
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
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tutar</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="0"
                                                value={formatCurrency(field.value)}
                                                onChange={(e) => {
                                                    const rawValue = e.target.value.replace(/\./g, '');
                                                    if (!isNaN(Number(rawValue))) {
                                                        field.onChange(rawValue);
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
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tür</FormLabel>
                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                            disabled={!!forcedType}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Tür seçin" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Gelir">Gelir</SelectItem>
                                                <SelectItem value="Gider">Gider</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Kategori</FormLabel>
                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Kategori seçin" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {categories.map((cat) => (
                                                    <SelectItem key={cat.value} value={cat.value}>
                                                        {cat.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Animal selector - only show when hayvan_satisi is selected */}
                        {watchCategory === 'hayvan_satisi' && (
                            <FormField
                                control={form.control}
                                name="animal_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Satılan Hayvan</FormLabel>
                                        <FormControl>
                                            <Combobox
                                                options={animalOptions}
                                                value={field.value || ''}
                                                onSelect={field.onChange}
                                                placeholder={loadingAnimals ? "Yükleniyor..." : "Hayvan seçin"}
                                                searchPlaceholder="Hayvan ara..."
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Açıklama</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Açıklama girin" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notlar (Opsiyonel)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Notlar..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={onClose}>
                                İptal
                            </Button>
                            <Button type="submit">İşlemi Kaydet</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
