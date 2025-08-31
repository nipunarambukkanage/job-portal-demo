import dayjs from 'dayjs';
export const fmtDate = (d?: string | number | Date) => (d ? dayjs(d).format('YYYY-MM-DD') : '');
