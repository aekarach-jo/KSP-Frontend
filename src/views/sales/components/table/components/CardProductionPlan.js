import React, { useCallback, useMemo } from 'react';
import classNames from 'classnames';
import { Badge, Card, Col, Row } from 'react-bootstrap';
import useSort from 'hooks/useSort';
import './style.css';

const CardContainer = ({ tableInstance, className = '', customStyle, rowStyle }) => {
  const { getTableProps, headerGroups, page, getTableBodyProps, prepareRow, toggleAllPageRowsSelected, setIsOpenAddEditModal, rowProps } = tableInstance;
  const handleRowClick = useCallback((oc, itemD, productId) => (e) => oc?.(e, itemD, productId), []);

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
            const getLastTwoDigits = (number) => {
              return number % 100;
            };
            console.log(row.original);
            const newRowProps = row.getRowProps(rowProps);
            const splitSubType = row.original?.producedSize?.split('Subtype')[0];
            const splitValue = splitSubType?.split('x');
            const r = Number(splitValue[0].trim(' '));
            const g = Number(splitValue[1].trim(' '));
            const b = Number(splitValue[2].trim(' '));

            const redRange = [180, 255];
            const greenRange = [180, 255];
            const blueRange = [180, 255];

            const length = r;
            const width = g;
            const height = b;

            const red = Math.floor((length / 100 > 1 ? getLastTwoDigits(length) / 100 : length / 100) * (redRange[1] - redRange[0] + 1)) + redRange[0];
            const green = Math.floor((width / 100 > 1 ? getLastTwoDigits(width) / 100 : width / 100) * (greenRange[1] - greenRange[0] + 1)) + greenRange[0];
            const blue = Math.floor((height / 100 > 1 ? getLastTwoDigits(height) / 100 : height / 100) * (blueRange[1] - blueRange[0] + 1)) + blueRange[0];

            const hex = `#${(red * 65536 + green * 256 + blue).toString(16).padStart(6, '0')}`;
            return (
              <tr
                key={`tr.${i}`}
                style={{ cursor: 'pointer' }}
                {...row.getRowProps()}
                {...newRowProps}
                onClick={handleRowClick(newRowProps.onClick, row?.original, row?.original?.productId)}
                className={classNames({ selected: row.isSelected })}
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
                    style={{ background: hex }}
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

export default CardContainer;
