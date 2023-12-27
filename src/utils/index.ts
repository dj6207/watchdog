import { ApplicationUsageData, UsageLogData } from "../types";

export const formatDate = (date:Date):string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0')
    return `${year}-${month}-${day}`;
}

export const formatDateMonthDayYear = (date:Date):string => {
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    };
    return date.toLocaleDateString('en-US', options);
}

export const formatTime = (seconds: number): string => {
    const secondsInMinute = 60;
    const secondsInHour = 3600;
    const secondsInDay = 86400;
    const secondsInWeek = 604800;

    if (seconds >= secondsInWeek) {
        const weeks = Math.floor(seconds / secondsInWeek);
        const days = Math.floor((seconds % secondsInWeek) / secondsInDay);
        return `${weeks}w ${days}d`;
    } else if (seconds >= secondsInDay) {
        const days = Math.floor(seconds / secondsInDay);
        const hours = Math.floor((seconds % secondsInDay) / secondsInHour);
        return `${days}d ${hours}h`;
    } else if (seconds >= secondsInHour) {
        const hours = Math.floor(seconds / secondsInHour);
        const minutes = Math.floor((seconds % secondsInHour) / secondsInMinute);
        return `${hours}h ${minutes}m`;
    } else if (seconds >= secondsInMinute) {
        const minutes = Math.floor(seconds / secondsInMinute);
        const remainingSeconds = seconds % secondsInMinute;
        return `${minutes}m ${remainingSeconds}s`;
    } else {
        return `${seconds}s`;
    }
}

export const filterUsageLogData = (usageLogDataList:UsageLogData[]):UsageLogData[] => {
    // ... creates a shallow copy since .sort will mutate the list
    // filters list based on  timeSpent
    const filteredList = [...usageLogDataList].sort((a, b) => b.timeSpent - a.timeSpent);
    return filteredList.slice(0, 10);
}

export const filterApplicationUsageData = (applicationUsageDataList:ApplicationUsageData[]):ApplicationUsageData[] => {
    const filteredList = [...applicationUsageDataList].sort((a, b) => b.totalTimeSpent - a.totalTimeSpent);
    return filteredList.slice(0, 10);
}

export const getDaysOfCurrentWeek = ():Date[] => {
    const currentDate = new Date();
    const startDateOfWeek = currentDate.getDate() - currentDate.getDay() + (currentDate.getDay() === 0 ? -6 : 1);
    let currentDaysOfWeek:Date[] = [];
    for (let i = 0; i < 7; i++) {
        currentDaysOfWeek.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), startDateOfWeek + i));
    }
    return currentDaysOfWeek;
}

export const truncateString = (string: string | undefined, length: number = 10): string => {
    if (string) {
        return string.length > length ? `${string.slice(0, length)}...` : string;
    }
    return "?";
};