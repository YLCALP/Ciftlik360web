'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
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
import { Animal } from '@/lib/types';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

const formSchema = z.object({
    tag_number: z.string().min(1, 'Tag number is required'),
    name: z.string().optional(),
    species: z.string().min(1, 'Species is required'),
    breed: z.string().optional(),
    gender: z.string().min(1, 'Gender is required'),
    birth_date: z.string().optional(),
    weight: z.string().optional(),
    purchase_price: z.string().default('0'),
    purchase_date: z.string().min(1, 'Purchase date is required'),
    status: z.string().default('Active'),
    notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AnimalFormProps {
    initialData?: Animal;
    onSubmit: (values: FormValues) => void;
    loading?: boolean;
    onCancel?: () => void;
}

export function AnimalForm({ initialData, onSubmit, loading, onCancel }: AnimalFormProps) {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            tag_number: initialData?.tag_number || '',
            name: initialData?.name || '',
            species: initialData?.species || '',
            breed: initialData?.breed || '',
            gender: initialData?.gender || 'Female',
            birth_date: initialData?.birth_date || '',
            weight: initialData?.weight?.toString() || '',
            purchase_price: initialData?.purchase_price?.toString() || '0',
            purchase_date: initialData?.purchase_date || format(new Date(), 'yyyy-MM-dd'),
            status: initialData?.status || 'Active',
            notes: initialData?.notes || '',
        },
    });

    const formatCurrency = (value: string) => {
        if (!value) return '';
        // Remove non-digits
        const number = value.replace(/\D/g, '');
        // Add dots as thousands separators
        return number.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="tag_number"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tag Number</FormLabel>
                                <FormControl>
                                    <Input placeholder="TR-001" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Bella" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="species"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Species</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select species" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Cow">Cow</SelectItem>
                                        <SelectItem value="Sheep">Sheep</SelectItem>
                                        <SelectItem value="Goat">Goat</SelectItem>
                                        <SelectItem value="Chicken">Chicken</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="breed"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Breed</FormLabel>
                                <FormControl>
                                    <Input placeholder="Holstein" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Gender</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select gender" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Female">Female</SelectItem>
                                        <SelectItem value="Male">Male</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Status</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Active">Active</SelectItem>
                                        <SelectItem value="Sick">Sick</SelectItem>
                                        <SelectItem value="Sold">Sold</SelectItem>
                                        <SelectItem value="Deceased">Deceased</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="birth_date"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Birth Date</FormLabel>
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
                                                    format(new Date(field.value), "PPP")
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value ? new Date(field.value) : undefined}
                                            onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
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
                                                    format(new Date(field.value), "PPP")
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value ? new Date(field.value) : undefined}
                                            onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
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
                        name="weight"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Weight (kg)</FormLabel>
                                <FormControl>
                                    <Input type="number" step="0.1" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="purchase_price"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Purchase Price</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="0"
                                        {...field}
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
                </div>
                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Any additional notes..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex justify-end gap-2">
                    {onCancel && (
                        <Button type="button" variant="outline" onClick={onCancel}>
                            Cancel
                        </Button>
                    )}
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Saving...' : 'Save Animal'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
