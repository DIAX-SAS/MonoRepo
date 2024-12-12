export type InfoSettings = {
  filters: {
    initTime: Date;
    endTime: Date;
    accUnit: 'second' | 'minute' | 'hour';
  };
};
