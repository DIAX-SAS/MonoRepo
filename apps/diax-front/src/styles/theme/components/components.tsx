import type { Components } from '@mui/material/styles';

import type { Theme } from '../types';
import { MuiAvatar } from './avatar';
import { MuiButton } from './button';
import { MuiCard } from './card';
import { MuiCardContent } from './card-content';
import { MuiCardHeader } from './card-header';
import { MuiLink } from './link';
import { MuiStack } from './stack';

export const components = {
  MuiAvatar,
  MuiButton,
  MuiCard,
  MuiCardContent,
  MuiCardHeader,
  MuiLink,
  MuiStack
} satisfies Components<Theme>;
