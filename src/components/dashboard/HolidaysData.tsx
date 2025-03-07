
import { Holiday } from '@/lib/types';

export const getHolidays = (): Holiday[] => {
  return [
    {
      date: new Date(2023, 10, 23), // November 23, 2023
      name: 'Thanksgiving Day'
    },
    {
      date: new Date(2023, 10, 24), // November 24, 2023
      name: 'Black Friday'
    }
  ];
};
