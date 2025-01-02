import Initializers from "./initializers";

/**
 * A class that works with times
 */
class Timer {
    static unitToMsDict = new Map()
        .set('y', ['year', 365 * 24 * 60 * 60 * 1000])
        .set('M', ['month', 30 * 24 * 60 * 60 * 1000])
        .set('d', ['day', 24 * 60 * 60 * 1000])
        .set('h', ['hour', 60 * 60 * 1000])
        .set('m', ['minute', 60 * 1000])
        .set('s', ['second', 1000]) as Map<string, [string, number]>;
    static unitsToMS = (amount: string, unit: string) => Number(amount.slice(0, -1)) * (this.unitToMsDict.get(unit)?.at(1) as number);
    static timeFormatOptions = {
        locale: 'en-US',
        options: {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            weekday: 'long',
            timeZone: 'America/Detroit',
            timeZoneName: 'longGeneric',
        } as Intl.DateTimeFormatOptions,
    };
    /** Converts a Date or number to a timestamp */
    static timestamp = (value: Date | number) => new Intl.DateTimeFormat(this.timeFormatOptions.locale, this.timeFormatOptions.options).format(value);
    /** Converts a string to milliseconds */
    static stringToMilliseconds = (timeString: string) => timeString
        .split(' ')
        .map((value: string) => this.unitsToMS(value, value.slice(-1)))
        .reduce((a, b) => a + b);
    /** Converts a string to seconds */
    static stringToSeconds = (timeString: string) => this.stringToMilliseconds(timeString) / 1e3;
    /** Converts a string to minutes */
    static unixTime = (date: Date) => Math.round(Date.parse(date.toISOString()) / 1e3);
}

/**
 * A class that contains methods for processing text
 */
const List = {
    /** Joins an array of strings with a comma and a space in the Conjunction style*/
    and: (value: string[]) => new Intl.ListFormat('en-US', { style: 'long', type: 'conjunction' }).format(value),
    /** Joins an array of strings with a comma and a space in the Disjunction style*/
    or: (value: string[]) => new Intl.ListFormat('en-US', { style: 'long', type: 'disjunction' }).format(value),
}



class RuntimeStatistics {
    /** The number of times `X` has been registered */
    registered: number;
    /** The number of times `X` has been executed */
    executed: number;
    constructor() {
        this.registered = 0;
        this.executed = 0;
    }
    /** Increment the number of times `X` has been registered */
    reg = () => ++this.registered;
    /** Increment the number of times `X` has been executed */
    exec = () => ++this.executed;
}

class UtilsClass {
    static Time = Timer;
    static List = List;
    static RuntimeStatistics = RuntimeStatistics;
    static Initializers = Initializers;
}

export default UtilsClass;

export {
    Timer,
    List,
    RuntimeStatistics,
    Initializers,
}
