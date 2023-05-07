import React, {useState, useEffect, useCallback} from 'react';
import PropTypes from 'prop-types';
import DerivAPIBasic from '@deriv/deriv-api/dist/DerivAPIBasic';
import _ from 'lodash';

import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Hard coded graph data
const data = [
  {name: 'Page A', uv: 400, pv: 2400, amt: 2400},
  {name: 'Page B', uv: 500, pv: 2400, amt: 2400},
  {name: 'Page A', uv: 200, pv: 2400, amt: 2400},
  {name: 'Page A', uv: 100, pv: 2400, amt: 2400},
  {name: 'Page A', uv: 400, pv: 2400, amt: 2400},
  {name: 'Page A', uv: 450, pv: 2400, amt: 2400},
];

export default function TableRecord(props) {
  const {row} = props;

  const appId = 36480; // 1089; // Replace with your appId or leave as 1089 for testing.
  const connection = new WebSocket(
    `wss://ws.binaryws.com/websockets/v3?app_id=${appId}`
  );
  const api = new DerivAPIBasic({connection});
  // const ticks_history_request = {
  //   ticks_history: "R_50",
  //   adjust_start_time: 1,
  //   count: 10,
  //   end: "latest",
  //   start: 1,
  //   style: "ticks"
  // };

  const [symbol, setSymbol] = useState(null);
  const [subscriptionId, setSubscriptionId] = useState(null);
  const [ticksHistoryRequest, setTicksHistoryRequest] = useState(null);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    return function cleanup() {
      console.log('[TableRecord] >> unmount for: ', props?.row);

      // If subscriptionId exists, then call API to de-register subscription
      if (subscriptionId) forgetSubscription(subscriptionId);

      connection.removeEventListener('message', ticksHistoryResponse, false);
      api.disconnect();
    };
  }, []);

  useEffect(() => {
    console.log('[TableRecord] >> row: ', row);
    if (row) {
      setSymbol(row?.symbol);
      setTicksHistoryRequest({
        ticks_history: row?.symbol,
        adjust_start_time: 1,
        count: 10,
        end: 'latest',
        start: 1,
        style: 'ticks',
      });
    }
  }, [row]);

  useEffect(() => {
    if (ticksHistoryRequest) getTicksHistory();
  }, [ticksHistoryRequest]);

  const ticksHistoryResponse = async res => {
    console.log('[TableRecord] >> [ticksHistoryResponse]');

    const dataRes = JSON.parse(res.data);
    if (dataRes.error !== undefined) {
      console.log('Error : ', data.error.message);
      connection.removeEventListener('message', ticksHistoryResponse, false);
      await api.disconnect();
    }

    const pricesArray = _.get(dataRes, 'history.prices', []);
    const chartArrayData = pricesArray.map(rec => {
      return {
        price: rec,
      };
    });

    setChartData(chartArrayData);

    connection.removeEventListener('message', ticksHistoryResponse, false);
  };

  const getTicksHistory = useCallback(async () => {
    console.log('[TableRecord] >> [getTicksHistory]');

    connection.addEventListener('message', ticksHistoryResponse);
    await api.ticksHistory(ticksHistoryRequest);
  }, [ticksHistoryRequest]);

  const forgetSubscriptionResponse = res => {
    console.log('[TableRecord] >> [forgetSubscriptionResponse]');
  };

  const forgetSubscription = async () => {
    console.log('[TableRecord] >> [forgetSubscription]');

    connection.addEventListener('message', forgetSubscriptionResponse);
    await api.ticksHistory({
      forget: subscriptionId,
      req_id: 1,
    });
  };

  return (
    <TableRow
      hover
      tabIndex={-1}
      key={row.display_name}
      sx={{cursor: 'pointer'}}>
      <TableCell scope="row">{row?.display_name}</TableCell>
      <TableCell>{row.spot}</TableCell>
      <TableCell>{row.spot_percentage_change}</TableCell>
      <TableCell
        sx={{
          width: 100,
          // backgroundColor: 'gray',
        }}>
        <LineChart width={100} height={30} data={chartData}>
          <Line
            type="monotone"
            dataKey="price"
            stroke="#82ca9d"
            dot={false}
            strokeWidth={3}
            name="price"
          />
          <Tooltip />
        </LineChart>
      </TableCell>
      <TableCell sx={{width: 60}}>
        <Button variant="outlined">Trade</Button>
      </TableCell>
    </TableRow>
  );
}

TableRecord.propTypes = {
  row: PropTypes.oneOfType([PropTypes.object]).isRequired,
};
