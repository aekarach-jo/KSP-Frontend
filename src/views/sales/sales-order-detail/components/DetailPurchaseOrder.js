import React, { useMemo } from 'react';
import { Badge, Dropdown, Form } from 'react-bootstrap';
import CsLineIcons from 'cs-line-icons/CsLineIcons';

import Table from 'components/table/Table';

const DetailPurchaseOrder = () => {
  const columns = useMemo(() => {
    return [
      {
        Header: '',
        accessor: 'id',
        Cell: () => (
          <div style={{ padding: '0 10px' }}>
            <Form.Check />
          </div>
        ),
      },
      {
        Header: 'รหัสอ้างอิงลูกค้า',
        accessor: 'name',
        sortable: true,
        headerClassName: 'text-muted text-uppercase w-20',
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
      { Header: 'ชื่อลูกค้า', accessor: 'sales', sortable: true, headerClassName: 'text-muted text-uppercase w-30' },
      { Header: 'วันที่สร้าง', accessor: 'stock', sortable: true, headerClassName: 'text-muted text-uppercase w-20' },
      { Header: 'ชื่อผู้สร้าง', accessor: 'category', sortable: true, headerClassName: 'text-muted text-uppercase w-20' },
      {
        Header: 'สถานะ',
        accessor: 'tag',
        sortable: true,
        headerClassName: 'text-muted text-uppercase w-5',
        Cell: ({ cell }) => {
          return <Badge bg="outline-primary">{cell.value}</Badge>;
        },
      },
      {
        Header: '',
        accessor: 'actions',
        Cell: () => (
          <div style={{ padding: '0 5px' }}>
            <Dropdown className="d-inline-block" align="end">
              <Dropdown.Toggle size="sm" variant="foreground-alternate" className="dropdown-toggle-no-arrow btn btn-icon btn-icon-only bg-none">
                <CsLineIcons icon="more-horizontal" />
              </Dropdown.Toggle>
              <Dropdown.Menu className="dropdown-menu-sm dropdown-menu-end">
                <Dropdown.Item href="#/action-1">
                  <CsLineIcons icon="edit" className="me-1" size="15" /> <span className="align-middle">แก้ไข</span>
                </Dropdown.Item>
                <Dropdown.Item className="danger" href="#/action-2">
                  <CsLineIcons icon="bin" className="me-1" size="15" /> <span className="align-middle">ลบ</span>
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        ),
      },
    ];
  }, []);

  const data = useMemo(() => {
    return [
      { id: 1, name: 'THAIYANG01', sales: 'ไทยยางกิจไพศาล จำกัด', stock: '14/2/2565 12:34', category: '14/2/2565 12:34', tag: 'ใหม่' },
      { id: 2, name: 'THAIYANG01', sales: 'ไทยยางกิจไพศาล จำกัด', stock: '14/2/2565 12:34', category: '14/2/2565 12:34', tag: 'ดำเนินการ' },
      { id: 3, name: 'THAIYANG01', sales: 'ไทยยางกิจไพศาล จำกัด', stock: '14/2/2565 12:34', category: '14/2/2565 12:34', tag: 'ใหม่' },
    ];
  }, []);

  return <Table columns={columns} data={data} />;
};

export default DetailPurchaseOrder;
