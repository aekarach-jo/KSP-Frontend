/* eslint-disable no-plusplus */
import React, { useMemo } from 'react';
import { useIntl } from 'react-intl';
import classNames from 'classnames';
import CsLineIcons from 'cs-line-icons/CsLineIcons';

const Table = ({ tableInstance, className = 'react-table boxed' }) => {
  const { formatMessage: f } = useIntl();

  const { getTableProps, headerGroups, page, getTableBodyProps, prepareRow, toggleAllPageRowsSelected } = tableInstance;

  const colSpanNotFoundRow = useMemo(() => Math.max(...headerGroups.map((hg) => hg.headers.length)), [headerGroups]);

  return (
    <>
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
                        toggleAllPageRowsSelected(false);
                        row.toggleRowSelected();
                      } else {
                        row.toggleRowSelected();
                      }
                    }}
                  >
                    {cell.render('Cell')}
                  </td>
                ))}
              </tr>
            );
          })}
          {!page?.length && (
            <tr className="empty-row h-100">
              <td colSpan={colSpanNotFoundRow}>
                <CsLineIcons icon="warning-hexagon" />
                <div>{f({ id: 'common.no-data' })}</div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
};
export default Table;
