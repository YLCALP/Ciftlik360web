'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AnimalTable } from '@/components/animals/AnimalTable';
import { AnimalForm } from '@/components/animals/AnimalForm';
import { SellAnimalDialog } from '@/components/animals/SellAnimalDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import { createAnimalPurchaseTransaction, createAnimalSaleTransaction, updateAnimalPurchaseTransaction } from '@/lib/transactions';
import { Animal } from '@/lib/types';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog';

export default function AnimalsPage() {
    const [animals, setAnimals] = useState<Animal[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isSellDialogOpen, setIsSellDialogOpen] = useState(false);
    const [selectedAnimal, setSelectedAnimal] = useState<Animal | undefined>(undefined);
    const [animalToDelete, setAnimalToDelete] = useState<string | null>(null);
    const [animalToSell, setAnimalToSell] = useState<Animal | null>(null);

    const supabase = createClient();

    useEffect(() => {
        async function fetchAnimals() {
            try {
                const { data, error } = await supabase
                    .from('animals')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) {
                    console.error('Error fetching animals:', error);
                } else {
                    setAnimals(data || []);
                }
            } catch (error) {
                console.error('Unexpected error:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchAnimals();
    }, [supabase]);

    const filteredAnimals = animals.filter((animal) =>
        (animal.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        animal.tag_number.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCreate = async (values: any) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user found');

            const newAnimal = {
                ...values,
                user_id: user.id,
                weight: values.weight ? parseFloat(values.weight) : null,
                purchase_price: parseFloat(values.purchase_price),
            };

            const { data, error } = await supabase.from('animals').insert([newAnimal]).select().single();

            if (error) throw error;

            // Create purchase transaction
            await createAnimalPurchaseTransaction(
                user.id,
                data.id,
                values.tag_number,
                values.species,
                parseFloat(values.purchase_price),
                values.purchase_date
            );

            setAnimals([data, ...animals]);
            setIsAddDialogOpen(false);
        } catch (error) {
            console.error('Error creating animal:', error);
        }
    };

    const handleUpdate = async (values: any) => {
        if (!selectedAnimal) return;
        try {
            const updatedAnimal = {
                ...values,
                weight: values.weight ? parseFloat(values.weight) : null,
                purchase_price: parseFloat(values.purchase_price),
            };

            const { data, error } = await supabase
                .from('animals')
                .update(updatedAnimal)
                .eq('id', selectedAnimal.id)
                .select()
                .single();

            if (error) throw error;

            // Update the related purchase transaction
            await updateAnimalPurchaseTransaction(
                selectedAnimal.id,
                values.tag_number,
                values.species,
                parseFloat(values.purchase_price),
                values.purchase_date
            );

            setAnimals(animals.map((a) => (a.id === data.id ? data : a)));
            setIsEditDialogOpen(false);
            setSelectedAnimal(undefined);
        } catch (error) {
            console.error('Error updating animal:', error);
        }
    };

    const handleDeleteClick = (id: string) => {
        setAnimalToDelete(id);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!animalToDelete) return;
        try {
            const { error } = await supabase
                .from('animals')
                .delete()
                .eq('id', animalToDelete);

            if (error) {
                console.error('Error deleting animal:', error);
                return;
            }

            setAnimals(animals.filter((a) => a.id !== animalToDelete));
            setIsDeleteDialogOpen(false);
            setAnimalToDelete(null);
        } catch (error) {
            console.error('Error deleting animal:', error);
        }
    };

    const handleSellClick = (animal: Animal) => {
        setAnimalToSell(animal);
        setIsSellDialogOpen(true);
    };

    const handleSellConfirm = async (data: { sold_price: number; sold_date: string }) => {
        if (!animalToSell) return;
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                console.error('User not authenticated');
                return;
            }

            // Update animal as sold
            const { error } = await supabase
                .from('animals')
                .update({
                    sold_price: data.sold_price,
                    sold_date: data.sold_date,
                    status: 'sold'
                })
                .eq('id', animalToSell.id);

            if (error) throw error;

            // Create sale transaction
            await createAnimalSaleTransaction(
                user.id,
                animalToSell.id,
                animalToSell.tag_number,
                animalToSell.species,
                data.sold_price,
                data.sold_date
            );

            // Update local state
            setAnimals(animals.map(a =>
                a.id === animalToSell.id
                    ? { ...a, sold_price: data.sold_price, sold_date: data.sold_date, status: 'sold' }
                    : a
            ));
            setIsSellDialogOpen(false);
            setAnimalToSell(null);
        } catch (error) {
            console.error('Error selling animal:', error);
        }
    };

    const handleEditClick = (animal: Animal) => {
        setSelectedAnimal(animal);
        setIsEditDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Animals</h2>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add Animal
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Add New Animal</DialogTitle>
                        </DialogHeader>
                        <AnimalForm
                            onSubmit={handleCreate}
                            onCancel={() => setIsAddDialogOpen(false)}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search animals..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div>Loading...</div>
            ) : (
                <AnimalTable
                    animals={filteredAnimals}
                    onDelete={handleDeleteClick}
                    onEdit={handleEditClick}
                    onSell={handleSellClick}
                />
            )}

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Animal</DialogTitle>
                    </DialogHeader>
                    {selectedAnimal && (
                        <AnimalForm
                            initialData={selectedAnimal}
                            onSubmit={handleUpdate}
                            onCancel={() => setIsEditDialogOpen(false)}
                        />
                    )}
                </DialogContent>
            </Dialog>

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Are you sure?</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. This will permanently delete the animal record.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <SellAnimalDialog
                animal={animalToSell}
                isOpen={isSellDialogOpen}
                onClose={() => setIsSellDialogOpen(false)}
                onConfirm={handleSellConfirm}
            />
        </div>
    );
}
