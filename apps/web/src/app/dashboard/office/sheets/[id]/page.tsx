'use client';

import { useQuery, useMutation } from '@apollo/client';
import { GET_SPREADSHEET, UPDATE_SPREADSHEET } from '@/graphql/office';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Plus } from 'lucide-react';
import { debounce } from 'lodash';

const COLS = 26; // A-Z
const ROWS = 100;

const getColumnLabel = (index: number): string => {
  return String.fromCharCode(65 + index); // A, B, C, ...
};

export default function SpreadsheetEditorPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const spreadsheetId = params.id as string;

  const [title, setTitle] = useState('');
  const [sheets, setSheets] = useState<any[]>([]);
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { data, loading } = useQuery(GET_SPREADSHEET, {
    variables: { id: spreadsheetId },
    skip: !spreadsheetId,
  });

  const [updateSpreadsheet] = useMutation(UPDATE_SPREADSHEET, {
    onCompleted: () => {
      setIsSaving(false);
    },
  });

  const spreadsheet = data?.spreadsheet;

  useEffect(() => {
    if (spreadsheet) {
      setTitle(spreadsheet.title);
      setSheets(spreadsheet.sheets || []);
    }
  }, [spreadsheet]);

  const debouncedSave = debounce(async (newTitle: string, newSheets: any[]) => {
    setIsSaving(true);
    await updateSpreadsheet({
      variables: {
        input: {
          id: spreadsheetId,
          title: newTitle,
          sheets: newSheets,
        },
      },
    });
  }, 1000);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    debouncedSave(newTitle, sheets);
  };

  const handleCellChange = (cellId: string, value: string) => {
    const newSheets = [...sheets];
    const currentSheet = { ...newSheets[activeSheetIndex] };
    currentSheet.cells = { ...currentSheet.cells, [cellId]: { value } };
    newSheets[activeSheetIndex] = currentSheet;
    setSheets(newSheets);
    debouncedSave(title, newSheets);
  };

  const addSheet = () => {
    const newSheet = {
      id: `sheet${sheets.length + 1}`,
      name: `Sheet ${sheets.length + 1}`,
      cells: {},
      rowCount: ROWS,
      columnCount: COLS,
    };
    const newSheets = [...sheets, newSheet];
    setSheets(newSheets);
    debouncedSave(title, newSheets);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading spreadsheet...</p>
      </div>
    );
  }

  if (!spreadsheet) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Spreadsheet not found</p>
      </div>
    );
  }

  const activeSheet = sheets[activeSheetIndex];

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="border-b p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/dashboard/office')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="text-xl font-bold border-none focus-visible:ring-0 px-0 w-96"
            placeholder="Untitled Spreadsheet"
          />
        </div>
        <div className="flex items-center space-x-2">
          {isSaving && <span className="text-sm text-muted-foreground">Saving...</span>}
        </div>
      </div>

      {/* Sheet Tabs */}
      <div className="border-b p-2 flex items-center space-x-2 bg-muted/30">
        {sheets.map((sheet, index) => (
          <Button
            key={sheet.id}
            variant={index === activeSheetIndex ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveSheetIndex(index)}
          >
            {sheet.name}
          </Button>
        ))}
        <Button variant="ghost" size="sm" onClick={addSheet}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Spreadsheet Grid */}
      <div className="flex-1 overflow-auto p-4">
        {activeSheet && (
          <div className="inline-block">
            <table className="border-collapse">
              <thead>
                <tr>
                  <th className="w-12 h-8 border bg-muted"></th>
                  {Array.from({ length: COLS }).map((_, i) => (
                    <th key={i} className="w-24 h-8 border bg-muted text-center text-sm">
                      {getColumnLabel(i)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 30 }).map((_, rowIndex) => (
                  <tr key={rowIndex}>
                    <td className="w-12 h-8 border bg-muted text-center text-sm">
                      {rowIndex + 1}
                    </td>
                    {Array.from({ length: COLS }).map((_, colIndex) => {
                      const cellId = `${getColumnLabel(colIndex)}${rowIndex + 1}`;
                      const cellValue = activeSheet.cells?.[cellId]?.value || '';
                      return (
                        <td key={cellId} className="border p-0">
                          <Input
                            value={cellValue}
                            onChange={(e) => handleCellChange(cellId, e.target.value)}
                            onFocus={() => setSelectedCell(cellId)}
                            className={`w-full h-full border-none rounded-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                              selectedCell === cellId ? 'bg-blue-50' : ''
                            }`}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Formula Bar */}
      {selectedCell && (
        <div className="border-t p-2 flex items-center space-x-2 bg-muted/30">
          <span className="font-medium text-sm">{selectedCell}</span>
          <Input
            value={activeSheet?.cells?.[selectedCell]?.value || ''}
            onChange={(e) => handleCellChange(selectedCell, e.target.value)}
            className="flex-1"
            placeholder="Enter value or formula"
          />
        </div>
      )}
    </div>
  );
}
