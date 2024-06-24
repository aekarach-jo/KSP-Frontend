import React, { useEffect, useMemo, useState, useReducer } from 'react';
import { Badge, Button, Form } from 'react-bootstrap';
import { NAVIGATION } from '../constants';

const handleRowClick = (row) => {
  // Redirect to the link when the row is clicked
  window.location.href = `${NAVIGATION.CUSTOMER_ORDER_DETAIL}/${row.original.id}`;
};
const a = 0;

export const getColumn = (f, fd, setReceiveModal, flagsGlobal, setFlagsGlobal, setIsReceiving) => {
  return [
    {
      Header: f({ id: 'exportScheduler.field.dateTime' }),
      id: 'schedule',
      accessor: 'schedule',
      headerClassName: 'empty w-10',
      Cell: ({ cell, row }) => {
        const { checked, onChange } = row.getRowProps();
        const [isActive, setIsActive] = useState({ isActive: row.original.isActive });
        const rowIndex = row.index;
        // useEffect(() => {
        //   setIsActive(row.original.isActive);
        //   setFlagsGlobal({
        //     isActive: row.original.isActive,
        //     schedule: row.original.schedule,
        //     id: row.original.id,
        //     ...flagsGlobal,
        //   });
        // }, [row.original]);
        const toggleCheckbox = (key) => {
          setIsActive((prevFlags) => ({
            ...prevFlags,
            [key]: !prevFlags[key],
          }));
          setFlagsGlobal((prevFlags) => ({
            ...prevFlags,
            [key]: !prevFlags[key],
          }));
          return onChange;
        };
        return <Form.Check className="form-check mt-1 w-30" type="checkbox" checked={isActive} label={cell.value} />;
      },
    },
    {
      Header: f({ id: 'exportScheduler.field.system' }),
      id: 'pocheck',
      headerClassName: 'empty w-50 text-center',
      Cell: ({ row }) => {
        const { checked, onChange } = row.getRowProps();
        const rowIndex = row.index;
        const [flags, setFlags] = useState({
          flagPO: row.original.flagPO,
          flagSO: row.original.flagSO,
          flagPI: row.original.flagPI,
          flagPD: row.original.flagPD,
        });

        const toggleCheckbox = (key) => {
          setFlags((prevFlags) => ({
            ...prevFlags,
            [key]: !prevFlags[key],
          }));
          setFlagsGlobal((prevFlags) => ({
            ...prevFlags,
            [key]: !prevFlags[key],
          }));
          return onChange;
        };

        useEffect(() => {
          console.log(rowIndex);
          setFlagsGlobal({});
        }, [rowIndex]);
        return (
          <div className="d-flex gap-5">
            <Form.Check
              className="form-check float-end mt-1 w-30"
              type="checkbox"
              checked={flags.flagPO}
              onChange={() => toggleCheckbox('flagPO')}
              label={f({ id: 'exportScheduler.field.pocheck' })}
            />
            <Form.Check
              className="form-check float-end mt-1 w-30"
              type="checkbox"
              checked={flags.flagSO}
              onChange={() => toggleCheckbox('flagSO')}
              label={f({ id: 'exportScheduler.field.socheck' })}
            />
            <Form.Check
              className="form-check float-end mt-1 w-30"
              type="checkbox"
              checked={flags.flagPI}
              onChange={() => toggleCheckbox('flagPI')}
              label={f({ id: 'exportScheduler.field.picheck' })}
            />
            <Form.Check
              className="form-check float-end mt-1 w-30"
              type="checkbox"
              checked={flags.flagPD}
              onChange={() => toggleCheckbox('flagPD')}
              label={f({ id: 'exportScheduler.field.pdcheck' })}
            />
          </div>
        );
      },
    },
    {
      id: 'update',
      headerClassName: 'empty w-10',
      Cell: ({ row }) => {
        return (
          <div className="text-center">
            <Button
              variant="success"
              onClick={() => {
                setFlagsGlobal((prevFlags) => ({
                  ...prevFlags,
                  schedule: row.original.schedule,
                  id: row.original.id,
                }));
                setIsReceiving(true);
              }}
              className="btn-icon btn-icon-start w-100 w-md-auto mb-1 "
              // disabled={isLoading}
            >
              <span>update</span>
            </Button>
          </div>
        );
      },
    },
  ];
};

// If you have the following style applied to your rows, you can apply the same to your new page:
// <div style={{ cursor: 'pointer' }}>
//    ... your table component ...
// </div>
