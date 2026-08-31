import { useState } from 'react';
import { Animal } from '@/lib/types';
import { animalStatusBadge, normalizeAnimalStatus } from '@/lib/animal-status';
import { cn } from '@/lib/utils';
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
                                <Badge className={cn('border-transparent', animalStatusBadge(animal.status).badgeClass)}>
                                    {animalStatusBadge(animal.status).label}
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
                                        disabled={normalizeAnimalStatus(animal.status) === 'Satildi'}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-chart-1 hover:text-chart-1"
                                        onClick={() => onSell(animal)}
                                        disabled={normalizeAnimalStatus(animal.status) === 'Satildi'}
                                    >
                                        <BadgeTurkishLira className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive"
                                        onClick={() => onDelete(animal.id)}
                                        disabled={normalizeAnimalStatus(animal.status) === 'Satildi'}
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
