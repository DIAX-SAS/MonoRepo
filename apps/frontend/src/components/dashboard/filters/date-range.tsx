"use client";
import { SyntheticEvent } from 'react';
import { DateRangePicker, Stack } from 'rsuite';
import { DateRange } from 'rsuite/esm/DateRangePicker/types';

export default function DateRangeComponent({
  readOnly,
  dateRange,
  setDateRange,
}: {
  readOnly: boolean;
  dateRange: { startDate: string | null; endDate: string | null };
  setDateRange: (range: { startDate: string | null; endDate: string | null }) => void;
}) {
  const handleDateChange = (value: DateRange | null, event: SyntheticEvent<Element, Event>) => {
    const [startDate, endDate] = value ?? [];

    // Convertimos las fechas a formato ISO o null si no hay fechas
    const range = {
      startDate: startDate ? startDate.toISOString() : null,
      endDate: endDate ? endDate.toISOString() : null,
    };

    setDateRange(range);
  };

  const parsedValue: DateRange | null =
    dateRange.startDate && dateRange.endDate ? [new Date(dateRange.startDate), new Date(dateRange.endDate)] : null;
  return (
    <Stack spacing={10} direction="column" alignItems="flex-start">
      <DateRangePicker
        format="MM/dd/yyyy hh:mm aa"
        showMeridiem
        onChange={handleDateChange} 
        readOnly={readOnly}
        value={parsedValue}
      />
    </Stack>
  );
}
