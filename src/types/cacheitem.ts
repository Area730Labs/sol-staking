
import config from "../config.json"

/**
 * interface to use when putting data into storage
 */

export default interface CacheItem {

    /**
     * unix timestamp
     */
    validUntil: number

    /**
     * serialized data
     */
    data: any
}


/**
 * 
 * @param key prefix for cache key
 * @param constructor for cache info if not found or expired
 * @param validitySeconds cache time 
 * @param args cache key parts 
 */
export async function getOrConstruct<T>(force: boolean,key: string, constructor: { (): Promise<T> }, validitySeconds: number, ...args: string[]): Promise<T> {

    if (!force && config.disable_cache) {
        force = true;
    }

    // ts
    const curTime = new Date().getTime() / 1000;

    // constrcut key

    const delimiter = "_"

    const keyValue = key + delimiter + args.join(delimiter);

    const strkey = localStorage.getItem(keyValue)
    
    let construct  = false;
    if (strkey == null) {
        construct = true;
    } else {
        // check if data is valid
        const parsed = JSON.parse(strkey) as CacheItem;

        if (!force && parsed.validUntil > curTime) {
            return parsed.data as T;
        } else {
            construct = true;
        }
    }

    if (construct || force) {
        const newObject = await constructor();

        const cacheObject = JSON.stringify({
            validUntil: curTime + validitySeconds,
            data: newObject
        })

        localStorage.setItem(keyValue, cacheObject);

        return newObject;
    } 


}