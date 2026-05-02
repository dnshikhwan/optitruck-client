import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useRef } from "react";
import { useTranslation } from "react-i18next";

interface ImportExcelProps<T> {
    onImport: (data: T[]) => void;
    mapRow: (row: Record<string, unknown>, index: number) => T;
}

export function ImportExcelButton<T>({
    onImport,
    mapRow,
}: ImportExcelProps<T>) {
    const inputRef = useRef<HTMLInputElement>(null);
    const { t } = useTranslation();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = (event) => {
            const binaryData = event.target?.result;

            // Parse the binary data into a workbook (think: the whole Excel file)
            const workbook = XLSX.read(binaryData, { type: "binary" });

            // Grab the first sheet by name
            const firstSheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[firstSheetName];

            // Convert the sheet rows into an array of plain objects
            // Each object key = column header, value = cell value
            const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(
                sheet,
                {
                    range: 1,
                },
            );

            // Map raw rows into your data shape
            const mapped = rows.map((row, index) => mapRow(row, index));
            onImport(mapped);
        };

        // Read file as binary string so SheetJS can parse it
        reader.readAsBinaryString(file);

        // Reset input so the same file can be re-imported if needed
        e.target.value = "";
    };

    return (
        <>
            <input
                ref={inputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                className="hidden"
                onChange={handleFileChange}
            />
            <Button
                type="button"
                variant="outline"
                onClick={() => inputRef.current?.click()}
            >
                <Upload className="mr-2 h-4 w-4" />
                {t("import")}
            </Button>
        </>
    );
}
