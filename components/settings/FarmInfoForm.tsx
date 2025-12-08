'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/lib/toast';
import { Loader2 } from 'lucide-react';

interface FarmInfoFormProps {
    onSuccess?: () => void;
}

interface FarmInfo {
    id?: string;
    farm_name: string;
    owner_name: string;
    address: string;
    city: string;
    province: string;
    postal_code: string;
    phone: string;
    email: string;
    farm_type: string;
    total_area: string;
    livestock_capacity: string;
    notes: string;
}

export function FarmInfoForm({ onSuccess }: FarmInfoFormProps) {
    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(true);
    const [formData, setFormData] = useState<FarmInfo>({
        farm_name: '',
        owner_name: '',
        address: '',
        city: '',
        province: '',
        postal_code: '',
        phone: '',
        email: '',
        farm_type: 'mixed',
        total_area: '',
        livestock_capacity: '',
        notes: '',
    });

    const supabase = createClient();

    useEffect(() => {
        async function fetchFarmInfo() {
            try {
                const { data: { user }, error: userError } = await supabase.auth.getUser();

                if (userError) throw userError;
                if (!user) throw new Error('Kullanıcı bulunamadı');

                const { data, error } = await supabase
                    .from('farm_info')
                    .select('*')
                    .eq('user_id', user.id)
                    .single();

                if (error && error.code !== 'PGRST116') {
                    throw error;
                }

                if (data) {
                    setFormData({
                        id: data.id,
                        farm_name: data.farm_name || '',
                        owner_name: data.owner_name || '',
                        address: data.address || '',
                        city: data.city || '',
                        province: data.province || '',
                        postal_code: data.postal_code || '',
                        phone: data.phone || '',
                        email: data.email || '',
                        farm_type: data.farm_type || 'mixed',
                        total_area: data.total_area?.toString() || '',
                        livestock_capacity: data.livestock_capacity?.toString() || '',
                        notes: data.notes || '',
                    });
                }
            } catch (error) {
                console.error('Error fetching farm info:', error);
                toast.error('Hata!', 'Çiftlik bilgileri yüklenemedi.');
            } finally {
                setFetchingData(false);
            }
        }

        fetchFarmInfo();
    }, [supabase]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data: { user }, error: userError } = await supabase.auth.getUser();

            if (userError) throw userError;
            if (!user) throw new Error('Kullanıcı bulunamadı');

            const farmData = {
                user_id: user.id,
                farm_name: formData.farm_name,
                owner_name: formData.owner_name,
                address: formData.address,
                city: formData.city,
                province: formData.province,
                postal_code: formData.postal_code,
                phone: formData.phone,
                email: formData.email,
                farm_type: formData.farm_type,
                total_area: formData.total_area ? parseFloat(formData.total_area) : null,
                livestock_capacity: formData.livestock_capacity ? parseInt(formData.livestock_capacity) : null,
                notes: formData.notes,
            };

            if (formData.id) {
                // Update existing
                const { error } = await supabase
                    .from('farm_info')
                    .update(farmData)
                    .eq('id', formData.id);

                if (error) throw error;
            } else {
                // Create new
                const { error } = await supabase
                    .from('farm_info')
                    .insert([farmData]);

                if (error) throw error;
            }

            toast.success('Başarılı!', 'Çiftlik bilgileri güncellendi.');
            onSuccess?.();
        } catch (error) {
            console.error('Error updating farm info:', error);
            toast.error('Hata!', 'Çiftlik bilgileri güncellenirken bir sorun oluştu.');
        } finally {
            setLoading(false);
        }
    };

    if (fetchingData) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Çiftlik Bilgileri</CardTitle>
                <CardDescription>
                    Çiftliğinizle ilgili detaylı bilgileri buradan yönetebilirsiniz.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="farm_name">Çiftlik Adı *</Label>
                            <Input
                                id="farm_name"
                                value={formData.farm_name}
                                onChange={(e) => setFormData({ ...formData, farm_name: e.target.value })}
                                placeholder="Örn: Yalçın Çiftliği"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="owner_name">Sahip Adı</Label>
                            <Input
                                id="owner_name"
                                value={formData.owner_name}
                                onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                                placeholder="Sahip adı"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="farm_type">Çiftlik Tipi</Label>
                            <Select
                                value={formData.farm_type}
                                onValueChange={(value) => setFormData({ ...formData, farm_type: value })}
                            >
                                <SelectTrigger id="farm_type" className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="dairy">Süt</SelectItem>
                                    <SelectItem value="meat">Et</SelectItem>
                                    <SelectItem value="mixed">Karma</SelectItem>
                                    <SelectItem value="poultry">Kümes</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Telefon</Label>
                            <Input
                                id="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="+90 555 123 45 67"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">E-posta</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="ornek@email.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="city">Şehir</Label>
                            <Input
                                id="city"
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                placeholder="Şehir"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="province">İl</Label>
                            <Input
                                id="province"
                                value={formData.province}
                                onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                                placeholder="İl"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="postal_code">Posta Kodu</Label>
                            <Input
                                id="postal_code"
                                value={formData.postal_code}
                                onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                                placeholder="34000"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="total_area">Toplam Alan (m²)</Label>
                            <Input
                                id="total_area"
                                type="number"
                                value={formData.total_area}
                                onChange={(e) => setFormData({ ...formData, total_area: e.target.value })}
                                placeholder="1000"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="livestock_capacity">Hayvan Kapasitesi</Label>
                            <Input
                                id="livestock_capacity"
                                type="number"
                                value={formData.livestock_capacity}
                                onChange={(e) => setFormData({ ...formData, livestock_capacity: e.target.value })}
                                placeholder="50"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address">Adres</Label>
                        <Textarea
                            id="address"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            placeholder="Tam adres"
                            rows={2}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notlar</Label>
                        <Textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Ek notlar..."
                            rows={3}
                        />
                    </div>

                    <div className="flex gap-2 pt-4">
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Kaydet
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
