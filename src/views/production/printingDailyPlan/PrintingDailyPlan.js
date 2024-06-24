import CsLineIcons from 'cs-line-icons/CsLineIcons';
import React, { useEffect, useMemo, useState } from 'react';
import { request } from 'utils/axios-utils';
import { useGlobalFilter, usePagination, useRowState, useSortBy, useTable } from 'react-table';
import { Accordion, Button, Card, Col, Row, Table } from 'react-bootstrap';
import { useQuery } from 'react-query';
import { useIntl } from 'react-intl';
import { NavLink, useHistory } from 'react-router-dom';
import 'react-datepicker/dist/react-datepicker.css';
import { SERVICE_URL } from 'config';

import HtmlHead from 'components/html-head/HtmlHead';
import TableCard from './table/TableCardReportProductionPlan';
import PageTitle from './components/PageTitle';

import FilterComponent from './components/FilterForm';

import { API, INTL, NAVIGATION, QUERY } from './constants';

const productPlanRespTransform = (res) => {
  const arr = res.data.data.sort((objA, objB) => new Date(objA.planDate) - new Date(objB.planDate));
  const result = arr.reduce((acc, obj) => {
    const existing = acc.find((item) => item.planDate === obj.planDate);
    if (existing) {
      existing.valueList.push(obj);
    } else {
      acc.push({ planDate: obj.planDate, valueList: [obj] });
    }
    return acc;
  }, []);

  const newData = result?.map((item) => {
    const valueCounts = item.valueList.reduce((acc, cur) => {
      if (cur in acc) {
        acc[cur.machineName] += 1;
      } else {
        acc[cur.machineName] = 1;
      }
      return acc;
    }, {});

    const groupedValues = Object.entries(valueCounts).map((entry) => {
      const obj = item.valueList.map((v) => {
        let groupMachine = v;
        if (v.machineName === entry[0]) {
          groupMachine = v;
        } else {
          groupMachine = 'empty';
        }
        return groupMachine;
      });
      const productDetail = obj.filter((v) => v !== 'empty');
      return { value: entry[0], list: productDetail };
    });

    groupedValues.sort((a, b) => b.count - a.count);
    return {
      date: item.planDate,
      valueList: groupedValues,
    };
  });

  const objData = {
    data: newData,
    error: res.data.error,
    message: res.data.message,
    pagination: res.data.pagination,
  };
  return objData;
};

const getProductPlan = async ({ filter, limit = 10, sortBy = {} }) => {
  const res = await request({ url: API.FIND_PRODPLAN_LIST, params: { ...filter, ...sortBy, page: filter.page + 1, limit } });
  return productPlanRespTransform(res);
};

const sortByFromTable = ([field]) => {
  if (!field) {
    return {};
  }

  return {
    sortField: field.id,
    sortDirection: field.desc ? 'desc' : 'asc',
  };
};

const PrintingDailyPlan = () => {
  const { formatMessage: f } = useIntl();
  const { push } = useHistory();

  const title = f({ id: INTL.TITLE });
  const description = f({ id: INTL.DESCRIPTION });

  const [isShowFilter, setShowFilter] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [listDailyItem, setListDailyItem] = useState(null);
  const [productId, setProductId] = useState();
  const [productNameOptions, setProductNameOptions] = useState([]);
  const [machineOptions, setMachineOptions] = useState([]);
  const [toolingOptions, setToolingOptions] = useState([]);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const columns = useMemo(() => {
    return [
      {
        Header: () => f({ id: 'dailyPlan.field.date' }),
        accessor: 'date',
        sortable: true,
        colClassName: 'd-flex flex-column mb-2 position-relative',
        headerClassName: 'text-muted text-medium text-uppercase',
        headerProps: { xs: 12, md: 11 },
        Cell: ({ cell }) => cell.value || '-',
      },
    ];
  }, [f]);

  const [data, setData] = useState([]);
  const [filter, setFilter] = useState({ page: 0 });
  const [pageCount, setPageCount] = useState(1);

  const tableInstance = useTable(
    {
      columns,
      data,
      filter,
      setData,
      setFilter,
      manualPagination: true,
      manualGlobalFilter: true,
      manualSortBy: true,
      autoResetPage: false,
      autoResetSortBy: false,
      pageCount,
      initialState: { pageIndex: 0, sortBy: [{ id: 'datePlan', desc: false }] },
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowState
  );

  const {
    state: { globalFilter, pageIndex: page, pageSize, sortBy },
  } = tableInstance;

  const { isFetching, refetch } = useQuery(
    [QUERY.PRODPLAN_LIST, filter, pageSize, sortBy],
    () => getProductPlan({ filter, limit: pageSize, sortBy: sortByFromTable(sortBy) }),
    {
      refetchOnWindowFocus: false,
      onSuccess(resp) {
        const { data: result, pagination = {} } = resp;
        setData(result);
        setPageCount(pagination.totalPage);
        // setTotal(pagination.total);
        // setPageIndex(pagination.page - 1);
      },
      onError(err) {
        console.error('Error fetching supplier list', err);
      },
    }
  );

  const callTooling = async () => {
    const dataProduct = await request({ url: `${SERVICE_URL}/masterData/tooling/find` });
    const list = [];
    dataProduct.data.data.forEach((element) => {
      const obj = {
        value: element.name,
        label: element.name,
        detail: element,
      };
      list.push(obj);
    });
    setToolingOptions(list);
  };
  const callMachine = async () => {
    const dataProduct = await request({ url: `${SERVICE_URL}/masterData/machine/find` });
    const list = [];
    dataProduct.data.data.forEach((element) => {
      const obj = {
        value: element.name,
        label: element.name,
        detail: element,
      };
      list.push(obj);
    });
    callTooling();
    setMachineOptions(list);
  };

  const callProductionName = async () => {
    const dataProduct = await request({ url: `${SERVICE_URL}/productionPlan/productionOrderList` });
    const list = [];
    dataProduct.data.data.forEach((element) => {
      const obj = {
        value: element.productName,
        label: element.productName,
        detail: element,
      };
      list.push(obj);
    });
    callMachine();
    setProductNameOptions(list);
  };

  useEffect(() => {
    setFilter((currentFilter) => ({
      ...currentFilter,
      page,
    }));
  }, [page]);

  useEffect(() => {
    setFilter((currentFilter) => ({
      ...currentFilter,
      PONo: globalFilter,
    }));
  }, [globalFilter]);

  useEffect(() => {
    callProductionName();
  }, []);

  const onSetShowModal = (id) => {
    setShowModal(true);
    setProductId(id);
  };
  return (
    <>
      <HtmlHead title={title} description={description} />
      <PageTitle
        title={title}
        description={description}
        setShowModal={setShowModal}
        setProductId={setProductId}
        buttons={{
          back: { label: f({ id: 'common.back' }) },
        }}
      />
      <TableCard tableInstance={tableInstance} setShowModal={setShowModal} setProductId={onSetShowModal} filter={FilterComponent} isLoading={isFetching} />
    </>
  );
};

export default PrintingDailyPlan;
