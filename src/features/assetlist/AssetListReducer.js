import {
  SET_ACTIVE_CATEGORY,
  SET_ASSET_DATA,
  SHOW_LOADER,
  HIDE_LOADER,
  SET_TAB_DATA,
} from './actionTypes';

const initialState = {
  number: undefined,
  hasError: false,
  isFulfilled: false,

  assetData: [],
  isLoading: true,

  activeCategoryName: null,
  activeCategoryIndex: 0,
  activeCategoryId: null,
  activeCategoryData: [],

  tabData: [],
  forexData: [],
  syntheticIndexData: [],
  indexData: [],
  cryptocurrencyData: [],
  commodityData: [],
  tableHeaderData: [
    {
      id: 'name',
      numeric: false,
      disablePadding: true,
      sortable: true,
      label: 'Name',
    },
    {
      id: 'lastPrice',
      numeric: false,
      disablePadding: true,
      sortable: true,
      label: 'Last Price',
    },
    {
      id: '24hChange',
      numeric: false,
      disablePadding: true,
      sortable: true,
      label: '24h Change',
    },
    {
      id: 'chart',
      numeric: false,
      disablePadding: true,
      label: '',
    },
    {
      id: 'tradeAction',
      numeric: false,
      disablePadding: true,
      label: '',
    },
  ],
};

const reducer = (state = initialState, action) => {
  // console.log('[AssetListReducer][reducer] >> action: ', action.type);
  // console.log('[AssetListReducer][reducer] >> payload: ', action?.payload);

  switch (action.type) {
    case SET_ASSET_DATA:
      return {
        ...state,
        assetData: action.payload,
      };
    case SET_TAB_DATA:
      return {
        ...state,
        tabData: action.payload,
      };
    case SHOW_LOADER:
      return {
        ...state,
        isLoading: true,
      };
    case HIDE_LOADER:
      return {
        ...state,
        isLoading: false,
      };
    case SET_ACTIVE_CATEGORY:
      return {
        ...state,
        activeCategoryName: action.payload?.activeCategoryName,
        activeCategoryIndex: action.payload?.activeCategoryIndex,
        activeCategoryId: action.payload?.activeCategoryId,
        activeCategoryData: action.payload?.activeCategoryData,
      };
    default:
      return state;
  }
};

export default reducer;
