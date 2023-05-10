import React, {useState, useEffect} from 'react';
import _ from 'lodash';

import {useTableHeaderData, useActiveCategory} from 'features/assetlist';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TableRecord from './TableRecord';

function TableHeader() {
  const tableHeaderData = useTableHeaderData();

  return (
    <TableHead>
      <TableRow>
        {tableHeaderData.map(headCell => (
          <TableCell key={headCell.id}>
            <TableSortLabel>{headCell.label}</TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

export default function AssetTable() {
  const {activeCategoryData, activeCategoryIndex} = useActiveCategory();

  const [subCategoryData, setSubCategoryData] = useState([]);
  const [subCategoryIndex, setSubCategoryIndex] = useState(null);
  const [subCategoryId, setSubCategoryId] = useState(null);

  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    manageSubCategoryData();
  }, [activeCategoryIndex, activeCategoryData]);

  useEffect(() => {
    massageTableData();
  }, [activeCategoryIndex, subCategoryIndex]);

  // Massage Table Data based on filter(s)
  const massageTableData = () => {
    console.log('[AssetTable] >> [massageTableData]');

    if (subCategoryIndex === null) {
      setTableData(activeCategoryData);
    } else {
      setTableData(
        activeCategoryData.filter(rec => rec?.submarket === subCategoryId)
      );
    }
  };

  // Dynamically extract the sub categories for the selected category
  const manageSubCategoryData = () => {
    console.log('[AssetTable] >> [manageSubCategoryData]');

    // Reset sub category state
    resetSubCategoryToEmpty();

    const {subCatdata} = activeCategoryData.reduce(
      (prevObj, item) => {
        const prevSubCatData = _.get(prevObj, 'subCatdata', []);
        const prevArray = _.get(prevObj, 'array', []);
        const id = _.get(item, 'submarket');
        const displayName = _.get(item, 'submarket_display_name');

        if (prevArray.indexOf(id) === -1) {
          prevArray.push(id);
          prevSubCatData.push({id, displayName});
        }

        return {
          subCatdata: prevSubCatData,
          array: prevArray,
        };
      },
      {subCatdata: [], array: []}
    );

    setSubCategoryData(subCatdata);
  };

  const resetSubCategoryToEmpty = () => {
    console.log('[AssetTable] >> [resetSubCategoryToEmpty]');

    setSubCategoryData([]);
    setSubCategoryIndex(null);
    setSubCategoryId(null);
  };

  const onSubCategoryClick = (index, item) => {
    console.log('[AssetTable] >> [resetSubCategoryToEmpty]');

    if (subCategoryIndex != null && subCategoryIndex === index) {
      setSubCategoryIndex(null);
      setSubCategoryId(null);
    } else {
      setSubCategoryIndex(index);
      setSubCategoryId(item?.id);
    }
  };

  return (
    <Box sx={{width: '100%'}}>
      <Paper
        sx={{
          width: '90%',
          left: '5%',
          right: '5%',
          position: 'relative',
          marginTop: '15px',
        }}>
        <Stack direction="row" spacing={2}>
          {Array.isArray(subCategoryData) &&
            subCategoryData.map((item, index) => (
              <Button
                onClick={() => onSubCategoryClick(index, item)}
                variant={subCategoryIndex === index ? 'contained' : 'outlined'}>
                {item?.displayName}
              </Button>
            ))}
        </Stack>

        <TableContainer>
          <Table
            sx={{minWidth: 750, marginTop: '30px'}}
            aria-labelledby="tableTitle"
            size="medium">
            <TableHeader />
            <TableBody>
              {tableData.map((row, index) => (
                <TableRecord row={row} key={row?.display_name} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
