import {useSelector} from 'react-redux';

/**
 * Custom React Hooks to get random.org API loading state and response from the state.
 *
 * @see https://reactjs.org/docs/hooks-custom.html
 */

export const useTabData = () =>
  useSelector(state => state.assetlist.tabData ?? []);

export const useAssetData = () =>
  useSelector(state => state.assetlist.assetData ?? []);

export const useIsLoading = () =>
  useSelector(state => state.assetlist.isLoading);

export const useTableHeaderData = () =>
  useSelector(state => state.assetlist.tableHeaderData ?? []);

export const useActiveCategory = () => {
  const {
    activeCategoryName,
    activeCategoryIndex,
    activeCategoryId,
    activeCategoryData,
  } = useSelector(state => state.assetlist);

  return {
    activeCategoryName,
    activeCategoryIndex,
    activeCategoryId,
    activeCategoryData,
  };
};
