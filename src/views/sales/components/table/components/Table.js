import classNames from 'classnames';
import React, { useCallback } from 'react';

const Table = ({ tableInstance, className = 'react-table boxed', rowProps, customStyle, rowStyle }) => {
  const { getTableProps, headerGroups, page, getTableBodyProps, prepareRow, toggleAllPageRowsSelected, setIsOpenAddEditModal } = tableInstance;
  const handleRowClick = useCallback((oc, itemD, group) => (e) => oc?.(e, itemD, group), []);
  return (
    <>
      <table className={className} {...getTableProps()} style={customStyle}>
        <thead>
          {headerGroups.map((headerGroup, headerIndex) => (
            <tr key={`header${headerIndex}`} {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column, index) => {
                return (
                  <th
                    key={`th.${index}`}
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                    className={classNames(column.headerClassName, {
                      sorting_desc: column.isSortedDesc,
                      sorting_asc: column.isSorted && !column.isSortedDesc,
                      sorting: column.sortable,
                    })}
                  >
                    {column.render('Header')}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {page.map((row, i) => {
            prepareRow(row);
            const newRowProps = row.getRowProps(rowProps);
            return (
              <tr
                key={`tr.${i}`}
                {...row.getRowProps()}
                {...newRowProps}
                onClick={handleRowClick(newRowProps.onClick, row?.original, row?.original?.id)}
                className={classNames({ selected: row.isSelected })}
                style={{ cursor: 'pointer' }}
              >
                {row.cells.map((cell, cellIndex) => (
                  <td
                    key={`td.${cellIndex}`}
                    {...cell.getCellProps()}
                    onClick={() => {
                      if (!row.toggleRowSelected) return;

                      if (cell.column.id === 'name') {
                        toggleAllPageRowsSelected(false);
                        row.toggleRowSelected();
                        setIsOpenAddEditModal(true);
                      } else {
                        row.toggleRowSelected();
                      }
                    }}
                    style={rowStyle}
                    className="sh-md-4"
                  >
                    {cell.render('Cell')}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
};
export default Table;
