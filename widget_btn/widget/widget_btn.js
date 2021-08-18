var widget_btn = StudioWidgetWrapper.extend({
    init: function () {
        var thisObj = this;
        thisObj._super.apply(thisObj, arguments);
        thisObj.render();
        if ((typeof (Studio) != "undefined") && Studio) {
            Studio.registerEvents(thisObj, "buildingDismantling", "楼宇拆解事件", []);
            Studio.registerEvents(thisObj, "hidePipeline", "管网控制事件", []);
            Studio.registerEvents(thisObj, "setCamera", "设置场景镜头事件", []);
            Studio.registerEvents(thisObj, "addRangeToMap", "添加范围圈定事件", []);
            Studio.registerEvents(thisObj, "addPointToMap", "地图打点事件", []);
            Studio.registerEvents(thisObj, "clearOverlays", "清除地图覆盖物圈定", []);

            Studio.registerEvents(thisObj, "sendSensorData", "发送环境数据", [{"sensors": []}]);
            Studio.registerEvents(thisObj, "sendDeviceData", "发送设备数据", [{"devices": []}]);
            Studio.registerEvents(thisObj, "sendSpaceData", "发送空间数据", [{"rooms": [], "vendors": []}]);

            Studio.registerEvents(thisObj, "funcStartLive", "视频播放", []);
            Studio.registerEvents(thisObj, "closeLive", "关闭播放器", []);

            Studio.registerAction(thisObj, "poiClick", "POI点击响应", [], $.proxy(this.poiClickCbk, this), []);
        }
    },

    render: function () {
        var thisObj = this;
        var elem = thisObj.getContainer();
        var widgetBasePath = thisObj.getWidgetBasePath();
        var widgetProperties = thisObj.getProperties();
        if (elem) {
            thisObj.vm = new Vue({
                    el: $("#widget_btn", elem)[0],
                    data() {
                        return {
                            png: {},
                            url: {
                                getSysParametersUrl: '/Common/0.1.0/getSysParameters',
                                querySysParamUrl: '/SmartCampus__SystemManagement/1.0.0/getSCBasicSystemParameter',
                                queryDeviceUrl: '/SmartCampus__FacilityManagement/0.1.0/Device/queryDevice',
                                queryEnSensorUrl: 'hm_bigScreen__HMSecurityManagement/0.1.0/listEnvSensor',
                                queryEnSensorBySnUrl: 'hm_bigScreen__HMSecurityManagement/1.0.0/queryEnSensor',
                                querySpaceTreeUrl: '/Space/0.1.0/querySpaceTree/',
                                querySpaceUrl: '/Space/0.1.0/Space/query',
                            },
                            color: ['FC8476', 'FEDF47', '357D71', '4699C2', '55C5D1', '3C436A', 'DC5084', 'F79C65', 'FFD574'],

                            // -------------------- 分割线 --------------------
                            APIAlready: '1',
                            isShow: false,
                            sysParamObj: {
                                iconPrefix: '',
                                companyLogoPrefix: '',
                                apartSpaceId: ''
                            },

                            obj1: {
                                floorNum: 'floorId'
                            },// 地上楼层 - 空间id
                            obj2: {
                                deviceSn: true
                            },// 设备sn - 是否合格

                            deviceList: [],

                            floorObj: {}, // {楼层:空间id}，用于拆楼后筛选出当前楼层的room
                            rooms: [], // 筛选level等于ROOM的空间，用于地图上打点和画区域轮廓

                            // --------------- poi点击回调 ---------------
                            mapPoi: {},// 地图上的poi，{id:type}

                            deviceEnvSensorDialog: {
                                dialog: false,
                                envSensor: {
                                    basic: {name: ''},
                                    attrs: []
                                }
                            },// 设备指标弹框

                            venderDialog: {
                                dialog: false,
                                vender: {
                                    attrObj: {}
                                },
                                attrs: []
                            },// 企业信息弹框

                            apartFloors: [{
                                label: 'B1',
                                value: -1
                            }, {
                                label: 'F1',
                                value: 1
                            }, {
                                label: 'F2',
                                value: 2
                            }, {
                                label: 'F3',
                                value: 3
                            }, {
                                label: 'F4',
                                value: 4
                            }, {
                                label: 'F5',
                                value: 5
                            }, {
                                label: 'F10',
                                value: 10
                            }, {
                                label: 'F15',
                                value: 15
                            }], // 可拆的楼层按钮
                            clickBtn: '', // 点击选中的楼层

                            // --------------- 监听页面操作 ---------------
                            x: '',
                            y: '',
                            count: ''
                        }
                    },
                    mounted() {
                        this.init();
                        this.setTimer();
                    },
                    methods: {
                        // -------------------------------------- 初始化相关的数据 ---------------------------------------
                        init() {
                            let _this = this;
                            _this.initMap();
                            _this.initSysParams();
                            _this.initEnvSensor(true);

                            const timeOut = 60 * 1e3;
                            setInterval(() => {
                                _this.initEnvSensor();
                            }, timeOut);
                        },

                        /**
                         * 地图加载完成后通知组件isShow = true
                         */
                        initMap() {
                            let _this = this;
                            sessionStorage.setItem('APIAlready', '1');
                            let intervalID = setInterval(function () {
                                if (_this.APIAlready === '0') {
                                    _this.isShow = true;
                                    window.clearInterval(intervalID);
                                }
                                _this.APIAlready = sessionStorage.getItem('APIAlready')
                            }, 1e3);
                        },

                        /**
                         * 初始化查询系统参数
                         * companyLogoPrefix
                         * apartSpaceId
                         */
                        initSysParams() {
                            let _this = this;
                            _this.getSysParameters(['iconPrefix', 'companyLogoPrefix', 'apartSpaceId']).then(paramObj => {
                                if (!paramObj.iconPrefix) {
                                    _this.$message({
                                        showClose: true,
                                        message: '未配置 iconPrefix 系统参数',
                                        type: 'info',
                                        customClass: 'hw-message'
                                    });
                                } else {
                                    let iconPrefix = paramObj.iconPrefix;
                                    _this.png = {
                                        EnvSensor: iconPrefix + 'EnvSensor.png',
                                        EnvSensor_selected: iconPrefix + 'EnvSensor-selected.png',
                                        EnvSensor_stop: iconPrefix + 'EnvSensor-red.png',

                                        camera: iconPrefix + 'camera_icon_blue.png',
                                        camera_selected: iconPrefix + 'camera_icon_related.png',
                                        camera_outLine: iconPrefix + 'camera_icon_red.png',

                                        Turnstile: iconPrefix + 'Turnstile.png',
                                        Turnstile_selected: iconPrefix + 'Turnstile-selected.png',

                                        smileFace: iconPrefix + 'smileFace.png',
                                        sadFace: iconPrefix + 'sadFace.png',

                                        defalut: iconPrefix + 'default.png',
                                        defalut_selected: iconPrefix + 'default_selected.png',

                                        pointCluster: iconPrefix + "images/point-cluster.png"
                                    }
                                }
                                if (!paramObj.companyLogoPrefix) {
                                    _this.$message({
                                        showClose: true,
                                        message: '未配置 companyLogoPrefix 系统参数',
                                        type: 'info',
                                        customClass: 'hw-message'
                                    });
                                }
                                if (!paramObj.apartSpaceId) {
                                    _this.$message({
                                        showClose: true,
                                        message: '未配置 apartSpaceId 系统参数',
                                        type: 'info',
                                        customClass: 'hw-message'
                                    });
                                }
                                _this.sysParamObj = paramObj;
                                _this.querySpace({parentId: paramObj.apartSpaceId}).then(spaces => {
                                    let floorObj = {};
                                    spaces.forEach(space => {
                                        let attr = space.spaceAttribute[0];
                                        if (attr.attrDef.code === 'up_floor_num' && attr.attrValue) {
                                            floorObj[attr.attrValue.toString()] = space.id;
                                        }
                                    });
                                    _this.obj1 = floorObj;
                                })
                            });
                        },

                        /**
                         * 初始化环境信息
                         * 查询设备和设备指标
                         */
                        initEnvSensor(sendDeviceData) {
                            let _this = this;
                            Promise.all([_this.queryEnSensor(), _this.queryDevices()]).then(res => {
                                let sensors = res[0];
                                _this.obj2 = getIsQualifiedObj(sensors);
                                thisObj.triggerEvent("sendSensorData", {sensors: sensors});

                                let devices = res[1];
                                devices = _this.buildDevices(devices);
                                _this.deviceList = devices;

                                if (sendDeviceData) {
                                    thisObj.triggerEvent("sendDeviceData", {devices: devices});
                                }

                            });

                            /**
                             * 获得传感器指标是否合格对象
                             * @return {{Sn:boolean}}
                             */
                            function getIsQualifiedObj(devices) {
                                let obj = {};
                                for (const device of devices) {
                                    obj[device.Sn] = true;
                                    let node = device.Node;
                                    if (!node) {
                                        continue;
                                    }
                                    // 遍历Node指标。若有一项指标不合格，则整体不合格
                                    let length = node.length;
                                    for (let i = 0; i < length; i++) {
                                        let isQualified = _this.isQualified(device.Node[i]);
                                        if (!isQualified) {
                                            obj[device.Sn] = false;
                                            break;
                                        }
                                    }
                                }
                                return obj;
                            }
                        },


                        // ---------------------------------------- 点击交互动作 ----------------------------------------
                        /**
                         * 楼层按钮点击事件
                         * @param floorNum
                         * @return {boolean}
                         */
                        btnClick(floorNum) {
                            let _this = this;
                            floorNum = Number(floorNum);
                            _this.clickBtn = floorNum;

                            _this.apartFloor(floorNum); // 拆楼&管道操作
                            _this.setCameraInfo(floorNum); // 切换场景镜头

                            // 拆40楼  特殊处理，返回全部的设备信息
                            if (floorNum === 40) {
                                thisObj.triggerEvent("sendDeviceData", {devices: _this.deviceList});
                                return false;
                            }

                            let floorId = _this.obj1[floorNum.toString()]; // 当前楼层id
                            if (!floorId) {// 若未在空间配置地上楼层，则floorId为空
                                _this.$message({
                                    showClose: true,
                                    message: `未配置 ${floorNum} 楼（地上楼层）`,
                                    type: 'info',
                                    customClass: 'hw-message'
                                });
                                return false;
                            }

                            // 查询楼层下的全部设备 -> 地图打点 -> 向其它组件发送数据
                            _this.queryDevices({spaceInPath: floorId}).then(devices => {
                                devices = _this.buildDevices(devices);
                                thisObj.triggerEvent("sendDeviceData", {devices: devices});

                                let mapPoints = buildMapPoint(devices);
                                deviceToMap(mapPoints);  // 向地图添加自定义设备点位
                            });


                            // 查询楼层下的全部房间 -> 地图打点 -> 向其它组件发送数据
                            _this.querySpace({parentId: floorId}).then(rooms => {
                                spaceToMap(rooms).then(params => {
                                    thisObj.triggerEvent("sendSpaceData", params);
                                }); // 地图添加空间的覆盖物
                            });


                            function buildMapPoint(arr) {
                                let mapPoints = [];
                                (arr || []).forEach(e => {
                                    let marker = {
                                        id: e.id,
                                        // title: e.deviceName,
                                        title: '',
                                        width: 25,
                                        height: 25,
                                        coord_z: 0,
                                        image: e.image || _this.png[e.defCode],
                                        imageSelected: _this.png[`${e.defCode}_selected`],
                                        label: {
                                            // text: e.deviceName,
                                            text: '',
                                            offset: '5,55'
                                        }
                                    };
                                    let coordinates = e.coords.split(',') || [];
                                    if (coordinates[0] && coordinates[1]) {
                                        marker.position = [coordinates[0], coordinates[1]];
                                        mapPoints.push(marker);
                                        _this.mapPoi[marker.id] = 'device';
                                    }
                                });
                                return mapPoints;
                            }

                            /**
                             * 自定义点
                             * @param markers
                             */
                            function deviceToMap(markers) {
                                let _this = this;
                                let paramObj = {
                                    layerId: "layer_123456",
                                    layerIndex: 1234,
                                    markers: markers || [],
                                    options: {
                                        image: _this.widgetBasePath + "images/point-cluster.png",
                                        width: 30,
                                        height: 30,
                                    }
                                };
                                if (paramObj.markers.length > 0) {
                                    // console.log('triggerEvent-POI', paramObj);
                                    thisObj.triggerEvent("addPointToMap", {clusterInfo: paramObj});
                                }
                            }

                            /**
                             * 地图上空间相关内容
                             * @param rooms
                             */
                            async function spaceToMap(rooms) {
                                let rangList = [];
                                let poiIds = [];
                                // 遍历在地图上画出所以房间信息
                                let index = 0;
                                for (const room of rooms) {
                                    let fence = room.fences[0];
                                    if (!fence) {
                                        continue;
                                    }
                                    let polygon = fence.polygon;
                                    // 判断栅栏经纬度是否支持地图打点
                                    let length = polygon.length;
                                    if (length < 3) {
                                        continue;
                                    }
                                    let points = [];
                                    for (let i = 0; i < length; i++) {
                                        points.push({"coord": `${polygon[i].x},${polygon[i].y}`});
                                    }
                                    _this.addRangeToMap(fence.id, _this.color[(index % 9)], points, room.spaceName);
                                    rangList.push(fence.id);

                                    // 有关联公司，打点图标
                                    if (!room.extId) {
                                        continue;
                                    }
                                    let centerPoint = _this.getCenterPoint(points);
                                    let arr = centerPoint.coord.split(',');
                                    let jsondata1 = {
                                        append: true,
                                        markerInfo: {
                                            layerId: room.parent,
                                            layerIndex: 1002,
                                            markers: [
                                                {
                                                    id: room.id,
                                                    position: [arr[0], arr[1]],
                                                    // title: room.spaceName,
                                                    title: '',
                                                    width: 25,
                                                    height: 25,
                                                    coord_z: 6,
                                                    image: _this.png.defalut,
                                                    imageSelected: _this.png.defalut_selected,
                                                    label: {
                                                        // text: room.spaceName,
                                                        text: '',
                                                        size: '12',
                                                        color: 'FFFFFFE6',
                                                        offset: '18,36'
                                                    }
                                                }
                                            ]
                                        }
                                    };
                                    await _this.queryOrganization({id: room.extId}).then(conpanys => {
                                        if (conpanys.length > 0) {
                                            let company = conpanys[0];
                                            company.organizationAttribute.forEach(item => {
                                                if (item.attrDef.code === 'comLogo') {
                                                    if (item.attrValue) {
                                                        jsondata1.markerInfo.markers[0].image = _this.sysParamObj.companyLogoPrefix + item.attrValue;
                                                    }
                                                }
                                            });
                                            thisObj.triggerEvent("addPointToMap", jsondata1);
                                            poiIds.push(room.id);
                                            _this.mapPoi[room.id] = 'company';
                                        }
                                    });
                                    index++;
                                }
                                return {rooms: rangList, vendors: poiIds};
                            }
                        },

                        /**
                         * 地图上的poi点击回调事件
                         * @param e
                         */
                        poiClick(e) {
                            let _this = this;
                            let poiId = e.poiId;
                            _this.closeAllWidow();
                            if (_this.mapPoi[poiId] === 'company') {
                                companyClick(poiId);
                            } else {
                                deviceClick(poiId);
                            }

                            /**
                             * 点击地图上设备logo
                             * @param deivceId
                             */
                            function deviceClick(deivceId) {
                                // 初始化弹出内容
                                _this.deviceEnvSensorDialog = {
                                    dialog: false,
                                    envSensor: {
                                        basic: {name: ''},
                                        attrs: []
                                    }
                                };
                                // 查询设备信息
                                _this.queryDevices({id: deivceId}).then(devices => {
                                    let device = devices[0];
                                    if (device.deviceDef.code === 'camera') {
                                        startLive(device);
                                    } else if (device.deviceDef.code === 'EnvSensor') {
                                        _this.deviceEnvSensorDialog.dialog = true;
                                        getEnvSensorDialogData(device);
                                    } else {
                                        showTurnstile(device);
                                    }
                                });

                                /**
                                 * 播放摄像头视频
                                 * @param device
                                 */
                                function startLive(device) {
                                    let data = {
                                        cameraCode: device.externalCode,
                                        cameraCodes: [device.externalCode],
                                        cameraName: device.deviceName,
                                        displayCloseButton: "true"
                                    };
                                    thisObj.triggerEvent("funcStartLive", data)
                                }

                                /**
                                 * 查询单个传感器指标数据
                                 * @param device
                                 */
                                function getEnvSensorDialogData(device) {
                                    queryEnSensorBySn(device.externalCode).then(data => {
                                        let node = data.Node;
                                        if (!node) {
                                            _this.$message({
                                                showClose: true,
                                                message: '未查询到指标数据',
                                                type: 'error',
                                                customClass: 'hw-message'
                                            });
                                            return false;
                                        }
                                        let envSersorContent = getEnvSersorContent(node);
                                        _this.deviceEnvSensorDialog.envSensor = {
                                            basic: {
                                                name: data.Name,
                                                flashtime: data.Flashtime,
                                            },
                                            attrs: envSersorContent.attrs,
                                            qualified: envSersorContent.qualified
                                        };
                                    });

                                    function queryEnSensorBySn(sn) {
                                        let param = {
                                            "Param": {
                                                "token": "3b5656a50ff2060467326bc44283e2cb",
                                                "device": sn
                                            }
                                        };
                                        return new Promise(resolve => {
                                            thisObj.callAPIConn(_this.url.queryEnSensorBySnUrl, param, 'POST', (res) => {
                                                if (res && res.resp && res.resp.code === '0' && res.data[0]) {
                                                    // console.log("queryEnSensorBySn", res);
                                                    resolve(res.data[0].EnvSensor.Device)
                                                }
                                            });
                                        });
                                    }

                                    /**
                                     * 构造页面上能直接展示的指标数据
                                     * @param arr
                                     * @return {{qualified: boolean, attrs: []}}
                                     */
                                    function getEnvSersorContent(arr) {
                                        let attrs = [];
                                        let qualified = true;
                                        (arr || []).forEach(item => {
                                            let itemQualified = _this.isQualified(item);
                                            if (!itemQualified) {
                                                qualified = false;
                                            }
                                            let value = item.Value;
                                            value = Math.round(value * 10000) / 10000;
                                            attrs.push({
                                                name: item.Name,
                                                value: `${value} ${item.Unit}`,
                                                class: itemQualified ? '' : 'qualified'
                                            });
                                        });
                                        return {attrs: attrs, qualified: qualified};
                                    }
                                }

                                /**
                                 * 闸机
                                 * 弹出闸机名字成功信息提示框
                                 * @param device
                                 */
                                function showTurnstile(device) {
                                    _this.$message({
                                        showClose: true,
                                        message: `闸机 - ${device.deviceName}`,
                                        type: 'success',
                                        customClass: 'hw-message'
                                    });
                                }
                            }

                            /**
                             * 点击地图上企业logo
                             *
                             * @param spaceId
                             */
                            function companyClick(spaceId) {
                                _this.venderDialog = {
                                    dialog: false,
                                    vender: {
                                        attrObj: {}
                                    },
                                    attrs: []
                                }; // 初始化弹框内容
                                _this.venderDialog.dialog = true;

                                _this.querySpace({spaceId: spaceId}).then(spaces => {
                                    let space = spaces[0];
                                    let venderId = space.extId;
                                    _this.queryOrganization({id: venderId}).then(conpanys => {
                                        if (conpanys.length > 0) {
                                            let company = conpanys[0];
                                            let attrObj = {};
                                            company.organizationAttribute.forEach(item => {
                                                let attr = getAttrDef(item);
                                                attrObj[attr.key] = attr.value;
                                            });
                                            company.attrObj = attrObj;
                                            _this.venderDialog.vender = company;
                                        }
                                    })
                                });

                                function getAttrDef(item) {
                                    let key = item.attrDef.code;
                                    let label = item.attrDef.label;
                                    let value = '';
                                    switch (key) {
                                        case "comLevel":
                                            label = label.split('（')[0];
                                            if (item.attrValue) {
                                                value = item.attrValue === '1' ? '普通' : '黑钻'
                                            }
                                            break;
                                        case "comType":
                                            label = label.split('（')[0];
                                            if (item.attrValue) {
                                                value = item.attrValue === '1' ? '入驻企业' : '物业公司'
                                            }
                                            break;
                                        case "comLogo":
                                            if (item.attrValue) {
                                                value = _this.suffix + _this.objectStrogeProxy + item.attrValue
                                            }
                                            break;
                                        default:
                                            value = item.attrValue;
                                            break;
                                    }
                                    return {key: key, label: label, value: value}
                                }
                            }
                        },

                        /**
                         * 关闭全部弹框
                         */
                        closeAllWidow() {
                            let _this = this;
                            _this.deviceEnvSensorDialog.dialog = false; // 关闭传感器信息框
                            _this.venderDialog.dialog = false;           // 关闭企业信息框
                            thisObj.triggerEvent("closeLive");          // 关闭播放器
                        },

                        // -------------------------------------- 封装基线基本接口 ---------------------------------------
                        /**
                         * 获取自定义系统参数
                         * @param parameterNames
                         * @return {Promise<{}>}
                         */
                        getSysParameters(parameterNames) {
                            let _this = this;
                            let param = {
                                parameterNames: parameterNames
                            };
                            return new Promise(resolve => {
                                thisObj.callAPIConn(_this.url.getSysParametersUrl, param, 'post', res => {
                                    if (res && res.resp && res.resp.code && res.resp.code === '0') {
                                        console.log('getSysParameters:', res);
                                        resolve(res.data[0].parameters);
                                    }
                                });
                            });
                        },

                        /**
                         * 获取系统参数
                         * UnifiedPortal_Mainframe_SpaceRootCode
                         * @return {Promise<list>}
                         */
                        querySysSpaceRootCode() {
                            let _this = this;
                            let param = {
                                paraNameList: [
                                    'UnifiedPortal_Mainframe_SpaceRootCode'
                                ]
                            };
                            return new Promise(resolve => {
                                thisObj.callAPIConn(_this.url.querySysParamUrl, param, 'post', res => {
                                    if (res && res['resp'] && res['resp']['code'] && res['resp']['code'] === '0') {
                                        // console.log('querySysSpaceRootCode:', res.data[0]['paraValueList']);
                                        resolve(res.data[0]['paraValueList']);
                                    }
                                });
                            });
                        },

                        /**
                         * 查询空间数据
                         * @param condition
                         * @return {Promise<list>}
                         */
                        querySpace(condition) {
                            let _this = this;
                            let param = {
                                "start": 0,
                                "limit": 5000,
                                "condition": {}
                            };
                            if (condition) {
                                if (condition.spaceId) {
                                    param.condition.id = {"value": condition.spaceId};
                                }
                                if (condition.spaceRootCode) {
                                    param.condition.spaceRootCode = {value: condition.spaceRootCode};
                                }
                                if (condition.levelCode) {
                                    param.condition.levelCode = {value: condition.levelCode};
                                }
                                if (condition.parentId) {
                                    param.condition.parent = {"value": condition.parentId};
                                }
                            }

                            return new Promise(resolve => {
                                thisObj.callAPIConn(_this.url.querySpaceUrl, param, 'POST', res => {
                                    if (res && res.resp && res.resp.code && res.resp.code === '0') {
                                        // console.log('querySpace', res.data[0]['spaces']);
                                        resolve(res.data[0]['spaces']);
                                    }
                                });
                            });
                        },

                        /**
                         * 查询设备实例
                         * @return {Promise<devices>}
                         */
                        queryDevices(condition) {
                            let _this = this;
                            let params = {
                                start: 0,
                                limit: 5000,
                                condition: {}
                            };
                            if (condition && condition.id) {
                                params.condition.id = {value: condition.id};
                            }
                            if (condition && condition.spaceInPath) {
                                params.condition.spaceInPath = {value: condition.spaceInPath};
                            }
                            return new Promise(resolve => {
                                thisObj.callAPIConn(_this.url.queryDeviceUrl, params, 'POST', res => {
                                    if (res && res['resp'] && res['resp']['code'] && res['resp']['code'] === '0') {
                                        // console.log('queryDevices', res.data[0].devices);
                                        resolve(res.data[0].devices);
                                    }
                                });
                            });
                        },

                        /**
                         * 查询企业列表
                         * @param condition
                         * @return {Promise<>}
                         */
                        queryOrganization(condition) {
                            let url = '/Organization/0.1.0/Organization/query';
                            let param = {
                                "condition": {
                                    "parent": {
                                        "operator": "=",
                                        "value": "0E01000000j77kw0tRMu"
                                    },
                                    "typeCode": {
                                        "operator": "=",
                                        "value": "COMPANY"
                                    }
                                },
                                "limit": 5000,
                                "start": 0
                            };
                            if (condition && condition.id) {
                                param.condition.id = condition.id;
                            }
                            return new Promise(resolve => {
                                thisObj.callAPIConn(url, param, 'POST', res => {
                                    if (res && res.resp && res.resp.code && res.resp.code === '0') {
                                        resolve(res.data[0].organizations);
                                    }
                                });
                            });
                        },

                        /**
                         * 查询空间树
                         * @param spaceId
                         * @return {Promise<{}>}
                         */
                        querySpaceTree(spaceId) {
                            let _this = this;
                            let params = {
                                "start": 0,
                                "limit": 5000,
                                "isChildren": true
                            }; // isChildren, true:只查询直接子节点；false:查询整个子树
                            return new Promise(resolve => {
                                thisObj.callAPIConn(_this.url.querySpaceTreeUrl + spaceId, params, 'POST', res => {
                                    if (res && res.resp && res.resp.code && res.resp.code === '0') {
                                        console.log('querySpaceTree:', res);
                                        resolve(res.data[0].space);
                                    }
                                });
                            });
                        },

                        /**
                         * 查询全部传感器指标
                         * @return {Promise<Array>}
                         */
                        queryEnSensor() {
                            let _this = this;
                            let param = {
                                "param": {
                                    "token": "3b5656a50ff2060467326bc44283e2cb"
                                }
                            };
                            return new Promise(resolve => {
                                thisObj.callAPIConn(_this.url.queryEnSensorUrl, param, 'POST', (res) => {
                                    if (res && res.resp && res.resp.code === '0' && res.data[0]) {
                                        // console.log("queryEnvSensor", res.data[0].EnvSensor.Device);
                                        resolve(res.data[0].EnvSensor.Device);
                                    }
                                });
                            });
                        },


                        // -------------------------------------- 地图动作响应函数 ---------------------------------------
                        /**
                         * 楼宇拆解
                         * @param floorNum
                         */
                        apartFloor(floorNum) {
                            let _this = this;
                            _this.mapPoi = {};
                            // 清空地图覆盖物
                            thisObj.triggerEvent("clearOverlays", {
                                "overlayTypes": ["range", "poi"]
                            });
                            // 隐藏全部管网
                            if (floorNum !== -1 && floorNum !== 1) {
                                _this.hidePipeline();
                            }
                            // 楼宇拆解
                            let jsonData = {
                                build_id: "Build_01",
                                floor: floorNum,
                                animation_type: 1
                            };
                            thisObj.triggerEvent("buildingDismantling", jsonData);
                        },

                        /**
                         * 设置场景镜头
                         * @param floorNum
                         */
                        setCameraInfo(floorNum) {
                            let obj = getCenter(floorNum);
                            let jsonData = {
                                center: obj.center,
                                distance: obj.center[2],
                                rph: obj.rph,
                                rotate: floorNum === 40
                            };
                            thisObj.triggerEvent("setCamera", jsonData);

                            function getCenter(floor) {
                                let center = ['116.47520', '39.908420', 300];
                                let rph = [0, 1, 45];

                                if (floor < 0) {
                                    center[2] = 300 - 5.2 * floor;
                                    rph = [0, 1, 30];
                                }

                                if (floor > 0) {
                                    center[2] = 5.2 * floor + 300;
                                    rph = [0, 1, 30];
                                }

                                if (floorNum === 40) {
                                    center = ['116.47487', '39.908904', 400];
                                    rph = [0, 1, 30];
                                }
                                return {center: center, rph: rph}
                            }
                        },

                        /**
                         * 管网操作
                         */
                        hidePipeline(showWater, showAir) {
                            thisObj.triggerEvent("hidePipeline", {state: '0'});
                            if (showWater) {
                                thisObj.triggerEvent("hidePipeline", {state: '1'});
                            }
                            if (showAir) {
                                thisObj.triggerEvent("hidePipeline", {state: '2'});
                            }
                        },

                        /**
                         * 添加区域轮廓
                         * @param id
                         * @param color
                         * @param points
                         * @param name
                         */
                        addRangeToMap(id, color, points, name) {
                            let rangeData = {
                                "id": id,
                                'color': color,
                                "points": points,
                                "title_text": name
                            };
                            thisObj.triggerEvent("addRangeToMap", rangeData);
                        },


                        // ------------------------------------------ 其它方法 ------------------------------------------
                        /**
                         * 重构device对象数组，只保留有用的字段
                         * @param devices
                         * @return {[device]}
                         */
                        buildDevices(devices) {
                            let _this = this;
                            let obj = _this.obj2;
                            let deviceList = [];
                            devices.forEach(item => {
                                // 设备在线状态
                                let onLineState = getOnLineState(item.deviceAttr);

                                // 组装设备在地图上的图标
                                let deviceCode = item.deviceDef.code;
                                if (deviceCode === 'EnvSensor') {
                                    item.image = obj[item.externalCode] ? _this.png.smileFace : _this.png.sadFace;
                                } else if (deviceCode === 'camera' && onLineState === '1') {
                                    item.image = _this.png['camera_outLine'];
                                } else {
                                    item.image = _this.png[deviceCode];
                                }

                                let location = item.deviceLocation;
                                let device = {
                                    id: item.id,
                                    code: item.code,
                                    deviceName: item.deviceName,
                                    spaceId: location.space,
                                    spaceLevelCode: Array.isArray(location.spaceInPath) && location.spaceInPath.length > 0 && location.spaceInPath[0].spaceLevelCode ? location.spaceInPath[0].spaceLevelCode : '',
                                    coords: location.coordinate || '',
                                    defCode: item.deviceDef.code,
                                    externalCode: item.externalCode,
                                    status: onLineState,
                                    image: item.image
                                };
                                deviceList.push(device);
                            });
                            return deviceList;

                            function getOnLineState(attrs) {
                                let length = Array.isArray(attrs) ? attrs.length : 0;
                                for (let i = 0; i < length; i++) {
                                    if (attrs[i].attrDef && attrs[i].attrDef.code === 'onlineStatus') {
                                        return attrs[i].attrValue;
                                    }
                                }
                            }
                        },

                        /**
                         * 判断传感器某项指标是否合格
                         * @param attr
                         * @return {boolean}
                         */
                        isQualified(attr) {
                            let value = Number(attr.Value) || -1;
                            let isQualified = true;
                            switch (attr.Name) {
                                case '油烟':
                                    isQualified = value < 1.01;
                                    break;
                                case '异味':
                                    isQualified = value < 0.11;
                                    break;
                                case 'PM2.5':
                                    isQualified = value < 76;
                                    break;
                                case 'TVOC':
                                    isQualified = value < 0.11;
                                    break;
                                case 'CO2':
                                    isQualified = value < 1001;
                                    break;
                                case '甲醛':
                                    isQualified = value < 0.11;
                                    break;
                                default:
                                    break;
                            }
                            return isQualified;
                        },

                        /**
                         * 简单的计算多边形中心
                         * @param points
                         * @return {{coord: 'avgLon,avgLat'}}
                         */
                        getCenterPoint(points) {
                            let sumLon = 0;
                            let sumLat = 0;
                            let length = points.length || 0;

                            for (let i = 0; i < length; i++) {
                                let lonAndLat = points[i].coord.split(',');
                                sumLon += Number(lonAndLat[0] || 0);
                                sumLat += Number(lonAndLat[1] || 0);
                            }

                            return {coord: `${(sumLon / length).toFixed(6)},${(sumLat / length).toFixed(6)}`}
                        },

                        // 拖拽事件对应函数
                        dragstart(e) {
                            let _this = this;
                            _this.offsetX = e.offsetX;
                            _this.offsetY = e.offsetY;
                            let evmousedown = document.createEvent('HTMLEvents');
                            evmousedown.initEvent('mousedown', false, true);
                            let evmouseup = document.createEvent('HTMLEvents');
                            evmouseup.initEvent('mouseup', false, true);
                            document.dispatchEvent(evmousedown);
                            document.dispatchEvent(evmouseup);
                        },
                        dragend(e) {
                            let _this = this;
                            let event = e.toElement.parentElement.parentElement.parentElement.parentElement.parentElement;
                            let eventBox = e.toElement.parentElement.parentElement.parentElement.parentElement;
                            // 当前页面长度、宽度
                            // let totalWidth = this.transferPXTOREM(event.offsetWidth);
                            // let totalHeight = this.transferPXTOREM(event.offsetHeight)

                            let totalWidth = document.body.clientWidth;
                            let totalHeight = document.body.clientHeight;

                            let style = eventBox.style;
                            //标题元素top距离窗口顶部距离
                            let topHeight = parseFloat(style.top) + _this.transferPXTOREM(e.offsetY - _this.offsetY);
                            //标题元素left距离窗口左边距离
                            let leftWidth = parseFloat(style.left) + _this.transferPXTOREM(e.offsetX - _this.offsetX);
                            // 弹窗高度、宽度
                            let divHeight = _this.transferPXTOREM(eventBox.offsetHeight);
                            let divWidth = _this.transferPXTOREM(eventBox.offsetWidth);
                            let initTop = 0;
                            // 移动后的弹窗bottom和right
                            let offsetHeight = divHeight + topHeight - initTop;
                            let offsetWidth = divWidth + leftWidth;
                            if (topHeight <= initTop) {
                                style.top = initTop + 'rem';
                            } else if (offsetHeight >= totalHeight) {
                                style.top = (totalHeight - divHeight + initTop) + 'rem';
                            } else {
                                style.top = topHeight + 'rem';
                            }
                            if (leftWidth <= 0) {
                                style.left = '0rem';
                            } else if (offsetWidth >= totalWidth) {
                                style.left = (totalWidth - divWidth) + 'rem';
                            } else {
                                style.left = leftWidth + 'rem'
                            }
                        },
                        /**
                         * px转rem
                         * @param px
                         * @returns {number}
                         */
                        transferPXTOREM(px) {
                            let root = document.body.style.fontSize || document.defaultView.getComputedStyle(document.body, null).fontSize;
                            if (root.indexOf('%') > -1) {
                                return px / parseFloat(root) / 100 * 16
                            } else {
                                return px / parseFloat(root)
                            }
                        },

                        /**
                         * 设置监听页面响应的计时器
                         */
                        setTimer() {
                            let _this = this;
                            // 监听鼠标
                            document.onmousemove = (event) => {
                                let x1 = event.clientX;
                                let y1 = event.clientY;
                                if (_this.x !== x1 || _this.y !== y1) {
                                    this.count = 0
                                }
                                _this.x = x1;
                                _this.y = y1;
                            };
                            // 监听键盘
                            document.onkeydown = () => {
                                _this.count = 0
                            };
                            // 监听Scroll
                            document.onscroll = () => {
                                _this.count = 0
                            };

                            _this.count = 0;

                            setInterval(() => {
                                // 判断用户5分钟无操作就自动旋转地图
                                const minutes = 5;
                                _this.count++;
                                if (_this.count === minutes * 60) {
                                    _this.count = 0;
                                    _this.setCameraInfo(40); // 初始化场景镜头
                                    _this.$message({
                                        showClose: true,
                                        message: `页面 ${minutes} 分钟未进行操作`,
                                        type: 'info',
                                        customClass: 'hw-message'
                                    });
                                }
                            }, 1000);
                        }
                    }
                },
            )
        }
        thisObj.sksBindItemEvent();
        $(window).resize(function () {
            thisObj.sksRefreshEvents();
        });
    },

    /**
     * 通用 APIConnector 调用 API
     * @param service
     * @param param
     * @param type
     * @param callbackFunc
     */
    callAPIConn: function (service, param, type, callbackFunc) {
        let thisObj = this;
        let connector;
        switch (type.toUpperCase()) {
            case 'POST':
                connector = thisObj.getConnectorInstanceByName('APIConnector_POST');
                break;
            case 'GET':
                connector = thisObj.getConnectorInstanceByName('APIConnector_GET');
                if (connector) {
                    connector.getConnectorParams().requestMethod = 'get';
                }
                break;
            case 'PUT':
                connector = thisObj.getConnectorInstanceByName('APIConnector_PUT');
                if (connector) {
                    connector.getConnectorParams().requestMethod = 'put';
                }
                break;
            case 'DELETE':
                connector = thisObj.getConnectorInstanceByName('APIConnector_DELETE');
                if (connector) {
                    connector.getConnectorParams().requestMethod = 'delete';
                }
                break;
            default:
                connector = thisObj.getConnectorInstanceByName('APIConnector_POST');
                break;
        }
        if (connector) {
            connector.setInputParams({service: service, needSchema: 'data'}); //异步（默认）
            if (param.async === false) {
                connector.setInputParams({service: service, needSchema: 'data', async: false}); //同步
                delete param.async;
            }
            connector.query(param).done(function (response) {
                if (response.resp && response.resp.code) {
                    callbackFunc.call(thisObj, response);
                }
            })
        }
    },

// 组件动作回调
    poiClickCbk(data) {
        this.vm.poiClick(data.eventParam);
    }
});