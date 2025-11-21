import { mockStats } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Beef, Warehouse, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Animals</CardTitle>
                        <Beef className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{mockStats.totalAnimals}</div>
                        <p className="text-xs text-muted-foreground">
                            +2 from last month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{mockStats.lowStockItems}</div>
                        <p className="text-xs text-muted-foreground">
                            Requires attention
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${mockStats.monthlyIncome}</div>
                        <p className="text-xs text-muted-foreground">
                            +15% from last month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Monthly Expense</CardTitle>
                        <TrendingDown className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${mockStats.monthlyExpense}</div>
                        <p className="text-xs text-muted-foreground">
                            +4% from last month
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* Mock activity log */}
                            <div className="flex items-center">
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">Sold 500L Milk</p>
                                    <p className="text-sm text-muted-foreground">
                                        Income: $7,500
                                    </p>
                                </div>
                                <div className="ml-auto font-medium">+$7,500</div>
                            </div>
                            <div className="flex items-center">
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">Purchased Cattle Feed</p>
                                    <p className="text-sm text-muted-foreground">
                                        Expense: $3,000
                                    </p>
                                </div>
                                <div className="ml-auto font-medium">-$3,000</div>
                            </div>
                            <div className="flex items-center">
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">New Calf Born (TR-006)</p>
                                    <p className="text-sm text-muted-foreground">
                                        Animal Management
                                    </p>
                                </div>
                                <div className="ml-auto font-medium">Just now</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <button className="w-full rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90">Add Animal</button>
                        <button className="w-full rounded-md bg-secondary px-4 py-2 text-secondary-foreground hover:bg-secondary/80">Record Transaction</button>
                        <button className="w-full rounded-md bg-secondary px-4 py-2 text-secondary-foreground hover:bg-secondary/80">Update Stock</button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
