var HM_Camera_Control_Widget = StudioWidgetWrapper.extend({

    init: function () {
        var thisObj = this;
        thisObj._super.apply(thisObj, arguments);
        thisObj.render();
        thisObj.initGlobalActionHook();
        if ((typeof (Studio) != "undefined") && Studio) {

            // 播放器停止了播放
            Studio.registerEvents(thisObj, "stopPlay", "Stop Play", []);
            // 播放器开始了播放
            Studio.registerEvents(thisObj, "startPlay", "Start Play", []);
            // 实时播放方法
            Studio.registerAction(thisObj, "startLive", "Start Play Live", [], $.proxy(thisObj.startLive, thisObj), []);
            // 录像回放方法
            Studio.registerAction(thisObj, "startPlayBack", "Start Play Back", [], $.proxy(thisObj.startPlayBack, thisObj), []);
            // 停止所有播放
            Studio.registerAction(thisObj, "stopAll", "Stop All Play", [], $.proxy(thisObj.cancel, thisObj), []);
            // 暂停播放
            Studio.registerAction(thisObj, "pause", "pause", [], $.proxy(thisObj.pauseEvent, thisObj), []);
            // 关闭播放器
            Studio.registerAction(thisObj, "closePlay", "closePlay", [], $.proxy(thisObj.closePlay, thisObj), []);
            // 切换实况和录像
            Studio.registerEvents(thisObj, "switch", "Switch live or replay", []);
        }
    },

    render: function () {
        var thisObj = this;
        var widgetProperties = thisObj.getProperties();
        var elem = thisObj.getContainer();
        thisObj.getItems();
        thisObj.getConnectorProperties();
        var widgetBasePath = thisObj.getWidgetBasePath();
        if (elem) {
            var containerDiv = $(".scfClientRenderedContainer", elem);
            if (containerDiv.length) {
                $(containerDiv).empty();
            } else {
                containerDiv = document.createElement('div');
                containerDiv.className = "scfClientRenderedContainer";
                $(elem).append(containerDiv);
            }
            const I18N = HttpUtils.getI18n({
                locale: HttpUtils.getLocale(),
                messages: thisObj.getMessages()
            });
            let lang = I18N.messages[I18N.locale]
            let playWidth = '100%';
            let playHeight = '100%';
            let playTop = widgetProperties.playTop
            videojs.options.flash.swf = widgetBasePath + 'static/video-js.swf';
            videojs.options.flash.params = { wmode: "transparent" };
            var IframeOnClick = {
                resolution: 200,
                iframes: [],
                interval: null,
                Iframe: function () {
                    this.element = arguments[0];
                    this.cb = arguments[1];
                    this.hasTracked = false;
                },
                track: function (element, cb) {
                    this.iframes.push(new this.Iframe(element, cb));
                    if (!this.interval) {
                        var _this = this;
                        this.interval = setInterval(function () {
                            _this.checkClick();
                        }, this.resolution);
                    }
                },
                checkClick: function () {
                    if (document.activeElement) {
                        var activeElement = document.activeElement;
                        this.iframes.map((item, i) => {
                            if (activeElement === this.iframes[i].element) {
                                if (this.iframes[i].hasTracked == false) {
                                    this.iframes[i].cb.apply(window, []);
                                    this.iframes[i].hasTracked = true;
                                }
                            } else {
                                this.iframes[i].hasTracked = false;
                            }
                        })
                    }
                }
            }
            thisObj.vm = new Vue({
                el: $("#HW_Camera_Control_Widget", elem)[0],
                computed: {
                    autoHeight() {
                        return this.position === 'fixed' ? 'unset' : this.height
                    },
                    autoWidth() {
                        return this.position === 'fixed' ? 'unset' : this.width
                    },
                    videoHeight() {
                        if (this.isLive) {
                            return 'calc(100% - 7.2rem)'
                        } else {
                            return 'calc(100% - 9.4rem)'
                        }
                    }
                },
                data: {
                    pickerBeginDateBefore: {
                        disabledDate(time) {
                            return time.getTime() > Date.now();
                        }
                    },
                    handlePause: false,//是否手动点击暂停
                    width: widgetProperties.width,
                    height: widgetProperties.height,
                    position: widgetProperties.position ? widgetProperties.position : 'fixed',
                    vTop: widgetProperties.vTop,
                    vBottom: widgetProperties.vBottom,
                    vLeft: widgetProperties.vLeft,
                    vRight: widgetProperties.vRight,
                    zIndex: widgetProperties.zIndex,
                    ptzControl: widgetProperties.ptzControl ? widgetProperties.ptzControl : "/VideoProxy/0.1.0/ptz",
                    playbackControlURL: "/VideoProxy/0.1.0/playbackcontrol",
                    playStyle: 'width:' + playWidth + ';height:' + playHeight + ';top:' + playTop,
                    isPlay: [true],
                    closeitUrls: [],
                    iframeDiv: 'iframe1',
                    isNativePause: false,
                    activeItem: 0,
                    activeControlBtn: 0,
                    onPlay: false,
                    onPause: false,
                    onStop: false,
                    isFull: false,
                    isShowTips: 0,
                    tips: 'direction control is only for spherical camera',
                    activeWin: 0,
                    zoomNum: 1,
                    lang: lang,
                    playTrigger: false,
                    isLive: true,
                    liveClass: 'select',
                    replayClass: '',
                    playbackParam: { date: '', startTime: '', endTime: '' },
                    videoTotalTime: 0,//存储录像总时间用于判断是否播放完成
                    playbackSlider: {
                        played: 0,
                        playedTime: '00:00',
                        totalTime: '00:00',
                    },
                    playbackData: {
                        cameraCode: '',
                        cameraName: '',
                        originStartTime: '',
                        startTime: '',
                        originEndTime: '',
                        endTime: '',
                        timeDifference: '',
                        nextVideoUrl: "",
                        breakTime: 0
                    },
                    flvPlaybackData: {
                        cameraCode: '',
                        cameraName: '',
                        originEndTime: '',
                        originStartTime: '',
                        siderTimeAfterSeek: 0,
                        siderTimeBeforeSeek: 0,
                        played: 0,
                        isFlvVideoSeeked: false,
                        flvFisrtPlayFlag: 0,
                        flvVideoJsPlaybackElems: []
                    },
                    cameraAdd: [],
                    cameraDel: [],
                    delCount: -1,
                    rateArray: [0.25, 0.5, 1, 2, 4],
                    rateIndex: 2,
                    zoomLevel: 1,
                    isShowTip: false,
                    destination: '',
                    isShowConfirm: false,
                    dialogPng: widgetBasePath + 'images/ok.png',
                    isShowDialog: false,
                    dialogMsg: '',
                    png: {
                        success: widgetBasePath + 'images/ok.png',
                        error: widgetBasePath + 'images/error.png',
                        info: widgetBasePath + 'images/info.png',
                        warn: widgetBasePath + 'images/warn.png'
                    },
                    countTime: 5,
                    isPlayAtTime: false,
                    videoServiceName: "",
                    videoMediaType: "",
                    getVideoSurveillanceConfig: '/HiCampus__VideoSurveillance/1.0.0/getConfig',
                    getVideoProxyConfig: '/VideoProxy/0.1.0/getConfig',
                    getAllcamPlayConfig: '/HiCampus__SecurityWorkbenchBase/1.0.0/getVideoSurveillanceConfig',
                    allcamPort: "",
                    fastForward: {},
                    videoJsLiveElems: [],
                    videoJsPlaybackElem: null,
                    channelName: "",
                    isCloseliVideoEnded: false,
                    codesAdd: [],
                    codesDel: [],
                    codesBefore: [],
                    codesAfter: [],
                    codes: [],
                    playId: [],
                    liveVideoMediaType: "",
                    playBackVideoMediaType: "",
                    transcodeServiceName: "",
                    playbackParamOrigin: "playbackParamOrigin",
                    playbackActionFlag: false,
                    //用于生成自增长Id
                    autoIndex: 0,
                    //相机是否正在转动，调整焦距
                    ptzControlActionFlag: false,
                    //判断视频画面是否已加载完成
                    isVideoLoadCompleted: false,
                    //判断视频画面是否已加载完成
                    isVideoLoadCompleted4Lives: [],
                    iscontrolPTZByTranscode: 0,
                    isShowPTZStopFailedMessage: false,
                    isSliderDragDisable: true,
                    sslCertificate: "",//是否存在CA证书
                    isshowfill: false,//是否显示填充按钮
                    isfill: false,//是否填充
                    objectfit: "contain",//填充方式
                    //VCR控制
                    fileId: "",
                    pickerOptions: {
                        selectableRange: '00:00:00 - 23:59:59'
                    },
                    removeIndex: -1,
                    codesDetailsBefore: [],
                    hasSameCameraCode: false,
                    isTriggerPlayback: false
                },
                mounted() {
                    this.changeElementUILocale(HttpUtils.getLocale());
                    this.addWindowListener();
                    this.getVideoServiceName();
                    this.getAllcamLivePort();
                    let allcamQuery = this.getQueryValue("allcam");

                    if (allcamQuery[0] != "") {
                        this.setLocalStorage("allcam", allcamQuery)
                    }
                },
                methods: {
                    changeElementUILocale(locale) {
                        switch (locale) {
                            case "en-US":
                                ELEMENT.locale(ELEMENT.lang.en);
                                break;
                            case "zh-CN":
                                ELEMENT.locale(ELEMENT.lang.zhCN);
                                break;
                            default:
                                ELEMENT.locale({ "el": this.lang.el != undefined ? this.lang.el : ELEMENT.lang.en });
                                break;
                        }
                    },
                    nativeControl() {
                        if (this.isPlay[this.activeWin]) {
                            this.pause()
                        } else {
                            this.play()
                        }
                    },
                    /****** 通过 FlowConnector 调用 CustomAPI ******/
                    callConn: function (service, param, type, callbackFunc, failCallBackFunc) {
                        var _this = this;
                        var connector = null;
                        switch (type.toUpperCase()) {
                            case 'POST':
                                connector = thisObj.getConnectorInstanceByName('FlowConnector_POST');
                                break;
                            case 'GET':
                                connector = thisObj.getConnectorInstanceByName('FlowConnector_GET');
                                break;
                            case 'PUT':
                                connector = thisObj.getConnectorInstanceByName('FlowConnector_PUT');
                                break;
                            case 'DELETE':
                                connector = thisObj.getConnectorInstanceByName('FlowConnector_DELETE');
                                break;
                            default:
                                connector = thisObj.getConnectorInstanceByName('FlowConnector_POST');
                                break;
                        }
                        if (connector) {
                            connector.setInputParams({
                                service: service,
                                needSchema: 'data'
                            }); //异步（默认）
                            if (param.async === false) {
                                connector.setInputParams({
                                    service: service,
                                    needSchema: 'data',
                                    async: false
                                }); //同步
                                delete param.async;
                            }
                            connector
                                .query(param)
                                .done(function (response) {
                                    if (response.resp && response.resp.code) {
                                        callbackFunc.call(_this, response);
                                    }
                                })
                                .fail(function (response) {
                                    if (failCallBackFunc) {
                                        failCallBackFunc.call(_this, response.response);
                                    }

                                    callbackFunc.call(_this, response.response)
                                })
                        } else {
                            if (service == '/SmartCampus__UnifiedPortal/1.0.0/verifyLogin') {
                                if (_this.sysParams.loginUrl) {
                                    location.href = _this.sysParams.loginUrl;
                                }
                            }

                        }
                    },
                    showDialog(type, message, isShowTip, destination, callback) {
                        this.dialogPng = this.png[type];
                        this.dialogMsg = message;
                        this.isShowTip = !!isShowTip;
                        this.destination = destination;
                        this.isShowConfirm = false;
                        this.$nextTick(() => {
                            this.isShowDialog = true;
                            if (this.isShowTip) {
                                let count = setInterval(() => {
                                    if (this.countTime === 0) {
                                        clearInterval(count);
                                        callback()
                                    } else {
                                        this.countTime--;
                                    }
                                }, 1000);
                            }
                        });
                    },
                    close() {
                    },
                    fullScreen() {
                        if (!this.isVideoLoadCompleted) {
                            return;
                        }

                        if (this.videoMediaType == "HTML") {
                            this.full($('#dk_iframe' + this.playId[this.activeWin], elem)[0])
                        } else {
                            if (this.isLive) {
                                if (!this.isVideoLoadCompleted4Lives[this.activeWin]) return;
                                this.full(this.videoJsLiveElems[this.activeWin])
                            } else {
                                this.full(this.videoJsPlaybackElem)
                            }
                        }
                    },
                    full(elem) {
                        if (elem.requestFullscreen) {
                            elem.requestFullscreen();
                        } else if (elem.mozRequestFullScreen) {
                            elem.mozRequestFullScreen();
                        } else if (elem.webkitRequestFullScreen) {
                            elem.webkitRequestFullScreen();
                        }
                    },
                    exitFull(elem) {
                        if (elem.exitFullscreen) {
                            elem.exitFullscreen();
                        } else if (elem.mozCancelFullScreen) {
                            elem.mozCancelFullScreen();
                        } else if (elem.webkitCancelFullScreen) {
                            elem.webkitCancelFullScreen();
                        }
                    },
                    addWindowListener() {
                        window.onmessage = (e) => {
                            let response = e.data || {};
                            switch (response.cmd) {
                                case 'screenShot':
                                    thisObj.downloadFile(response.data, 'ScreenShot-' + new Date().getTime());
                                    break;
                                case 'gbTimeUpdate':

                                    break;
                                case 'videoTimeUpdate':
                                    if (this.isLive) {
                                        return;
                                    }
                                    this.updatePlayTimeMs(this.playbackData.originStartTime + response.data * 1000)
                                    break;
                                case 'gbPaused': // relay 控制 ws 链接断开了
                                    //判断是否调用了设置时间
                                    if (this.isCloseliVideoEnded && !this.isLive) {
                                        let iframeObj = $('#dk_iframe' + this.playId[this.activeWin], elem)[0].contentWindow;
                                        iframeObj.postMessage({
                                            cmd: "dh_play_at_time",
                                            from: "third",
                                            data: {
                                                startTime: this.playbackData.originStartTime,
                                                endTime: this.playbackData.endTime
                                            }
                                        }, this.getIframeUri('#dk_iframe' + this.playId[this.activeWin]));
                                        this.isPlayAtTime = false;
                                        this.playbackData.timeDifference = 0
                                        this.playbackSlider.playedTime = "00:00"
                                        this.playbackSlider.played = 0
                                        this.isCloseliVideoEnded = false
                                    }
                                    break;
                                case 'gbCanPlay':
                                    break;
                                case 'gbPlay':
                                    this.isVideoLoadCompleted = true;
                                    this.isSliderDragDisable = false;
                                    if (this.playTrigger) {
                                        this.isPlay[this.activeWin] = true;
                                        this.isPlay = JSON.parse(JSON.stringify(this.isPlay));
                                        thisObj.triggerEvent('startPlay');
                                    }
                                    break;
                            }
                        };
                    },
                    initVideo() {
                    },
                    login() { },
                    flvDestroyVideo() {
                        if (this.playBackVideoMediaType === "HTTP-FLV") {
                            if (this.videoJsPlaybackElem) {
                                this.videoJsPlaybackElem.removeAttribute('src');
                                this.videoJsPlaybackElem.load();
                                this.videoJsPlaybackElem.dispose();
                            }
                        }
                    },
                    startPlayBack(cameraCode, cameraName, startTime, endTime) {
                        if (!this.isTriggerPlayback) {
                            this.flvDestroyVideo();
                        }
                        this.isTriggerPlayback = false
                        if (this.playBackVideoMediaType === "HTML") this.isSliderDragDisable = true;
                        cameraCode = cameraCode.trim()
                        this.activeWin = 0;
                        this.playbackData = {
                            cameraCode: cameraCode,
                            cameraName: cameraName,
                            originStartTime: parseInt(startTime),
                            startTime: startTime,
                            endTime: endTime,
                            originEndTime: endTime,
                            timeDifference: 0
                        }
                        this.replayMode()
                        if (!cameraCode || !startTime || !endTime) {
                            this.cancel()
                            this.playbackData.cameraCode = cameraCode;
                            return
                        }
                        this.closeitUrls = []
                        setTimeout(() => {
                            this.closeitUrls.push({
                                url: '',
                                id: '1',
                                code: cameraCode,
                                deviceName: cameraName
                            })
                            this.$nextTick(() => {
                                this.videoMediaType = this.playBackVideoMediaType;
                                //调接口(基本信息)
                                let req = {
                                    "async": true,
                                    "cameraCode": cameraCode,
                                    "mediaType": this.videoMediaType,
                                    "startTime": startTime,
                                    "endTime": endTime,
                                    "protocolType": 2
                                };
                                if ("MP4" == this.videoMediaType) {
                                    req.protocolType = 2;
                                    //奥看如果截取的视频时长不一样，衔接时会有不连贯的问题
                                    req.endTime = (Math.floor(req.startTime / 60000) + 1) * 60000
                                    req.startTime = (Math.floor(req.startTime / 60000)) * 60000
                                    this.playbackData.breakTime = (startTime / 1000) % 60;
                                    this.playbackData.timeDifference = -this.playbackData.breakTime
                                }
                                this.getPlaybackURL(req, (response) => {
                                    //恢复可点击
                                    this.playbackActionFlag = false;
                                    //请求成功
                                    if (response && response.resp && response.resp.code == '0') {
                                        let live = response.data[0].url;
                                        if (this.videoMediaType === "HTTP-FLV" && response.data[0].extension) {
                                            this.fileId = response.data[0].extension.fileId;
                                        }
                                        this.playId.splice(0, 0, "playId" + this.autoIndex++);
                                        this.isPlay.splice(0, 0, true);
                                        if ("HTML" == this.videoMediaType) {
                                            live = live + "&playerInitText=Loading"
                                            let externalThis = this;
                                            let HTMLComponent = Vue.extend({
                                                template: '<div id="' + this.playId[0] + '" class="iframe1"><div class="showDeviceName" :title="cameraName">{{cameraName}}</div><iframe class="iframes"  id="dk_iframe' + this.playId[0] + '" name="dkIframe"  src="" ></iframe></div>',
                                                data: function () {
                                                    return {
                                                        activeWin: externalThis.activeWin,
                                                        cameraName: cameraName
                                                    }
                                                },
                                            });
                                            let component = new HTMLComponent().$mount();
                                            document.getElementById('HTML').appendChild(component.$el);
                                            $("#dk_iframe" + this.playId[0], elem).attr('src', live).attr('src');
                                            this.isPlay[this.activeWin] = true;
                                            this.isNativePause = false;
                                        } else {
                                            this.jumpToAuthentication(live);
                                            let options = {
                                                muted: "MP4" == this.videoMediaType ? false : true,
                                                loop: "MP4" == this.videoMediaType ? false : true,
                                                autoplay: "MP4" == this.videoMediaType ? false : true
                                            };
                                            if (this.videoMediaType === 'HTTP-FLV') {
                                                options.techOrder = ['flvjs'];
                                                options.flvjs = {
                                                    mediaDataSource: {
                                                        isLive: true,
                                                        cors: true,
                                                        withCredentials: false,
                                                    },
                                                    config: {
                                                        enableStashBuffer: false,
                                                        lazyLoad: true,
                                                        lazyLoadMaxDuration: 1,
                                                        lazyLoadRecoverDuration: 1,
                                                        deferLoadAfterSourceOpen: false,
                                                        statisticsInfoReportInterval: 1,
                                                        fixAudioTimestampGap: false,
                                                        autoCleanupSourceBuffer: true,
                                                        autoCleanupMaxBackwardDuration: 5,
                                                        autoCleanupMinBackwardDuration: 2,
                                                    }
                                                }
                                                //issue 1104修改去除 this.fastForward={cursor:"not-allowed"}    
                                            }
                                            let externalThis = this;
                                            let videoJsComponent = Vue.extend({
                                                template: '<div id="' + this.playId[0] + '" ><div class="showDeviceName" :title="cameraName">{{cameraName}}</div><video id="videojs' + this.playId[0] +
                                                    '" style="width:100%;height:100%;" crossOrigin="anonymous" class="video-js" muted preload="auto"></video></div>',
                                                data: function () {
                                                    return {
                                                        activeWin: externalThis.activeWin,
                                                        isPlay: externalThis.isPlay,
                                                        cameraName: cameraName
                                                    }
                                                },
                                            });
                                            let component = new videoJsComponent().$mount();
                                            document.getElementById('videoJs').appendChild(component.$el);
                                            let _this = this;
                                            this.videoJsPlaybackElem = videojs("videojs" + this.playId[0], options, function () {
                                                let srcInfo = {}
                                                if (_this.videoMediaType === 'HTTP-FLV') {
                                                    srcInfo = { src: live, type: 'video/x-flv' }
                                                } else if (_this.videoMediaType === "HLS") {
                                                    srcInfo = { src: live, type: 'application/x-mpegURL' }
                                                } else if (_this.videoMediaType === "MP4") {
                                                    srcInfo = { src: live, type: 'video/mp4' }
                                                } else {
                                                    srcInfo = live
                                                }
                                                this.src(srcInfo);
                                                this.load();
                                            });
                                            this.videoJsPlaybackElem.on('loadeddata', () => {
                                                //获取并预加载下一段视频
                                                if (this.videoMediaType === "MP4") {

                                                    this.prepareNextVideo();
                                                    window.isVideoLoaded = true
                                                }
                                            });
                                            this.videoJsPlaybackElem.on('canplay', () => {
                                                this.isSliderDragDisable = false;
                                                this.isVideoLoadCompleted = true;
                                                this.isPlay[this.activeWin] = true;
                                                this.isPlay = JSON.parse(JSON.stringify(this.isPlay));
                                                this.isSliderDragDisable = false;
                                                // this.isshowfill = true;
                                                this.$nextTick(() => {
                                                    this.videoJsPlaybackElem.playbackRate(this.rateArray[this.rateIndex]);
                                                    if (this.videoMediaType === "MP4" && this.playbackData.breakTime) {
                                                        this.videoJsPlaybackElem.currentTime(this.playbackData.breakTime);
                                                        this.playbackData.breakTime = null;
                                                    }
                                                });
                                                if (this.videoMediaType === "MP4") {
                                                    if (window.isVideoLoaded) {
                                                        $("#tempVideo").remove();
                                                        window.isVideoLoaded = false;
                                                    }
                                                }
                                                this.$nextTick(() => {
                                                    //根据按钮的状态进行判断，如果是暂停状态不运行
                                                    // if (this.isPlay[this.activeWin] == true) {
                                                    //     this.videoJsPlaybackElem.play();
                                                    // }
                                                    if (this.handlePause) {
                                                        this.videoJsPlaybackElem.pause();
                                                    } else {
                                                        if (this.isPlay[this.activeWin] == true) {
                                                            this.videoJsPlaybackElem.play();
                                                        }
                                                    }
                                                });
                                                // this.$nextTick(() => {
                                                //     this.videoJsPlaybackElem.play();
                                                // });

                                                if (this.isfill) {
                                                    this.objectfit = "fill"
                                                    let video = $('video[id^="videojs' + this.playId[this.activeWin] + '"]');
                                                    let videoDiv = document.getElementById(video[0].id);
                                                    videoDiv.setAttribute("style", "object-fit:" + this.objectfit);
                                                } else {
                                                    this.objectfit = "contain"
                                                    let video1 = $('video[id^="videojs' + this.playId[this.activeWin] + '"]');
                                                    let videoDiv1 = document.getElementById(video1[0].id);
                                                    videoDiv1.setAttribute("style", "object-fit:" + this.objectfit);
                                                }
                                            });
                                            this.videoJsPlaybackElem.on('playing', () => {
                                                this.isSliderDragDisable = false;
                                                // this.isPlay[this.activeWin] = true;
                                                if (this.handlePause) {
                                                    this.isPlay[this.activeWin] = false;
                                                } else {
                                                    this.isPlay[this.activeWin] = true;
                                                }
                                                if (this.videoMediaType == "HTTP-FLV" || this.videoMediaType == "MP4") {
                                                    this.isshowfill = true;
                                                }
                                                this.isPlay = JSON.parse(JSON.stringify(this.isPlay));
                                            });
                                            this.videoJsPlaybackElem.on('timeupdate', () => {
                                                //更新进度条
                                                this.videoTimeUpdate()
                                            });
                                            if (this.videoMediaType === "HTTP-FLV") this.flvPlaybackData.flvVideoJsPlaybackElems[this.autoIndex - 1] = this.videoJsPlaybackElem;
                                        }
                                    } else if (response && response.resMsg) {
                                        if (cameraName && cameraName.length >= 24) cameraName = cameraName.substring(0, 20) + "..." + cameraName.substring(cameraName.length - 2)
                                        this.$message({
                                            showClose: true,
                                            message: this.lang.camera + (cameraName ? cameraName : cameraCode) + " " + this.lang.failRecord + response.resMsg,
                                            type: 'error'
                                        })
                                        this.cancelBtn();
                                    }
                                }, error => {
                                    this.playbackActionFlag = false;
                                    if (cameraName && cameraName.length >= 24) cameraName = cameraName.substring(0, 20) + "..." + cameraName.substring(cameraName.length - 2)
                                    this.$message({
                                        showClose: true,
                                        message: this.lang.camera + (cameraName ? cameraName : cameraCode) + " " + this.lang.failRecord + error.resMsg,
                                        type: 'error'
                                    })
                                    this.cancelBtn();
                                });
                            })
                        }, 500)
                    },
                    //由于奥看长视频分成了两个接口，为了改动最小化，这里做了异步转同步的处理
                    getPlaybackURL(req, callback, errorcallback) {
                        this.callConn("/VideoProxy/0.1.0/playback", req, "GET", (response) => {
                            if (response && response.resp && response.resp.code == '0') {
                                // url = response.data[0].url; 坏味道注释2020/09/08
                                if (this.videoMediaType === "HTTP-FLV" && response.data[0].extension) {
                                    this.fileId = response.data[0].extension.fileId;
                                }
                                let taskId = response.data[0].taskId;
                                //如果返回了taskId说明是长视频，开始转码并返回taskId,需要等段时间才能获取到播放地址
                                if (taskId) {
                                    let getTaskDetailReq = {
                                        "taskId": taskId,
                                        "urlType": 6
                                    }
                                    window.getRecordTaskDetailInterval = setInterval(() => {
                                        this.callConn("/VideoProxy/0.1.0/getRecordTaskDetail", getTaskDetailReq, "POST", (response1) => {
                                            if (response1 && response1.resp && response1.resp.code == '0') {
                                                let taskStatus = response1.data[0].taskStatus;
                                                if (3 == taskStatus) {
                                                    callback(response1)
                                                    clearInterval(window.getRecordTaskDetailInterval);
                                                }
                                            }
                                        }, error => {
                                            if (window.getRecordTaskDetailInterval) {
                                                clearInterval(window.getRecordTaskDetailInterval)
                                                window.getRecordTaskDetailInterval = null;
                                            }
                                        })
                                    }, 5000)
                                } else {
                                    callback(response)
                                }
                            }
                        }, error => {
                            errorcallback(error)
                        })
                    },
                    startLive(cameraCodes, cameraNames, cameraTypes) {
                        if (!Array.isArray(cameraCodes)) {
                            return;
                        }
                        if (cameraCodes.length === 0) {
                            setTimeout(() => {
                                this.cancel();
                            }, 500);
                            return;
                        }
                        if (cameraCodes.length === 1) {
                            if (this.transcodeServiceName.toUpperCase() == "ALLCAM" || this.transcodeServiceName.toUpperCase() == "ALLCAMCLOUD") {
                                this.videoMediaType = this.liveVideoMediaType;
                                if (this.videoMediaType == "HTTP-FLV") {
                                    this.isshowfill = true;  //显示按钮
                                    this.isfill = false; //还原为标准 
                                }
                            }
                        } else {
                            this.isshowfill = false;//隐藏按钮
                            this.isfill = false; //还原为标准 
                            let video = $('video[id^="videojs' + this.playId[this.activeWin] + '"]');
                            if (video && video.length > 0) {
                                if (video[0].id) {
                                    var videoDiv = document.getElementById(video[0].id);
                                    this.objectfit = "contain"
                                    videoDiv.setAttribute("style", "object-fit:" + this.objectfit);
                                }
                            }
                        }

                        this.$nextTick(() => {
                            if (this.codesBefore.length === 0) {
                                this.codesBefore = cameraCodes;
                                let codes = [];
                                for (let i = 0; i < cameraCodes.length; i++) {
                                    codes[i] = {
                                        code: cameraCodes[i],
                                        name: cameraNames[i],
                                        type: cameraTypes[i]
                                    }
                                }
                                this.codesAdd = cameraCodes;
                                this.codes = codes;
                                this.codesDetailsBefore = codes;
                            } else {
                                this.codes = [];
                                this.codesAfter = cameraCodes;
                                let codes = [];
                                for (let i = 0; i < cameraCodes.length; i++) {
                                    codes[i] = {
                                        code: cameraCodes[i],
                                        name: cameraNames[i],
                                        type: cameraTypes[i]
                                    }
                                }
                                let cameraSpec = this.codesBefore[0] || cameraCodes;
                                if (this.isCameraCodeSame(this.codesBefore) || this.isCameraCodeSame(cameraCodes) || this.isCameraCodeSame(cameraSpec))
                                    this.handleSameCameraCode(codes)
                                else
                                    this.handleDiffCameraCode()

                                //关闭删除
                                if (this.codesDel.length !== 0) {
                                    for (let h = 0; h < this.codesDel.length; h++) {
                                        this.delCount = h;
                                        //相关的都要删
                                        this.removeDiv(this.codesDel[h]);
                                    }
                                    this.delCount = -1;
                                    this.cameraDel = [];
                                }
                                this.$nextTick(() => {
                                    this.codesBefore = this.codes;
                                    for (let i = 0; i < cameraCodes.length; i++) {
                                        codes[i] = {
                                            code: this.codes[i],
                                            name: cameraNames[i],
                                            type: cameraTypes[i]
                                        }
                                    }
                                    this.codes = codes;
                                    this.codesDetailsBefore = codes;
                                })
                            }
                            this.$nextTick(() => {
                                // 播放新增
                                if (this.codesAdd.length !== 0) {
                                    setTimeout(() => {
                                        this.startLiveByOrder(this.codesAdd);
                                        this.$nextTick(() => {
                                            this.cameraAdd = []
                                        })
                                    }, 0)
                                }
                            })
                            this.$nextTick(() => {
                                this.changeDivStyle();
                            })
                        })
                    },
                    findDelCamera(code) {
                        let delCamera = this.cameraDel[this.delCount];
                        let delCameraName = delCamera.name;

                        for (let i = 0; i < this.codesDetailsBefore.length; i++) {
                            if ((this.codesDetailsBefore[i].code == code) && (this.codesDetailsBefore[i].name == delCameraName)) {
                                return i;
                            }
                        }
                    },
                    removeDiv(code) {
                        let cancelOrder = this.codesBefore.indexOf(code);
                        if (this.removeIndex !== -1) {
                            cancelOrder = this.removeIndex;
                            this.removeIndex = -1;
                        }
                        if ((this.delCount !== -1) && (this.cameraDel.length > 0) && this.hasSameCameraCode) {
                            cancelOrder = this.findDelCamera(code);
                        }
                        let divId = this.playId[cancelOrder];
                        if (this.activeWin === cancelOrder) {
                            this.activeWin = 0;
                        }
                        document.getElementById(divId).remove();
                        if (this.liveVideoMediaType !== "HTML") {
                            if (this.videoJsLiveElems.length > cancelOrder) {
                                if (this.videoJsLiveElems[cancelOrder]) {
                                    this.videoJsLiveElems[cancelOrder].dispose();
                                }
                                this.videoJsLiveElems.splice(cancelOrder, 1);
                            }
                        }
                        this.playId.splice(cancelOrder, 1);
                        this.codesBefore.splice(cancelOrder, 1);
                        this.closeitUrls.splice(cancelOrder, 1);
                        this.isPlay.splice(cancelOrder, 1);
                        this.isVideoLoadCompleted4Lives.splice(cancelOrder, 1);
                        this.isPlay = JSON.parse(JSON.stringify(this.isPlay));
                        this.changeDivStyle();
                    },
                    changeDivStyle() {
                        let length = this.codes.length;
                        if (length === 1) {
                            this.iframeDiv = 'iframe1'
                        } else if (length > 1 && length <= 4) {
                            length = 4;
                            this.iframeDiv = 'iframe4'
                        } else if (length > 4 && length <= 9) {
                            length = 9;
                            this.iframeDiv = 'iframe9'
                        } else {
                            length = 16;
                            this.iframeDiv = 'iframe16'
                        }
                        for (let i = 0; i < length; i++) {
                            if (this.activeWin !== i) {
                                $("#" + this.playId[i]).attr("class", this.iframeDiv);
                                $("#setWindow" + this.playId[i]).show();
                            } else {
                                $("#" + this.playId[i]).attr("class", this.iframeDiv + ' selected');
                            }
                        }
                    },
                    startLiveByOrder(codes) {
                        this.liveMode()
                        this.isVideoLoadCompleted = true;
                        this.playTrigger = false;
                        let urls = [];
                        for (let i = 0; i < codes.length; i++) {
                            let order = this.codesBefore.indexOf(codes[i]);
                            let cameraName = this.codes[order].name;
                            let cameraType = this.codes[order].type;
                            if ((this.cameraAdd.length > 0) && this.cameraAdd[i]) {
                                cameraName = this.cameraAdd[i].name ? this.cameraAdd[i].name : this.codes[order].name
                                cameraType = this.cameraAdd[i].type ? this.cameraAdd[i].type : this.codes[order].type
                            }
                            urls[i] = {
                                url: '',
                                code: codes[i],
                                id: '1',
                                deviceName: cameraName,
                                type: cameraType
                            }
                        }
                        this.closeitUrls = this.closeitUrls.concat(urls);
                        this.closeitUrls = JSON.parse(JSON.stringify(this.closeitUrls));
                        this.videoMediaType = this.liveVideoMediaType;
                        this.$nextTick(() => {
                            this.videoMediaType = this.liveVideoMediaType;
                            urls.map((item, index) => {
                                let playOrder = this.codesBefore.indexOf(codes[index]);
                                if (this.hasSameCameraCode) {
                                    playOrder = this.playId.length;
                                }
                                this.playId.splice(playOrder, 0, "playId" + this.autoIndex++);
                                this.isPlay.splice(playOrder, 0, false);
                                this.isVideoLoadCompleted4Lives[playOrder] = false;
                                //调接口(基本信息)
                                if (codes[index]) {
                                    let req = {
                                        "async": false,
                                        "cameraCode": codes[index].trim(),
                                        "mediaType": this.videoMediaType
                                    };
                                    if (this.videoMediaType == "HTTP-FLV") {
                                        //返回https协议的地址
                                        req.protocolType = 2
                                    }
                                    this.callConn("/VideoProxy/0.1.0/live", req, "GET", (response) => {
                                        if (response && response.resp && response.resp.code == '0') {
                                            let live = response.data[0].url;

                                            if ("HTML" == this.videoMediaType) {
                                                live = live + "&playerInitText=Loading"
                                                let externalThis = this;
                                                let HTMLComponent = Vue.extend({
                                                    template: '<div id="' + this.playId[playOrder] + '" ><div class="showDeviceName" :title="cameraName">{{cameraName}}</div><iframe class="iframes"  id="dk_iframe' +
                                                        this.playId[playOrder] + '" name="dkIframe"  src="" ></iframe><div id="setWindow' + this.playId[playOrder] + '" style="position: relative; left:0; top:-100%; width:100%; height:100%;z-index:1; opacity: 0; cursor: pointer;"></div></div>',
                                                    data: function () {
                                                        return {
                                                            activeWin: externalThis.activeWin,
                                                            playOrder: playOrder,
                                                            cameraName: urls[index].deviceName
                                                        }
                                                    },
                                                });
                                                let component = new HTMLComponent().$mount();
                                                document.getElementById('HTML').appendChild(component.$el);
                                                $("#dk_iframe" + this.playId[playOrder], elem).attr('src', live).attr('src');
                                                setTimeout(() => {
                                                    this.isVideoLoadCompleted4Lives[playOrder] = true;
                                                    this.isVideoLoadCompleted4Lives = JSON.parse(JSON.stringify(this.isVideoLoadCompleted4Lives));
                                                }, 1500)
                                                if (live) {
                                                    this.isPlay[playOrder] = !!live;
                                                    this.isPlay = JSON.parse(JSON.stringify(this.isPlay));
                                                }
                                            } else {
                                                //RTMP不需要跳转
                                                if (this.videoMediaType === 'HTTP-FLV') this.jumpToAuthentication(live);
                                                if (playOrder > 5) live = live.replace('8082', this.allcamPort);
                                                let options = {
                                                    muted: true,
                                                    loop: true,
                                                    autoplay: true
                                                };
                                                if (this.videoMediaType === 'HTTP-FLV') {
                                                    options.techOrder = ['flvjs'];
                                                    options.flvjs = {
                                                        mediaDataSource: {
                                                            isLive: true,
                                                            cors: true,
                                                            withCredentials: false,
                                                        },
                                                        config: {
                                                            enableStashBuffer: false,
                                                            lazyLoad: true,
                                                            lazyLoadMaxDuration: 1,
                                                            lazyLoadRecoverDuration: 1,
                                                            deferLoadAfterSourceOpen: false,
                                                            statisticsInfoReportInterval: 1,
                                                            fixAudioTimestampGap: false,
                                                            autoCleanupSourceBuffer: true,
                                                            autoCleanupMaxBackwardDuration: 5,
                                                            autoCleanupMinBackwardDuration: 2,
                                                        }
                                                    }
                                                }
                                                let externalThis = this;
                                                //使用基础 Vue 构造器，创建一个子类
                                                let videoJsComponent = Vue.extend({
                                                    template: '<div id="' + this.playId[playOrder] + '" ><div class="showDeviceName" :title="cameraName">{{cameraName}}</div><video id="videojs' +
                                                        this.playId[playOrder] + '" style="width:100%;height:100%;"  crossOrigin="anonymous" class="video-js" muted preload="auto"></video><div id="setWindow' + this.playId[playOrder] +
                                                        '" style="position: relative; left:0; top:-100%; width:100%; height:100%;z-index:1; opacity: 0; cursor: pointer;"></div></div>',
                                                    data: function () {
                                                        return {
                                                            activeWin: externalThis.activeWin,
                                                            playOrder: playOrder,
                                                            isPlay: externalThis.isPlay,
                                                            cameraName: urls[index].deviceName
                                                        }
                                                    },
                                                });
                                                let component = new videoJsComponent().$mount();
                                                //对指定videoJs添加项目
                                                document.getElementById('videoJs').appendChild(component.$el);
                                                let _this = this;
                                                let video = videojs("videojs" + this.playId[playOrder], options, function () {
                                                    this.src(_this.videoMediaType === 'HTTP-FLV' ? { src: live, type: 'video/x-flv' } : live);
                                                    this.load();
                                                });

                                                video.on('canplay', () => {
                                                    this.isVideoLoadCompleted4Lives[playOrder] = true;
                                                    this.isVideoLoadCompleted4Lives = JSON.parse(JSON.stringify(this.isVideoLoadCompleted4Lives));
                                                })

                                                video.on('pause', () => {
                                                    video.play();
                                                });
                                                video.on('progress', function () {
                                                    let len = this.buffered().length;
                                                    let buftime = this.buffered().end(len - 1) - this.currentTime();
                                                    if (buftime >= 0.5) {
                                                        this.currentTime(this.buffered().end(len - 1));
                                                    }
                                                })

                                                this.videoJsLiveElems.splice(playOrder, 0, video);
                                                if (live) {
                                                    this.isPlay[playOrder] = !!live;
                                                    this.isNativePause = false;
                                                    this.isPlay = JSON.parse(JSON.stringify(this.isPlay));
                                                }
                                            }
                                            let setWindowId = "setWindow" + this.playId[playOrder];
                                            $(document).on('click', '#' + setWindowId, { code: codes[index] }, this.setWindow);
                                            if (this.activeWin !== playOrder) {
                                                $('#' + setWindowId).css('display', '');
                                                $("#" + this.playId[playOrder]).attr('class', this.iframeDiv + '');
                                            } else {
                                                $("#" + this.playId[playOrder]).attr('class', this.iframeDiv + ' selected');
                                                $('#' + setWindowId).css('display', 'none');
                                            }
                                        } else if (response && response.resMsg) {
                                            let cameraNameorCode = (this.codes[playOrder].name.trim() ? this.codes[playOrder].name.trim() : this.codes[playOrder].code.trim())
                                            if (this.codes[playOrder].name.trim() && cameraNameorCode.length >= 24) cameraNameorCode = cameraNameorCode.substring(0, 20) + "..." + cameraNameorCode.substring(cameraNameorCode.length - 2)
                                            this.$message({
                                                showClose: true,
                                                message: this.lang.camera + cameraNameorCode + " " + this.lang.failedRequestVideo + response.resMsg,
                                                type: 'error'
                                            })
                                            let externalThis = this;
                                            let Component = Vue.extend({
                                                template: '<div id="' + this.playId[playOrder] + '" ><div class="showDeviceName" :title="cameraName">{{cameraName}}</div><iframe class="iframes"  id="dk_iframe' +
                                                    this.playId[playOrder] + '" name="dkIframe"  src="" ></iframe><div id="setWindow' + this.playId[playOrder] + '" style="position: relative; left:0; top:-100%; width:100%; height:100%;z-index:1; opacity: 0; cursor: pointer;"></div></div>',
                                                data: function () {
                                                    return {
                                                        activeWin: externalThis.activeWin,
                                                        playOrder: playOrder,
                                                        cameraName: urls[index].deviceName
                                                    }
                                                },
                                            });
                                            let component = new Component().$mount();
                                            if (this.videoMediaType !== "HTML") {
                                                document.getElementById('videoJs').appendChild(component.$el);
                                                let video = "";
                                                this.videoJsLiveElems.splice(playOrder, 0, video);
                                            } else {
                                                document.getElementById('HTML').appendChild(component.$el);
                                            }
                                            let setControlId = "setControl" + this.playId[playOrder];
                                            $(document).on('click', '#' + setControlId, { code: codes[index] }, this.setWindow);
                                            $(document).on('click', '#' + setControlId, this.nativeControl);
                                            let setWindowId = "setWindow" + this.playId[playOrder];
                                            $(document).on('click', '#' + setWindowId, { code: codes[index] }, this.setWindow);
                                            if (this.activeWin !== playOrder) {
                                                $('#' + setWindowId).css('display', '');
                                                $("#" + this.playId[playOrder]).attr('class', this.iframeDiv + '');
                                            } else {
                                                $("#" + this.playId[playOrder]).attr('class', this.iframeDiv + ' selected');
                                                $('#' + setWindowId).css('display', 'none');
                                            }
                                        }
                                    }, error => {
                                        $("#dk_iframe" + this.playId[playOrder], elem).attr('src', '').attr('src');
                                    });
                                } else {
                                    $("#dk_iframe" + this.playId[playOrder], elem).attr('src', '').attr('src');
                                }
                                var _this = this;
                                IframeOnClick.track(document.getElementById('dk_iframe' + this.playId[playOrder]), () => {
                                    _this.activeWin = playOrder
                                });
                            });
                            this.isPlay = JSON.parse(JSON.stringify(this.isPlay));
                            this.$nextTick(() => {
                                this.changeDivStyle();
                            })
                        })
                    },
                    cancel() {
                        this.isVideoLoadCompleted = false;
                        setTimeout(() => {
                            this.$nextTick(() => {
                                this.codes = [];
                                this.codesBefore = [];
                                this.codesAfter = [];
                                this.codesAdd = [];
                                this.codesDel = [];
                                this.playId = [];
                                this.closeitUrls = [];
                                this.closeitUrls = JSON.parse(JSON.stringify(this.closeitUrls));
                                this.isPlay = [];
                                this.isPlay = JSON.parse(JSON.stringify(this.isPlay));
                                this.isfill = false;
                                this.isshowfill = false;
                            });
                        }, 500);
                        this.rateIndex = 2
                        $("#rate").html(this.rateArray[this.rateIndex] + "X")
                        this.playbackSlider = {
                            played: 0,
                            playedTime: '00:00',
                            totalTime: '00:00',
                        }
                        this.playbackData.cameraCode = '';
                        if (this.videoMediaType != "HTML") {
                            try {
                                if (this.videoJsPlaybackElem) {
                                    this.videoJsPlaybackElem.dispose();
                                }
                                for (elem of this.videoJsLiveElems) {
                                    if (elem && elem.dispose) {
                                        elem.dispose()
                                    }
                                }
                                this.videoJsPlaybackElem = null
                                this.videoJsLiveElems = []
                            }
                            catch (e) {
                            }
                        }
                    },
                    cancelBtn() {
                        if (!this.isVideoLoadCompleted) {
                            return;
                        }
                        this.isVideoLoadCompleted = false;
                        this.isshowfill = false;
                        this.codes = [];
                        this.codesBefore = [];
                        this.codesAfter = [];
                        this.codesAdd = [];
                        this.codesDel = [];
                        this.playId = [];
                        this.closeitUrls = [];
                        this.closeitUrls = JSON.parse(JSON.stringify(this.closeitUrls));
                        this.isPlay = [];
                        this.isPlay = JSON.parse(JSON.stringify(this.isPlay));
                        this.rateIndex = 2
                        $("#rate").html(this.rateArray[this.rateIndex] + "X")
                        this.playbackSlider = {
                            played: 0,
                            playedTime: '00:00',
                            totalTime: '00:00',
                        }
                        if (this.videoMediaType != "HTML") {
                            try {
                                if (this.videoJsPlaybackElem) {
                                    this.videoJsPlaybackElem.dispose();
                                }
                                for (elem of this.videoJsLiveElems) {
                                    if (elem && elem.dispose) {
                                        elem.dispose()
                                    }
                                }
                                this.videoJsPlaybackElem = null
                                this.videoJsLiveElems = []
                            }
                            catch (e) {
                            }
                        }
                    },
                    ok() {
                        if (this.opttype === 'back') {
                            this.$emit('back')
                        } else if (this.optType === 'shears') {
                            this.$emit('shears')
                        }
                    },
                    closePlay() {
                        this.codes = [];
                        this.codesBefore = [];
                        this.codesAfter = [];
                        this.codesAdd = [];
                        this.codesDel = [];
                        this.playId = [];
                        this.closeitUrls = [];
                        this.closeitUrls = JSON.parse(JSON.stringify(this.closeitUrls));
                        this.isPlay = [];
                        this.isPlay = JSON.parse(JSON.stringify(this.isPlay));
                        this.rateIndex = 2;
                        $("#rate").html(this.rateArray[this.rateIndex] + "X")
                        // TODO 隐藏组件
                        thisObj.triggerEvent('stopPlay');
                    },
                    playbackControlPlay() {
                        var params = {
                            "fileId": this.fileId,
                            "action": "play"
                        }
                        this.callConn(this.playbackControlURL, params, "POST", (response) => {
                            if (response && response.resp && response.resp.code == '0') {
                                this.isPlay[this.activeWin] = true;
                                this.isPlay = JSON.parse(JSON.stringify(this.isPlay));
                            } else if (response && response.resMsg) {
                                this.$message({
                                    showClose: true,
                                    message: response.resMsg,
                                    type: 'error'
                                })
                            }
                        });
                    },
                    play() {
                        this.handlePause = false;
                        this.playTrigger = false;
                        this.isPlay[this.activeWin] = true;
                        this.isPlay = JSON.parse(JSON.stringify(this.isPlay));

                        if (this.videoMediaType == "HTML") {
                            let iframeObj = $('#dk_iframe' + this.playId[this.activeWin], elem)[0].contentWindow;
                            iframeObj.postMessage({
                                cmd: "dh_resume",
                                from: "third",
                                value: {}
                            }, this.getIframeUri('#dk_iframe' + this.playId[this.activeWin]));
                        } else {
                            let setControlId = "setControl" + this.playId[this.activeWin];
                            $("#" + setControlId + " img").css('display', 'none');
                            if (this.isLive) {
                                let liveVideoElem = this.videoJsLiveElems[this.activeWin]
                                liveVideoElem.play();
                            } else {
                                this.videoJsPlaybackElem.play();
                            }
                            this.isNativePause = false
                        }
                        thisObj.triggerEvent('startPlay');
                    },
                    pause(param) {
                        //判断是否手动点击暂停
                        if (param && param == "handlePause") {
                            this.handlePause = true;
                        } else {
                            this.handlePause = false;
                        }
                        if (!this.isVideoLoadCompleted) {
                            return;
                        }
                        this.playTrigger = true;
                        this.isPlay[this.activeWin] = false;
                        this.isPlay = JSON.parse(JSON.stringify(this.isPlay));
                        if (this.videoMediaType == "HTML") {
                            let iframeObj = $('#dk_iframe' + this.playId[this.activeWin], elem)[0].contentWindow;
                            iframeObj.postMessage({
                                cmd: "dh_pause",
                                from: "third",
                                value: {}
                            }, this.getIframeUri('#dk_iframe' + this.playId[this.activeWin]));
                        }
                        else {
                            let setControlId = "setControl" + this.playId[this.activeWin];
                            $("#" + setControlId + " img").css('display', '');
                            if (this.isLive) {
                                let liveVideoElem = this.videoJsLiveElems[this.activeWin]
                                liveVideoElem.pause();
                            } else {
                                if (this.videoJsPlaybackElem) this.videoJsPlaybackElem.pause();
                                else return;
                            }
                            this.isNativePause = true
                        }

                        thisObj.triggerEvent('stopPlay')
                    },
                    resume() {
                        if (!this.isVideoLoadCompleted) {
                            return;
                        }
                        this.playTrigger = false;
                        this.isPlay[this.activeWin] = true;
                        this.isPlay = JSON.parse(JSON.stringify(this.isPlay));
                        if (this.videoMediaType == "HTML") {
                            let iframeObj = $('#dk_iframe' + this.playId[this.activeWin], elem)[0].contentWindow;
                            iframeObj.postMessage({
                                cmd: "dh_resume",
                                from: "third",
                                value: {}
                            }, this.getIframeUri('#dk_iframe' + this.playId[this.activeWin]));
                        } else {
                            let setControlId = "setControl" + this.playId[this.activeWin];
                            $("#" + setControlId + " img").css('display', 'none');
                            if (this.isLive) {
                                let liveVideoElem = this.videoJsLiveElems[this.activeWin]
                                liveVideoElem.play();
                            } else {
                                if (this.videoJsPlaybackElem) this.videoJsPlaybackElem.play();
                                else return;
                            }

                            this.isNativePause = false
                        }
                    },
                    pauseEvent() {
                        this.isPlay[this.activeWin] = false;
                        this.isPlay = JSON.parse(JSON.stringify(this.isPlay));
                        let iframeObj = $('#dk_iframe' + this.playId[this.activeWin], elem)[0].contentWindow;
                        iframeObj.postMessage({
                            cmd: "dh_pause",
                            from: "third",
                            value: {}
                        }, this.getIframeUri('#dk_iframe' + this.playId[this.activeWin]));
                        this.isNativePause = true;
                    },
                    flvTimeUpdate() {

                        let videoDuration = this.flvPlaybackData.originEndTime - this.flvPlaybackData.originStartTime;
                        let videoCurrentTime = this.flvPlaybackData.played * 1000 + this.videoJsPlaybackElem.currentTime() * 1000;
                        if (videoCurrentTime > 0 && videoDuration > 0 && videoCurrentTime >= videoDuration) {
                            this.playbackSlider.playedTime = this.formatSeconds(parseInt(videoDuration / 1000));
                            setTimeout(() => {
                                this.flvReplay()
                            }, 200)
                            return
                            // 播放时间超过了总时长时重新播放
                        }
                        this.playbackSlider.played = parseInt(videoCurrentTime / 1000);
                        this.playbackSlider.playedTime = this.formatSeconds(parseInt(videoCurrentTime / 1000));
                        return videoDuration
                    },
                    mp4Replay() {
                        this.videoJsPlaybackElem.pause();
                        this.playbackSlider.played = 0;
                        this.playbackSlider.playedTime = this.formatSeconds(0)
                        this.videoSeeked(0);
                    },
                    mp4TimeUpdate() {
                        let videoCurrentTime = this.videoJsPlaybackElem.currentTime(); // 视频播放当前时间
                        videoCurrentTime = this.playbackData.timeDifference + videoCurrentTime;
                        let videoDuration = 0;
                        if (this.playbackData.originEndTime && this.playbackData.originStartTime) {
                            videoDuration = (this.playbackData.originEndTime - this.playbackData.originStartTime) / 1000;
                        } else {
                            videoDuration = this.videoJsPlaybackElem.duration();
                        }
                        if (videoCurrentTime > 0 && videoDuration > 0 && videoCurrentTime >= videoDuration) {
                            this.flvReplay()
                            return
                        }
                        this.playbackSlider.played = parseInt(videoCurrentTime);
                        this.playbackSlider.playedTime = this.formatSeconds(videoCurrentTime);
                        return videoDuration;
                    },
                    htmlTimeUpdate() {
                        let videoDuration = this.flvPlaybackData.originEndTime - this.flvPlaybackData.originStartTime;
                        let videoCurrentTime = this.flvPlaybackData.played * 1000 + this.videoJsPlaybackElem.currentTime() * 1000;
                        if (videoCurrentTime > 0 && videoDuration > 0 && videoCurrentTime >= videoDuration) {
                            this.playbackSlider.playedTime = this.formatSeconds(parseInt(videoDuration / 1000));
                            setTimeout(() => {
                                this.flvReplay()
                            }, 200)
                            return
                        }
                        this.playbackSlider.played = parseInt(videoCurrentTime / 1000);
                        this.playbackSlider.playedTime = this.formatSeconds(parseInt(videoCurrentTime / 1000));
                        return videoDuration
                    },
                    videoTimeUpdate() {
                        if (this.playbackData.breakTime) {
                            return;
                        }
                        if (this.videoMediaType == "HTTP-FLV") {
                            this.flvTimeUpdate();                  
                            if (this.playbackSlider.played >= this.playbackData.videoTotalTime && !this.isVideoStitch) {
                                this.flvReplay()
                                return;
                            }
                        } else if (this.videoMediaType == "MP4") {
                            this.mp4TimeUpdate();
                            if (!this.isPlayUrl) {
                                if (this.playbackSlider.played >= (this.playbackData.videoTotalTime == 0 ? this.playbackData.totalTime : this.playbackData.videoTotalTime) && !this.isVideoStitch) {
                                    this.mp4Replay();
                                    return;
                                }
                                if (this.videoJsPlaybackElem.currentTime() == this.videoJsPlaybackElem.duration()) {
                                    $("#tempVideo").css("zIndex", "10");
                                    this.$nextTick(() => {
                                        if (this.playbackData.nextVideoUrl) {
                                            this.videoJsPlaybackElem.src(this.playbackData.nextVideoUrl)
                                        }
                                        this.playbackData.timeDifference += this.videoJsPlaybackElem.duration()
                                    })
                                }
                            }
                        } else {
                            this.htmlTimeUpdate()
                        }
                    },
                    prepareNextVideo(isNext, callback) {
                        if (undefined == isNext) {
                            isNext = true;
                        }
                        let timeRange = this.getNextVideoInfo(isNext)
                        if (timeRange.length == 0) {
                            this.playbackData.nextVideoUrl = null;
                            return;
                        }
                        let req = {
                            "async": true,
                            "cameraCode": this.playbackData.cameraCode,
                            "mediaType": this.videoMediaType,
                            "startTime": timeRange[0],
                            "endTime": timeRange[1],
                            "protocolType": 2
                        };
                        this.callConn("/VideoProxy/0.1.0/playback", req, "GET", (response) => {
                            if (response && response.resp && response.resp.code == '0') {
                                this.playbackData.nextVideoUrl = response.data[0].url;
                                if (response.data[0].extension) {
                                    this.fileId = response.data[0].extension.fileId;
                                }
                                if (this.mediaType === "HTTP-FLV" && response.data[0].extension) {
                                    //HTTP-FLV不支持倍速。增加样式
                                    this.fastForward = {
                                        cursor: "not-allowed",
                                        color: "lawngreen"
                                    }
                                }
                                let tempVideo = '<video id="tempVideo" preload="true" src="' + this.playbackData.nextVideoUrl + '" style="position: absolute;width: 100%;height: 100%;top: 0;left: 0;z-index: -1;"></video>'
                                $("#" + this.playId[this.activeWin]).append(tempVideo);
                                if (callback) {
                                    callback(response.data[0].url)
                                }
                            }
                        });
                    },
                    getNextVideoInfo(isNext) {
                        //存储下一段要播放视频的开始结束时间
                        let result = [];

                        //返回时间戳
                        let currentTime = this.getSliderTime()
                        let minute = Math.floor((currentTime + 2000) / 60000);
                        if (isNext) {
                            result[0] = (minute + 1) * 60000
                            result[1] = (minute + 2) * 60000
                        } else {
                            result[0] = minute * 60000
                            result[1] = (minute + 1) * 60000
                        }
                        if (result[0] >= this.playbackData.originEndTime) {
                            return []
                        }
                        return result;
                    },
                    //返回时间戳
                    getSliderTime() {
                        let currentTime = this.playbackSlider.played * 1000 + this.playbackData.originStartTime;
                        return currentTime;
                    },
                    getFlvSliderTime() {
                        let currentTime = this.flvPlaybackData.played * 1000 + parseInt(this.flvPlaybackData.originStartTime);
                        return currentTime;
                    },
                    stop() {
                        if (!this.isVideoLoadCompleted4Lives[this.activeWin]) return;
                        if (!this.ptzControlActionFlag) {
                            return;
                        }
                        this.ptzControlActionFlag = false;
                        //当对接登虹时，调用sdk云台控制
                        if (this.iscontrolPTZByTranscode === 'HTML' && (this.iscontrolPTZByTranscode == 1)) {
                            let iframeObj = $('#dk_iframe' + this.playId[this.activeWin], elem)[0].contentWindow;
                            iframeObj.postMessage({
                                cmd: 'dh_gb_ptz',
                                from: 'third',
                                data: {
                                    value: 0
                                }
                            }, this.getIframeUri('#dk_iframe' + this.playId[this.activeWin]));
                            return;
                        }
                        let cameraCode = this.closeitUrls[this.activeWin].code.trim()
                        //调接口(基本信息)
                        let req = {
                            "async": true,
                            "cameraCode": cameraCode,
                            "controlCode": 'PTZ_STOP',
                            "controlParam1": "",
                            "controlParam2": ""
                        };

                        this.callConn(this.ptzControl, req, "POST", (res) => {
                            if (res && res.resMsg) {
                                if (this.isShowPTZStopFailedMessage) {
                                    this.$message({ showClose: true, message: res.resMsg, type: 'error' });
                                }
                            }
                        });
                    },
                    cut() {
                        if (!this.isVideoLoadCompleted) {
                            return;
                        }
                        if (this.videoMediaType != "HTML") {
                            if (this.isLive) {
                                if (!this.isVideoLoadCompleted4Lives[this.activeWin]) return;
                                if (this.liveVideoMediaType == 'MP4' || this.liveVideoMediaType == 'HLS' || this.liveVideoMediaType == 'HTTP-FLV') {
                                    this.nativeCapture();
                                } else {
                                    this.getLiveShortcut();
                                }
                            } else {
                                if (this.playBackVideoMediaType == 'MP4' || this.playBackVideoMediaType == 'HLS' || this.playBackVideoMediaType == 'HTTP-FLV') {
                                    this.nativeCapture();
                                } else {
                                    this.getBackShortcut();
                                }
                            }
                        } else {
                            let iframeObj = $('#dk_iframe' + this.playId[this.activeWin], elem)[0].contentWindow;

                            iframeObj.postMessage({
                                cmd: "dh_screen_shot",
                                from: "third",
                                value: {}
                            },
                                this.getIframeUri('#dk_iframe' + this.playId[this.activeWin]))
                        }
                    },
                    back() {
                    },
                    shears() {
                    },
                    refresh() {
                    },
                    playbackRate(value) {
                        if (!this.isVideoLoadCompleted) {
                            return;
                        }
                        if (value === 1) {
                            if ((this.videoMediaType === "HTTP-FLV") && (this.rateIndex <= 2)) {
                                this.fastForward = {}
                            }
                        }
                        if (value === 0) {
                            if ((this.videoMediaType === "HTTP-FLV") && (this.rateIndex >= 1)) {
                                this.fastForward = { cursor: "not-allowed" }
                            }
                        }
                        if (this.videoMediaType != "HTML") {
                            if (this.videoJsPlaybackElem) {
                                if (value === 1) {
                                    this.rateIndex === 0 ? 0 : this.rateIndex--;
                                } else {
                                    if (this.playBackVideoMediaType === "HTTP-FLV" && (this.rateIndex >= 2)) { return; }
                                    this.rateIndex === this.rateArray.length - 1 ? this.rateArray.length - 1 : this.rateIndex++;
                                }
                                this.videoJsPlaybackElem.playbackRate(this.rateArray[this.rateIndex]);
                                $("#rate").html(this.rateArray[this.rateIndex] + "X");
                            }
                        } else {
                            if ($('#dk_iframe' + this.playId[this.activeWin], elem)[0] && $('#dk_iframe' + this.playId[this.activeWin], elem)[0].contentWindow) {
                                let iframeObj = $('#dk_iframe' + this.playId[this.activeWin], elem)[0].contentWindow;
                                if (value === 1) {
                                    this.rateIndex === 0 ? 0 : this.rateIndex--;
                                } else {
                                    this.rateIndex === this.rateArray.length - 1 ? this.rateArray.length - 1 : this.rateIndex++;
                                }
                                $("#rate").html(this.rateArray[this.rateIndex] + "X");
                                /*可设置rate值为：0.25，0.5，1，2*/
                                iframeObj.postMessage({
                                    cmd: "dh_gb_playback_rate",
                                    from: "third",
                                    data: {
                                        value: this.rateArray[this.rateIndex]
                                    }
                                }, this.getIframeUri('#dk_iframe' + this.playId[this.activeWin]));
                            }
                        }
                    },
                    clickPlay() {
                    },
                    isPtzDisabled() {
                        return !(this.closeitUrls.length && this.closeitUrls[this.activeWin] && this.closeitUrls[this.activeWin].type == 2)
                    },
                    selectItem(value) {
                        if (this.isPtzDisabled() && [0, 1, 2, 3, 4].indexOf(value) != -1) {
                            return;
                        }
                        if (!this.isVideoLoadCompleted4Lives[this.activeWin]) return;
                        this.ptzControlActionFlag = true;
                        //当对接登虹时，调用sdk云台控制
                        if (this.videoMediaType === 'HTML' && (this.iscontrolPTZByTranscode == 1)) {
                            let iframeObj = $('#dk_iframe' + this.playId[this.activeWin], elem)[0].contentWindow;
                            iframeObj.postMessage({
                                cmd: 'dh_gb_ptz',
                                from: 'third',
                                data: {
                                    value: value
                                }
                            }, this.getIframeUri('#dk_iframe' + this.playId[this.activeWin]));
                            return;
                        }
                        let controlCode = ""
                        switch (value) {
                            case 0:
                                controlCode = "PTZ_STOP"
                                break;
                            case 1:
                                controlCode = "PTZ_UP"
                                break;
                            case 2:
                                controlCode = "PTZ_DOWN"
                                break;
                            case 3:
                                controlCode = "PTZ_LEFT"
                                break;
                            case 4:
                                controlCode = "PTZ_RIGHT"
                                break;
                            case 5:
                                controlCode = "PTZ_UP_LEFT"
                                break;
                            case 6:
                                controlCode = "PTZ_DOWN_LEFT"
                                break;
                            case 7:
                                controlCode = "PTZ_UP_RIGHT"
                                break;
                            case 8:
                                controlCode = "PTZ_DOWN_RIGHT"
                                break;
                        }

                        let cameraCode = this.closeitUrls[this.activeWin].code.trim()
                        //调接口(基本信息)
                        let req = {
                            "async": true,
                            "cameraCode": cameraCode,
                            "controlCode": controlCode,
                            "controlParam1": "2",
                            "controlParam2": "2"
                        };
                        if (controlCode == "PTZ_STOP") {
                            req.controlParam1 = ""
                            req.controlParam2 = ""
                        }

                        this.callConn(this.ptzControl, req, "POST", (res) => {


                            if (res && res.resp && res.resp.code == '0') {
                                this.isShowPTZStopFailedMessage = true;
                            }
                            else if (res && res.resMsg) {
                                this.isShowPTZStopFailedMessage = false
                                this.$message({ showClose: true, message: res.resMsg, type: 'error' });
                            }
                        });
                    },
                    showTips() {
                        this.isShowTips = 1
                    },
                    hideTips() {
                        this.isShowTips = 0
                    },
                    zoomIn() {
                        if (!this.isVideoLoadCompleted4Lives[this.activeWin]) return;

                        //当对接登虹时，调用sdk云台控制
                        if (this.videoMediaType === 'HTML' && (this.iscontrolPTZByTranscode == 1)) {
                            let iframeObj = $('#dk_iframe' + this.playId[this.activeWin], elem)[0].contentWindow;
                            iframeObj.postMessage({
                                cmd: 'dh_gb_ptz',
                                from: 'third',
                                data: {
                                    value: 10
                                }
                            }, this.getIframeUri('#dk_iframe' + this.playId[this.activeWin]));
                            return;
                        }
                        this.zoom("PTZ_LENS_ZOOM_IN")
                        this.ptzControlActionFlag = true;
                    },
                    zoomOut() {
                        if (!this.isVideoLoadCompleted4Lives[this.activeWin]) return;

                        //当对接登虹时，调用sdk云台控制
                        if (this.videoMediaType === 'HTML' && (this.iscontrolPTZByTranscode == 1)) {
                            let iframeObj = $('#dk_iframe' + this.playId[this.activeWin], elem)[0].contentWindow;
                            iframeObj.postMessage({
                                cmd: 'dh_gb_ptz',
                                from: 'third',
                                data: {
                                    value: 9
                                }
                            }, this.getIframeUri('#dk_iframe' + this.playId[this.activeWin]));
                            return;
                        }
                        this.zoom("PTZ_LENS_ZOOM_OUT")
                        this.ptzControlActionFlag = true;
                    },
                    zoom(controlCode) {

                        let cameraCode = this.closeitUrls[this.activeWin].code.trim()
                        //调接口(基本信息)
                        let req = {
                            "async": true,
                            "cameraCode": cameraCode,
                            "controlCode": controlCode,
                            "controlParam1": "2",
                            "controlParam2": "1"
                        };

                        this.callConn(this.ptzControl, req, "POST", (res) => {

                             if (res && res.resp && res.resp.code == '0') {
                                if (res.data[0].resMsg && res.data[0].resMsg.resCode != "0") {
                                    return;
                                } else {
                                    this.isShowPTZStopFailedMessage = true;
                                }
                            }
                            else if (res && res.resMsg) {
                                this.isShowPTZStopFailedMessage = false;
                                this.$message({ showClose: true, message: res.resMsg, type: 'error' });
                            }
                        });

                    },
                    liveMode() {
                        this.isVideoLoadCompleted = false;
                        if (this.isLive) {
                            return;
                        }
                        //初始化参数
                        this.playbackActionFlag = false;
                        this.liveClass = 'select'
                        this.replayClass = ''
                        this.isLive = true
                        thisObj.triggerEvent('switch', { isLive: true });
                        if (this.videoJsPlaybackElem) {
                            this.videoJsPlaybackElem.dispose();
                            this.videoJsPlaybackElem = null;
                        }
                        // 调用摄像头树组件方法
                        this.cancel()
                    },
                    replayMode() {
                        //画面加载状态改为false
                        this.isVideoLoadCompleted = false;
                        if (!this.isLive) {
                            return;
                        }
                        //初始化参数
                        this.liveClass = ''
                        this.replayClass = 'select'
                        this.isLive = false
                        this.cancel()
                        this.iframeDiv = 'iframe1'
                        // 调用摄像头树组件方法
                        thisObj.triggerEvent('switch', { isLive: false });
                        for (elem of this.videoJsLiveElems) {
                            if (elem && elem.dispose) {
                                elem.dispose();
                                elem = null;
                            }
                        }
                    },
                    playback() {
                        //防止连续点击回放按钮
                        if (this.playbackActionFlag) {
                            return;
                        }
                        //清空后报错提示
                        if (this.playbackParamOrigin === null) {
                            this.$message({ showClose: true, message: this.lang.errorSelectDateForPlayback, type: 'error' });
                            return;
                        }
                        let startTime = new Date(this.playbackParamOrigin[0]).getTime()
                        let endTime = new Date(this.playbackParamOrigin[1]).getTime()
                        //重置时间报错
                        if (!startTime || !endTime) {
                            this.$message({ showClose: true, message: this.lang.errorSelectDateForPlayback, type: 'error' });
                            return;
                        }
                        if (startTime >= endTime) {
                            this.$message({ showClose: true, message: this.lang.errorStarttimeEndtime, type: 'error' });
                            return;
                        }
                        let cameraCode = this.playbackData.cameraCode.trim();
                        if (!cameraCode) {
                            this.$message({ showClose: true, message: this.lang.selectCameraForPlayback, type: 'error' });
                            return;
                        }
                        this.cancel()
                        this.playbackData.cameraCode = cameraCode;

                        let now = new Date().getTime();
                        let timeDiff = now - endTime
                        if (timeDiff < 0) {
                            this.$message({ showClose: true, message: this.lang.endTimeLessThanCurTime, type: 'error' });
                            return;
                        }
                        if (timeDiff < 120000 && timeDiff >= 0) {
                            this.$message({ showClose: true, message: this.lang.endTimeCompCurTime, type: 'error' });
                            return;
                        }
                        if ((endTime - startTime) / 1000 > 3600 * 12 && this.playBackVideoMediaType == "HTML") {
                            // 登虹HTML
                            this.$message({ showClose: true, message: this.lang.errorVideoDuration, type: 'error' });
                            return;
                        }
                        if ((endTime - startTime) / 1000 > 3600 * 24 && (this.playBackVideoMediaType == "MP4" || this.playBackVideoMediaType == "HTTP-FLV")) {
                            // 奥看MP4和HTTP-FLV
                            this.$message({ showClose: true, message: this.lang.errorVideoDuration1, type: 'error' });
                            return;
                        }
                        this.playbackSlider.totalTime = this.formatSeconds((endTime - startTime) / 1000)
                        //防止连续点击回放按钮
                        this.playbackActionFlag = true;
                        this.flvPlaybackData.originStartTime = startTime;
                        this.flvPlaybackData.originEndTime = endTime;
                        this.flvPlaybackData.played = 0;
                        this.flvPlaybackData.flvFisrtPlayFlag = 0;
                        this.playbackSlider = {
                            played: 0,
                            playedTime: '00:00',
                            totalTime: this.formatSeconds((endTime - startTime) / 1000)
                        }
                        if (this.playBackVideoMediaType == "HTTP-FLV") {
                            endTime += 3000;
                        }
                        //处理回放操作
                        this.startPlayBack(this.playbackData.cameraCode.trim(), this.playbackData.cameraName.trim(), startTime, endTime)
                    },
                    resetPlaybackParam() {
                        //重置页面上的输入信息
                        this.playbackParamOrigin = { date: '', startTime: '', endTime: '' }
                        this.playbackActionFlag = false
                    },
                    playattime() {
                        let iframeObj = $('#dk_iframe' + this.playId[this.activeWin], elem)[0].contentWindow;
                        iframeObj.postMessage({
                            cmd: "dh_play_at_time",
                            from: "third",
                            data: {
                                startTime: this.playbackData.startTime,
                                endTime: this.playbackData.endTime
                            }
                        }, this.getIframeUri('#dk_iframe' + this.playId[this.activeWin]));
                        this.isPlayAtTime = true;
                    },
                    replay() {
                        this.isPlay[0] = true;
                        this.isNativePause = false;
                        let startTime = new Date(this.playbackParamOrigin[0]).getTime()
                        let endTime = new Date(this.playbackParamOrigin[1]).getTime()
                        this.playbackSlider.totalTime = this.formatSeconds((endTime - startTime) / 1000)
                        this.startPlayBack(this.playbackData.cameraCode.trim(), this.playbackData.cameraName.trim(), this.playbackData.startTime, this.playbackData.endTime)
                    },
                    updatePlayTime(date) {
                        if (this.isPlay[0]) {
                            let time = date.getTime()
                            if (time <= (this.playbackData.endTime + 999) && time >= this.playbackData.originStartTime) {
                                this.playbackSlider.played = parseInt((time - this.playbackData.originStartTime) / 1000)
                                this.playbackSlider.playedTime = this.formatSeconds((time - this.playbackData.originStartTime) / 1000)
                                this.playbackData.startTime = time //更新开始时间                                
                            }
                            this.isCloseliVideoEnded = this.playbackSlider.played >= (this.flvPlaybackData.originEndTime - this.flvPlaybackData.originStartTime) / 1000 ? true : false;

                        }
                    },
                    updatePlayTimeMs(date) {
                        if (this.isPlay[0]) {
                            let time = date;
                            if (time <= (this.playbackData.endTime + 999) && time >= this.playbackData.originStartTime) {
                                this.playbackSlider.played = parseInt((time - this.playbackData.originStartTime) / 1000)
                                this.playbackSlider.playedTime = this.formatSeconds((time - this.playbackData.originStartTime) / 1000)
                                this.playbackData.startTime = time //更新开始时间                               
                            }
                            this.isCloseliVideoEnded = this.playbackSlider.played >= (this.flvPlaybackData.originEndTime - this.flvPlaybackData.originStartTime) / 1000 ? true : false;
                        }
                    },
                    flvReplay() {
                        this.playbackSlider.playedTime = this.formatSeconds(0)
                        this.playbackSlider.played = 0;
                        this.flvPlaybackData.played = 0;
                        this.flvPlaybackData.isFlvVideoSeeked = false;
                        this.startPlayBack(this.playbackData.cameraCode, this.playbackData.cameraName, this.flvPlaybackData.originStartTime, this.flvPlaybackData.originEndTime);
                    },

                    flvSeeked(e) {
                        let _this = this
                        setTimeout(function () {
                            _this.isSliderDragDisable = false
                            _this.$forceUpdate()

                        }, 3000)
                        this.videoJsPlaybackElem.pause()
                        let videoSpeed = e;
                        let videoCurrentTime = videoSpeed;
                        this.playbackSlider.played = e;
                        this.flvPlaybackData.played = e;
                        this.flvPlaybackData.siderTimeAfterSeek = this.getFlvSliderTime();
                        this.playbackSlider.playedTime = this.formatSeconds(parseInt(videoCurrentTime));
                        this.$nextTick(() => {
                            let _startTime = this.flvPlaybackData.siderTimeAfterSeek;
                            this.flvPlaybackData.isFlvVideoSeeked = true;
                            this.startPlayBack(this.playbackData.cameraCode, this.playbackData.cameraName, _startTime.toString(), this.flvPlaybackData.originEndTime);

                        })

                    },
                    htmlSeeked(e) {
                        this.pause();;
                        let videoSpeed = e;
                        let videoCurrentTime = videoSpeed;
                        this.playbackSlider.played = e;
                        this.flvPlaybackData.played = e;
                        this.flvPlaybackData.siderTimeAfterSeek = this.getFlvSliderTime();
                        this.playbackSlider.playedTime = this.formatSeconds(parseInt(videoCurrentTime));
                        this.flvPlaybackData.siderTimeAfterSeek = this.getFlvSliderTime();
                        let _startTime = this.flvPlaybackData.siderTimeAfterSeek;
                        this.playbackData.startTime = _startTime
                        this.playbackData.startTime = this.playbackData.startTime.toString();
                        this.playattime()
                    },
                    videoSeeked(e) {
                        this.isSliderDragDisable = true;
                        // HTML
                        if (this.videoMediaType == "HTML") {
                            this.htmlSeeked(e);
                        }// MP4
                        else {
                            if (this.videoMediaType == "MP4") {
                                this.videoJsPlaybackElem.pause();
                                $("#tempVideo").remove();
                                //时间戳
                                let currentSliderTime = this.getSliderTime();
                                let videoSpeed = e;
                                let videoCurrentTime = videoSpeed;
                                this.playbackSlider.played = e;
                                this.flvPlaybackData.played = e;
                                this.flvPlaybackData.siderTimeAfterSeek = this.getFlvSliderTime();
                                this.playbackSlider.playedTime = this.formatSeconds(parseInt(videoCurrentTime));
                                //从此处开始播放
                                this.playbackData.breakTime = (currentSliderTime / 1000) % 60
                                //进度条已走过的时间
                                this.playbackData.timeDifference = (currentSliderTime - this.playbackData.originStartTime) / 1000 - this.playbackData.breakTime
                                this.prepareNextVideo(false, (url) => {
                                    this.videoJsPlaybackElem.src(url);
                                    this.$nextTick(() => {
                                        this.videoJsPlaybackElem.play();
                                    })
                                });
                                // HTTP-FLV
                            } else if (this.videoMediaType == "HTTP-FLV") {
                                this.flvSeeked(e);
                            } else {
                                this.pause()
                                let videoEment = this.videoJsPlaybackElem
                                let videoDuration = videoEment.duration();
                                let videoSpeed = e / 100;
                                let videoCurrentTime = videoSpeed * videoDuration;
                                videoEment.currentTime(videoCurrentTime);
                                this.playbackSlider.playedTime = this.formatSeconds(videoCurrentTime);
                                this.play()
                            }
                        }
                    },
                    formatSeconds(value) {
                        let theTime = parseInt(value);
                        let middle = 0;
                        let hour = 0;
                        if (theTime >= 60) {
                            middle = parseInt(theTime / 60);
                            theTime = parseInt(theTime % 60);
                            if (middle >= 60) {
                                hour = parseInt(middle / 60);
                                middle = parseInt(middle % 60);
                            }
                        }
                        let result = theTime.toFixed(0).padStart(2, "0");
                        if (middle > 0) {
                            result = middle.toFixed(0).padStart(2, "0") + ":" + result;
                        } else {
                            result = "00:" + result
                        }
                        if (hour > 0) {
                            result = hour.toFixed(0).padStart(2, "0") + ":" + result;
                        }
                        return result;
                    },
                    formatSecond(time) {
                        let timeArray = time.split(":");
                        var timeSecond = 0;
                        var len = timeArray.length
                        for (var i = 0; i < len; i++) {
                            var base = 1;
                            for (var j = 0; j < i; j++) {
                                base = base * 60
                            } timeSecond += parseInt(timeArray[len - i - 1]) * base
                        }
                        return timeSecond
                    },
                    onPlay() {
                        let video = this.$refs.videoPlayer
                        video.controls = false
                        this.showVideoViewer.totalTime = this.formatSeconds(video.duration)
                    },
                    formatTooltip(val) {
                        val = this.formatSeconds(val);
                        return val;
                    },
                    getVideoServiceName() {
                        this.$nextTick(() => {
                            this.callConn(this.getVideoProxyConfig, {}, 'GET', response => {
                                if (response && response.resp && response.resp.code == '0') {
                                    this.liveVideoMediaType = response.data[0].liveMediatype;
                                    this.playBackVideoMediaType = response.data[0].playbackMediaType;
                                    this.iscontrolPTZByTranscode = response.data[0].controlPTZ;
                                    this.transcodeServiceName = response.data[0].transcodeServiceName;
                                    this.sslCertificate = response.data[0].sslCertificate;
                                } else if (response && response.resMsg) {
                                    this.$message({ showClose: true, message: response.resMsg, type: 'error' });
                                }
                            })
                        })
                    },
                    getAllcamLivePort() {
                        this.$nextTick(() => {
                            this.callConn(this.getAllcamPlayConfig, {}, 'GET', response => {
                                if (response && response.resp && response.resp.code == '0') {
                                    this.allcamPort = response.data[0].allcamPort
                                }
                            })
                        })
                    },
                    // AllCam截图
                    getLiveShortcut() {
                        let cameraCode = this.closeitUrls[this.activeWin].code.trim()
                        var params = {
                            "cameraCode": cameraCode,
                            "mediaType": this.videoMediaType,
                            "protocolType": 2
                        }
                        this.callConn("/VideoProxy/0.1.0/live/shot", params, "POST", (response) => {
                            if (response && response.resp && response.resp.code == '0') {
                                this.getShortCutByImgUrl(response.data[0].url);
                            } else if (response && response.resMsg) {
                                this.$message({ showClose: true, message: this.lang.screenshotFail + response.resMsg, type: 'error' });
                            }
                        });
                    },
                    nativeCapture() {
                        let canvas = document.createElement('canvas'),
                            ctx = canvas.getContext('2d'),
                            video = $('video[id^="videojs' + this.playId[this.activeWin] + '"]');
                        if (video && video.length) {
                            video = video[0]
                        } else {
                            return;
                        }
                        canvas.width = video.videoWidth
                        canvas.height = video.videoHeight
                        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
                        let image = canvas.toDataURL('image/png')
                        function dataURIToBlob(dataURI, callback) {
                            var binStr = atob(dataURI.split(',')[1]),
                                len = binStr.length,
                                arr = new Uint8Array(len);
                            for (var i = 0; i < len; i++) {
                                arr[i] = binStr.charCodeAt(i);
                            }
                            callback(new Blob([arr]));
                        }
                        var callback = function (blob) {
                            var a = document.createElement('a');
                            a.download = 'ScreenShot-' + new Date().getTime() + '.png';
                            a.href = URL.createObjectURL(blob);
                            a.click()
                        }
                        dataURIToBlob(image, callback);
                    },
                    getBackShortcut() {
                        let newStartTime = this.playbackData.originStartTime + parseInt(this.videoJsPlaybackElem.currentTime()) * 1000; // 视频播放当前时间
                        var params = {
                            "snapshotTime": newStartTime,
                            "cameraCode": this.playbackData.cameraCode.trim(),
                        }				
                        this.callConn("/VideoProxy/0.1.0/playback/shot", params, "POST", (response) => {
                            if (response && response.resp && response.resp.code == '0') {
                                this.getShortCutByImgUrl(response.data[0].url);
                            } else if (response && response.resMsg) {
                                this.$message({ showClose: true, message: this.lang.screenshotFail + response.resMsg, type: 'error' });
                            }
                        });
                    },
                    getShortCutByImgUrl(url) {
                        let src = url;
                        var canvas = document.createElement('canvas');
                        var img = document.createElement('img');
                        img.onload = (e) => {
                            canvas.width = img.width;
                            canvas.height = img.height;
                            var context = canvas.getContext('2d');
                            context.drawImage(img, 0, 0, img.width, img.height);
                            canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);
                            canvas.toBlob((blob) => {
                                let link = document.createElement('a');
                                link.href = window.URL.createObjectURL(blob);
                                let fileName = new Date().getTime()
                                link.download = fileName;
                                link.click();
                                let tipInfo = {
                                    "type": "1",
                                    "message": this.lang.screenshotName + fileName + ".jpg"
                                }
                                this.$emit("tip-showed", tipInfo);

                            }, "image/jpeg");
                        }
                        img.setAttribute("crossOrigin", 'Anonymous');
                        img.src = src;
                    },
                    isCameraCodeSame(cameraCodes) {
                        for (let i = 0; i < cameraCodes.length; i++) {
                            for (let j = i + 1; j < cameraCodes.length; j++) {
                                if (cameraCodes[i] == cameraCodes[j]) {
                                    this.hasSameCameraCode = true
                                    return true;
                                }
                            }
                        }
                        this.hasSameCameraCode = false
                        return false;
                    },
                    handleDiffCameraCode() {
                        let resObj = {
                            add: [],
                            del: []
                        },
                            cenObj = {};
                        //把beforeArr数组去重放入cenObj
                        for (let i = 0; i < this.codesBefore.length; i++) {
                            cenObj[this.codesBefore[i]] = this.codesBefore[i];
                        }
                        //遍历afterArr，查看其元素是否在cenObj中
                        for (let j = 0; j < this.codesAfter.length; j++) {
                            if (!cenObj[this.codesAfter[j]]) {
                                resObj.add.push(this.codesAfter[j]);
                            } else {
                                this.codes.push(cenObj[this.codesAfter[j]]);
                                delete cenObj[this.codesAfter[j]]
                            }
                        }
                        for (let key in cenObj) {
                            resObj.del.push(key);
                        }
                        this.codesDel = resObj.del;
                        this.codesAdd = resObj.add;
                        // 得到现在的codes
                        this.codes = this.codes.concat(resObj.add);
                    },
                    handleSameCameraCode(codes) {
                        let k = 0, temp = [];
                        this.cameraAdd = [];
                        this.cameraDel = [];
                        let resObj = {
                            add: [],
                            del: []
                        };
                        //减少情况
                        if (this.codesBefore.length > this.codesAfter.length) {
                            for (let i = 0; i < this.codesBefore.length - k; i++) {
                                if (i >= this.codesAfter.length) {
                                    for (let j = i + k; j < this.codesBefore.length; j++) {
                                        temp[k++] = this.codesBefore[j];
                                        this.cameraDel.push(this.codesDetailsBefore[j]);
                                    }
                                    break;
                                }
                                if ((this.codesBefore[i + k] !== this.codesAfter[i]) || (this.codesDetailsBefore[i + k].name !== codes[i].name)) {
                                    temp[k] = this.codesBefore[i + k];
                                    this.cameraDel.push(this.codesDetailsBefore[i + k]);
                                    k++;
                                    i--;
                                }
                            }
                            resObj.del = temp;
                        } else if (this.codesBefore.length < this.codesAfter.length) {//增加情况
                            for (let i = 0; i < this.codesAfter.length - k; i++) {
                                if (i >= this.codesBefore.length) {
                                    for (let j = i + k; j < this.codesAfter.length; j++) {
                                        temp[k++] = this.codesAfter[j];
                                        this.cameraAdd.push(codes[j])
                                    }
                                    break;
                                }
                                if (this.codesAfter[i + k] !== this.codesBefore[i]) {
                                    temp[k] = this.codesAfter[i + k];
                                    this.cameraAdd.push(codes[i + k])
                                    k++;
                                    i--;
                                }
                            }
                            resObj.add = temp;
                        } else {
                            if (this.codesBefore.length == 9) {
                                resObj.del[0] = this.codesBefore[0];
                                resObj.add[0] = this.codesAfter[8];
                                this.cameraAdd.push(codes[8])
                                this.cameraDel.push(this.codesDetailsBefore[0])
                            }
                        }
                        this.codesDel = resObj.del;
                        this.codesAdd = resObj.add;
                        this.codes = this.codesAfter;
                    },
                    setWindow(event) {
                        let code = event.data.code;
                        this.activeWin = this.codesBefore.indexOf(code);
                        for (let i = 0; i < this.codesBefore.length; i++) {
                            let setWindowId = "setWindow" + this.playId[i];
                            if (this.activeWin !== i) {
                                $('#' + setWindowId).css('display', '');
                                $("#" + this.playId[i]).attr('class', this.iframeDiv + '');
                            } else {
                                $("#" + this.playId[i]).attr('class', this.iframeDiv + ' selected');
                                $('#' + setWindowId).css('display', 'none');
                            }
                        }
                    },
                    getIframeUri(id) {
                        let iframe = $(id)
                        if (iframe && iframe.attr("src")) {
                            let src = iframe.attr("src");
                            let url = new URL(src);
                            return url.protocol + "//" + url.host
                        }
                        return window.location.protocol + "//" + window.location.host
                    },
                    getCookie(trustAllcam) {
                        let arr, reg = new RegExp("(^| )" + trustAllcam + "=([^;]*)(;|$)");
                        if (arr = document.cookie.match(reg))
                            return unescape(arr[2]);
                        else
                            return null;
                    },
                    setCookie(name, value) {
                        let Days = 300;
                        let exp = new Date();
                        exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
                        document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString();
                    },
                    getLocalStorage(name) {
                        if (window.localStorage) {
                            let storage = window.localStorage;
                            return storage.getItem(name)
                        } else {
                            return this.getCookie(name);
                        }
                    },
                    setLocalStorage(name, value) {
                        if (window.localStorage) {
                            let storage = window.localStorage;
                            storage.setItem(name, value)
                        } else {
                            this.setCookie(name, value);
                        }
                    },
                    getQueryValue(queryName) {
                        //location.search是从当前URL的?号开始的字符串,substring(1)就是从索引1开始截取,split("#")[0]取#前的第一个
                        var query = decodeURI(top.location.search.substring(1)).split("#")[0];
                        var vars = query.split("&");

                        return vars[0].split("?");
                    },
                    getAllcamIP(url) {
                        if ((this.liveMediaType !== "HTML" || this.playbackMediaType !== "HTML")) {
                            let ipAddress = url.match(/(\d{1,3}\.){3}\d{1,3}/g);
                            return ipAddress[0];
                        }
                        return null;
                    },
                    jumpToAuthentication(url) {
                        //如果存在CA证书,不进行页面跳转操作。return
                        return true;
                        if (this.sslCertificate === "true") return;
                        if (this.transcodeServiceName.toUpperCase() !== "ALLCAM") return;
                        let ipAddress = this.getAllcamIP(url);
                        let allcamSave = this.getLocalStorage('allcam');
                        //判断是否信任过，如果LocalStorage里面allcam对应的value[]包含ip信息，则不跳转
                        if (allcamSave) {
                            let allcamcheck = allcamSave.split(",")
                            for (var i = 0; i < allcamcheck.length; i++) {
                                if (allcamcheck[i].indexOf(this.ipToint(ipAddress)) != -1) return;
                            }
                        }
                        if (!allcamSave || allcamSave.indexOf(ipAddress) == -1) {
                            if (ipAddress) {
                                let jumpURL = top.location.href;

                                top.location.href = "https://" + ipAddress + ":8082/httpsflv2.html?jumpurl=" + encodeURIComponent(jumpURL) + "?" + this.ipToint(ipAddress);
                            }
                        }
                    },
                    switchfill() {

                        if (this.isVideoLoadCompleted) {
                            this.isfill = !this.isfill
                            if (this.isfill) {
                                this.objectfit = "fill"
                                let video = $('video[id^="videojs' + this.playId[this.activeWin] + '"]');
                                var videoDiv = document.getElementById(video[0].id);
                                videoDiv.setAttribute("style", "object-fit:" + this.objectfit);
                            } else {
                                this.objectfit = "contain"
                                let video = $('video[id^="videojs' + this.playId[this.activeWin] + '"]');
                                var videoDiv1 = document.getElementById(video[0].id);
                                videoDiv1.setAttribute("style", "object-fit:" + this.objectfit);
                            }
                        }

                    },
                    ipToint(ip) {
                        var num = 0;
                        ip = ip.split(".");
                        num = Number(ip[0]) * 256 * 256 * 256 + Number(ip[1]) * 256 * 256 + Number(ip[2]) * 256 + Number(ip[3]);
                        num = num >>> 0;
                        return num;
                    },
                    changeTimeRange() {
                        let pickedDate = new Date(this.playbackParamOrigin.date).getTime();
                        let now = new Date();
                        if (now.getTime() - pickedDate < 24 * 60 * 60 * 1000) {
                            let maxTime = now.getHours().toString().padStart(2, "0") + ":" + now.getMinutes().toString().padStart(2, "0") + ":" + now.getSeconds().toString().padStart(2, "0");
                            this.pickerOptions.selectableRange = '00:00:00 - ' + maxTime;
                        } else {
                            this.pickerOptions.selectableRange = '00:00:00 - 23:59:59';
                        }
                        return
                    }


                }
            })
        }
        thisObj.sksBindItemEvent();
        $(window).resize(function () {
            thisObj.sksRefreshEvents();
        });
    },
    downloadFile: function (content, fileName) { //下载base64图片
        var base64ToBlob = function (code) {
            let parts = code.split(';base64,');
            let contentType = parts[0].split(':')[1];
            let raw = window.atob(parts[1]);
            let rawLength = raw.length;
            let uInt8Array = new Uint8Array(rawLength);
            for (let i = 0; i < rawLength; ++i) {
                uInt8Array[i] = raw.charCodeAt(i);
            }
            return new Blob([uInt8Array], {
                type: contentType
            });
        };
        let aLink = document.createElement('a');
        let blob = base64ToBlob(content);
        let evt = document.createEvent("HTMLEvents");
        evt.initEvent("click", true, true); //initEvent 不加后两个参数在FF下会报错  事件类型，是否冒泡，是否阻止浏览器的默认行为
        aLink.download = fileName;
        aLink.href = URL.createObjectURL(blob);
        aLink.click();
    },
    startLive(data) {
        if (data && data.eventParam) {
            this.vm.startLive(data.eventParam.cameraCodes, data.eventParam.cameraNames, data.eventParam.cameraTypes)
        }
    },
    startPlayBack(data) {
        if (data && data.eventParam) {
            this.vm.flvPlaybackData.originStartTime = data.eventParam.startTime;
            this.vm.flvPlaybackData.originEndTime = data.eventParam.endTime;
            this.vm.flvPlaybackData.played = 0;
            this.vm.flvPlaybackData.flvFisrtPlayFlag = 0;
            this.vm.playbackSlider.played = 0;
            this.vm.isTriggerPlayback = true
            this.vm.startPlayBack(data.eventParam.cameraCode, data.eventParam.cameraName, data.eventParam.startTime, data.eventParam.endTime)
        }
    },
    cancel() {
        this.vm.cancel()
    },
    pauseEvent() {
        this.vm.pauseEvent()
    },
    closePlay() {
        this.vm.closePlay()
    },
    initGlobalActionHook() {
        window.startLive = data => {
            if (data && data.cameraCodes) {
                this.vm.startLive(data.cameraCodes, data.cameraNames, data.cameraTypes)
            }
        }
    }
});
