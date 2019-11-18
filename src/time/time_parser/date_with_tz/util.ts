export enum UtilZone {
    LOCAL = "local",
    FIXED = "fixed",
    UTC = "utc"
}

export interface CalendarObject {
    year;
    month;
    day;
    hour;
    minute;
    second;
    millisecond;
}
