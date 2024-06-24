/* eslint-disable no-plusplus */
import React from 'react';
import classNames from 'classnames';

const Table = ({ tableInstance, className = 'react-table boxed', loading, rowProps = () => ({}) }) => {
  const { getTableProps, headerGroups, page, getTableBodyProps, prepareRow, toggleAllPageRowsSelected } = tableInstance;

  return (
    <div
      className={classNames({
        'overlay-spinner': loading,
      })}
    >
      <table className={className} {...getTableProps()}>
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

            return (
              <tr key={`tr.${i}`} {...row.getRowProps()} className={classNames({ selected: row.isSelected })}>
                {row.cells.map((cell, cellIndex) => (
                  <td
                    key={`td.${cellIndex}`}
                    {...cell.getCellProps()}
                    onClick={() => {
                      if (cell.column.id === 'name') {
                        toggleAllPageRowsSelected?.(false);
                        row.toggleRowSelected?.();
                      } else {
                        row.toggleRowSelected?.();
                      }
                    }}
                  >
                    {cell.render('Cell')}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
export default Table;
