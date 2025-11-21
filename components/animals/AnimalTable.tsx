'use client';

import { Animal } from '@/lib/types';
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
import { Edit, Eye, Trash, BadgeTurkishLira } from 'lucide-react';
import Link from 'next/link';

interface AnimalTableProps {
    animals: Animal[];
    onDelete: (id: string) => void;
    onEdit: (animal: Animal) => void;
    onSell: (animal: Animal) => void;
}

export function AnimalTable({ animals, onDelete, onEdit, onSell }: AnimalTableProps) {
    const getStatusColor = (status: string) => {
        const statusLower = status?.toLowerCase();
        switch (statusLower) {
            case 'healthy':
                return 'bg-green-500 hover:bg-green-600';
            case 'sick':
                return 'bg-red-500 hover:bg-red-600';
            case 'pregnant':
                return 'bg-blue-500 hover:bg-blue-600';
            case 'sold':
                return 'bg-gray-500 hover:bg-gray-600';
            case 'active':
                return 'bg-green-500 hover:bg-green-600';
            default:
                return 'bg-green-500 hover:bg-green-600';
        }
    };

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Tag Number</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Breed</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {animals.map((animal) => (
                        <TableRow key={animal.id}>
                            <TableCell className="font-medium">{animal.tag_number}</TableCell>
                            <TableCell>{animal.name || '-'}</TableCell>
                            <TableCell>{animal.species}</TableCell>
                            <TableCell>{animal.breed || '-'}</TableCell>
                            <TableCell>
                                <Badge className={getStatusColor(animal.status || 'active')}>
                                    {animal.status || 'active'}
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
                                        disabled={animal.status === 'sold'}
                                        title={animal.status === 'sold' ? 'Sold animals cannot be edited' : 'Edit'}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    {animal.status !== 'sold' && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-green-600 hover:text-green-700"
                                            onClick={() => onSell(animal)}
                                            title="Sell Animal"
                                        >
                                            <BadgeTurkishLira className="h-4 w-4" />
                                        </Button>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive"
                                        onClick={() => onDelete(animal.id)}
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
