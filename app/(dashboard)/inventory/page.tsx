'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { InventoryTable } from '@/components/inventory/InventoryTable';
import { StockAdjustmentModal } from '@/components/inventory/StockAdjustmentModal';
import { InventoryForm, InventoryFormValues } from '@/components/inventory/InventoryForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Download } from 'lucide-react';
import { InventoryItem } from '@/lib/types';
import { createInventoryPurchaseTransaction } from '@/lib/transactions';
import { toast } from '@/lib/toast';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { PackageOpen } from 'lucide-react';
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

export default function InventoryPage() {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
    const [modalType, setModalType] = useState<'Stokta' | 'StokYok'>('Stokta');
    const [error, setError] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string>('Hepsi');

    const supabase = createClient();

    useEffect(() => {
        fetchInventory();
    }, []);

    async function fetchInventory() {
        try {
            const { data, error } = await supabase
                .from('feed_inventory')
                .select('*')
                .order('feed_name');

            if (error) throw error;
            setItems(data || []);
        } catch (error: any) {
            console.error('Error fetching inventory:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    const filteredItems = items.filter((item) => {
        const matchesSearch = item.feed_name.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'Hepsi' ||
            (statusFilter === 'DusukStok' && item.quantity < 10) ||
            (statusFilter === 'StokYok' && item.quantity === 0) ||
            (statusFilter === 'Stokta' && item.quantity > 0);

        return matchesSearch && matchesStatus;
    });

    const handleStockIn = (item: InventoryItem) => {
        setSelectedItem(item);
        setModalType('Stokta');
        setIsModalOpen(true);
    };

    const handleStockOut = (item: InventoryItem) => {
        setSelectedItem(item);
        setModalType('StokYok');
        setIsModalOpen(true);
    };

    const handleConfirmAdjustment = async (quantity: number, type: 'Stokta' | 'StokYok') => {
        if (!selectedItem) return;

        const newQuantity = type === 'Stokta'
            ? selectedItem.quantity + quantity
            : Math.max(0, selectedItem.quantity - quantity);

        try {
            const { error } = await supabase
                .from('feed_inventory')
                .update({
                    quantity: newQuantity,
                    updated_at: new Date().toISOString()
                })
                .eq('id', selectedItem.id);

            if (error) throw error;

            setItems(items.map(item =>
                item.id === selectedItem.id
                    ? { ...item, quantity: newQuantity, updated_at: new Date().toISOString() }
                    : item
            ));
            toast.success(
                type === 'Stokta' ? 'Stok eklendi!' : 'Stok çıkarıldı!',
                `${selectedItem.feed_name} için stok güncellendi.`
            );
        } catch (error) {
            console.error('Error updating stock:', error);
            toast.error('Hata!', 'Stok güncellenirken bir sorun oluştu.');
        }
    };

    const handleCreate = async (data: InventoryFormValues) => {
        if (isCreating) return;
        setIsCreating(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                console.error('Kullanıcı oturumu açılmadı');
                return;
            }

            const newItem = {
                user_id: user.id,
                feed_name: data.feed_name,
                feed_type: data.feed_type,
                brand: data.brand || null,
                quantity: parseFloat(data.quantity),
                unit: data.unit,
                purchase_price: parseFloat(data.purchase_price.replace(/\./g, '').replace(',', '.')),
                purchase_date: data.purchase_date.toISOString().split('T')[0],
                expiry_date: data.expiry_date ? data.expiry_date.toISOString().split('T')[0] : null,
                supplier: data.supplier || null,
                storage_location: data.storage_location || null,
                notes: data.notes || null,
            };

            const { data: insertedData, error } = await supabase
                .from('feed_inventory')
                .insert([newItem])
                .select()
                .single();

            if (error) throw error;

            // Create purchase transaction
            const purchasePrice = parseFloat(data.purchase_price.replace(/\./g, '').replace(',', '.'));
            await createInventoryPurchaseTransaction(
                user.id,
                insertedData.id,
                data.feed_name,
                data.feed_type,
                purchasePrice,
                data.purchase_date.toISOString().split('T')[0]
            );

            setItems([...items, insertedData]);
            setIsAddDialogOpen(false);
            toast.success('Ürün eklendi!', `${data.feed_name} başarıyla envantere eklendi.`);
        } catch (error) {
            console.error('Error creating item:', error);
            toast.error('Hata!', 'Ürün eklenirken bir sorun oluştu.');
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-center gap-4 animate-slide-up delay-100">
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Envanter ara..."
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
                        <SelectItem value="Hepsi">Tüm Ürünler</SelectItem>
                        <SelectItem value="Stokta">Stokta</SelectItem>
                        <SelectItem value="DusukStok">Düşük Stok (&lt; 10)</SelectItem>
                        <SelectItem value="StokYok">Stok Yok</SelectItem>
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
                                    filteredItems.map((item: InventoryItem) => ({
                                        'Ürün Adı': item.feed_name,
                                        'Tür': item.feed_type,
                                        'Marka': item.brand || '-',
                                        'Miktar': item.quantity,
                                        'Birim': item.unit,
                                        'Alış Fiyatı': item.purchase_price,
                                        'Alış Tarihi': item.purchase_date,
                                        'Son Kullanma': item.expiry_date || '-',
                                    })),
                                    'Envanter'
                                );
                                if (success) toast.success('Başarılı!', 'Excel dosyası indirildi.');
                                else toast.error('Hata!', 'Dışa aktarma başarısız.');
                            }}>
                                Excel (.xlsx)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                                const success = exportToPDF(
                                    filteredItems,
                                    [
                                        { header: 'Ürün Adı', dataKey: 'feed_name' },
                                        { header: 'Tür', dataKey: 'feed_type' },
                                        { header: 'Marka', dataKey: 'brand' },
                                        { header: 'Miktar', dataKey: 'quantity' },
                                        { header: 'Birim', dataKey: 'unit' },
                                        { header: 'Alış Fiyatı', dataKey: 'purchase_price' },
                                    ],
                                    'Envanter',
                                    'Envanter Listesi'
                                );
                                if (success) toast.success('Başarılı!', 'PDF dosyası indirildi.');
                                else toast.error('Hata!', 'Dışa aktarma başarısız.');
                            }}>
                                PDF (.pdf)
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button onClick={() => setIsAddDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Ürün Ekle
                    </Button>
                </div>
            </div>

            {
                error && (
                    <div className="bg-destructive/15 text-destructive px-4 py-2 rounded-md">
                        Error: {error}
                    </div>
                )
            }

            {
                loading ? (
                    <TableSkeleton />
                ) : filteredItems.length === 0 ? (
                    <EmptyState
                        icon={PackageOpen}
                        title="Envanter boş"
                        description="Yem, ilaç veya diğer malzemeleri ekleyerek stok takibine başlayın."
                        actionLabel="Ürün Ekle"
                        onAction={() => setIsAddDialogOpen(true)}
                    />
                ) : (
                    <div className="animate-slide-up delay-200">
                        <Card>
                            <CardContent className="p-0">
                                <InventoryTable
                                    items={filteredItems}
                                    onStockIn={handleStockIn}
                                    onStockOut={handleStockOut}
                                />
                            </CardContent>
                        </Card>
                    </div>
                )
            }

            <StockAdjustmentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirmAdjustment}
                item={selectedItem}
                type={modalType}
            />

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Envanter Ürünü Ekle</DialogTitle>
                    </DialogHeader>
                    <InventoryForm
                        onSubmit={handleCreate}
                        onCancel={() => setIsAddDialogOpen(false)}
                        isLoading={isCreating}
                    />
                </DialogContent>
            </Dialog>
        </div >
    );
}
