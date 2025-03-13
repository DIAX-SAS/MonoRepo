import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import type { SxProps } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { ListBullets as ListBulletsIcon } from "@phosphor-icons/react/dist/ssr/ListBullets";

export interface TasksProgressProps {
  sx?: SxProps;
  value: number;
  title: string;
}

export default function CardFactor({
  value,
  sx,
  title,
}: TasksProgressProps): React.JSX.Element {
  return (
    <Card sx={sx}>
      <CardContent>
        <Stack spacing={2}>
          <Stack
            direction="row"
            sx={{ alignItems: "flex-start", justifyContent: "space-between" }}
            spacing={3}
          >
            <Stack spacing={1}>
              <Typography
                color="text.secondary"
                gutterBottom
                variant="overline"
              >
                {title}
              </Typography>
              <Typography >{value}%</Typography>
            </Stack>
            <Avatar
              sx={{
                backgroundColor: "var(--mui-palette-warning-main)",
                height: "56px",
                width: "56px",
              }}
            >
              <ListBulletsIcon fontSize="var(--icon-fontSize-lg)" />
            </Avatar>
          </Stack>
          <div>
            <LinearProgress
              value={value}
              variant="determinate"
              role="progressbar" 
              aria-valuenow={value}
              aria-valuemin={0} 
              aria-valuemax={100} 
              aria-label="Loading progress" 
            />

          </div>
        </Stack>
      </CardContent>
    </Card>
  );
}
