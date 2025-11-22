import { Skeleton } from "@/components/ui/skeleton"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

export function TableSkeleton() {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead><Skeleton className="h-4 w-[100px]" /></TableHead>
                        <TableHead><Skeleton className="h-4 w-[100px]" /></TableHead>
                        <TableHead><Skeleton className="h-4 w-[100px]" /></TableHead>
                        <TableHead className="text-right"><Skeleton className="h-4 w-[80px] ml-auto" /></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-4 w-[80px] ml-auto" /></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
