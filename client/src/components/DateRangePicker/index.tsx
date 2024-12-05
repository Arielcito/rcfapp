"use client";

import React from 'react';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays } from 'date-fns';

interface DateRangePickerProps {
  value: {
    from: Date;
    to: Date;
  };
  onChange: (range: { from: Date; to: Date }) => void;
}

const DateRangePicker = ({ value, onChange }: DateRangePickerProps) => {
  const handleRangeSelect = (range: string) => {
    const today = new Date();
    let from: Date;
    let to: Date;

    switch (range) {
      case 'today':
        from = startOfDay(today);
        to = endOfDay(today);
        break;
      case 'yesterday':
        from = startOfDay(subDays(today, 1));
        to = endOfDay(subDays(today, 1));
        break;
      case 'week':
        from = startOfWeek(today, { weekStartsOn: 1 });
        to = endOfWeek(today, { weekStartsOn: 1 });
        break;
      case 'month':
        from = startOfMonth(today);
        to = endOfMonth(today);
        break;
      default:
        from = startOfDay(today);
        to = endOfDay(today);
    }

    onChange({ from, to });
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handleRangeSelect('today')}
        className={`px-4 py-2 rounded-sm ${
          value.from.getDate() === new Date().getDate()
            ? 'bg-primary text-white'
            : 'bg-gray-2 dark:bg-meta-4'
        }`}
      >
        Hoy
      </button>
      <button
        onClick={() => handleRangeSelect('yesterday')}
        className="px-4 py-2 rounded-sm bg-gray-2 dark:bg-meta-4 hover:bg-primary hover:text-white"
      >
        Ayer
      </button>
      <button
        onClick={() => handleRangeSelect('week')}
        className="px-4 py-2 rounded-sm bg-gray-2 dark:bg-meta-4 hover:bg-primary hover:text-white"
      >
        Esta Semana
      </button>
      <button
        onClick={() => handleRangeSelect('month')}
        className="px-4 py-2 rounded-sm bg-gray-2 dark:bg-meta-4 hover:bg-primary hover:text-white"
      >
        Este Mes
      </button>
    </div>
  );
};

export default DateRangePicker; 