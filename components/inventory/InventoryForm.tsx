'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';

const formSchema = z.object({
    feed_name: z.string().min(2, 'Name must be at least 2 characters'),
    feed_type: z.string().min(1, 'Type is required'),
    brand: z.string().optional(),
    quantity: z.string().refine((val) => !isNaN(Number(val)), {
        message: 'Must be a number',
    }),
    unit: z.string().min(1, 'Unit is required'),
    purchase_price: z.string().refine((val) => !isNaN(Number(val.replace(/\./g, '').replace(',', '.'))), {
        message: 'Must be a number',
    }),
    purchase_date: z.date(),
    expiry_date: z.date().optional(),
    supplier: z.string().optional(),
    storage_location: z.string().optional(),
    notes: z.string().optional(),
});

export type InventoryFormValues = z.infer<typeof formSchema>;

interface InventoryFormProps {
    defaultValues?: Partial<InventoryFormValues>;
    onSubmit: (data: InventoryFormValues) => void;
    onCancel: () => void;
    isLoading?: boolean;
}

export function InventoryForm({ defaultValues, onSubmit, onCancel, isLoading }: InventoryFormProps) {
    const form = useForm<InventoryFormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            feed_name: '',
            feed_type: '',
            brand: '',
            quantity: '0',
            unit: 'kg',
            purchase_price: '0',
            purchase_date: new Date(),
            supplier: '',
            storage_location: '',
            notes: '',
            ...defaultValues,
        },
    });

    const formatCurrency = (value: string) => {
        if (!value) return '';
        const number = parseFloat(value.replace(/\./g, '').replace(',', '.'));
        if (isNaN(number)) return value;
        return new Intl.NumberFormat('tr-TR').format(number);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="feed_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Ürün Adı</FormLabel>
                                <FormControl>
                                    <Input placeholder="Arpa" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="feed_type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tip</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Yem">Yem</SelectItem>
                                        <SelectItem value="Ilac">İlaç</SelectItem>
                                        <SelectItem value="Takviye">Takviye</SelectItem>
                                        <SelectItem value="Ekipman">Ekipman</SelectItem>
                                        <SelectItem value="Diger">Diğer</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="brand"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Marka</FormLabel>
                                <FormControl>
                                    <Input placeholder="Marka" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-2 gap-2">
                        <FormField
                            control={form.control}
                            name="quantity"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Miktar</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="unit"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel> Birim</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Birim" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="kg">Kg</SelectItem>
                                            <SelectItem value="litre">Litre</SelectItem>
                                            <SelectItem value="cuval">Çuval</SelectItem>
                                            <SelectItem value="adet">Adet</SelectItem>
                                            <SelectItem value="balya">Balya</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="purchase_price"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Purchase Price</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
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
                        name="purchase_date"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Purchase Date</FormLabel>
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
                                                    <span>Pick a date</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[340px] p-0" align="start">
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

                    <FormField
                        control={form.control}
                        name="expiry_date"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Expiry Date (Optional)</FormLabel>
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
                                                    <span>Pick a date</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[340px] p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="supplier"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tedarikçi</FormLabel>
                                <FormControl>
                                    <Input placeholder="Tedarikçi" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="storage_location"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Depolama Yeri</FormLabel>
                                <FormControl>
                                    <Input placeholder="Depolama Yeri" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Notlar</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Notlar..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Vazgeç
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Kayıt Ediliyor...' : 'Kaydet'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
