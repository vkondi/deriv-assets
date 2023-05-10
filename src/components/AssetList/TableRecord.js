import React, {useState, useEffect, useCallback, useRef} from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import TrendingDownSharpIcon from '@mui/icons-material/TrendingDownSharp';
import TrendingUpSharpIcon from '@mui/icons-material/TrendingUpSharp';
import {LineChart, Line, Tooltip, AreaChart, Area} from 'recharts';

import config from '../../config';
import Stylesheet from './AssetList.module.css';

export default function TableRecord(props) {
  const {row} = props;
  const tickSubscription = useRef();
  const COLOR_RED = '#c13b3b';
  const COLOR_GREEN = '#82ca9d';

  // Tick Stream
  const [loadingTickStream, setLoadingTickStream] = useState(false);
  const [tickStreamPipSize, setTickStreamPipSize] = useState(null);
  const [tickStreamId, setTickStreamId] = useState(null);

  // Tick History
  const [loadingTickHistory, setLoadingTickHistory] = useState(false);
  const [tickHistoryPipSize, setTickHistoryPipSize] = useState(null);
  const [chartData, setChartData] = useState([]);

  // Generic to Asset
  const [symbol, setSymbol] = useState(row?.symbol);
  const [quote, setQuote] = useState(null);
  const [exchangeIsOpen, setExchangeIsOpen] = useState(
    !(row?.exchange_is_open === 0)
  );
  const spotPercentageChange = row?.spot_percentage_change;

  useEffect(() => {
    return function cleanupComponent() {
      // Forget all the subscriptions related to this component
      config.derivAPI.forgetAll();

      // Unsubscribe ticks specifically if still polling
      cleanUpTickStream();
    };
  }, []);

  // Triggers fetching tick history
  useEffect(() => {
    if (symbol) getTicksHistory();
  }, [symbol]);

  // Subscribe to stream only if exchange is open
  useEffect(() => {
    if (symbol && exchangeIsOpen) subscribeTicks();
  }, [symbol, exchangeIsOpen]);

  // To set quote value from Tick History response when Tick Stream fails due to exchange being closed
  useEffect(() => {
    if (row) {
      // When exchange is closed, set the last price from tick history response
      if (!exchangeIsOpen && Array.isArray(chartData) && chartData.length > 0) {
        setQuote(chartData[chartData.length - 1]?.price);
      }
    }
  }, [row, chartData, exchangeIsOpen]);

  // Event to set Tick value based on PIP sized decimal
  useEffect(() => {
    if (quote != null) {
      if (exchangeIsOpen && !isNaN(tickStreamPipSize)) {
        setQuote(Number(quote).toFixed(tickStreamPipSize));
      }

      if (!exchangeIsOpen && !isNaN(tickHistoryPipSize)) {
        setQuote(Number(quote).toFixed(tickHistoryPipSize));
      }
    }
  }, [quote]);

  const cleanUpTickStream = () => {
    return new Promise((resolve, reject) => {
      try {
        if (tickSubscription.current) tickSubscription.current.unsubscribe();

        resolve();
      } catch (e) {
        console.log('[TableRecord][cleanUpTickStream] >> Exception: ', e);
        reject(e);
      }
    });
  };

  const subscribeTicks = async e => {
    console.log('[TableRecord] >> [subscribeTicks]');

    try {
      setLoadingTickStream(true);

      // Clean up any pre-existing subscriptions for the same tick
      cleanUpTickStream();

      const ticks = config.derivAPI.subscribe({ticks: symbol});
      tickSubscription.current = ticks.subscribe(handleTickSubscription);

      // DEBUG MODE: Unsubscribe after configured timeout
      if (config.DEBUG_MODE) {
        setTimeout(() => {
          cleanUpTickStream();
        }, config.DEBUG_TICKS_SUBSCRIPTION_TIMER);
      }
    } catch (err) {
      console.log('[TableRecord][subscribeTicks] >> Exception: ', err);

      setLoadingTickStream(false);
    }
  };

  const handleTickSubscription = res => {
    console.log('[TableRecord] >> [handleTickSubscription]');

    // Error handling
    if (res.error !== undefined) {
      console.log(
        '[TableRecord][handleTickSubscription] >> Error : ',
        res?.error?.message
      );
      cleanUpTickStream();
      return;
    }

    setQuote(res?.tick?.quote);
    setLoadingTickStream(false);
    setTickStreamPipSize(res?.tick?.pip_size);
  };

  const ticksHistoryResponse = response => {
    console.log('[TableRecord] >> [ticksHistoryResponse]');

    // debugger; // eslint-disable-line no-debugger
    if (response.error !== undefined) {
      console.log(
        '[TableRecord][ticksHistoryResponse] >> Error: ',
        response?.error?.message
      );
      return;
    }

    const pricesArray = _.get(response, 'history.prices', []);
    const chartArrayData = pricesArray.map(rec => {
      return {
        price: rec,
      };
    });

    setChartData(chartArrayData);
    setLoadingTickHistory(false);
    setTickHistoryPipSize(_.get(response, 'pip_size'));
  };

  const getTicksHistory = () => {
    console.log('[TableRecord] >> [getTicksHistory]');

    setLoadingTickHistory(true);

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

        setLoadingTickHistory(false);
      });
  };

  return (
    <TableRow
      hover
      tabIndex={-1}
      key={row?.display_name}
      sx={{cursor: 'pointer'}}>
      {/* Asset name */}
      <TableCell scope="row">{row?.display_name}</TableCell>

      {/* Last Price */}
      <TableCell>
        {loadingTickStream && !quote ? <CircularProgress size={25} /> : quote}
      </TableCell>

      {/* Last 24h Price */}
      <TableCell>
        <>
          {!isNaN(spotPercentageChange) && spotPercentageChange < 0 && (
            <div className={Stylesheet.spotPercentDiv}>
              <span className={Stylesheet.spotPercentSpan}>
                {spotPercentageChange}
              </span>
              <TrendingDownSharpIcon sx={{color: COLOR_RED}} />
            </div>
          )}
          {!isNaN(spotPercentageChange) && spotPercentageChange > 0 && (
            <div className={Stylesheet.spotPercentDiv}>
              <span className={Stylesheet.spotPercentSpan}>
                {spotPercentageChange}
              </span>
              <TrendingUpSharpIcon sx={{color: COLOR_GREEN}} />
            </div>
          )}
        </>
      </TableCell>

      {/* Price Chart */}
      <TableCell
        sx={{
          width: 100,
        }}>
        {Array.isArray(chartData) &&
        chartData.length < 1 &&
        loadingTickHistory ? (
          <CircularProgress size={25} />
        ) : (
          <LineChart width={100} height={30} data={chartData}>
            <Line
              dataKey="price"
              stroke={
                chartData?.[0]?.price < chartData?.[chartData.length - 1]?.price
                  ? COLOR_GREEN
                  : COLOR_RED
              }
              strokeWidth={1.5}
              name="price"
              dot={false}
            />
            <Tooltip />
          </LineChart>
        )}
      </TableCell>

      {/* Trade CTA */}
      <TableCell sx={{width: 60}}>
        <Button variant="outlined">Trade</Button>
      </TableCell>
    </TableRow>
  );
}

TableRecord.propTypes = {
  row: PropTypes.oneOfType([PropTypes.object]).isRequired,
};
