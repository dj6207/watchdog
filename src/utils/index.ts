import { UsageLogData } from "../types";

export const formatDate = (date:Date):string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0')
    return `${year}-${month}-${day}`;
}

export const filterUsageLogData = (usageLogDataList:UsageLogData[]):UsageLogData[] => {
    // ... creates a shallow copy since .sort will mutate the list
    // filters list based on  timeSpent
    const filteredList = [...usageLogDataList].sort((a, b) => b.timeSpent - a.timeSpent);
    return filteredList.slice(0, 10);
}