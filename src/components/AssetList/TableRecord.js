import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import {LineChart, Line} from 'recharts';

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
          bgcolor: 'yellow',
          width: 150,
        }}>
        <LineChart width={150} height={100} data={data}>
          <Line type="monotone" dataKey="uv" stroke="red" />
        </LineChart>
      </TableCell>
      <TableCell
        sx={{
          bgcolor: 'green',
        }}>
        {row.protein}
      </TableCell>
    </TableRow>
  );
}

TableRecord.propTypes = {
  row: PropTypes.oneOfType([PropTypes.object]).isRequired,
};
