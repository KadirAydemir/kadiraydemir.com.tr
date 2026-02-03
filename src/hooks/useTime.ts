import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { enUS, tr } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

export const useTime = () => {
    const [time, setTime] = useState(new Date());
    const { i18n } = useTranslation();

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const locale = i18n.language.startsWith('tr') ? tr : enUS;

    return {
        time,
        formattedTime: format(time, 'MMM d HH:mm', { locale }),
        fullDate: format(time, 'EEEE, MMMM d, yyyy', { locale })
    };
};
