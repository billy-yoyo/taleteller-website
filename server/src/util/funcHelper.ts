
export const applyUpdates = (data: any, model: any) => {
    Object.entries(data).forEach(([key, value]) => {
        model[key] = value;
    });
};

export const isPlainObject = (v: any): v is object => (!!v && typeof v === 'object' && (v.__proto__ === null || v.__proto__ === Object.prototype));

export const objectFromMap = <K extends string>(keys: readonly K[], map: Map<K, any>): {[key in K]: any} => {
    return Object.fromEntries(keys.map(key => [key, map.get(key)])) as {[key in K]: any}
};

export const mapFromObject = <K extends string>(keys: readonly K[], obj: {[key in K]: any}): Map<K, any> => {
    const map = new Map<K, any>();
    keys.forEach(key => {
        map.set(key, obj[key]);
    });
    return map;
};

export const createKeydObject = <K extends string, V>(keys: readonly K[], value: V): {[key in K]: V} => {
    return Object.fromEntries(keys.map(key => [key, value])) as {[key in K]: V};
}
