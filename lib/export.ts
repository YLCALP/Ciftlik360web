import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Export data to Excel file
 * @param data Array of objects to export
 * @param filename Name of the file (without extension)
 */
export function exportToExcel<T extends Record<string, any>>(data: T[], filename: string) {
    try {
        // Create a new workbook
        const wb = XLSX.utils.book_new();

        // Convert data to worksheet
        const ws = XLSX.utils.json_to_sheet(data);

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Data');

        // Generate Excel file and trigger download
        XLSX.writeFile(wb, `${filename}.xlsx`);

        return true;
    } catch (error) {
        console.error('Error exporting to Excel:', error);
        return false;
    }
}

/**
 * Export data to PDF file
 * @param data Array of objects to export
 * @param columns Column definitions with header and dataKey
 * @param filename Name of the file (without extension)
 * @param title Title of the PDF document
 */
export function exportToPDF<T extends Record<string, any>>(
    data: T[],
    columns: { header: string; dataKey: string }[],
    filename: string,
    title: string
) {
    try {
        const doc = new jsPDF();

        // Add title
        doc.setFontSize(16);
        doc.text(title, 14, 15);

        // Add date
        doc.setFontSize(10);
        const date = new Date().toLocaleDateString('tr-TR');
        doc.text(`Tarih: ${date}`, 14, 22);

        // Add table
        autoTable(doc, {
            startY: 30,
            head: [columns.map(col => col.header)],
            body: data.map(row =>
                columns.map(col => {
                    const value = row[col.dataKey];
                    // Format numbers with thousand separators
                    if (typeof value === 'number') {
                        return value.toLocaleString('tr-TR');
                    }
                    return value ?? '-';
                })
            ),
            styles: { fontSize: 9, font: 'helvetica' },
            headStyles: { fillColor: [59, 130, 246], textColor: 255 },
            alternateRowStyles: { fillColor: [245, 245, 245] },
        });

        // Save the PDF
        doc.save(`${filename}.pdf`);

        return true;
    } catch (error) {
        console.error('Error exporting to PDF:', error);
        return false;
    }
}
