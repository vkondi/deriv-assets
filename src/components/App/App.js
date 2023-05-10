import React, {useEffect} from 'react';
import {useDispatch} from 'react-redux';
import DerivAPIBasic from '@deriv/deriv-api/dist/DerivAPIBasic';
import _ from 'lodash';

import AssetList from 'components/AssetList';
import {useActiveCategory} from 'features/assetlist';

import {
  SET_ASSET_DATA,
  HIDE_LOADER,
  SET_TAB_DATA,
  SHOW_LOADER,
  SET_ACTIVE_CATEGORY,
} from 'features/assetlist/actionTypes';
import config from '../../config';
import {shuffleArray} from '../../helpers/utils';

config.derivAPI = new DerivAPIBasic({app_id: config.DERIV_APP_ID});

function App() {
  const dispatch = useDispatch();
  const {activeCategoryIndex} = useActiveCategory();

  useEffect(() => {
    init();

    // Clean up activity on umounting
    return function cleanup() {
      if (config.derivAPI.connection) {
        config.derivAPI.connection.close();
      }
    };
  }, []);

  const init = () => {
    console.log('[App] >> [init]');

    // Invoke method to fetch Active Symbols
    getActiveSymbols();
  };

  const getActiveSymbols = async () => {
    console.log('[App] >> [getActiveSymbols]');

    // Show loader
    dispatch({
      type: SHOW_LOADER,
      payload: true,
    });

    config.derivAPI
      .activeSymbols({
        active_symbols: 'full',
        product_type: 'basic',
      })
      .then(activeSymbolsResponse)
      .catch(err => {
        console.error('[App][getActiveSymbols] >> Exception: ', err);
      });
  };

  const activeSymbolsResponse = async response => {
    console.log('[App] >> [activeSymbolsResponse]');

    // Check for any error
    if (response?.error !== undefined) {
      console.log(
        'App][activeSymbolsResponse] >> Error: ',
        response?.error?.message
      );
      return;
    }

    if (response?.msg_type === 'active_symbols') {
      const responseData = _.get(response, 'active_symbols', []);
      const activeSymbols = config.DEBUG_MODE
        ? _.take(shuffleArray(responseData), config.DEBUG_MAX_ACTIVE_SYMBOLS)
        : _.sortBy(responseData, ['display_order']);

      // debugger; // eslint-disable-line no-debugger

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

      // Set initial reducer data
      setInitialReducerData(assetData);

      // Hide loader
      dispatch({
        type: HIDE_LOADER,
        payload: true,
      });
    }
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
