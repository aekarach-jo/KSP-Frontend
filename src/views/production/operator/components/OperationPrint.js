import React from 'react';
import HtmlHead from 'components/html-head/HtmlHead';
import { useIntl } from 'react-intl';
import { Badge, Card, Row } from 'react-bootstrap';
import moment from 'moment';
import PageTitle from './PageTitle';

const OperationPrint = React.forwardRef((props, ref) => {
  const { formatMessage: f, formatDate: fD, formatTime: fT } = useIntl();
  const { dataList, title, description } = props;
  console.log(dataList);

  const stylePage = {
    '@page': {
      size: 'A4 landscape',
      margin: '2rem 1rem 2rem 1rem',
    },
  };

  return (
    <div ref={ref} className={stylePage}>
      <HtmlHead title={title} description={description} />
      <PageTitle title={title} description={description} />

      <Card className="mt-3 p-4">
        {dataList?.map((data, index) => {
          console.log(data);
          const { itemList } = data;
          return (
            <>
              <Row key={index}>
                <Badge bg="info" style={{ display: 'flex', justifyContent: 'flex-start' }} className="h6 badge-lg mb-0 mt-2">
                  {index + 1} . {data?.producedSize}
                </Badge>
              </Row>
              <table className="rows">
                <thead>
                  <tr className="w-100">
                    <th className="w-30"> {f({ id: 'production.produce.manufacturing.field.product' })}</th>
                    <th className="w-20"> {f({ id: 'production.produce.customer' })}</th>
                    <th className="w-20"> {f({ id: 'production.produce.no' })}</th>
                    <th className="w-10"> {f({ id: 'production.produce.producedAmount' })}</th>
                    <th className="w-10"> {f({ id: 'production.produce.status' })}</th>
                    <th className="w-10"> {f({ id: 'dailyPlan.field.deliveryDate' })}</th>
                  </tr>
                </thead>
                <tbody>
                  {itemList?.map((item, indexItem) => {
                    return (
                      <tr key={indexItem} style={{ ...(indexItem === 1 ? { pageBreakAfter: 'always'} : {pageBreakAfter: 'inherit'})}}>
                        <td className="table-td">{item?.productName}</td>
                        <td className="table-td">{item?.customerName}</td>
                        <td className="table-td">{item?.productionOrderNo}</td>
                        <td className="table-td">{item?.productionProducedAmount}</td>
                        <td className="table-td">{item?.step?.label}</td>
                        <td className="table-td">{moment(item?.CODeliverDt).add(543, 'year').format('DD/MM/YYYY')}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </>
          );
        })}
      </Card>
    </div>
  );
});
export default OperationPrint;
