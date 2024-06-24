import React from 'react';
import { Badge } from 'react-bootstrap';
import Table from 'components/table-list/TableList';
import { useIntl } from 'react-intl';

const List = ({ isLoading, tableInstance }) => {
  const { formatMessage: f } = useIntl();
  const columns = React.useMemo(() => {
    return [
      {
        Header: f({ id: 'machine.field.machineCode' }),
        accessor: 'machineCode',
        sortable: true,
        headerClassName: 'text-muted text-small text-uppercase w-10',
        Cell: ({ cell }) => {
          return (
            <a
              className="list-item-heading body"
              href="#!"
              onClick={(e) => {
                e.preventDefault();
              }}
            >
              {cell.value}
            </a>
          );
        },
      },
      {
        Header: f({ id: 'machine.field.machineName' }),
        accessor: 'machineName',
        sortable: true,
        headerClassName: 'text-muted text-small text-uppercase w-10',
        Cell: ({ row }) => <>{row?.original?.customerId?.name || '-'}</>,
      },
      {
        Header: f({ id: 'machine.field.machineType' }),
        accessor: 'machineType',
        sortable: true,
        headerClassName: 'text-muted text-small text-uppercase w-10',
      },
      {
        Header: f({ id: 'machine.field.status' }),
        accessor: 'status',
        sortable: true,
        headerClassName: 'text-muted text-small text-uppercase w-10 justify-content-end text-end',
        Cell: ({ cell }) => {
          return (
            <div style={{ textAlign: 'right' }}>
              <Badge bg="outline-primary">{cell.value}</Badge>
            </div>
          );
        },
      },
    ];
  }, [f]);

  return (
    <>
      <Table tableInstance={tableInstance} isLoading={isLoading} columns={columns} />
    </>
  );
};

export default List;
