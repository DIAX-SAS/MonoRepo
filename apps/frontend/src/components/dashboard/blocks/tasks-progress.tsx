"use client";
import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { TasksProgressProps } from '@/types/data';

export function TasksProgress({ sx, data
 }: TasksProgressProps): React.JSX.Element {
  const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
  return (
    <Card sx={sx}>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }} spacing={3}>
            <Stack spacing={1}>
              <Typography color="text.secondary" gutterBottom variant="overline">
                {data.name}
              </Typography>
              <Typography variant="h4">{data.value}%</Typography>
            </Stack>
            <Avatar
              sx={{ backgroundColor: randomColor, height: '56px', width: '56px' }}
              alt={data.name} 
              src='d'             
            />
          </Stack>
          <div>
            <LinearProgress  value={data.value} variant="determinate" />
          </div>
        </Stack>
      </CardContent>
    </Card>
  );
}
