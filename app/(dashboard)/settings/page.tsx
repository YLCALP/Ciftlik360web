'use client';

import { useState } from 'react';
import { ProfileForm } from '@/components/settings/ProfileForm';
import { FarmInfoForm } from '@/components/settings/FarmInfoForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SettingsPage() {
    return (
        <div className="space-y-6 animate-fade-in">

            <Tabs defaultValue="profile" className="space-y-6 animate-slide-up delay-100">
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
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
