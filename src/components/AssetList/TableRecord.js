import React, {useState, useEffect, useCallback, useRef} from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import {LineChart, Line, Tooltip} from 'recharts';

import config from '../../config';

export default function TableRecord(props) {
  const {row} = props;

  const [symbol, setSymbol] = useState(null);
  const [quote, setQuote] = useState(null);
  const [chartData, setChartData] = useState([]);

  const tickSubscription = useRef();

  useEffect(() => {
    return function cleanupComponent() {
      // Forget all the subscriptions related to this component
      config.derivAPI.forgetAll();

      // Unsubscribe ticks specifically if still polling
      cleanUp();
    };
  }, []);

  useEffect(() => {
    if (row) {
      setSymbol(row?.symbol);

      // When exchange is closed, set the last price from tick history response
      if (
        row?.exchange_is_open === 0 &&
        Array.isArray(chartData) &&
        chartData.length > 0
      ) {
        setQuote(chartData[chartData.length - 1]?.price);
      }
    }
  }, [row, chartData]);

  useEffect(() => {
    if (symbol) getTicksHistory();
  }, [symbol]);

  useEffect(() => {
    if (symbol && row?.exchange_is_open === 1) subscribeTicks();
  }, [symbol]);

  const cleanUp = () => {
    return new Promise((resolve, reject) => {
      try {
        if (tickSubscription.current) {
          tickSubscription.current.unsubscribe();
        }

        resolve();
      } catch (e) {
        console.log('[TableRecord][cleanUp] >> Exception: ', e);
        reject(e);
      }
    });
  };

  const subscribeTicks = async e => {
    console.log('[TableRecord] >> [subscribeTicks]');

    try {
      cleanUp();

      const ticks = config.derivAPI.subscribe({ticks: symbol});
      tickSubscription.current = ticks.subscribe(handleTickSubscription);

      // Unsubscribe after configured timeout for DEBUG mode
      if (config.DEBUG_MODE) {
        setTimeout(() => {
          cleanUp();
        }, config.DEBUG_TICKS_SUBSCRIPTION_TIMER);
      }
    } catch (err) {
      console.log('[TableRecord][subscribeTicks] >> Exception: ', err);
    }
  };

  const handleTickSubscription = res => {
    console.log('[TableRecord] >> [handleTickSubscription]');

    if (res.error !== undefined) {
      console.log('Error : ', res.error.message);
      cleanUp();
      return;
    }

    setQuote(res?.tick?.quote);
  };

  const ticksHistoryResponse = dataRes => {
    console.log('[TableRecord] >> [ticksHistoryResponse]');
    // debugger; // eslint-disable-line no-debugger
    if (dataRes.error !== undefined) {
      console.log('Error : ', dataRes.error.message);
      return;
    }

    const pricesArray = _.get(dataRes, 'history.prices', []);
    const chartArrayData = pricesArray.map(rec => {
      return {
        price: rec,
      };
    });

    setChartData(chartArrayData);
  };

  const getTicksHistory = () => {
    console.log('[TableRecord] >> [getTicksHistory]');

    config.derivAPI
      .ticksHistory({
        ticks_history: symbol,
        adjust_start_time: 1,
        count: 30,
        end: 'latest',
        start: 30,
        style: 'ticks',
      })
      .then(ticksHistoryResponse)
      .catch(err => {
        console.log('[TableRecord][getTicksHistory] >> Exception: ', err);
      });
  };

  return (
    <TableRow
      hover
      tabIndex={-1}
      key={row.display_name}
      sx={{cursor: 'pointer'}}>
      <TableCell scope="row">{row?.display_name}</TableCell>
      <TableCell>{quote}</TableCell>
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