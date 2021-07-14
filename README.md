# vue-trackjs
A lightweight tracking library of vue.

## Installation

```
// npm
npm i --save vue-trackjs

// yarn
yarn add vue-trackjs

//  main引入
import TrackDirective from 'vue-trackjs'
import { options } from './track.config.js'

// vue 3
createApp(App).use(TrackDirective, options)

// vue 2
Vue.use(TrackDirective, options)

```
### 配置文件

```
// 新建track.config.js文件
import { setTrackBaseInfo, throttle } from 'vue-trackjs'

// 你的自定义通用埋点信息， vue-trackjs集成的通用信息下面会有介绍
const trackBaseInfo = {
    ip: '127.23.112.3',
    version: '1.0.0',
    deviceId: 'vue-track',
    language: 'us',
    network: '3G',
}

// 存储到localstorage
setTrackBaseInfo(trackBaseInfo)

// 获取埋点配置信息函数，一般埋点都是支持系统配置，从接口取埋点配置，下面只是简单示范
function getTrackConfig() {
    // 该函数必须return如下结构，eventId和action字段固定不可更改，其他随意
    return {
        // 该key对应后续自定义指令里面的id
        "moduleName_xxx_show": {
            "eventId": "moduleName_xxx_show",
            "resourceModule": "",
            "action": "show"
        },
        "moduleName_xxx_click": {
            "eventId": "moduleName_xxx_click",
            "resourceModule": "12323",
            "action": "click"
        }
    }
}

// 获取埋点信息上传id函数，埋点批次上传前获取上传权限，根据业务需要，为可选项
function getUploadId() {
    // 只接收下面两个字段
    return { liftTime, uploadKey }
}

// 轮询上传埋点信息回调函数, 会有3个入参  埋点信息数组  通用信息  getUploadId函数返回的uploadKey(可选)
function uploadTracks(trackList, baseInfo, uploadKey) {
    return Promise<any>
}

export const options = {
    appId: 'projectName',
    getTrackConfig,
    getUploadId,
    uploadTracks
}

```
### 基本用法

```
**vue-trackjs 自带的埋点类型有4种：**

// click 点击事件
<div v-track="{ id: 'moduleName_xxx_click', eventResource: '{xxid: 12}' }">...</div>

// scoll_up 用户浏览滚动深度
<div v-track="{ id: 'moduleName_xxx_scoll_up' }">...</div>

// stay 停留时长
<div v-track="{ id: 'moduleName_xxx_stay' }">...</div>

// show 页面加载时间
<div v-track="{ id: 'moduleName_xxx_show'  }" :data-track="getLoadingTime">...</div>

computed: {
    getLoadingTime() {
        // 注意自定义data属性里面只接收字符串
        return JSON.stringify({ loadingTime: xxx })
    }
}

注：因为vue自定义bind.value不是响应式的，但你的eventResource是响应式数据时，需要像上面的show一样新增一个data-track，用来替换eventResource

```

### 自定义埋点事件

```
// 需要新增customActionFn配置
const options = {
    // ...
    customActionFn: {
        // 入参会返回3个参数, callback函数必须调用传入trackInfo才会成功
        myCustom: (trackInfo, callback, el) => {
            const fn = () => {
                trackInfo.haha = "guapi"
                callback(trackInfo)
            }
            el.addEventListener('mouseenter', throttle(fn, 300))
        }
    }
}
```

### 手动埋点
```
import { manualBurying } from 'vue-trackjs'

function clickHandler() {
    // manualBurying接收两个入参  埋点信息  另一个localstorage的key（可选，默认appId）
    const trackInfo = { //... }
    manualBurying(trackInfo)
}

```

## Browser

```
<script type="text/javascript" src="track.min.js"></script>

除注册自定义指令的方式需要修改外，其他用法基本同上

```


