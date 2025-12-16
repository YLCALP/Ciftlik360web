import { useState } from 'react';
import { Animal, ANIMAL_STATUS } from '@/lib/types';
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
import { Edit, Eye, Trash, BadgeTurkishLira, ArrowUpDown } from 'lucide-react';
import Link from 'next/link';

interface AnimalTableProps {
    animals: Animal[];
    onDelete: (id: string) => void;
    onEdit: (animal: Animal) => void;
    onSell: (animal: Animal) => void;
}

type SortConfig = {
    key: keyof Animal | null;
    direction: 'asc' | 'desc';
};

export function AnimalTable({ animals, onDelete, onEdit, onSell }: AnimalTableProps) {
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });

    const handleSort = (key: keyof Animal) => {
        setSortConfig((current) => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
        }));
    };

    const sortedAnimals = [...animals].sort((a, b) => {
        if (!sortConfig.key) return 0;

        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue === bValue) return 0;
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        const comparison = aValue < bValue ? -1 : 1;
        return sortConfig.direction === 'asc' ? comparison : -comparison;
    });

    const getStatusColor = (status: string) => {
        const statusLower = status?.toLowerCase();
        switch (statusLower) {
            case 'aktif':
                return 'bg-green-500 hover:bg-green-600';
            case 'hasta':
                return 'bg-red-500 hover:bg-red-600';
            case 'gebe':
                return 'bg-blue-500 hover:bg-blue-600';
            case 'satildi':
            case 'satıldı':
                return 'bg-red-500 hover:bg-red-600';
            case 'oldu':
            case 'öldü':
                return 'bg-gray-500 hover:bg-gray-600';
            default:
                return 'bg-green-500 hover:bg-green-600';
        }
    };

    const translateSpecies = (species: string) => {
        const translations: Record<string, string> = {
            'Inek': 'İnek',
            'Koyun': 'Koyun',
            'Keci': 'Keçi',
            'Tavuk': 'Tavuk',
        };
        return translations[species] || species;
    };

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[50px]">Sıra</TableHead>
                        <TableHead onClick={() => handleSort('tag_number')} className="cursor-pointer hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-2">
                                Küpe No
                                <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                            </div>
                        </TableHead>
                        <TableHead onClick={() => handleSort('name')} className="cursor-pointer hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-2">
                                İsim
                                <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                            </div>
                        </TableHead>
                        <TableHead onClick={() => handleSort('species')} className="cursor-pointer hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-2">
                                Tür
                                <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                            </div>
                        </TableHead>
                        <TableHead onClick={() => handleSort('breed')} className="cursor-pointer hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-2">
                                Irk
                                <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                            </div>
                        </TableHead>
                        <TableHead onClick={() => handleSort('purchase_date')} className="cursor-pointer hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-2">
                                Alış Tarihi
                                <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                            </div>
                        </TableHead>
                        <TableHead onClick={() => handleSort('status')} className="cursor-pointer hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-2">
                                Durum
                                <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                            </div>
                        </TableHead>
                        <TableHead className="text-right">İşlemler</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedAnimals.map((animal, index) => (
                        <TableRow key={animal.id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell className="font-medium">{animal.tag_number}</TableCell>
                            <TableCell>{animal.name || '-'}</TableCell>
                            <TableCell>{translateSpecies(animal.species)}</TableCell>
                            <TableCell>{animal.breed || '-'}</TableCell>
                            <TableCell>
                                {new Date(animal.purchase_date).toLocaleDateString('tr-TR')}
                            </TableCell>
                            <TableCell>
                                <Badge className={getStatusColor(animal.status || 'Aktif')}>
                                    {animal.status || 'Aktif'}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Button variant="ghost" size="icon" asChild>
                                        <Link href={`/animals/${animal.id}`}>
                                            <Eye className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onEdit(animal)}
                                        disabled={animal.status === ANIMAL_STATUS.SATILDI}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-green-600 hover:text-green-700"
                                        onClick={() => onSell(animal)}
                                        disabled={animal.status === ANIMAL_STATUS.SATILDI}
                                    >
                                        <BadgeTurkishLira className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive"
                                        onClick={() => onDelete(animal.id)}
                                        disabled={animal.status === ANIMAL_STATUS.SATILDI}
                                    >
                                        <Trash className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
