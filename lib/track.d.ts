declare type anyMap = Indexable<any>;
declare type Fn<V> = (...arg: unknown[]) => V;
declare type listener = (e: Event) => void;
export interface DirectiveBinding {
    name: string;
    value?: any;
    arg?: string;
    oldArg?: string;
    modifiers?: Indexable<boolean>;
}
export declare class TrackPoint {
    defaultKey: string;
    intervalTime: number;
    eventMap: anyMap;
    getTrackConfig: Fn<Indexable<string>>;
    getUploadId: Fn<Indexable<string>>;
    uploadTracks: Fn<void>;
    customActionFn: Indexable<Fn<void>>;
    trackList: anyMap[];
    baseInfo: TrackInfo;
    userScrollDepth: number;
    promiseQueue: Array<() => void>;
    scrollCallback: Nullable<listener>;
    constructor(options?: anyMap);
    /**
     * 埋点轮训上传
     * @param immediate 是否立即上传历史埋点数据
     */
    init(immediate?: boolean): void;
    getanyMapQueue(): Promise<void>;
    getanyMap(): Promise<void>;
    getPermission(): Promise<void>;
    /**
     * 上传本地埋点数据
     * @param uploadKey getPermission返回
     */
    sendTrackInfo(uploadKey: string): Promise<void>;
    getTrackInfo(el: HTMLElement, binding: DirectiveBinding): Indexable<string>;
    handleBindEvent(el: HTMLElement, binding: DirectiveBinding): Promise<void>;
    addClickTrigger(el: HTMLElement, trackInfo: TrackInfo, action: string): void;
    addStayTrigger(trackInfo: TrackInfo): void;
    addScrollTrigger(el: HTMLElement, trackInfo: TrackInfo): void;
    saveScrollTrack(trackInfo: TrackInfo): void;
    handleUnBindEvent(el: HTMLElement, binding: DirectiveBinding): void;
}
export {};
