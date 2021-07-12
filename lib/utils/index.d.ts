declare const DEDAULT_KEY = "vue_track_key";
declare function getBaseInfo(): TrackInfo;
declare function getTemplateInfo(): TrackInfo;
/**
 * 清除埋点信息
 * @param liftTime 当设置了埋点有效期时自动清除过期埋点
 */
declare function clearStorage(defaultKey: string, liftTime?: number): void;
declare function write2Storage(defaultKey: string, trackInfo: TrackInfo): void;
/**
 * 修改埋点基础信息
 * @param baseKey 基础埋点信息对象或者对象里面的key
 * @param value 当key为key时对应的value
 */
declare function setTrackBaseInfo(baseKey: any, value?: any): void;
/**
 * 特殊情况手动埋点
 * @param options 回调函数
 * @param trackKey 时间间隔延迟多少毫秒
 */
declare function manualBurying(options: TrackInfo, trackKey?: string): void;
/**
 * 节流
 * @param fn 回调函数
 * @param delay 时间间隔延迟多少毫秒
 */
declare function throttle(fn: {
    apply: (arg0: any, arg1: any[]) => void;
}, delay?: number, immediate?: boolean): () => void;
export { write2Storage, clearStorage, getBaseInfo, getTemplateInfo, manualBurying, throttle, setTrackBaseInfo, DEDAULT_KEY, };
