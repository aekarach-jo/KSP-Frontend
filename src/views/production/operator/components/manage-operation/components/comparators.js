export const groupFilter = (needle) => (group) => `${group.planDate || ''}`;

export const detailFilter =
  (needle, columnNames = []) =>
  (detailItem) => {
    return columnNames.some((col) => `${detailItem[col] || ''}`.toLowerCase().includes(`${needle || ''}`.trim().toLowerCase()));
  };

export const groupSorter = (a, b) => `${a.saleOrderGroupName || ''}`.localeCompare(`${b.saleOrderGroupName || ''}`);

export const detailSorter = (sortColumn, sortDirection) => (a, b) => {
  if (!sortColumn) {
    return 0;
  }

  // Check number type
  if (typeof a[sortColumn] === 'number' || typeof b[sortColumn]) {
    return sortDirection === 'asc' ? Number(a.amount || 0) - Number(b.amount || 0) : Number(b.amount || 0) - Number(a.amount || 0);
  }

  return sortDirection === 'asc' ? `${a[sortColumn]}`.localeCompare(b[sortColumn]) : `${b[sortColumn]}`.localeCompare(a[sortColumn]);
};
