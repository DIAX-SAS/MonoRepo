'use client';

import * as React from 'react';
import Box from '@mui/material/Box';

const HEIGHT = 60;
const WIDTH = 60;
export interface LogoProps {
  height?: number;
  width?: number;
}

export function Logo({
  height = HEIGHT,
  width = WIDTH,
}: LogoProps): React.JSX.Element {
  const url = '/assets/logo-company.svg';
  return (
    <Box alt="logo" component="img" src={url} sx={{ height: height, width: width }} />
  );
}

