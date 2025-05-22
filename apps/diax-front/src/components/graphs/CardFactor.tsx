import * as React from 'react';
import {
  Card,
  CardContent,
  LinearProgress,
  Stack,
  Typography,
  Box,
} from '@mui/material';
import type { SxProps } from '@mui/material/styles';

export interface TasksProgressProps {
  sx?: SxProps;
  value?: number;
  title: string;
}

export default function CardFactor({
  value = 0,
  sx,
  title,
}: TasksProgressProps): React.JSX.Element {
  return (
    <Card sx={{ p: 1, ...sx }}>
      <CardContent>
        <Stack spacing={2}>
          <Box display="flex" justifyContent="flex-end" alignItems="center">
            <Box textAlign="right">
              <Typography
                variant="overline"
                color="text.secondary"
                gutterBottom
              >
                {title}
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {value}%
              </Typography>
            </Box>
          </Box>

          <LinearProgress
            value={value}
            variant="determinate"
            role="progressbar"
            aria-valuenow={value}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${title} progress`}
            sx={{ height: 8, borderRadius: 5 }}
          />
        </Stack>
      </CardContent>
    </Card>
  );
}
