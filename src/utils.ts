import Initializers from "./initializers";

/**
 * A class that works with times
 */
const Timer = {
    unitsToMS: (amount: string, unit: string) => {
        const unitToMsDict = new Map()
        .set('y', ['year', 365 * 24 * 60 * 60 * 1000])
        .set('M', ['month', 30 * 24 * 60 * 60 * 1000])
        .set('d', ['day', 24 * 60 * 60 * 1000])
        .set('h', ['hour', 60 * 60 * 1000])
        .set('m', ['minute', 60 * 1000])
        .set('s', ['second', 1000]) as Map<string, [string, number]>
        return Number(amount.slice(0, -1)) * (unitToMsDict.get(unit)?.at(1) as number)
    },
    /** Converts a Date or number to a timestamp */
    timestamp: (value: Date | number) => new Intl.DateTimeFormat(
        'en-US',
        {
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
    ).format(value),
    /** Converts a string to milliseconds */
    stringToMilliseconds: (timeString: string) => timeString
        .split(' ')
        .map((value: string) => Timer.unitsToMS(value, value.slice(-1)))
        .reduce((original, toAdd) => original + toAdd),
    /** Converts a string to seconds */
    stringToSeconds: (timeString: string) => Timer.stringToMilliseconds(timeString) / 1e3,
    /** Converts a string to minutes */
    unixTime: (date: Date) => Math.round(Date.parse(date.toISOString()) / 1e3),
}

/**
 * A class that contains methods for processing text
 */
const List = {
    /** Joins an array of strings with a comma and a space in the Conjunction style*/
    and: (value: string[]) => new Intl.ListFormat('en-US', { style: 'long', type: 'conjunction' }).format(value),
    /** Joins an array of strings with a comma and a space in the Disjunction style */
    or: (value: string[]) => new Intl.ListFormat('en-US', { style: 'long', type: 'disjunction' }).format(value), // eslint-disable-line id-length
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
    registerCount = () => ++this.registered;
    /** Increment the number of times `X` has been executed */
    executeCount = () => ++this.executed;
}

export default {
    Time: Timer,
    List,
    RuntimeStatistics,
    Initializers,
}

export {
    Timer as Time,
    List,
    RuntimeStatistics,
    Initializers,
}
