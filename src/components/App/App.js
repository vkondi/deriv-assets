import React, {useEffect} from 'react';
import {useDispatch} from 'react-redux';
import DerivAPIBasic from '@deriv/deriv-api/dist/DerivAPIBasic';
import _ from 'lodash';

import AssetList from 'components/AssetList';
// import classes from './App.module.css';
import {useActiveCategory} from 'features/assetlist';

import {
  SET_ASSET_DATA,
  HIDE_LOADER,
  SET_TAB_DATA,
  SHOW_LOADER,
  SET_ACTIVE_CATEGORY,
} from 'features/assetlist/actionTypes';

function App() {
  const dispatch = useDispatch();
  const {activeCategoryIndex} = useActiveCategory();
  const appId = 36480; // 1089; // Replace with your appId or leave as 1089 for testing.
  const connection = new WebSocket(
    `wss://ws.binaryws.com/websockets/v3?app_id=${appId}`
  );
  const api = new DerivAPIBasic({connection});

  useEffect(() => {
    init();
  }, []);

  const init = () => {
    console.log('[App] >> [init]');

    getActiveSymbols();
  };

  const getActiveSymbols = async () => {
    console.log('[App] >> [getActiveSymbols]');

    connection.addEventListener('message', activeSymbolsResponse);

    // Show loader
    dispatch({
      type: SHOW_LOADER,
      payload: true,
    });

    await api.activeSymbols({
      // landing_company: "maltainvest", // Uncomment landing_company if you want to retrieve specific symbols.
      active_symbols: 'full',
      product_type: 'basic',
    });
  };

  const activeSymbolsResponse = async res => {
    console.log('[App] >> [activeSymbolsResponse]');

    const data = JSON.parse(res.data);

    // console.log('[AssetList][activeSymbolsResponse] >> data: ', data);

    if (data.error !== undefined) {
      console.log('Error : ', data.error?.message);
      connection.removeEventListener('message', activeSymbolsResponse, false);
      await api.disconnect();
    }

    if (data.msg_type === 'active_symbols') {
      const activeSymbols = _.get(data, 'active_symbols', []);

      const {assetData} = activeSymbols.reduce(
        (prevObj, activeSymbol) => {
          const market = _.get(activeSymbol, 'market');
          const prevMarkets = _.get(prevObj, 'markets');
          const prevMarketData = _.get(prevObj, 'assetData');
          const prevTabData = _.get(prevObj, 'tabData');

          if (prevMarkets.indexOf(market) === -1) {
            prevMarkets.push(market);
            const tabDetails = {
              market,
              marketDisplayName: _.get(activeSymbol, 'market_display_name'),
            };

            prevMarketData.push({
              ...tabDetails,
              data: [],
            });
            prevTabData.push(tabDetails);
          }

          const marketIndex = prevMarkets.indexOf(market);
          prevMarketData[marketIndex].data.push(activeSymbol);

          const returnObj = {
            markets: prevMarkets,
            assetData: prevMarketData,
            tabData: prevTabData,
          };

          return returnObj;
        },
        {markets: [], assetData: [], tabData: []}
      );

      console.log('[App][activeSymbolsResponse] >> assetData: ', assetData);

      // Set initial reducer data
      setInitialReducerData(assetData);

      // Hide loader
      dispatch({
        type: HIDE_LOADER,
        payload: true,
      });
    }

    connection.removeEventListener('message', activeSymbolsResponse, false);
  };

  const setInitialReducerData = assetData => {
    console.log('[App] >> [setInitialReducerData]');

    // Set Asset data
    dispatch({
      type: SET_ASSET_DATA,
      payload: assetData,
    });

    // Set Tab data
    dispatch({
      type: SET_TAB_DATA,
      payload: assetData,
    });

    if (
      !activeCategoryIndex &&
      Array.isArray(assetData) &&
      assetData.length > 0
    ) {
      dispatch({
        type: SET_ACTIVE_CATEGORY,
        payload: {
          activeCategoryIndex: 0,
          activeCategoryName: assetData[0]?.marketDisplayName,
          activeCategoryId: assetData[0]?.market,
          activeCategoryData: assetData[0]?.data,
        },
      });
    }
  };

  return <AssetList />;
}

export default App;
