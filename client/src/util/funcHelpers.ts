
export const sum = <T>(arr: T[], getter: (val: T) => number) => {
    return arr.reduce((t, val) => t + getter(val), 0);
};

export const avg = (arr: number[]): number => {
    if (arr.length === 0) {
        return 0;
    } else {
        return sum(arr, x => x) / arr.length;
    }
}

export const fieldGetter = (obj: any, fields: any[]) => {
    let cur = obj;
    fields.forEach(field => {
        cur = cur[field];
    });
    return cur;
};

export const fieldSetter = (obj: any, fields: any[], value: any) => {
    let cur = obj;
    fields.slice(0, -1).forEach(field => {
        if (!cur[field]) {
            cur[field] = {};
        }
        cur = cur[field];
    });
    cur[fields[fields.length - 1]] = value;
};

export const fieldCloneWith = (obj: any, fields: any[], value: any) => {
    if (fields.length === 0) {
        return obj;
    } else if (fields.length === 1) {
        return {
            ...obj,
            [fields[0]]: value
        };
    } else {
        return {
            ...obj,
            [fields[0]]: fieldCloneWith(obj[fields[0]], fields.slice(1), value)
        };
    }
};

export const insertIntoSorted = <T>(sorted: T[], value: T, comparator: (a: T, b: T) => number) => {
    let low = 0, high = sorted.length;

    while (low < high) {
        const mid = (low + high) >>> 1;
        if (comparator(sorted[mid], value) < 0) {
            low = mid + 1;
        } else {
            high = mid;
        } 
    }

    sorted.splice(low, 0, value);
};

export const optionsFromNameMap = (nameMap: {[value: string]: string}): { value: string, name: string }[] => {
    return Object.keys(nameMap).map(value => ({ value, name: nameMap[value] }));
};

export const unique = <T>(array: T[]): T[] => {
    return Array.from(new Set(array));
};

export const groupBy = <T>(array: T[], keyGetter: (value: T) => string): {[key: string]: T[]} => {
    const grouped: {[key: string]: T[]} = {};
    array.forEach(value => {
        const key = keyGetter(value);
        if (!grouped[key]) {
            grouped[key] = [];
        }
        grouped[key].push(value);
    });
    return grouped;
};

export const deepCopy = (obj: any): any => {
    if (Array.isArray(obj)) {
        return obj.map(deepCopy);
    } else if (typeof obj === 'object' && obj !== null) {
        return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, deepCopy(v)]));
    } else {
        return obj;
    }
};
