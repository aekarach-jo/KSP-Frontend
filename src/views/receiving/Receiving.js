import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import { useIntl } from 'react-intl';
// import { Badge } from 'react-bootstrap';
import { Button, Tab, Nav } from 'react-bootstrap';
import { useGlobalFilter, usePagination, useRowState, useSortBy, useTable } from 'react-table';
import { request } from 'utils/axios-utils';
import CsLineIcons from 'cs-line-icons/CsLineIcons';

import HtmlHead from 'components/html-head/HtmlHead';
import PageTitle from 'views/sales/components/page-title/PageTitle';
import Table from 'views/sales/components/table/TableCard';
// import TableCard from 'views/sales/components/table/TableCardReceiving';
import ResponsiveNav from 'components/responsive-tab/ResponsiveTab';
import FilterComponent from './components/FilterForm';
import ReceiveItemModal from './components/ReceiveItemModal';
import HistoryItemModal from './components/HistoryItemModal';
import { useAddReceivingItem } from './components/FormMutation';

import { API, INTL, QUERY } from './constants';
import { useReceivingComplateTableInstance, useReceivingTableInstance } from './components/TableInstance';
import { usereceivingPendingQuery, usereceivingSubmitQuery } from './components/TableQuery';

const Receiving = () => {
  const { formatMessage: f } = useIntl();

  const title = f({ id: INTL.TITLE });
  const description = f({ id: INTL.DESCRIPTION });

  const [receiveModal, setReceiveModal] = useState(false);
  const [historyModal, setHistoryModal] = useState(false);
  const [receivingItem, setReceivingItem] = useState({});
  const [isReceiving, setIsReceiving] = useState(false);

  const tableInstance1 = useReceivingTableInstance({setReceiveModal, setHistoryModal, setReceivingItem});
  const tableInstance2 = useReceivingComplateTableInstance({setReceiveModal, setHistoryModal, setReceivingItem});

  const receivingPendingQuery = usereceivingPendingQuery({ tableInstance: tableInstance1 });
  const receivingSubmitQuery = usereceivingSubmitQuery({ tableInstance: tableInstance2 });

  const afterAddItem = () => {
    receivingPendingQuery.refetch();
    receivingSubmitQuery.refetch();
    setIsReceiving(false);
    setReceiveModal(false);
  };

  const { mutate: addReceivingItem } = useAddReceivingItem({ afterAddItem });

  return (
    <>
      <HtmlHead title={title} description={description} />
      <PageTitle title={title} description={description} />
      <Table
        // tableInstance={tableInstance}
        // filter={FilterComponent}
        tabs={[
          {
            eventKey: 'first',
            label: f({ id: 'receiving.list.tab.pending' }),
            tableInstance: tableInstance1,
            isLoading: receivingPendingQuery.isFetching,
            // filter: FilterComponent,
          },
          {
            eventKey: 'second',
            label: f({ id: 'receiving.list.tab.submit' }),
            tableInstance: tableInstance2,
            isLoading: receivingSubmitQuery.isFetching,
            // filter: FilterPurchaseItem,
          },
        ]}
      />
      <ReceiveItemModal
        isReceiving={isReceiving}
        show={receiveModal}
        onAdd={(addItem) => {
          setIsReceiving(true);
          addReceivingItem(addItem);
        }}
        onHide={() => {
          if (isReceiving) {
            return;
          }
          setReceiveModal(false);
          setReceivingItem({});
        }}
        data={receivingItem}
      />
      <HistoryItemModal
        show={historyModal}
        onHide={() => {
          setHistoryModal(false);
          setReceivingItem({});
        }}
        data={receivingItem}
      />
    </>
  );
};

export default Receiving;
