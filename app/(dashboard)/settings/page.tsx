'use client';

import { ProfileForm } from '@/components/settings/ProfileForm';
import { FarmInfoForm } from '@/components/settings/FarmInfoForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/shared/PageHeader';

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <PageHeader title="Ayarlar" description="Hesap ve çiftlik bilgilerinizi yönetin" />

            <Tabs defaultValue="profile" className="max-w-xl space-y-6">
                <TabsList className="w-fit">
                    <TabsTrigger value="profile">Profil</TabsTrigger>
                    <TabsTrigger value="farm">Çiftlik Bilgileri</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-4">
                    <ProfileForm />
                </TabsContent>

                <TabsContent value="farm" className="space-y-4">
                    <FarmInfoForm />
                </TabsContent>
            </Tabs>
        </div>
    );
}
