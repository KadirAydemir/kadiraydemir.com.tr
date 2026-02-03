import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarPopupProps {
    isOpen: boolean;
    onClose: () => void;
}



export const CalendarPopup = ({ isOpen, onClose }: CalendarPopupProps) => {
    const today = new Date();
    const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
    const { t } = useTranslation();

    const DAYS = t('calendar.days', { returnObjects: true }) as string[];
    const MONTHS = t('calendar.months', { returnObjects: true }) as string[];

    if (!isOpen) return null;

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Get first day of month (0 = Sunday, convert to Monday-based)
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    // Get number of days in month
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Get days from previous month
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const prevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const goToToday = () => {
        setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
    };

    const isToday = (day: number) => {
        return day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear();
    };

    // Build calendar grid
    const calendarDays: { day: number; isCurrentMonth: boolean; isToday: boolean }[] = [];

    // Previous month days
    for (let i = startDay - 1; i >= 0; i--) {
        calendarDays.push({
            day: daysInPrevMonth - i,
            isCurrentMonth: false,
            isToday: false
        });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
        calendarDays.push({
            day: i,
            isCurrentMonth: true,
            isToday: isToday(i)
        });
    }

    // Next month days (fill remaining cells)
    const remainingCells = 42 - calendarDays.length; // 6 rows x 7 days
    for (let i = 1; i <= remainingCells; i++) {
        calendarDays.push({
            day: i,
            isCurrentMonth: false,
            isToday: false
        });
    }

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-[100]"
                onClick={onClose}
            />

            {/* Calendar */}
            <div className="absolute top-full mt-2 right-0 w-80 bg-ubuntu-dock/95 backdrop-blur-xl rounded-xl shadow-2xl z-[101] border border-white/10 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-white/5">
                    <button
                        onClick={prevMonth}
                        className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <ChevronLeft size={18} className="text-gray-300" />
                    </button>

                    <button
                        onClick={goToToday}
                        className="text-white font-medium hover:bg-white/10 px-3 py-1 rounded-lg transition-colors"
                    >
                        {MONTHS[month]} {year}
                    </button>

                    <button
                        onClick={nextMonth}
                        className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <ChevronRight size={18} className="text-gray-300" />
                    </button>
                </div>

                {/* Days Header */}
                <div className="grid grid-cols-7 gap-1 px-3 py-2 bg-white/5">
                    {DAYS.map((day) => (
                        <div
                            key={day}
                            className="text-center text-xs font-medium text-gray-400 py-1"
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 px-3 pb-3">
                    {calendarDays.map((item, index) => (
                        <div
                            key={index}
                            className={`
                                aspect-square flex items-center justify-center text-sm rounded-lg
                                transition-colors cursor-pointer
                                ${item.isCurrentMonth
                                    ? 'text-white hover:bg-white/10'
                                    : 'text-gray-500'
                                }
                                ${item.isToday
                                    ? 'bg-ubuntu-orange text-white font-bold hover:bg-ubuntu-orange/80'
                                    : ''
                                }
                            `}
                        >
                            {item.day}
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="px-4 py-2 bg-white/5 border-t border-white/10">
                    <div className="text-center text-xs text-gray-400">
                        {t('calendar.today', { date: `${today.getDate()} ${MONTHS[today.getMonth()]} ${today.getFullYear()}` })}
                    </div>
                </div>
            </div>
        </>
    );
};
