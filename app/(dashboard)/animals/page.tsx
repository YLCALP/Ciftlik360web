'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AnimalTable } from '@/components/animals/AnimalTable';
import { AnimalForm } from '@/components/animals/AnimalForm';
import { SellAnimalDialog } from '@/components/animals/SellAnimalDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Download } from 'lucide-react';
import { createAnimalPurchaseTransaction, createAnimalSaleTransaction, updateAnimalPurchaseTransaction } from '@/lib/transactions';
import { Animal } from '@/lib/types';
import { toast } from '@/lib/toast';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Beef } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportToExcel, exportToPDF } from '@/lib/export';

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
    const [statusFilter, setStatusFilter] = useState<string>('Hepsi');
    const [typeFilter, setTypeFilter] = useState<string>('Hepsi');

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

    const filteredAnimals = animals.filter((animal) => {
        const matchesSearch =
            animal.tag_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (animal.name?.toLowerCase() || '').includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'Hepsi' || animal.status?.toLowerCase() === statusFilter.toLowerCase();
        const matchesType = typeFilter === 'Hepsi' || animal.species?.toLowerCase() === typeFilter.toLowerCase();

        return matchesSearch && matchesStatus && matchesType;
    });

    const handleCreate = async (values: any) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Kullanıcı bulunamadı');

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
            toast.success('Hayvan eklendi!', `${values.tag_number} başarıyla sisteme eklendi.`);
        } catch (error) {
            console.error('Error creating animal:', error);
            toast.error('Hata!', 'Hayvan eklenirken bir sorun oluştu.');
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
            toast.success('Hayvan güncellendi!', 'Bilgiler başarıyla güncellendi.');
        } catch (error) {
            console.error('Error updating animal:', error);
            toast.error('Hata!', 'Hayvan güncellenirken bir sorun oluştu.');
        }
    };

    const handleDeleteClick = (id: string) => {
        setAnimalToDelete(id);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!animalToDelete) return;
        try {
            // First, delete related transactions
            const { error: transactionError } = await supabase
                .from('transactions')
                .delete()
                .eq('animal_id', animalToDelete);

            if (transactionError) {
                console.error('Error deleting related transactions:', transactionError);
                toast.error('Hata!', 'İlişkili kayıtlar silinirken bir sorun oluştu.');
                return;
            }

            // Then delete the animal
            const { error } = await supabase
                .from('animals')
                .delete()
                .eq('id', animalToDelete);

            if (error) {
                console.error('Error deleting animal:', error);
                toast.error('Hata!', 'Hayvan silinirken bir sorun oluştu.');
                return;
            }

            setAnimals(animals.filter((a) => a.id !== animalToDelete));
            setIsDeleteDialogOpen(false);
            setAnimalToDelete(null);
            toast.success('Hayvan silindi!', 'Kayıt başarıyla silindi.');
        } catch (error) {
            console.error('Error deleting animal:', error);
            toast.error('Hata!', 'Hayvan silinirken bir sorun oluştu.');
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
                    status: 'Satildi'
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
                    ? { ...a, sold_price: data.sold_price, sold_date: data.sold_date, status: 'Satildi' }
                    : a
            ));
            setIsSellDialogOpen(false);
            setAnimalToSell(null);
            toast.success('Hayvan satıldı!', `${animalToSell.tag_number} başarıyla satıldı olarak işaretlendi.`);
        } catch (error) {
            console.error('Error selling animal:', error);
            toast.error('Hata!', 'Satış işlemi sırasında bir sorun oluştu.');
        }
    };

    const handleEditClick = (animal: Animal) => {
        setSelectedAnimal(animal);
        setIsEditDialogOpen(true);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-center gap-4 animate-slide-up delay-100">
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Hayvan ara..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Duruma göre filtrele" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Hepsi">Tüm Durumlar</SelectItem>
                        <SelectItem value="Aktif">Aktif</SelectItem>
                        <SelectItem value="Satildi">Satıldı</SelectItem>
                        <SelectItem value="Hasta">Hasta</SelectItem>
                        <SelectItem value="Gebe">Gebe</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Türe göre filtrele" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Hepsi">Tüm Türler</SelectItem>
                        <SelectItem value="Inek">İnek</SelectItem>
                        <SelectItem value="Koyun">Koyun</SelectItem>
                        <SelectItem value="Keci">Keçi</SelectItem>
                        <SelectItem value="Tavuk">Tavuk</SelectItem>
                    </SelectContent>
                </Select>
                <div className="flex gap-2 w-full sm:w-auto sm:ml-auto">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                <Download className="mr-2 h-4 w-4" /> Dışa Aktar
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => {
                                const success = exportToExcel(
                                    filteredAnimals.map((a: Animal) => ({
                                        'Küpe No': a.tag_number,
                                        'İsim': a.name || '-',
                                        'Tür': a.species,
                                        'Irk': a.breed || '-',
                                        'Cinsiyet': a.gender,
                                        'Doğum Tarihi': a.birth_date || '-',
                                        'Kilo': a.weight || '-',
                                        'Alış Fiyatı': a.purchase_price,
                                        'Durum': a.status || 'Aktif'
                                    })),
                                    'Hayvanlar'
                                );
                                if (success) toast.success('Başarılı!', 'Excel dosyası indirildi.');
                                else toast.error('Hata!', 'Dışa aktarma başarısız.');
                            }}>
                                Excel (.xlsx)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                                const success = exportToPDF(
                                    filteredAnimals,
                                    [
                                        { header: 'Küpe No', dataKey: 'tag_number' },
                                        { header: 'İsim', dataKey: 'name' },
                                        { header: 'Tür', dataKey: 'species' },
                                        { header: 'Irk', dataKey: 'breed' },
                                        { header: 'Cinsiyet', dataKey: 'gender' },
                                        { header: 'Durum', dataKey: 'status' },
                                    ],
                                    'Hayvanlar',
                                    'Hayvan Listesi'
                                );
                                if (success) toast.success('Başarılı!', 'PDF dosyası indirildi.');
                                else toast.error('Hata!', 'Dışa aktarma başarısız.');
                            }}>
                                PDF (.pdf)
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> Hayvan Ekle
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Yeni Hayvan Ekle</DialogTitle>
                            </DialogHeader>
                            <AnimalForm
                                onSubmit={handleCreate}
                                onCancel={() => setIsAddDialogOpen(false)}
                            />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>





            {loading ? (
                <TableSkeleton />
            ) : filteredAnimals.length === 0 ? (
                <EmptyState
                    icon={Beef}
                    title="Henüz hayvan eklenmemiş"
                    description="Çiftliğinize yeni hayvanlar ekleyerek takibini yapmaya başlayın."
                    actionLabel="Hayvan Ekle"
                    onAction={() => setIsAddDialogOpen(true)}
                />
            ) : (
                <div className="animate-slide-up delay-200">
                    <Card>
                        <CardContent className="p-0">
                            <AnimalTable
                                animals={filteredAnimals}
                                onDelete={handleDeleteClick}
                                onEdit={handleEditClick}
                                onSell={handleSellClick}
                            />
                        </CardContent>
                    </Card>
                </div>
            )}

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Hayvanı Düzenle</DialogTitle>
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
                        <DialogTitle>Emin misiniz?</DialogTitle>
                        <DialogDescription>
                            Bu işlem geri alınamaz. Hayvan kaydı kalıcı olarak silinecektir.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            İptal
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete}>
                            Sil
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
