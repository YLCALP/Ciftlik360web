'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/lib/toast';
import { Loader2 } from 'lucide-react';

interface ProfileFormProps {
    onSuccess?: () => void;
}

export function ProfileForm({ onSuccess }: ProfileFormProps) {
    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
    });

    const supabase = createClient();

    useEffect(() => {
        async function fetchUserData() {
            try {
                const { data: { user }, error: authError } = await supabase.auth.getUser();

                if (authError) throw authError;
                if (!user) throw new Error('Kullanıcı bulunamadı');

                // Fetch from public.users table
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('name, email, phone')
                    .eq('id', user.id)
                    .single();

                if (userError && userError.code !== 'PGRST116') {
                    throw userError;
                }

                setFormData({
                    name: userData?.name || '',
                    email: user.email || '',
                    phone: userData?.phone || '',
                });
            } catch (error) {
                console.error('Error fetching user data:', error);
                toast.error('Hata!', 'Kullanıcı bilgileri yüklenemedi.');
            } finally {
                setFetchingData(false);
            }
        }

        fetchUserData();
    }, [supabase]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser();

            if (authError) throw authError;
            if (!user) throw new Error('Kullanıcı bulunamadı');

            // Update public.users table
            const { error } = await supabase
                .from('users')
                .update({
                    name: formData.name,
                    phone: formData.phone,
                })
                .eq('id', user.id);

            if (error) throw error;

            toast.success('Başarılı!', 'Profil bilgileriniz güncellendi.');
            onSuccess?.();
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Hata!', 'Profil güncellenirken bir sorun oluştu.');
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
                <CardTitle>Profil Bilgileri</CardTitle>
                <CardDescription>
                    Kişisel bilgilerinizi buradan güncelleyebilirsiniz.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">İsim</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Adınız Soyadınız"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">E-posta</Label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            disabled
                            className="bg-muted"
                        />
                        <p className="text-xs text-muted-foreground">
                            E-posta adresi değiştirilemez
                        </p>
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
