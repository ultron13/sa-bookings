import React, { useEffect, useState } from 'react';
import api from '../services/api';

interface BookedRange { checkIn: string; checkOut: string; }

interface Props { accommodationId: string; }

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function isDateBooked(dateStr: string, ranges: BookedRange[]): boolean {
  return ranges.some((r) => dateStr >= r.checkIn && dateStr < r.checkOut);
}

export const AvailabilityCalendar: React.FC<Props> = ({ accommodationId }) => {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [bookedRanges, setBookedRanges] = useState<BookedRange[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.getAvailability(accommodationId, year, month)
      .then(({ data }: any) => setBookedRanges(data.data))
      .catch(() => setBookedRanges([]))
      .finally(() => setLoading(false));
  }, [accommodationId, year, month]);

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1); } else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1); } else setMonth(m => m + 1);
  };

  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const todayStr = today.toISOString().split('T')[0];

  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  return (
    <div className="border rounded-xl p-4 bg-white">
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <span className="font-semibold text-gray-900">{MONTHS[month - 1]} {year}</span>
        <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS.map((d) => <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>)}
      </div>

      {loading ? (
        <div className="text-center py-8"><div className="animate-spin w-5 h-5 border-2 border-sa-green border-t-transparent rounded-full mx-auto" /></div>
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, idx) => {
            if (!day) return <div key={`empty-${idx}`} />;
            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const booked = isDateBooked(dateStr, bookedRanges);
            const isPast = dateStr < todayStr;
            return (
              <div key={day} className={`
                aspect-square flex items-center justify-center text-sm rounded-lg text-center
                ${isPast ? 'text-gray-300 line-through' : booked ? 'bg-red-100 text-red-600 font-medium' : 'bg-green-50 text-green-700 font-medium'}
              `}>
                {day}
              </div>
            );
          })}
        </div>
      )}

      <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-100 inline-block" /> Available</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-100 inline-block" /> Booked</span>
      </div>
    </div>
  );
};
