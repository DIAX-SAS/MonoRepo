export interface Filters {
    initTime: number; // Timestamp
    endTime: number; // Timestamp
    accUnit: 'hour' | 'minute' | 'second';
    offset: boolean;
    live: boolean;
    states: string[];
    selected: string[];
  }
  