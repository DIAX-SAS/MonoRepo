"use client";
import React, { useState } from "react";
import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Typography,
} from "@mui/material";
import { ArrowDropDown, ArrowRight, Stop } from "@mui/icons-material";

export interface ChartNode {
  name: string;
  value?: number;
  children?: ChartNode[];
}

interface ChartTreeProps {
  data: ChartNode | undefined;
  unit: string;
  level?: number;
}

// Recursive value calculator
const getNodeValue = (node: ChartNode): number => {
  if (node.value !== undefined) return node.value;
  if (node.children && node.children.length > 0) {
    return node.children.reduce((sum, child) => sum + getNodeValue(child), 0);
  }
  return 0;
};

export const CollapsibleList: React.FC<ChartTreeProps> = ({
  data,
  level = 0,
  unit,
}) => {
  const [open, setOpen] = useState(false);

  if (!data) return null;

  const hasChildren = data.children && data.children.length > 0;

  const handleToggle = () => {
    setOpen((prev) => !prev);
  };

  const resolvedValue = getNodeValue(data);
  const cutNumber = (value: number): string => {
    const formattedValue = Number(value).toFixed(2);
    return isNaN(Number(formattedValue)) ? "" : formattedValue;
  };

  return (
    <List disablePadding>
      <ListItemButton
        onClick={hasChildren ? handleToggle : undefined}
        sx={{ pl: 2 + level * 2 }}
      >
        <ListItemIcon sx={{ minWidth: 24 }}>
          {hasChildren ? (open ? <ArrowDropDown /> : <ArrowRight />) : <></>}
        </ListItemIcon>

        <ListItemIcon sx={{ minWidth: 24 }}>
          <Stop fontSize="small" sx={{ color: "#ccc" }} />
        </ListItemIcon>

        <ListItemText
          primary={<Typography fontSize={14}>{`${data.name}`}</Typography>}
          secondary={
            <Typography fontSize={12} color="text.secondary">
              {`${cutNumber(resolvedValue)} ${unit}`}
            </Typography>
          }
        />
      </ListItemButton>

      {hasChildren && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          {data.children?.map((child, index) => (
            <CollapsibleList key={index} data={child} level={level + 1} unit={unit} />
          ))}
        </Collapse>
      )}
    </List>
  );
};
