/**
 * Utilities for CSV generation, downloadable file triggers and printable documents
 */

export function downloadCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  // UTF-8 BOM so Excel opens accents and Arabic characters properly
  const BOM = '\uFEFF';
  
  const csvContent = [
    headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(';'),
    ...rows.map((row) =>
      row
        .map((cell) => {
          const val = cell !== undefined && cell !== null ? String(cell) : '';
          return `"${val.replace(/"/g, '""')}"`;
        })
        .join(';')
    ),
  ].join('\r\n');

  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
