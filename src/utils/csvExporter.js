/**
 * Triggers a browser CSV file download from an array of row objects
 */
export const exportToCSV = (filename, rows) => {
    if (!rows || !rows.length) {
        console.warn('No data available to export to CSV.');
        return false;
    }

    const separator = ',';
    const keys = Object.keys(rows[0]);
    const csvHeader = keys.join(separator);
    
    const csvRows = rows.map(row => {
        return keys.map(k => {
            let cell = row[k] === null || row[k] === undefined ? '' : row[k];
            if (cell instanceof Date) {
                cell = cell.toLocaleString();
            } else {
                cell = String(cell);
            }
            cell = cell.replace(/"/g, '""');
            if (cell.search(/("|,|\n)/g) >= 0) {
                cell = `"${cell}"`;
            }
            return cell;
        }).join(separator);
    });

    const csvContent = [csvHeader, ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
};
