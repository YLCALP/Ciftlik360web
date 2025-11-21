'use client';

import { use, useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Animal } from '@/lib/types';

export default function AnimalDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [animal, setAnimal] = useState<Animal | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        async function fetchAnimal() {
            try {
                const { data, error } = await supabase
                    .from('animals')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) {
                    console.error('Error fetching animal:', error);
                } else {
                    setAnimal(data);
                }
            } catch (error) {
                console.error('Unexpected error:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchAnimal();
    }, [id, supabase]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!animal) {
        return <div>Animal not found</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/animals">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h2 className="text-3xl font-bold tracking-tight">{animal.name || 'Unnamed Animal'}</h2>
                <Badge variant="outline" className="text-lg">
                    {animal.tag_number}
                </Badge>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Species</p>
                                <p className="text-lg">{animal.species}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Breed</p>
                                <p className="text-lg">{animal.breed || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Gender</p>
                                <p className="text-lg">{animal.gender}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Birth Date</p>
                                <p className="text-lg">{animal.birth_date || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Weight</p>
                                <p className="text-lg">{animal.weight ? `${animal.weight} kg` : '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Status</p>
                                <Badge>{animal.status || 'Active'}</Badge>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Purchase Date</p>
                                <p className="text-lg">{animal.purchase_date}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Purchase Price</p>
                                <p className="text-lg">{animal.purchase_price}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Health & Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Notes</p>
                                <p className="text-base">{animal.notes || 'No notes available.'}</p>
                            </div>
                            {/* Placeholder for health history */}
                            <div className="rounded-md bg-muted p-4">
                                <p className="text-sm text-muted-foreground">Health history will appear here.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
