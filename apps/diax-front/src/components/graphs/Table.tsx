import React from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "../core";
import { FEPIMM } from "../../app/dashboard/dashboard.types";

interface MountingTableProps {  
  data: FEPIMM[] | undefined;
}

const MountingTable: React.FC<MountingTableProps> = ({  data }) => {
  const headers:string[] = [];
  const body: number[][] = [];

  data?.forEach((FEPIMM, index) => {
    if (index === 0) {
      FEPIMM.states.forEach((state) => {
        headers.push(state.name);
      });
    }
    FEPIMM.states.forEach((state) => {
      if(!body[index]) body[index] = []
      body[index].push(Number(state.value));
    });
  });
  return (
    <TableContainer
      component={Paper}
      sx={{ maxWidth: 600, mx: "auto", my: 3, p: 2 }}
    >
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: "#f4f4f4" }}>
            {headers.map((header,index) => (
              <TableCell key={index} align="center">{header}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {body.map((row, indexRow) => (
            <TableRow key={indexRow}>
              {row.map((value, index) => (
                <TableCell key={indexRow + "-" + index} align="center">
                  {value}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default MountingTable;
