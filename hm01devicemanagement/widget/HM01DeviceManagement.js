var HM01DeviceManagement = StudioWidgetWrapper.extend({
    init: function () {
        var thisObj = this;
        thisObj._super.apply(thisObj, arguments);
        thisObj.render();
        thisObj.initGlobalActionHook();
        if ((typeof (Studio) != "undefined") && Studio) {
            //在地图上标注元素,设备
            Studio.registerEvents(thisObj, "locateMarker", "locateMarker", []);

            //接收地图发来的位置信息
            Studio.registerAction(thisObj, "receiveLocation", "Receive Location", [], $.proxy(thisObj.receiveLocationCbk, thisObj), []);

            //点击地图上的点传过来的信息
            Studio.registerAction(thisObj, "receiveDeviceMsg", "receiveDeviceMsg", [], $.proxy(thisObj.receiveDeviceMsgCbk, thisObj), []);

            //在地图上添加元素,设备
            Studio.registerEvents(thisObj, "addMarker", "addMarker", []);

            //打开设备画像
            Studio.registerEvents(thisObj, "deviceFacility", "deviceFacility", []);

            //清除地图上存在的摄像头
            Studio.registerEvents(thisObj, "clear-cameras", "清除摄像头事件", []);

            //清除地图上存在的摄像头
            Studio.registerEvents(thisObj, "modifyMapConfig", "修改地图缩放", []);

            //调用视频播放事件
            Studio.registerEvents(thisObj, "funcStartLive", "调用视频播放事件", []);

            //设备关系操作
            Studio.registerAction(thisObj, "operateRelation", "设备关系操作", [], $.proxy(thisObj.vm.operateRelation, thisObj), []);

            //查看摄像头
            Studio.registerAction(thisObj, "operateCameraRange", "查看摄像头", [], $.proxy(thisObj.vm.operateCameraRange, thisObj), []);
        }
    },

    /*
     * Triggered from init method and is used to render the widget
     */
    render: function () {
        var thisObj = this;
        var elem = thisObj.getContainer();
        // var widgetProperties = thisObj.getProperties();
        thisObj.getProperties();
        var widgetBasePath = thisObj.getWidgetBasePath();

        const i18n = HttpUtils.getI18n({
            locale: HttpUtils.getLocale(),
            messages: thisObj.getMessages()
        });
        console.log("i18n", i18n)

        // var i18nVue = new Vue({
        //     i18n: i18n
        // });
        if (elem) {
            Vue.directive("dialogmove", function (el, binding, vnode) {
                const dialogHeaderEl = el.querySelector('.el-dialog__header')
                const dragDom = el.querySelector('.el-dialog')
                dialogHeaderEl.style.cssText += ';cursor:move;'
                dragDom.style.cssText += ';top:0px;'
                // 获取原有属性 ie dom元素.currentStyle 火狐谷歌 window.getComputedStyle(dom元素, null);
                const getStyle = (function () {
                    if (window.document.currentStyle) {
                        return (dom, attr) => dom.currentStyle[attr]
                    } else {
                        return (dom, attr) => getComputedStyle(dom, false)[attr]
                    }
                })()
                dialogHeaderEl.onmousedown = (e) => {
                    // 鼠标按下，计算当前元素距离可视区的距离
                    const disX = e.clientX - dialogHeaderEl.offsetLeft
                    const disY = e.clientY - dialogHeaderEl.offsetTop
                    const dragDomWidth = dragDom.offsetWidth
                    const dragDomHeight = dragDom.offsetHeight
                    const screenWidth = document.body.clientWidth
                    const screenHeight = document.body.clientHeight
                    const minDragDomLeft = dragDom.offsetLeft
                    const maxDragDomLeft = screenWidth - dragDom.offsetLeft - dragDomWidth
                    const minDragDomTop = dragDom.offsetTop
                    const maxDragDomTop = screenHeight - dragDom.offsetTop - dragDomHeight
                    // 获取到的值带px 正则匹配替换
                    let styL = getStyle(dragDom, 'left')
                    let styT = getStyle(dragDom, 'top')
                    if (styL.includes('%')) {
                        styL = +document.body.clientWidth * (+styL.replace(/\%/g, '') / 100)
                        styT = +document.body.clientHeight * (+styT.replace(/\%/g, '') / 100)
                    } else {
                        styL = +styL.replace(/\px/g, '')
                        styT = +styT.replace(/\px/g, '')
                    }
                    document.onmousemove = function () {
                        // 通过事件委托，计算移动的距离
                        let left = el.clientX - disX
                        let top = el.clientY - disY
                        // 边界处理
                        if (-(left) > minDragDomLeft) {
                            left = -minDragDomLeft
                        } else if (left > maxDragDomLeft) {
                            left = maxDragDomLeft
                        }
                        if (-(top) > minDragDomTop) {
                            top = -minDragDomTop
                        } else if (top > maxDragDomTop) {
                            top = maxDragDomTop
                        }
                        // 移动当前元素
                        dragDom.style.cssText += `;left:${left + styL}px;top:${top + styT}px;`
                        // emit onDrag event
                        vnode.child.$emit('dragDialog')
                    }
                    document.onmouseup = function (em) {
                        document.onmousemove = null
                        document.onmouseup = null
                    }
                }
            })
            thisObj.vm = new Vue({
                i18n: i18n,
                el: $('#DeviceManage', elem)[0],
                data: {
                    // Translation: Definition lang object
                    props:{
                        checkStrictly: true,
                        // lazy: true,
                        // lazyLoad (node, resolve) {
                        //     const { level } = node;
                        //     setTimeout(() => {
                        //     const nodes = Array.from({ length: level + 1 })
                        //         .map(item => ({
                        //         value: ++id,
                        //         label: `选项${id}`,
                        //         leaf: level >= 2
                        //         }));
                        //     // 通过调用resolve将子节点数据返回，通知组件数据加载完成
                        //     resolve(nodes);
                        //     }, 1000);
                        // }
                    },
                    isEdit:false,
                    treeDataMap: {},
                    selectDataDevice:false,
                    selectdeviceList:[],
                    deviceDefOptions:[], //设备规格树信息
                    lang: {},
                    deviceAttrTab: 'dynamicAttr',
                    uploadData: {
                        dialog: false,
                        fileList: [],
                        downUrl: '/u-route/baas/bulk/v1.0/template/xlsx?template=Device_deviceDataImport' //设备导入模板下载地址
                    },
                    buttonSaveLoading: false,
                    isShowDeviceManage: true,
                    isShowDeviceStatus: false,
                    isShowCameraRange: false,
                    associatedDevice: false,
                    condition: {
                        deviceCode: '',
                        externalCode: '',
                        deviceName: '',
                        status: '',
                        spaceInPath: '',
                        spaceInPathLabel: '',
                        defCode: '',
                        defCodeLabel: '',
                        channel: '',
                        spacePathList: [],
                        gatewayId: '',
                        defIdLabelList:[], //设备规格分类
                    },
                    deviceList: {
                        loading: false,
                        deviceQrCode: false,
                        downLoadStatus: false,
                        downLoadAllStatus: false,
                        total: 0,
                        dataList: [],
                        pageNum: 1,
                        pageSize: 10
                    },
                    selectCameras: {
                        isShowDistance: false,
                        deviceCameraData: {},
                        rangedata: [5, 10, 15, 20, 500],
                        zoomLevel: [22, 22, 21, 21, 17],
                        defaultLevel: 18,
                        isUseDefaultZoom: false,
                        defaultclassMode: [true, false, false, false, false],
                        classMode: [],
                        actionName: {},
                        relationParam: {},
                        queryParam: {
                            longitude: '',
                            latitude: '',
                            selectdata: ''
                        },
                        camerasIds: [],
                        circleids: []
                    },
                    deviceRelation: {
                        loading: false,
                        showDeviceRelation: false,
                        newIcon: false,
                        disable: false,
                        triggerClick: false,
                        relatedDeviceDisable: true,
                        currentData: [],
                        currentDevice: {},
                        selectedType: {},
                        selectedData: {},
                        selectedDeviceCode: {},
                        updateData: {},
                        typeList: [],
                        total: 0,
                        dataList: [],
                        pageNum: 1,
                        pageSize: 10
                    },
                    deviceSelect: {
                        loading: false,
                        dialog: false,
                        condition: {
                            externalCode: '',
                            deviceName: ''
                        },
                        currentRow: {},
                        total: 0,
                        dataList: [],
                        pageNum: 1,
                        pageSize: 10
                    },
                    deviceStatus: {
                        active: {
                            count: 0,
                            percent: 0
                        },
                        inactive: {
                            count: 0,
                            percent: 0
                        },
                        deleted: {
                            count: 0,
                            percent: 0
                        },
                        unreg: {
                            count: 0,
                            percent: 0
                        },
                        total: 0
                    },
                    deviceData: {
                        id: '',
                        deviceCode: '',
                        externalCode: '',
                        externalCodeCopy: '',
                        deviceName: '',
                        status: 'ACTIVE',
                        channel: '',
                        channelCopy: '',
                        deviceProduct: '',
                        remark: '',
                        deviceDef: '',
                        deviceDefCopy: '',
                        deviceDefName: '',
                        deviceDefCode: '',
                        nodeId: '',
                        gatewayId: '',
                        connectStatus: '',
                        hmi:''
                    },
                    deviceDef: {
                        loading: false,
                        datas: [],
                        dialog: false, //设备规格定义对话框
                        conditionDialog: false,
                        currentRow: {},
                        pageNum: 1,
                        pageSize: 10,
                        total: 0,
                        deviceDefAttr: [], //设备规格属性
                        condition: {
                            code: '',
                            defName: ''
                        },
                        categories: []
                    },
                    space: {
                        loading: false,
                        datas: [],
                        dialog: false,
                        conditionDialog: false,
                        currentRow: {},
                        pageNum: 1,
                        pageSize: 10,
                        total: 0,
                        condition: {
                            spaceRootCode: '',
                            spaceName: '',
                            spacePathList: [],
                            spacePathListInit: [],
                        },
                        spaceRoots: []
                    },
                    spaceOptions: [], //空间位置信息
                    currentSpace: {},
                    pageCount: "4",
                    spaceRootCode: '',
                    device: {
                        addEditDeviceDialog: false, //设备实例对话框
                        activeTab: '1',
                        rules: { // Translated
                            externalCode: [{
                                    required: true,
                                    message: '不能为空',
                                    trigger: 'blur'
                                },
                                {
                                    min: 0,
                                    max: 255,
                                    message: '长度在 0 到 255 个字符',
                                    trigger: 'blur'
                                }
                            ],
                            deviceName: [{
                                    required: true,
                                    message: '不能为空',
                                    trigger: 'blur'
                                },
                                {
                                    min: 0,
                                    max: 255,
                                    message: '长度在 0 到 255 个字符',
                                    trigger: 'blur'
                                }
                            ],
                            deviceDefName: [{
                                required: true,
                                message: '不能为空',
                                trigger: 'change'
                            }]
                        },
                        configNames:[],
                        deviceProducts: [],
                        deviceChannels: [],
                        deviceAttribute: [], //实例属性（页面模型绑定）
                        currentDeviceAttr: [], //设备实例属性（查出来的实际属性）
                        deviceAttributeDelete: [] //已删除的属性项
                    },
                    deviceLocation: {
                        space: '',
                        spaceLabel: '',
                        longitude: null,
                        latitude: null,
                        altitude: null,
                        building: null,
                        floor: null
                    },
                    widgetBasePath: widgetBasePath,
                    deviceStatusData: {
                        width: 0,
                        height: 0,
                        backgroundColor: 'rgba(61,73,99,0.8)',
                        excircle: {
                            color: '#6Cfa77',
                            width: 2
                        },
                        incircle: {
                            width: 1.5,
                            colorOn: '#6Cfa77',
                            colorOff: '#606266',
                            font: {
                                font: '1.65rem sans-serif',
                                color: '#6Cfa77',
                                text: 0,
                                height: 100
                            }
                        },
                        foot: {
                            font: 'normal 1.2rem sans-serif',
                            color: '#ffffff',
                            text: '启用率', // Translated
                            height: 185
                        }
                    },
                    notInitQuery: false,
                    channelIOT: [],
                    showSeparate: false, //查询条件中的分隔线中的图标，
                    deviceAttributeDialog: { //设备属性信息
                        dialog: false,
                        loading: false,
                        deviceAttrDatas: [],
                        row: {}
                    },
                    deviceModel: { //物模型绑点信息
                        tab: "attr",
                        dialog: false,
                        loading: false,
                        datas: {},
                        dataList: [],
                        row: {}
                    },
					dynamicAttrShow: '',
                    dynamicAttrShowFlag: false
                },
                watch: {
                    'deviceData.deviceDef': function (newVal, oldVal) {
                        if (!!newVal && !this.deviceData.id) {
                            this.changeDeviceDef(); //按设备规格查询设备产品（新增设备时，设备规格改变才触发）
                        }
                    }
                },
                created() {
                    this.changeElementUILocale(HttpUtils.getLocale());
                    // Translation: set lang
                    this.lang = i18n.messages[i18n.locale] || i18n.messages["en-US"];
                    this.uploadData.downUrl = this.lang.downUrl || '/u-route/baas/bulk/v1.0/template/xlsx?template=Device_deviceDataImport';
                    // Translation: Device rules
                    this.device.rules = {
                        externalCode: [{
                                required: true,
                                message: this.lang.addEditDialog.externalEncodingPlaceholder,
                                trigger: 'blur'
                            },
                            {
                                min: 0,
                                max: 255,
                                message: this.lang.rules.lengthErrorMessage,
                                trigger: 'blur'
                            }
                        ],
                        deviceName: [{
                                required: true,
                                message: this.lang.addEditDialog.deviceNamePlaceholder,
                                trigger: 'blur'
                            },
                            {
                                min: 0,
                                max: 255,
                                message: this.lang.rules.lengthErrorMessage,
                                trigger: 'blur'
                            }
                        ],
                        deviceDefName: [{
                            required: true,
                            message: this.lang.addEditDialog.equipmentSpecsPlaceholder,
                            trigger: 'change'
                        }]
                    };
                    // Translation: deviceStatusData.foot.text
                    this.deviceStatusData.foot.text = this.lang.deviceStatusDataFootText;
                    // （初始化）读取SessionStorage中的空间数据作为条件
                    if (sessionStorage.getItem('currentSpaceData')) {
                        let currentSpaceData = JSON.parse(sessionStorage.getItem('currentSpaceData')).spaceInfo[0];
                        let addressPathArray = [];
                        this.condition.spaceInPath = currentSpaceData.id;
                        this.currentSpace = currentSpaceData;
                        if (currentSpaceData.path && currentSpaceData.path.length > 0) {
                            currentSpaceData.path.forEach(function (m, index) {
                                addressPathArray.push(m.spaceName);
                            });
                            this.condition.spaceInPathLabel = addressPathArray.join('/') + '/' + currentSpaceData.spaceName;
                            this.currentSpace.spaceInPathLabel = this.condition.spaceInPathLabel; //补充空间节点名称，便于clear事件中回显
                        } else { //只选择更节点时，按根节点进行查询【修复bug】
                            this.condition.spaceInPathLabel = currentSpaceData.spaceName;
                            this.currentSpace.spaceInPathLabel = currentSpaceData.spaceName;
                        }
                    }
                    if (Studio.inReader) {
                        this.queryDeviceChannel(); //查询设备规格
                        if (sessionStorage.getItem('currentSpaceData')) {
                            if (this.currentSpace.id) {
                                this.condition.spacePathList.push(this.currentSpace.id);
                                this.space.condition.spacePathList.push( this.currentSpace.id);
                                 this.space.condition.spacePathListInit.push(this.currentSpace.id);
                                this.queryCurrentSpaceTree(this.currentSpace.id); //查询当前节点对的空间树信息
                            }
                        }
                    }
                    this.queryDeviceStatusCount(); //查询设备各状态的数量
                    this.querySysParams(); //查询系统参数
                    this.queryCurrentDeviceTree(); //查询设备规格树
                },
                mounted() {
                    // Translation: Change all ElementIU components language.
                    this.changeElementUILocale(HttpUtils.getLocale());

                    //初始化开发态样式
                    this.setDevStyle();
                    this.drawCancas(this.deviceStatusData); //初始化仪表盘
                    this.queryDevicesList(); //查询设备列表
                },
                computed: {
                    dynamicAttrCount: function () {
                        let count = this.device.deviceAttribute.filter(function (e) {
                            return e.attrType == 'DYNAMIC' && e.valueType != '1'
                        }).length;
                        let valueTypeAttr = this.device.deviceAttribute.filter(function (e) {
                            return e.attrType == 'DYNAMIC' && e.valueType == '1'
                        });
                        valueTypeAttr.forEach(function (e) {
                            count += e.valueTypeList.length;
                        });
                        return count;
                    }
                },
                methods: {
                    //响应同步按钮
                    SynchronousEquipment() {
                        var _this = this;
                        _this.querySpaceData();
                        console.log("_this.currentSpace.id",_this.currentSpace.id)
                        let param = {
                            'body': {
                                "ID": "huamao__io.huamao.longten",
                                "APPKEY": "/9v2si7l+ra2ig8eGsLTKw==",
                                "token": "3b5656a50ff2060467326bc44283e2cb",
                                "project": "8866675"
                            }
                        }
                        thisObj.callAPIConn('/hm_bigScreen__hm/0.1.0/Device/SyncDevice_LT', param, 'POST', res => {
                            console.log("res",res)
                            if (res != null && res.resp.code == 0){
                                _this.queryDevicesList()
                            }
                            // Vue.prototype.$message({
                            //     message: '同步成功！',
                            //     type: 'success'
                            // });
                            _this.$message({ showClose: true, message: _this.lang.syncSuccess, type: 'success', customClass: 'hw-message' });
                        })
                    },


                    // Translation: Change all ElementIU components language.
                    renderHeader(h, {
                        column,
                        $index
                    }, tableTitle) {
                        return h(
                            'el-tooltip', {
                                props: {
                                    content: tableTitle,
                                    placement: 'bottom',
                                },
                                domProps: {
                                    innerHTML: tableTitle
                                }
                            }, [h('span')]
                        )
                    },
                    changeElementUILocale(locale) {
                        switch (locale) {
                            case "en-US":
                                ELEMENT.locale(ELEMENT.lang.en);
                                break;
                            case "zh-CN":
                                ELEMENT.locale(ELEMENT.lang.zhCN);
                                break;
                            default:
                                ELEMENT.locale({
                                    "el": this.lang.el != undefined ? this.lang.el : ELEMENT.lang.en
                                });
                                break;
                        }
                    },
                    setDevStyle() {
                        if (!Studio.inReader) {
                            $('.el-col-12').css('width', '47%');
                            $('.el-input--suffix .el-input__inner').css('padding-right', '0px');
                            $('.el-col-6').css('width', '22%');
                            $('.el-input').css('width', '95%');
                            $('#DeviceManage .deviceManage-area').css('width', '40rem');
                        }
                    },
                    openDeviceFacility: function (row) {
                        if (row.status == 'DELETED' || row.status == 'UNREG') {
                            return;
                        }
                        thisObj.triggerEvent("deviceFacility", {
                            deviceId: row.id,
                            deviceCode: row.code,
                            type:'DYNAMIC'
                        }); //进入设施画像页面
                    },
                    locateFlashMarker: function (row) {
                        this.selectCameras.isShowDistance = false;
                        //this.selectCameras.deviceCameraData = row;
                        if (row) {
                            thisObj.triggerEvent("locateMarker", {
                                id: row.id
                            });
                        }
                        //this.selectCameras.classMode=this.selectCameras.defaultclassMode;
                        if (this.selectCameras.isUseDefaultZoom) {
                            this.selectCameras.isUseDefaultZoom = false;
                            thisObj.triggerEvent('modifyMapConfig', {
                                zoom: this.selectCameras.defaultLevel
                            });
                        }
                        if (this.selectCameras.circleids.length > 0 || this.selectCameras.camerasIds.length > 0) {
                            let idAll = [];
                            this.selectCameras.circleids.forEach(v => {
                                idAll.push(v);
                            })
                            this.selectCameras.camerasIds.forEach(v1 => {
                                idAll.push(v1);
                            })
                            this.selectCameras.camerasIds = [];
                            this.selectCameras.circleids = []; //清除地图上所有的摄像头
                            thisObj.triggerEvent('clear-cameras', {
                                overlayIds: idAll,
                                overlayTypes: ["circle", "InfoWindow"]
                            });
                        }
                    },
                    queryDeviceByCondition: function (flag) {
                        this.deviceList.pageNum = 1;
                        this.deviceList.pageSize = 10;
                        if (flag == 'space') {
                            this.condition.spaceInPath = '';
                            this.condition.spaceInPathLabel = '';
                            if (this.currentSpace.id) {
                                this.condition.spaceInPath = this.currentSpace.id;
                                this.condition.spaceInPathLabel = this.currentSpace.spaceInPathLabel;
                            }
                        }
                        if (flag == 'deviceDef') {
                            this.condition.defId = '';
                            this.condition.defIdLabel = '';
                        }
                        this.queryDevicesList();
                    },
                    handleCommand: function (command) { //处理表格行中下拉菜单的操作
                        var _this = this;
                        var deviceMsg = null;
                        if (!command) {
                            return;
                        }
                        switch (command.type) {
                            case 'qrCode':
                                _this.qrCode(command.row); // 显示设备二维码
                                break;
                            case 'AttributeDef':
                                _this.viewDeviceAttribute(command.row); // 显示设备属性信息
                                break;
                            case 'DeviceModelCnet':
                                _this.viewDeviceModelBACnet(command.row); // 显示物模型绑点信息
                                break;
                            case 'ACTIVE':
                                deviceMsg = {
                                    url: '/Device/0.1.0/enableDevice/' + command.row.id,
                                    method: 'POST'
                                };
                                break;
                            case 'INACTIVE':
                                deviceMsg = {
                                    url: '/Device/0.1.0/disableDevice/' + command.row.id,
                                    method: 'POST'
                                };
                                break;
                            case 'DELETED':
                                deviceMsg = {
                                    url: '/Device/0.1.0/discardDevice/' + command.row.id,
                                    method: 'POST'
                                };
                                _this.getDeviceRelation(command.row);
                                break;
                            case 'DEL':
                                deviceMsg = {
                                    url: '/Device/0.1.0/Device/' + command.row.id,
                                    method: 'DELETE'
                                };
                                break;
                            case 'AddToIOT':
                                deviceMsg = {
                                    url: '/SmartCampus__FacilityManagement/0.1.0/Device/IOT/add',
                                    params: {
                                        id: command.row.id
                                    },
                                    type: 'AddToIOT',
                                    method: 'POST'
                                };
                                break;
                            case 'UpdateToIOT':
                                deviceMsg = {
                                    url: '/SmartCampus__FacilityManagement/0.1.0/Device/IOT/update/' + command.row.id,
                                    params: {},
                                    method: 'PUT'
                                };
                                break;
                            case 'DeleteFromIOT':
                                deviceMsg = {
                                    url: '/SmartCampus__FacilityManagement/0.1.0/Device/IOT/delete/' + command.row.id,
                                    params: {},
                                    method: 'DELETE'
                                };
                                break;
                            case 'RELATED': {
                                _this.deviceRelation.newIcon = false;
                                _this.buttonSaveLoading = false;
                                _this.deviceRelation.currentData = [];
                                _this.deviceRelation.pageNum = 1;
                                _this.deviceRelation.currentDevice = command.row;
                                _this.deviceRelation.currentData.push(_this.deviceRelation.currentDevice);
                                _this.getDeviceRelation(command.row); //显示关联设备
                                console.log("HANDLE COMMAND DENEME1:", command.row);
                                _this.deviceRelation.showDeviceRelation = true;
                            }
                            break;
                        case 'COLLECT': {
                            $.each(_this.deviceList.dataList || [], function (i, device) {
                                Vue.set(device, 'isCollecting', false);
                            });
                            Vue.set(command.row, 'isCollecting', true);
                            //控制鼠标效果
                            var cursorCss = "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAA8NJREFUWAm9l0tsTGEUgM+5M6NTVLUi2hLqkdiwICIWEgsLOwlJJ1phYyEiHisRG62wEMI0HgtEJSQoTaoWQixkECHpph4pOqMSRAUTOuY99zj/Hf/M/L2PeeEu5r//+c/ju+ec+99/kC4tDEAtREF3HcH2Nw/hP18ahDN3KEXr9HoK6P2LftL1BTepd8HS/8WBdGrxfEjHQzTTBdToMuIiAkEMwpjUB6DG04Ubhkf/FRAKx+RvfQJEq2iWG2i6psRiBYbRxzAJvQxzCDcOf1MUqpxIgN0M0C18WUHIGEgME4f3nJnL0Bg5iuvGfsm1SscswJnWJkjSR3ZiPD41cTnqs+Wwc4wZ0iEBb1CH89C2rBvxRsZO10luAAgF8s+7z8+3VipTM5djmloOuTZxZJgMxGkI03Qa20MXJ647zQsA5m8D0i/klHnFgKgrDULaYQpSDPOMoY5jR7Bfyu3GPMDZpQ2QGP/MYScVKlMLZ6JMCGmPKYpjQg9Axn3Ybo/JAQgjfhtucTOulw6MUWRCQEwtLxOKD55gAiKY0u+xt070hZ7LdRWgu3UT6HRVLuZGATGbIaZUByH8ZfcYCnN2bsMkT6c7F0TceGcMQPSreLWmKHJiw4/c5HMYZHJ1EESA4MVG8MAWjKQzijfcPhhlxAEluJwIyw9pwCjTVHGJvQQj+mOMpWdj+8g2BcDwq6G5BDKgkYlURRAi9Qw/gjFtpeYLrkbfKDc8gFoCIWmafBc+RcK8JzSIqenSRTlSXA4PUK3SQiZVKcAEfccY7MCOkV4pk6MpA+h7meTgfVLBchQQohxx53LwxpTQflCntmFkhlVw4dsEYAR0u+3LIIn0Pz2RMEOgThltPHMFW+rruM5d0sRqtMwhMTT4ez6wQbOVkSLjR6C5XI4a5PbmTv1FjzBV24YdL8YUPZuJJYDQpZOtfv7dY2Onil0cusn1mp1tRl9wUF10nlmXQNggFC+D9K3TJwxPX15ucGFuC4B7R5/yekjGcBxRO2jsIY5K1ou2AIY6ateszQqkCK+geUVPgaSs22IAxcugafvRV9lhRJDaNqF8DD6oPOd9YYmcKyNigEu1RpGVOXHOQNaZUxb2lRnPpF4cwOW1A7j5p1FNTssRFAXAXa/f8RdSvBH5C/ngpbkO5AWV3xUFMFxP3BOIzuGe0NvKw+YtSwNww3U24U+QuHAcvO5D2fvqf0sCwJ3Gt/uBEU7DY7gj+KX60FkPJQFkA2tXuRc+Q0Pdib8VXPgxH0jsvHum9vGxPY1bh6r+O1YY4jd1R0zWeebHGAAAAABJRU5ErkJggg==),auto";
                            $('.ec-extension-gismap').css('cursor', cursorCss);
                            $('.ol-viewport').css('cursor', cursorCss);
                            //console.log("光标改成设备");
                            $('.leaflet-interactive').css('cursor', cursorCss);
                            $('.leaflet-zoom-animated').css('cursor', cursorCss);
                            $('#map').css('cursor', cursorCss);
                        }
                        break;
                        case 'STOPC': {
                            Vue.set(command.row, 'isCollecting', false);
                            //控制鼠标效果
                            $('.ec-extension-gismap').css('cursor', 'inherit');
                            $('.ol-viewport').css('cursor', 'inherit');
                            $('.leaflet-zoom-animated').css('cursor', 'inherit');
                            $('#map').css('cursor', 'inherit');
                            //console.log("光标改成inherit");
                            $('.leaflet-interactive').css('cursor', 'pointer');
                        }
                        break;
                        default:
                            break;
                        }
                        if (deviceMsg && deviceMsg.url) {
                            if (command.type == 'DEL') {
                                var alarmCount = 0;
                                var deleteStr = '';
                                //删除设备时查询设备是否有告警
                                let queryAlarmParam = {
                                    start: 0,
                                    limit: 5000,
                                    condition: {
                                        fromDevice: {
                                            value: command.row.id,
                                            operator: "="
                                        }
                                    }
                                }
                                thisObj.callAPIConn('/Alarm/0.1.0/Alarm/query', queryAlarmParam, 'POST', vm => {
                                    if (vm && vm.resp && vm.resp.code == '0') {
                                        if (vm.data[0]) {
                                            let data = vm.data[0];
                                            alarmCount = data.count;
                                            deleteStr = alarmCount > 0 ? _this.lang.other.deleteAllAlarms : _this.lang.other.isDeviceInstance
                                            _this.$confirm(_this.lang.other.deleteConfirm + " <span title = " + _this.htmlEncode(command.row.deviceName) + " > " + _this.htmlEncode(command.row.deviceName) + "  </span> " + deleteStr + "<br/>(" + _this.lang.other.canNotBeRecoverable + ")", _this.lang.warning, {
                                                confirmButtonText: _this.lang.confirmButtonText, //'确定',
                                                cancelButtonText: _this.lang.cancelButtonText, //'取消',
                                                dangerouslyUseHTMLString: true,
                                                type: 'warning',
                                                customClass: 'hw-messagebox'
                                            }).then(function () {
                                                _this.changeDeviceStatus(deviceMsg);
                                            }).catch(function () {});
                                        }
                                    }
                                })

                            } else if (command.type == 'AddToIOT' || command.type == 'UpdateToIOT' || command.type == 'DeleteFromIOT') {
                                _this.handelDeviceIOT(deviceMsg);
                            } else {
                                if (command.type == 'DELETED') {
                                    _this.$confirm(_this.lang.other.deprecated + " <span title = " + _this.htmlEncode(command.row.deviceName) + " > " + _this.htmlEncode(command.row.deviceName) + "  </span> " + _this.lang.other.isDeviceInstance + "<br/>(" + _this.lang.other.canNotBeRecoverableDeprecated + ")", '提示', {
                                        confirmButtonText: _this.lang.confirmButtonText, // '确定',
                                        cancelButtonText: _this.lang.cancelButtonText, //'取消',
                                        dangerouslyUseHTMLString: true,
                                        type: 'warning',
                                        customClass: 'hw-messagebox'
                                    }).then(function () {
                                        //如果该设备存在设备关系则需要删除后再删除设备
                                        if ((_this.deviceRelation.dataList && _this.deviceRelation.dataList.length > 0) || _this.deviceRelation.total > 0) {
                                            _this.$alert(_this.lang.other.alreadyAssociated, _this.lang.error, {
                                                confirmButtonText: _this.lang.confirmButtonText, //'确定',
                                                type: 'error',
                                                customClass: 'hw-messagebox',
                                                callback: function () {}
                                            });
                                        } else {
                                            _this.changeDeviceStatus(deviceMsg);
                                        }
                                    }).catch(function () {});
                                } else {
                                    _this.changeDeviceStatus(deviceMsg);
                                }
                            }
                        }
                    },
                    htmlEncode: function (str) {
                        var encodeStr = "";
                        if (str.length == 0) return "";
                        encodeStr = str.replace(/&/g, "&amp;");
                        encodeStr = encodeStr.replace(/</g, "&lt;");
                        encodeStr = encodeStr.replace(/>/g, "&gt;");
                        encodeStr = encodeStr.replace(/ /g, "&nbsp;");
                        encodeStr = encodeStr.replace(/\'/g, "&#39;");
                        encodeStr = encodeStr.replace(/\"/g, "&quot;");
                        return encodeStr;
                    },
                    handelDeviceIOT: function (deviceMsg) {
                        var _this = this;
                        thisObj.callAPIConn(deviceMsg.url, deviceMsg.params, deviceMsg.method, function (vm) {
                            if (vm && vm.resp && vm.resp.code == '0') {
                                if (deviceMsg.type == 'AddToIOT') {
                                    _this.queryDevicesList(); //更新设备列表数据（由于）
                                }
                                _this.$message({
                                    showClose: true,
                                    message: _this.lang.operationSuccess,
                                    type: 'success',
                                    customClass: 'hw-message'
                                });
                            }
                        })
                    },
                    changeDeviceStatus: function (deviceMsg) {
                        var _this = this;
                        thisObj.callAPIConn(deviceMsg.url, {}, deviceMsg.method, function (vm) {
                            if (vm && vm.resp && vm.resp.code == '0') {
                                if (vm.data[0]) {
                                    _this.$message({
                                        showClose: true,
                                        message: _this.lang.operationSuccess,
                                        type: 'success',
                                        customClass: 'hw-message'
                                    });
                                    _this.queryDeviceStatusCount(); //查询设备各状态的数量
                                    //【只有删除非第一页的最后一条时才查上一页】删除最后一页的最后一条数据时，删完后查询上一页，避免当前页显示为空的情况,并且只有DELETED状态下查询上一页
                                    if (deviceMsg.method == 'DELETE' && _this.deviceList.pageNum > 1 && _this.deviceList.dataList.length == 1 && _this.deviceList.dataList[0].status == "DELETED") {
                                        _this.deviceList.pageNum -= 1;
                                    }
                                    _this.queryDevicesList(); //更新设备列表数据
                                }
                            }
                        })
                    },
                    handleCurrentChange: function (val) {
                        this.selectCameras.isShowDistance = false;
                        this.deviceList.pageNum = val;
                        this.queryDevicesList();
                    },
                    handleSizeChange: function (val) {
                        this.selectCameras.isShowDistance = false;
                        this.deviceList.pageNum = 1;
                        this.deviceList.pageSize = val;
                        this.queryDevicesList();
                    },
                    /*********************设置设备关联关系--start **************************/
                    closeDeviceRelationDialog: function () {
                        this.buttonSaveLoading = false;
                    },
                    closeRelationTypeDialog: function () {
                        this.buttonSaveLoading = true;
                        this.deviceRelation.newIcon = false;
                    },
                    actionIcon(num) {
                        var _this = this;
                        _this.buttonSaveLoading = false;
                        _this.deviceRelation.triggerClick = true;
                        _this.deviceRelation.relatedDeviceDisable = false;
                        if (num == 1) {
                            _this.deviceRelation.selectedData = "";
                            _this.deviceRelation.selectedType = "";
                            _this.deviceRelation.updateData = "";
                            _this.deviceRelation.disable = false;
                            _this.deviceRelation.newIcon = true;
                        }
                        //获取设备信息和关系类型信息
                        _this.getRelationType();
                        _this.openDeviceSelectDialog();
                    },
                    deleteDeviceRelation(val) {
                        var _this = this;
                        _this.$confirm(_this.lang.other.deviceRelationDeleteMessage, _this.lang.warning, {
                            confirmButtonText: _this.lang.confirmButtonText, //'确定',
                            cancelButtonText: _this.lang.cancelButtonText, //'取消',
                            customClass: 'hw-messagebox',
                            dangerouslyUseHTMLString: true,
                            type: 'warning'
                        }).then(function () {
                            let relationObj = {
                                "relatedDeviceCode": val.relatedDevice.name,
                                "relationTypeCode": val.type.name,
                                "sourceDeviceCode": _this.deviceRelation.currentDevice.code
                            };
                            let deviceRelation = [];
                            deviceRelation.push(relationObj);
                            let params = {
                                "deviceRelation": deviceRelation
                            }
                            thisObj.callAPIConn("/Device/0.1.0/DeviceRelation", params, 'DELETE', function (vm) {
                                if (vm && vm.resp && vm.resp.code == '0') {
                                    _this.$message({
                                        showClose: true,
                                        message: _this.lang.operationSuccess,
                                        type: 'success',
                                        customClass: 'hw-message'
                                    });
                                    _this.deviceRelation.pageNum = 1;
                                    _this.getDeviceRelation(_this.deviceRelation.currentDevice);
                                    console.log("DELETE DEVICE RELATION DENEME2:", _this.deviceRelation.currentDevice);
                                }
                            });
                        }).catch(function () {});
                    },
                    openDeviceSelectDialog: function () {
                        var _this = this;
                        _this.deviceSelect.pageNum = 1;
                        _this.deviceSelect.pageSize = 10;
                        _this.deviceSelect.condition.externalCode = "";
                        _this.deviceSelect.condition.deviceName = "";
                        _this.getDevicesList4Relation();
                    },
                    querySelectDeviceByCondition: function (flag) {
                        this.deviceSelect.pageNum = 1;
                        this.deviceSelect.pageSize = 10;
                        this.getDevicesList4Relation();
                    },
                    saveDeviceRelation() {
                        var _this = this;
                        let selectedCode = _this.deviceRelation.selectedDeviceCode ? _this.deviceRelation.selectedDeviceCode : _this.deviceRelation.selectedData;
                        if (!selectedCode || !_this.deviceRelation.selectedType) {
                            _this.$alert(_this.lang.other.associatedDeviceCanNotBeEmpty, _this.lang.error, {
                                confirmButtonText: _this.lang.confirmButtonText, //'确定',
                                type: 'error',
                                customClass: 'hw-messagebox',
                                callback: function () {}
                            });
                            return;
                        }
                        if (_this.deviceRelation.currentDevice.code == selectedCode) {
                            _this.$alert(_this.lang.other.associationCanNotEstablished, _this.lang.error, {
                                confirmButtonText: _this.lang.confirmButtonText, //'确定',
                                type: 'error',
                                customClass: 'hw-messagebox',
                                callback: function () {}
                            });
                            _this.deviceRelation.newIcon = false;
                            $('#changgeIcon').click();
                            return;
                        }
                        let params1 = {
                            start: 0,
                            limit: 10,
                            condition: {
                                deviceCode: {
                                    value: _this.deviceRelation.currentDevice.code,
                                    operator: "="
                                },
                                relationTypeCode: {
                                    value: "CAMERA_RELATION",
                                    operator: "="
                                }
                            }
                        };
                        thisObj.callAPIConn('/Device/0.1.0/DeviceRelation/query', params1, 'POST', vm => {
                            if (_this.deviceRelation.selectedType != "CAMERA_RELATION") {
                                _this.actionDeviceRelation();
                            } else if (_this.deviceRelation.selectedType == "CAMERA_RELATION" && (!vm.data[0].count || vm.data[0].count < 4)) { //最多绑定4个摄像头
                                let otherdeviceCode = "";
                                if (_this.deviceRelation.updateData && _this.deviceRelation.updateData.relatedDevice && _this.deviceRelation.updateData.relatedDevice.deviceName == _this.deviceRelation.selectedData) {
                                    otherdeviceCode = _this.deviceRelation.updateData.relatedDevice.name;
                                } else {
                                    otherdeviceCode = selectedCode;
                                }
                                let params11 = {
                                    start: 0,
                                    limit: 10,
                                    condition: {
                                        deviceCode: {
                                            value: otherdeviceCode,
                                            operator: "="
                                        },
                                        relationTypeCode: {
                                            value: "CAMERA_RELATION",
                                            operator: "="
                                        }
                                    }
                                };
                                console.log("params11", params11)
                                thisObj.callAPIConn('/Device/0.1.0/DeviceRelation/query', params11, 'POST', det => {
                                    if (!det.data[0].count || det.data[0].count < 4) {
                                        _this.actionDeviceRelation();
                                    } else {
                                        _this.$alert(_this.lang.other.associatedMaximum, _this.lang.error, {
                                            confirmButtonText: _this.lang.confirmButtonText, //'确定',
                                            type: 'error',
                                            customClass: 'hw-messagebox',
                                            callback: function () {}
                                        });
                                        return;
                                    }
                                });
                            } else {
                                _this.$alert(_this.lang.other.associatedMaximum, _this.lang.error, {
                                    confirmButtonText: _this.lang.confirmButtonText, //'确定',
                                    type: 'error',
                                    customClass: 'hw-messagebox',
                                    callback: function () {}
                                });
                                return;
                            }
                        })
                    },
                    actionDeviceRelation() {
                        var _this = this;
                        let selectedCode = _this.deviceRelation.selectedDeviceCode ? _this.deviceRelation.selectedDeviceCode : _this.deviceRelation.selectedData;
                        let deviceRelation = {};
                        let deviceRelations = [];
                        let actionUrl = "";
                        if (_this.deviceRelation.updateData) {
                            console.log("update", _this.deviceRelation.updateData)
                            //更新
                            deviceRelation = {
                                relatedDeviceCode: _this.deviceRelation.currentDevice.code,
                                sourceDeviceCode: selectedCode == _this.deviceRelation.updateData.relatedDevice.deviceName ? _this.deviceRelation.updateData.relatedDevice.name : selectedCode,
                                relationTypeCode: _this.deviceRelation.selectedType == _this.deviceRelation.updateData.type.relationName ? _this.deviceRelation.updateData.type.name : _this.deviceRelation.selectedType,
                            }
                            actionUrl = "/Device/0.1.0/DeviceRelation/update";
                        } else {

                            deviceRelation = {
                                sourceDeviceCode: _this.deviceRelation.currentDevice.code,
                                relatedDeviceCode: selectedCode,
                                relationTypeCode: _this.deviceRelation.selectedType
                            }
                            actionUrl = "/Device/0.1.0/DeviceRelation/create";
                        }
                        deviceRelations.push(deviceRelation);
                        let params = {
                            deviceRelation: deviceRelations
                        };
                        this.buttonSaveLoading = true;
                        thisObj.callAPIConn(actionUrl, params, 'POST', function (vm) {
                            if (vm && vm.resp && vm.resp.code == '0') {
                                if (vm.data[0].ids) {
                                    _this.closeRelationTypeDialog();
                                    _this.deviceRelation.pageNum = 1;
                                    _this.getDeviceRelation(_this.deviceRelation.currentDevice);
                                    console.log("ACTION DEVICE RELATION DENEME3:", _this.deviceRelation.currentDevice);
                                } else {
                                    _this.$alert(_this.lang.other.alreadyAssociatedSelectAgain, _this.lang.error, {
                                        confirmButtonText: _this.lang.confirmButtonText, //'确定',
                                        type: 'error',
                                        customClass: 'hw-messagebox',
                                        callback: function () {}
                                    });
                                    _this.deviceRelation.newIcon = false;
                                    $('#changgeIcon').click();
                                }
                            } else {
                                _this.$alert(vm.resMsg, _this.lang.error, {
                                    type: 'error',
                                    customClass: 'hw-messagebox',
                                    confirmButtonText: _this.lang.confirmButtonText, //'确定',
                                    callback: action => {}
                                });
                            }
                        });
                    },
                    associatedDeviceOpen: function () {
                        if (this.deviceRelation.triggerClick) {
                            this.associatedDevice = true;
                        }
                    },
                    closeAssociatedDialog: function () {
                        this.associatedDevice = false;
                        this.deviceSelect.currentRow = {};
                        this.deviceRelation.selectedData = "";
                        this.deviceRelation.selectedDeviceCode = "";
                    },
                    saveAssociateDevice: function () {
                        this.associatedDevice = false;
                    },
                    handleCurrentDeviceChange: function (val) {
                        this.deviceSelect.pageNum = val;
                        this.getDevicesList4Relation();
                    },
                    editDeviceRelation: function (val) {
                        this.deviceRelation.selectedDeviceCode = "";
                        this.deviceRelation.updateData = val;
                        this.buttonSaveLoading = false;
                        this.deviceRelation.disable = true;
                        this.deviceRelation.newIcon = true;
                        this.deviceRelation.triggerClick = false;
                        this.deviceRelation.relatedDeviceDisable = true;
                        //获取设备信息和关系类型信息
                        this.getRelationType();
                        this.openDeviceSelectDialog();
                        this.deviceRelation.selectedData = val.relatedDevice.deviceName;
                        this.deviceRelation.selectedType = val.type.relationName;
                    },
                    handleSizeDeviceChange: function (val) {
                        this.deviceSelect.pageNum = 1;
                        this.deviceSelect.pageSize = val;
                        this.getDevicesList4Relation();
                    },
                    handleDeviceSelectChange: function (row) {
                        if (!row) {
                            this.deviceSelect.currentRow = {};
                        } else {
                            this.deviceSelect.currentRow = row;
                            this.deviceRelation.selectedData = row.deviceName;
                            this.deviceRelation.selectedDeviceCode = row.code;
                        }
                    },
                    getDevicesList4Relation: function () {
                        var _this = this;
                        var params = {
                            start: (_this.deviceSelect.pageNum - 1) * _this.deviceSelect.pageSize,
                            limit: _this.deviceSelect.pageSize,
                            condition: {}
                        };
                        //当数据量达到10万 减少显示页面的数据 DTS2019081513032
                        if (_this.deviceSelect.pageNum > 10000) {
                            _this.pageCount = "3";
                            $('.el-pagination .el-pager li').css('min-width', '48px');
                        } else {
                            _this.pageCount = "4";
                            $('.el-pagination .el-pager li').css('min-width', '35.5px');
                        }
                        if (_this.deviceSelect.condition.externalCode) {
                            params.condition.externalCode = {
                                value: _this.deviceSelect.condition.externalCode,
                                operator: '='
                            }
                        }
                        if (_this.deviceSelect.condition.deviceName) {
                            params.condition.deviceName = {
                                value: _this.deviceSelect.condition.deviceName,
                                operator: 'like'
                            }
                        }
                        params.condition.status = {
                            valueList: ['ACTIVE', 'INACTIVE'],
                            operator: 'in'
                        }
                        params.querySchema = {
                            devices: {
                                deviceDef: {}
                            },
                            count: true
                        };
                        params.condition.spaceInPath = this.currentSpace.id;
                        _this.deviceSelect.loading = true;
                        thisObj.callAPIConn("/SmartCampus__FacilityManagement/0.1.0/Device/queryDevice", params, 'POST', function (vm) {
                            if (vm && vm.resp && vm.resp.code == '0') {
                                if (vm.data[0]) {
                                    _this.deviceSelect.loading = false;
                                    const data = vm.data[0];
                                    _this.deviceSelect.total = data.count;
                                    _this.deviceSelect.dataList = data.devices;
                                    console.log("_this.deviceSelect.dataList", _this.deviceSelect.dataList);
                                }
                            }
                        })
                    },
                    getRelationType() {
                        var _this = this;
                        let condition = {};
                        var params = {
                            start: 0,
                            limit: 5000,
                            condition: condition
                        };
                        //先写死 只做邻接模式
                        params.condition.relationMode = {
                            value: "ADJACENT",
                            operator: '='
                        }
                        _this.deviceRelation.loading = true;
                        thisObj.callAPIConn('/Device/0.1.0/queryDeviceRelationType', params, 'POST', vm => {
                            if (vm && vm.resp && vm.resp.code == "0") {
                                if (vm.data[0].count > 0) {
                                    let typeList = [];
                                    vm.data[0].relationType.forEach(v => {
                                        typeList.push({
                                            "code": v.code,
                                            "relationName": v.relationName
                                        })
                                    })
                                    _this.deviceRelation.typeList = typeList;
                                }
                            }
                        });
                    },
                    getDeviceRelation(deviceInfo) {
                        //获取设备关联关系
                        console.log("GET DEVICE RELATION DENEME4:", deviceInfo);
                        var _this = this;
                        let condition = {};
                        var params = {
                            start: (_this.deviceRelation.pageNum - 1) * _this.deviceRelation.pageSize,
                            limit: _this.deviceRelation.pageSize,
                            condition: condition
                        };
                        if (deviceInfo.code) {
                            params.condition.deviceCode = {
                                value: deviceInfo.code,
                                operator: '='
                            }
                        }
                        _this.deviceRelation.loading = true;
                        thisObj.callAPIConn('/Device/0.1.0/DeviceRelation/query', params, 'POST', vm => {
                            console.log("查询设备关系：", vm);
                            if (vm && vm.resp.code == '0') {
                                if (vm.data[0].count > 0) {
                                    vm.data[0].deviceRelation.map(v => {
                                        v.createDate = v.createDate.substr(0, 10)
                                    })
                                    _this.deviceRelation.dataList = vm.data[0].deviceRelation;
                                    _this.deviceRelation.total = vm.data[0].count;
                                } else {
                                    _this.deviceRelation.dataList = null;
                                    _this.deviceRelation.total = 0;
                                }
                                _this.deviceRelation.loading = false;
                                //_this.deviceRelation.showDeviceRelation = true;
                            }
                        });
                    },
                    /*********************设置设备关联关系--END**************************/
                    /*********************添加关联摄像头--Start**************************/
                    searchCameras: function (index) {
                        let _this = this;
                        if (this.selectCameras.circleids || this.selectCameras.camerasIds) {
                            let idAll = [];
                            this.selectCameras.circleids.forEach(v => {
                                idAll.push(v);
                            })
                            this.selectCameras.camerasIds.forEach(v1 => {
                                idAll.push(v1);
                            })
                            this.selectCameras.circleids = [];
                            this.selectCameras.camerasIds = [];
                            //清除地图上所有的摄像头
                            thisObj.triggerEvent('clear-cameras', {
                                overlayIds: idAll,
                                overlayTypes: ["circle", "InfoWindow"]
                            });
                        }
                        let deviceSpace = "";
                        if (this.selectCameras.deviceCameraData && this.selectCameras.deviceCameraData.deviceLocation) {
                            deviceSpace = this.selectCameras.deviceCameraData.deviceLocation;
                        }
                        if (deviceSpace && deviceSpace.coordinate) {
                            let coordinates = deviceSpace.coordinate.split(',');
                            if (Array.isArray(coordinates) && coordinates.length > 2) {
                                this.selectCameras.queryParam.longitude = coordinates[0];
                                this.selectCameras.queryParam.latitude = coordinates[1];
                                this.selectCameras.queryParam.selectdata = this.selectCameras.rangedata[index];
                            }
                            this.addCircleRange(index);
                            this.setNearbyCameraInfo();
                            this.modifyMapConfig(index);
                        } else if (deviceSpace && deviceSpace.spaceData && deviceSpace.spaceData.longitude && deviceSpace.spaceData.latitude) {
                            this.selectCameras.queryParam.longitude = deviceSpace.spaceData.longitude;
                            this.selectCameras.queryParam.latitude = deviceSpace.spaceData.latitude;
                            this.selectCameras.queryParam.selectdata = this.selectCameras.rangedata[index];
                            this.addCircleRange(index);
                            this.setNearbyCameraInfo();
                            this.modifyMapConfig(index);
                        } else {
                            this.$alert(_this.lang.other.setLocationInformation, _this.lang.prompt, {
                                confirmButtonText: _this.lang.confirmButtonText, //'确定',
                                type: 'error',
                                customClass: 'hw-messagebox',
                                callback: function () {}
                            });
                        }
                    },
                    modifyMapConfig(index) {
                        this.selectCameras.isUseDefaultZoom = true;
                        let longitude = "";
                        let latitude = "";
                        if (sessionStorage.getItem('currentSpaceData')) {
                            let currentSpaceData = JSON.parse(sessionStorage.getItem('currentSpaceData')).spaceInfo[0];
                            longitude = currentSpaceData.longitude;
                            latitude = currentSpaceData.latitude;
                        }
                        thisObj.triggerEvent('modifyMapConfig', {
                            center: [this.selectCameras.queryParam.longitude ? this.selectCameras.queryParam.longitude : longitude,
                                this.selectCameras.queryParam.latitude ? this.selectCameras.queryParam.latitude : latitude],
                            zoom: this.selectCameras.zoomLevel[index]
                        });
                        
                    },
                    addCircleRange(index) {
                        let longitude = "";
                        let latitude = "";
                        if (sessionStorage.getItem('currentSpaceData')) {
                            let currentSpaceData = JSON.parse(sessionStorage.getItem('currentSpaceData')).spaceInfo[0];
                            longitude = currentSpaceData.longitude;
                            latitude = currentSpaceData.latitude;
                        }
                        //修改样式
                        this.selectCameras.classMode = [false, false, false, false, false];
                        this.selectCameras.classMode[index] = true;
                        var rangeParams = {
                            append: true,
                            geometrys: []
                        }
                        let circleId = this.selectCameras.deviceCameraData.id + this.selectCameras.rangedata[index];
                        let geometry = {
                            geometryId: circleId,
                            type: 'circle',
                            radius: Number(this.selectCameras.rangedata[index]),
                            centerPoint: [this.selectCameras.queryParam.longitude?this.selectCameras.queryParam.longitude:longitude,
                                this.selectCameras.queryParam.latitude?this.selectCameras.queryParam.latitude:latitude],
                            style: {
                                strokeColor: '#4b4d73',
                                strokeWeight: '1px',
                                fillColor: '#4b4d73',
                                fillOpacity: '0.2',
                                dashArray: ""
                            }
                        }
                        rangeParams.geometrys.push(geometry);
                        this.selectCameras.circleids = [];
                        this.selectCameras.circleids.push(circleId);
                        thisObj.triggerEvent("addMarker", rangeParams);

                        
                        
                    },
                    setNearbyCameraInfo() {
                        let _this = this;
                        let longitude = "";
                        let latitude = "";
                        if (sessionStorage.getItem('currentSpaceData')) {
                            let currentSpaceData = JSON.parse(sessionStorage.getItem('currentSpaceData')).spaceInfo[0];
                            longitude = currentSpaceData.longitude;
                            latitude = currentSpaceData.latitude;
                        }
                        let param = {
                            start: 0,
                            limit: 5000,
                            longitude: this.selectCameras.queryParam.longitude?this.selectCameras.queryParam.longitude:longitude,
                            latitude: this.selectCameras.queryParam.latitude?this.selectCameras.queryParam.latitude:latitude,
                            deviceTypeLv1: 'camera',
                            distance: this.selectCameras.queryParam.selectdata
                        }
                        this.selectCameras.camerasIds = [];
                        let curSpaceData = JSON.parse(sessionStorage.getItem('currentSpaceData'));
                        if (curSpaceData && curSpaceData.spaceInfo[0] && curSpaceData.spaceInfo[0].id) {
                            param.spaceInPath = curSpaceData.spaceInfo[0].id;
                        } else if (curSpaceData && curSpaceData.spaceInfo && curSpaceData.spaceInfo.id) {
                            param.spaceInPath = curSpaceData.spaceInfo.id;
                        }
                        //let loading = this.loading('.relationCamerasForLoading')
                        thisObj.callAPIConn('/SmartCampus__SecurityManagement/1.0.0/getNearbyCameraListChange', param, 'POST', res => {
                            if (res && res.resp && res.resp.code == '0') {
                                console.log('查询周围摄像头Flow完成', res)
                                if (res.data[0]) {
                                    //查询该设备关联的所有摄像头
                                    var params = {
                                        start: 0,
                                        limit: 5000,
                                        condition: {
                                            deviceCode: {
                                                value: this.selectCameras.deviceCameraData.code,
                                                operator: "="
                                            },
                                            relationTypeCode: {
                                                value: "CAMERA_RELATION",
                                                operator: "="
                                            }
                                        }
                                    };
                                    thisObj.callAPIConn('/Device/0.1.0/DeviceRelation/query', params, 'POST', vm => {
                                        if (vm && vm.resp && vm.resp.code == '0') {
                                            console.log("vm", vm)
                                            var mapParams = {
                                                append: true,
                                                markerInfo: {
                                                    layerId: "layer_1234567546456",
                                                    layerIndex: 12345,
                                                    markers: []
                                                }
                                            }
                                            res.data[0].camerasInfo.forEach(v => {
                                                if (v.equipId == this.selectCameras.deviceCameraData.id) {
                                                    return; //排除自身
                                                }
                                                //排除已废弃
                                                if (v.status != "ACTIVE") {
                                                    return;
                                                }
                                                if (v.longitude && v.latitude) {
                                                    let marker = {
                                                        id: v.equipId,
                                                        position: [v.longitude, v.latitude],
                                                        image: widgetBasePath + "/images/camera_icon_blue.png",
                                                        width: 24,
                                                        height: 24,
                                                        imageSelected: widgetBasePath + "/images/camera_icon_blue.png",
                                                        widthSelected: 24,
                                                        heightSelected: 24,
                                                        infoWindow: ""
                                                    };
                                                    let actionType = "add";
                                                    this.selectCameras.actionName[v.equipId] = _this.lang.other.related;
                                                    if (vm.data[0] && vm.data[0].count > 0) {
                                                        vm.data[0].deviceRelation.forEach(f => {
                                                            if (v.equipId == f.relatedDevice.id) {
                                                                //已经关联
                                                                this.selectCameras.actionName[v.equipId] = _this.lang.other.disassociate;
                                                                actionType = "del";
                                                                marker.image = widgetBasePath + "/images/camera_icon_related.png";
                                                                marker.imageSelected = widgetBasePath + "/images/camera_icon_related.png";
                                                            }
                                                        })
                                                    }
                                                    if (v.equipCode) {
                                                        let codes = {
                                                            cameraCodes: [v.equipCode],
                                                            cameraName: v.equipCn,
                                                            displayCloseButton: "true"
                                                        };
                                                        this.selectCameras.relationParam = {
                                                            operType: actionType,
                                                            cameraid: v.equipId,
                                                            deviceCode: this.selectCameras.deviceCameraData.code,
                                                            status: this.selectCameras.deviceCameraData.status,
                                                            cameraNa: v.equipCn,
                                                            longitude: v.longitude,
                                                            latitude: v.latitude,
                                                            cameraCodes: v.equipCode
                                                        };
                                                        marker.infoWindow = {
                                                            content: "<div style='padding: 0 1rem'>" +
                                                                "<div style='text-align: center;font-size: 1rem'><span>" + _this.htmlEncode(v.equipCn) + "</span></div>" +
                                                                "<button type='button' id='camera-detail' style='margin: 1rem 0.5rem;width: 7rem;left: 40% !important;cursor: pointer;' class='map-popup-btn' onclick='startLive(" + JSON.stringify(codes) + ")' ><span>" + _this.lang.other.viewCamera + "</span></button>" +
                                                                "<button type='button'  style='width: 7rem;margin: 0rem;cursor: pointer;' class='map-popup-btn' id='operateRelationButton' onclick='operateRelation(" + JSON.stringify(this.selectCameras.relationParam) + ")' ><span id='operateRelation'>" + this.selectCameras.actionName[v.equipId] + "</span></button>",
                                                            offset: [30, 30],
                                                            width: 300,
                                                            height: 0,
                                                            boxTheme: "dark"
                                                        };
                                                    }
                                                    this.selectCameras.camerasIds.push(v.equipId);
                                                    mapParams.markerInfo.markers.push(marker);
                                                }
                                            })
                                            thisObj.triggerEvent('clear-cameras', {
                                                overlayIds: this.selectCameras.camerasIds,
                                                overlayTypes: ["InfoWindow"]
                                            });
                                            this.$nextTick(() => {
                                                console.log("mapParams", mapParams)
                                                thisObj.triggerEvent("addMarker", mapParams);
                                            })
                                        }
                                    })
                                }
                            }
                        }, error => {
                        })

                        
                    },
                    startLive(data) {
                        if (data.cameraCodes && data.cameraCodes.length) {
                            data.cameraCode = data.cameraCodes[0];
                        }
                        thisObj.triggerEvent("funcStartLive", data)
                    },
                    operateRelation(data) {
                        let _this = this;
                        let actionUrl = '';
                        let actionMeth = '';
                        let deviceRelations = [];
                        //let pageContent = document.getElementById('operateRelation').innerHTML;

                        let params1 = {
                            start: 0,
                            limit: 5000,
                            async: false,
                            condition: {
                                deviceCode: {
                                    value: data.deviceCode,
                                    operator: "="
                                },
                                relationTypeCode: {
                                    value: "CAMERA_RELATION",
                                    operator: "="
                                }
                            }
                        };
                        thisObj.callAPIConn('/Device/0.1.0/DeviceRelation/query', params1, 'POST', vm => {
                            if (data.operType == "add" && (!vm.data[0].count || vm.data[0].count < 4) || data.operType != "add") { //最多绑定4个摄像头
                                let paramquery = {
                                    start: 0,
                                    limit: 1,
                                    condition: {
                                        id: {
                                            value: data.cameraid,
                                            operator: '='
                                        }
                                    }
                                }
                                //根据摄像头id查询摄像头编码
                                thisObj.callAPIConn("/Device/0.1.0/Device/query", paramquery, 'POST', function (res) {
                                    if (res && res.resp && res.resp.code == '0' && res.data[0]) {
                                        console.log("res", res)
                                        let deviceRelation = {
                                            sourceDeviceCode: data.deviceCode,
                                            relatedDeviceCode: res.data[0].devices[0].code,
                                            relationTypeCode: "CAMERA_RELATION"
                                        }
                                        if (data.operType == "add") {
                                            let params12 = {
                                                start: 0,
                                                limit: 5000,
                                                async: false,
                                                condition: {
                                                    deviceCode: {
                                                        value: res.data[0].devices[0].code,
                                                        operator: "="
                                                    },
                                                    relationTypeCode: {
                                                        value: "CAMERA_RELATION",
                                                        operator: "="
                                                    }
                                                }
                                            };
                                            thisObj.callAPIConn('/Device/0.1.0/DeviceRelation/query', params12, 'POST', val => {
                                                if (!val.data[0].count || val.data[0].count < 4) {
                                                    actionUrl = "/Device/0.1.0/DeviceRelation/create";
                                                    actionMeth = 'POST';
                                                    deviceRelations.push(deviceRelation);
                                                    let params = {
                                                        deviceRelation: deviceRelations
                                                    };
                                                    thisObj.callAPIConn(actionUrl, params, actionMeth, function (rm) {
                                                        if (rm && rm.resp && rm.resp.code == '0') {
                                                            _this.$message({
                                                                showClose: true,
                                                                message: _this.lang.operationSuccess,
                                                                type: 'success',
                                                                customClass: 'hw-message'
                                                            });

                                                            _this.addMarkagain(data);
                                                        }
                                                    })
                                                } else {
                                                    _this.$alert(_this.lang.other.associatedMaximum, _this.lang.error, {
                                                        confirmButtonText: _this.lang.confirmButtonText, //'确定',
                                                        type: 'error',
                                                        customClass: 'hw-messagebox',
                                                        callback: function () {}
                                                    });
                                                    return;
                                                }
                                            });
                                        } else {
                                            actionUrl = "/Device/0.1.0/DeviceRelation";
                                            actionMeth = 'DELETE';
                                            deviceRelations.push(deviceRelation);
                                            let params = {
                                                deviceRelation: deviceRelations
                                            };
                                            thisObj.callAPIConn(actionUrl, params, actionMeth, function (dev) {
                                                if (dev && dev.resp && dev.resp.code == '0') {
                                                    _this.$message({
                                                        showClose: true,
                                                        message: _this.lang.operationSuccess,
                                                        type: 'success',
                                                        customClass: 'hw-message'
                                                    });
                                                    _this.addMarkagain(data);
                                                }
                                            })
                                        }
                                    }
                                })
                            } else {
                                _this.$alert(_this.lang.other.associatedMaximum, _this.lang.error, {
                                    confirmButtonText: _this.lang.confirmButtonText, //'确定',
                                    type: 'error',
                                    customClass: 'hw-messagebox',
                                    callback: function () {}
                                });
                                return;
                            }
                        })
                    },
                    addMarkagain(markData) {
                        let _this = this;
                        //先清除该点，再重新打点
                        thisObj.triggerEvent('clear-cameras', {
                            overlayIds: [markData.cameraid],
                            overlayTypes: ["InfoWindow"]
                        });
                        var mapParamagain = {
                            append: true,
                            markerInfo: {
                                layerId: "layer_1234567546456",
                                layerIndex: 12345,
                                markers: []
                            }
                        }
                        let marker = {
                            id: markData.cameraid,
                            position: [markData.longitude, markData.latitude],
                            image: markData.operType == "add" ? widgetBasePath + "/images/camera_icon_related.png" : widgetBasePath + "/images/camera_icon_blue.png",
                            width: 24,
                            height: 24,
                            imageSelected: markData.operType == "add" ? widgetBasePath + "/images/camera_icon_related.png" : widgetBasePath + "/images/camera_icon_blue.png",
                            widthSelected: 24,
                            heightSelected: 24,
                            infoWindow: ""
                        };
                        let codes = {
                            cameraCodes: [markData.cameraCodes],
                            cameraName: markData.equipCn,
                            displayCloseButton: "true"
                        };
                        this.selectCameras.relationParam = {
                            operType: markData.operType == "add" ? "del" : "add",
                            cameraid: markData.cameraid,
                            deviceCode: markData.deviceCode,
                            cameraNa: markData.cameraNa,
                            longitude: markData.longitude,
                            latitude: markData.latitude,
                            cameraCodes: markData.cameraCodes
                        };
                        this.selectCameras.actionName[markData.cameraid] = markData.operType == "add" ? _this.lang.other.disassociate : _this.lang.other.related;
                        marker.infoWindow = {
                            content: "<div style='padding: 0 1rem'>" +
                                "<div style='text-align: center;font-size: 1rem'><span>" + _this.htmlEncode(markData.cameraNa) + "</span></div>" +
                                "<button type='button' id='camera-detail' style='margin: 1rem 0.5rem;width: 7rem;left: 40% !important;cursor: pointer;' class='map-popup-btn' onclick='startLive(" + JSON.stringify(codes) + ")' ><span>" + _this.lang.other.viewCamera + "</span></button>" +
                                "<button type='button'  style='width: 7rem;margin: 0rem;cursor: pointer;' class='map-popup-btn' id='operateRelationButton' onclick='operateRelation(" + JSON.stringify(this.selectCameras.relationParam) + ")' ><span id='operateRelation'>" + this.selectCameras.actionName[markData.cameraid] + "</span></button>",
                            offset: [30, 30],
                            width: 300,
                            height: 0,
                            boxTheme: "dark"
                        };
                        mapParamagain.markerInfo.markers.push(marker);
                        thisObj.triggerEvent("addMarker", mapParamagain);
                    },
                    operateCameraRange(data) {
                        console.log(data)
                        this.selectCameras.isShowDistance = true;
                        this.selectCameras.deviceCameraData = data;
                        //this.selectCameras.classMode = this.selectCameras.defaultclassMode;
                        this.searchCameras(0); //默认打开第一个距离

                    },
                    changeShowRange() {
                        if (this.isShowCameraRange) {
                            this.isShowCameraRange = !this.isShowCameraRange;
                            this.searchCameras(0); //默认打开第一个距离 
                        } else {
                            thisObj.triggerEvent('modifyMapConfig', {
                                zoom: this.selectCameras.defaultLevel
                            });
                            if (this.selectCameras.circleids.length > 0 || this.selectCameras.camerasIds.length > 0) {
                                let idAll = [];
                                this.selectCameras.circleids.forEach(v => {
                                    idAll.push(v);
                                })
                                this.selectCameras.camerasIds.forEach(v1 => {
                                    idAll.push(v1);
                                })
                                console.log("idAll", idAll)
                                this.selectCameras.circleids = [];
                                this.selectCameras.camerasIds = [];
                                //清除地图上所有的摄像头
                                thisObj.triggerEvent('clear-cameras', {
                                    overlayIds: idAll,
                                    overlayTypes: ["circle", "InfoWindow"]
                                });
                            }
                            this.isShowCameraRange = !this.isShowCameraRange;
                            this.queryDevicesList();
                        }
                    },
                    /*********************添加关联摄像头--END**************************/
                    // 弹出设备实例对话框
                    openDeviceDialog: function (flag, row) {
                        if (row.status == 'DELETED' || row.status == 'UNREG') {
                            return;
                        }
                        this.device.deviceAttributeDelete = []; //清空已经删除了的属性项
                        this.device.deviceAttribute = [];
                        this.deviceAttrTab = 'dynamicAttr';
                        if (flag == 'edit' && row.id) {
                            // 设备实例基本信息
                            this.isEdit = true;
                            this.deviceData.id = row.id;
                            this.deviceData.externalCode = row.externalCode;
                            this.deviceData.externalCodeCopy = row.externalCode;
                            this.deviceData.deviceName = row.deviceName;
                            this.deviceData.deviceNameCopy = row.deviceName;
                            this.deviceData.deviceDef = row.deviceDef.id;
                            this.deviceData.deviceDefCopy = row.deviceDef.id;
                            this.deviceData.deviceDefName = row.deviceDef.defName || row.deviceDef.code;
                            this.deviceData.deviceDefCode = ' （' + row.deviceDef.code + '）';
                            this.deviceData.status = row.status;
                            this.deviceData.channel = row.channel;
                            this.deviceData.channelCopy = row.channel;
                            this.deviceData.deviceProduct = row.deviceProduct ? row.deviceProduct.id : null;
                            this.deviceData.remark = row.remark;
                            this.deviceData.nodeId = row.nodeId;
                            this.deviceData.gatewayId = row.gatewayId;
                            this.deviceData.hmi = row.hmi ? row.hmi : null;
                            // 设备实例位置信息
                            this.deviceLocation = {
                                longitude: '',
                                latitude: '',
                                altitude: '',
                                building: '',
                                floor: ''
                            };
                            if (row.deviceLocation) {
                                if (row.deviceLocation.coordinate && (row.deviceLocation.coordinate.indexOf(',') != -1 || row.deviceLocation.coordinate.indexOf(' ') != -1)) {
                                    var coordinates = [];
                                    if (row.deviceLocation.coordinate.indexOf(',') != -1) {
                                        coordinates = row.deviceLocation.coordinate.split(',');
                                        if (coordinates.length < 3) {
                                            // console.log('位置信息：' + coordinates + '格式不符合要求');
                                            this.deviceLocation.longitude = coordinates[0];
                                            this.deviceLocation.latitude = coordinates[1];
                                        } else {
                                            this.deviceLocation.longitude = coordinates[0];
                                            this.deviceLocation.latitude = coordinates[1];
                                            this.deviceLocation.altitude = coordinates[2];
                                            if (coordinates.length == 5) {
                                                this.deviceLocation.building = coordinates[3];
                                                this.deviceLocation.floor = coordinates[4];
                                            }
                                        }
                                    }
                                    if (row.deviceLocation.coordinate.indexOf(' ') != -1) {
                                        coordinates = row.deviceLocation.coordinate.split(' ');
                                        if (coordinates.length != 3) {
                                            this.deviceLocation.longitude = coordinates[0];
                                            this.deviceLocation.latitude = coordinates[1];
                                        } else {
                                            this.deviceLocation.longitude = coordinates[0];
                                            this.deviceLocation.latitude = coordinates[1];
                                            this.deviceLocation.altitude = coordinates[2];
                                        }
                                    }
                                }
                                if (Array.isArray(row.deviceLocation.spaceInPath) && row.deviceLocation.spaceInPath.length > 0) {
                                    this.deviceLocation.space = row.deviceLocation.spaceInPath[0].id;
                                    this.deviceLocation.spaceLabel = row.address || row.spaceName || row.code;
                                }
                            }
                            // 查询设备的属性信息【同步查询】
                            let dialogShow = false;
                            let deviceAttrDatas = []; // 查询出来的设备属性信息【需要与规格中的数新信息对比】
                            thisObj.callAPIConn('/Device/0.1.0/Device/' + this.deviceData.id + '/attributes?attrType=DYNAMIC&attrType=INSTANCE', {
                                async: false
                            }, 'GET', function (vm) {
                                if (vm && vm.resp && vm.resp.code == '0') {
                                    if (vm.data[0]) {
                                        deviceAttrDatas = vm.data[0].deviceAttr || [];
                                        dialogShow = true;
                                    }
                                }
                            });
                            if (!dialogShow) {
                                return;
                            }
                            // 设备实例属性信息
                            deviceAttrDatas = deviceAttrDatas.filter(function (e) {
                                return !!e.id
                            }); //过滤出已经实例化过了的属性
                            //处理属性中是单值但是有多个属性的（为避免点击的编辑时js报错，这里只取出来第一个外部编码不为空的属性）
                            let multDynamic = deviceAttrDatas.filter(function (e) {
                                return e.valueType === '1'
                            });
                            let singDynamic = deviceAttrDatas.filter(function (e) {
                                return e.valueType !== '1'
                            });
                            let newDynamic = [];
                            let newDynamicObj = {};
                            singDynamic.forEach(function (e) {
                                if (!newDynamicObj.hasOwnProperty(e['attrDef'].code)) {
                                    newDynamicObj[e['attrDef'].code] = e.id;
                                    newDynamic.push(e);
                                }
                            });
                            deviceAttrDatas = multDynamic.concat(newDynamic);
                            this.device.currentDeviceAttr = deviceAttrDatas.map(function (e) {
                                return {
                                    id: e.id,
                                    attributeDef: e.attrDef.id,
                                    externalCode: e.externalCode,
                                    attributeValue: e.attrValue
                                }
                            });
                            if (this.deviceData.deviceDef == this.deviceData.deviceDefCopy) { // 多次点开编辑同一个设备时，不会触发watch事件，这里强制查询
                                this.changeDeviceDef(); //查询设备规格、查询设备产品、查询设备组态页
                            }
                        } else {
                            this.isEdit = false;
                            this.deviceData.id = '';
                            this.deviceData.externalCode = '';
                            this.deviceData.deviceName = '';
                            this.deviceData.status = 'ACTIVE';
                            this.deviceData.channel = '';
                            this.deviceData.deviceProduct = '';
                            this.deviceData.remark = '';
                            this.deviceData.nodeId = '';
                            this.deviceData.gatewayId = '';
                            this.deviceData.deviceDef = '';
                            this.deviceData.deviceDefCopy = '';
                            this.deviceData.deviceDefName = '';
                            this.deviceData.deviceDefCode = '';
                            this.deviceData.hmi = '';
                            this.deviceLocation = {
                                space: '',
                                spaceLabel: '',
                                longitude: null,
                                latitude: null,
                                altitude: null,
                                building: null,
                                floor: null
                            };
                            if (this.currentSpace.id && !this.deviceData.id) {
                                this.deviceLocation.space = this.currentSpace.id;
                                this.deviceLocation.spaceLabel = this.currentSpace.spaceInPathLabel;
                            }
                        }
                        //有位置选择功能时
                        if (this.currentSpace.id) {
                            this.space.condition.spacePathList = JSON.parse(JSON.stringify(this.space.condition.spacePathListInit));
                            if (flag == 'edit' && row.id) { //编辑时按实际情况赋值，新增时给默认值
                                if (row.deviceLocation && row.deviceLocation.space) { //若空间信息不为空，则构造位置信息满足组件格式
                                    let arrayList = [];
                                    row.deviceLocation.spaceInPath.forEach(function (e) {
                                        arrayList.push(e.id)
                                    });
                                    if (arrayList.length > 0) {
                                        let index = arrayList.indexOf(this.currentSpace.id);
                                        this.space.condition.spacePathList = (arrayList.slice(0, index + 1)).reverse();
                                    }
                                }
                            }
                        }
                        this.device.activeTab = '1';
                        this.device.addEditDeviceDialog = true;
                        this.buttonSaveLoading = false;
                        this.$nextTick(() => {
                            this.$refs['deviceData'].clearValidate();
                        })
                    },
                    closeDeviceDialog: function () {
                        var _this = this;
                        _this.$refs['deviceData'].clearValidate();
                        _this.buttonSaveLoading = false;
                        _this.device.addEditDeviceDialog = false;
                        //如果有，关闭所有设备的采集位置状态
                        $.each(_this.deviceList.dataList || [], function (i, device) {
                            Vue.set(device, 'isCollecting', false);
                        });
                        //控制鼠标效果
                        $('.ec-extension-gismap').css('cursor', 'inherit');
                        $('.ol-viewport').css('cursor', 'inherit');
                        $('.leaflet-zoom-animated').css('cursor', 'inherit');
                        $('#map').css('cursor', 'inherit');
                        //console.log("光标改成inherit");
                        $('.leaflet-interactive').css('cursor', 'pointer');
                    },
                    /************** 新建、编辑设备信息 *************/
                    saveDevice: function () {
                        var _this = this;
                        _this.$refs['deviceData'].validate((valid) => {
                            if (valid) {
                                //表单校验通过
                                //如果有，关闭所有设备的采集位置状态
                                $.each(_this.deviceList.dataList || [], function (i, device) {
                                    Vue.set(device, 'isCollecting', false);
                                });
                                //控制鼠标效果
                                $('.ec-extension-gismap').css('cursor', 'inherit');
                                $('.ol-viewport').css('cursor', 'inherit');
                                $('.leaflet-zoom-animated').css('cursor', 'inherit');
                                $('#map').css('cursor', 'inherit');
                                //console.log("光标改成inherit");
                                $('.leaflet-interactive').css('cursor', 'pointer');
                                if (_this.deviceData.id) {
                                    _this.editDevice(); //编辑
                                } else {
                                    _this.addDevice(); //新建
                                }
                            }
                        })
                    },
                    saveDeviceBasicInfo: function () { //编辑时保存设备基本信息
                        let _this = this;
                        _this.$refs['deviceData'].validate((valid) => {
                            if (valid) {
                                let deviceParams = {
                                    id: _this.deviceData.id,
                                    deviceProduct: _this.deviceData.deviceProduct || "",
                                    externalCode: _this.deviceData.externalCode,
                                    deviceName: _this.deviceData.deviceName,
                                    channel: _this.deviceData.channel,
                                    remark: _this.deviceData.remark,
                                    nodeId: _this.deviceData.nodeId,
                                    gatewayId: _this.deviceData.gatewayId,
                                    HMI: _this.deviceData.hmi || "",
                                    deviceLocation: {
                                        space: null
                                    }
                                };
                                if (_this.currentSpace.id) {
                                    if (_this.space.condition.spacePathList.length > 0) {
                                        deviceParams.deviceLocation.space = _this.space.condition.spacePathList[_this.space.condition.spacePathList.length - 1];
                                    }
                                } else if (_this.deviceLocation.space) {
                                    deviceParams.deviceLocation.space = _this.deviceLocation.space;
                                }
                                console.log("编辑时设备基本信息：", deviceParams);
                                _this.buttonSaveLoading = true;
                                thisObj.callAPIConn('/Device/0.1.0/Device/update/' + _this.deviceData.id, deviceParams, 'POST', function (vm) {
                                    if (vm && vm.resp && vm.resp.code == '0') {
                                        if (vm.data[0]) {
                                            _this.$message({
                                                showClose: true,
                                                message: _this.lang.operationSuccess,
                                                type: 'success',
                                                customClass: 'hw-message'
                                            });
                                            _this.device.addEditDeviceDialog = false;
                                            _this.queryDevicesList(); //查询设备列表
                                        }
                                    }
                                })
                            }
                        })
                    },
                    editDevice: function () {
                        var _this = this;
                        var deviceParams = {
                            id: _this.deviceData.id,
                            deviceProduct: _this.deviceData.deviceProduct || "",
                            externalCode: _this.deviceData.externalCode,
                            deviceName: _this.deviceData.deviceName,
                            channel: _this.deviceData.channel,
                            remark: _this.deviceData.remark,
                            nodeId: _this.deviceData.nodeId,
                            gatewayId: _this.deviceData.gatewayId,
                            HMI: _this.deviceData.hmi || "",
                            deviceLocation: {
                                space: null
                            },
                            deviceAttribute: []
                        };
                        if (_this.currentSpace.id) {
                            if (_this.space.condition.spacePathList.length > 0) {
                                deviceParams.deviceLocation.space = _this.space.condition.spacePathList[_this.space.condition.spacePathList.length - 1];
                            }
                        } else if (_this.deviceLocation.space) {
                            deviceParams.deviceLocation.space = _this.deviceLocation.space;
                        }
                        deviceParams.deviceLocation.longitude = _this.deviceLocation.longitude == '' ? null : Number(_this.deviceLocation.longitude);
                        deviceParams.deviceLocation.latitude = _this.deviceLocation.latitude == '' ? null : Number(_this.deviceLocation.latitude);
                        deviceParams.deviceLocation.altitude = _this.deviceLocation.altitude == '' ? null : Number(_this.deviceLocation.altitude);
                        deviceParams.deviceLocation.building = _this.deviceLocation.building == '' ? '' : _this.deviceLocation.building;
                        deviceParams.deviceLocation.floor = _this.deviceLocation.floor == '' ? '' : _this.deviceLocation.floor;
                        var attrs = _this.checkDeviceAttr();
                        if (!attrs) {
                            return;
                        } else {
                            deviceParams.deviceAttribute = attrs;
                        }
                        // console.log('属性值：', attrs);
                        // console.log('编辑时的入参：', JSON.stringify(deviceParams, null, 4));
                        _this.buttonSaveLoading = true;
                        thisObj.callAPIConn('/Device/0.1.0/Device/update/' + _this.deviceData.id, deviceParams, 'POST', function (vm) {
                            if (vm && vm.resp && vm.resp.code == '0') {
                                if (vm.data[0]) {
                                    _this.$message({
                                        showClose: true,
                                        message: _this.lang.operationSuccess,
                                        type: 'success',
                                        customClass: 'hw-message'
                                    });
                                    _this.device.addEditDeviceDialog = false;
                                    _this.queryDevicesList(); //查询设备列表
                                }
                            }
                        })
                    },
                    selectOne(data) {
                        this.deviceData.hmi = data;
                    },
                    addDevice: function () {
                        var _this = this;
                        var deviceParams = {
                            deviceDef: _this.deviceData.deviceDef,
                            deviceProduct: _this.deviceData.deviceProduct || null,
                            externalCode: _this.deviceData.externalCode,
                            deviceName: _this.deviceData.deviceName,
                            channel: _this.deviceData.channel || null,
                            status: _this.deviceData.status || null,
                            remark: _this.deviceData.remark || null,
                            nodeId: _this.deviceData.nodeId || null,
                            gatewayId: _this.deviceData.gatewayId || null,
                            HMI: _this.deviceData.hmi || null,
                            deviceLocation: {
                                space: null
                            },
                            deviceAttribute: []
                        };
                        if (_this.currentSpace.id) {
                            if (_this.space.condition.spacePathList.length > 0) {
                                deviceParams.deviceLocation.space = _this.space.condition.spacePathList[_this.space.condition.spacePathList.length - 1];
                            }
                        } else if (_this.deviceLocation.space) {
                            deviceParams.deviceLocation.space = _this.deviceLocation.space;
                        }
                        deviceParams.deviceLocation.longitude = _this.deviceLocation.longitude ? Number(_this.deviceLocation.longitude) : null;
                        deviceParams.deviceLocation.latitude = _this.deviceLocation.latitude ? Number(_this.deviceLocation.latitude) : null;
                        deviceParams.deviceLocation.altitude = _this.deviceLocation.altitude ? Number(_this.deviceLocation.altitude) : null;
                        deviceParams.deviceLocation.building = _this.deviceLocation.building == '' ? null : _this.deviceLocation.building;
                        deviceParams.deviceLocation.floor = _this.deviceLocation.floor == '' ? null : _this.deviceLocation.floor;
                        var attrs = _this.checkDeviceAttr();
                        if (!attrs) {
                            return;
                        } else {
                            attrs.forEach(function (e) {
                                delete e.action;
                            }); //删除属性信息中的action（也可不删）
                            deviceParams.deviceAttribute = attrs;
                        }
                        // console.log('属性值：', attrs);
                        // console.log('编辑时的入参：', JSON.stringify(deviceParams, null, 4));
                        _this.buttonSaveLoading = true;
                        thisObj.callAPIConn('/Device/0.1.0/Device/create', deviceParams, 'POST', function (vm) {
                            if (vm && vm.resp && vm.resp.code == '0') {
                                if (vm.data[0]) {
                                    _this.$message({
                                        showClose: true,
                                        message: _this.lang.operationSuccess,
                                        type: 'success',
                                        customClass: 'hw-message'
                                    });
                                    _this.device.addEditDeviceDialog = false;
                                    _this.queryDevicesList(); //查询设备列表
                                    _this.queryDeviceStatusCount(); //查询设备各状态的数量
                                }
                            }
                        })
                    },
                    checkDeviceAttr: function () { //检验设备实例属性、位置信息
                        var _this = this;
                        if (_this.deviceLocation.longitude || _this.deviceLocation.latitude) {
                            //经度、纬度值要同时出现或同时不出现
                            if ((_this.deviceLocation.longitude && !_this.deviceLocation.latitude) || (_this.deviceLocation.latitude && !_this.deviceLocation.longitude)) {
                                _this.$alert(_this.lang.other.latLonErrorMessage, _this.lang.error, {
                                    confirmButtonText: _this.lang.confirmButtonText, //'确定',
                                    type: 'error',
                                    customClass: 'hw-messagebox',
                                    callback: function () {}
                                });
                                return;
                            } else {
                                //对经纬度增加校验 DTS2019092006425
                                const regexWei = /^(\-|\+)?([0-8]?\d{1}\.\d{0,16}|90\.0{0,16}|[0-8]?\d{1}|90)$/;
                                const regexJing = /^(\-|\+)?(((\d|[1-9]\d|1[0-7]\d|0{1,3})\.\d{0,16})|(\d|[1-9]\d|1[0-7]\d|0{1,3})|180\.0{0,16}|180)$/;
                                if (!regexJing.test(_this.deviceLocation.longitude) || !regexWei.test(_this.deviceLocation.latitude)) {
                                    _this.$alert(_this.lang.other.latLonIncorrect, _this.lang.error, {
                                        confirmButtonText: _this.lang.confirmButtonText, //'确定',
                                        type: 'error',
                                        customClass: 'hw-messagebox',
                                        callback: function () {}
                                    });
                                    return;
                                }
                            }
                        }
                        //判断属性信息（动态属性判断多值属性的外部编码是否重复，实例属性判断必填值是否为空）
                        //1、判断实例属性的必填值是否为空
                        var flag = false;
                        var nullValue = '';
                        if (_this.device.deviceAttribute.length > 0) { //判断 属性名、属性类型 是否为空
                            for (var i = 0; i < _this.device.deviceAttribute.length; i++) {
                                if (!!_this.device.deviceAttribute[i]['isMandatory'] && _this.device.deviceAttribute[i].attrType == 'INSTANCE' && !_this.device.deviceAttribute[i]['attributeValue']) {
                                    flag = true;
                                    nullValue = _this.device.deviceAttribute[i]['attrLabel'];
                                    break;
                                }
                            }
                        }
                        if (flag) {
                            _this.$alert(_this.lang.other.propertyNameInstance + " \"" + nullValue + "\" " + _this.lang.other.attributeCannotEmpty, _this.lang.error, {
                                confirmButtonText: _this.lang.confirmButtonText, //'确定',
                                type: 'error',
                                customClass: 'hw-messagebox',
                                callback: function () {}
                            });
                            _this.deviceAttrTab = 'instanceAttr';
                            return;
                        }
                        //构造属性信息
                        if (_this.device.deviceAttribute.length > 0) {
                            var deviceAttributes = [];
                            var deviceAttributeCopy = JSON.parse(JSON.stringify(_this.device.deviceAttribute));
                            let valueTypeList = [];
                            deviceAttributeCopy.forEach(function (e) {
                                if (e.attrType == 'DYNAMIC' && e.valueType == '1' && e.valueTypeList.length > 0) {
                                    valueTypeList = valueTypeList.concat(e.valueTypeList);
                                }
                            });
                            deviceAttributeCopy.forEach(function (e, index) {
                                if (e.attrType == 'DYNAMIC' && e.valueType == '1' && e.valueTypeList.length > 0) {
                                    deviceAttributeCopy.splice(index, 1);
                                }
                            });
                            deviceAttributeCopy = deviceAttributeCopy.concat(valueTypeList);
                            //2、判断动态属性的外部编码是否重复
                            if (deviceAttributeCopy.length > 0) {
                                let dynamicAttrsLength = (deviceAttributeCopy.filter(function (e) {
                                    return e.attrType == 'DYNAMIC' && !!e.externalCode
                                })).length;
                                let dynamicCode = new Set();
                                deviceAttributeCopy.forEach(function (m) {
                                    if (m.attrType == 'DYNAMIC' && !!m.externalCode) {
                                        dynamicCode.add(m.externalCode)
                                    }
                                });
                                if (dynamicCode.size != dynamicAttrsLength) {
                                    _this.$alert(_this.lang.other.dynamicAttributesCanNotDuplicated, _this.lang.error, {
                                        confirmButtonText: _this.lang.confirmButtonText, //'确定',
                                        type: 'error',
                                        customClass: 'hw-messagebox',
                                        callback: function () {}
                                    });
                                    _this.deviceAttrTab = 'dynamicAttr';
                                    return;
                                }
                            }
                            deviceAttributeCopy = deviceAttributeCopy.concat(_this.device.deviceAttributeDelete); //拼接已经删除了的属性项
                            deviceAttributes = deviceAttributeCopy.map(function (e) {
                                return {
                                    id: e.id ? e.id : undefined,
                                    action: e.action,
                                    externalCode: e.externalCode,
                                    attributeDef: e.attributeDef,
                                    attributeValue: e.attributeValue
                                }
                            })
                            return deviceAttributes;
                        } else {
                            return [];
                        }
                    },
                    /************** 弹出设备规格定义对话框 **************/
                    openDeviceDefDialog: function () {
                        var _this = this;

                        _this.deviceDef.condition.code = '';
                        _this.deviceDef.condition.defName = '';
                        _this.deviceDef.currentRow = {};
                        //增加判断避免重复查询，加快页面响应速度
                        _this.deviceDef.pageNum = 1;
                        _this.queryDeviceDef();
                        //查询设备规格目录(只查一次)
                        // if (this.deviceDef.categories.length == 0) {
                        //     var defCategoryParams = { start: 0, limit: 5000, condition: {} };
                        //     thisObj.callAPIConn('/Device/0.1.0/DeviceDefCategory/query', defCategoryParams, 'POST', function (vm) {
                        //         if (vm && vm.resp && vm.resp.code == '0') {
                        //             if (vm.data[0]) {
                        //                 const data = vm.data[0];
                        //                 _this.deviceDef.categories = data.categories.map(function (e) {
                        //                     return {
                        //                         id: e.id,
                        //                         code: e.code,
                        //                         categoryName: e.categoryName
                        //                     }
                        //                 });
                        //             }
                        //         }
                        //     });
                        // };
                        _this.deviceDef.dialog = true;
                    },
                    queryDefListData: function () {
                        this.deviceDef.pageNum = 1;
                        this.queryDeviceDef();
                    },
                    closeDeviceDefDialog: function () {
                        this.deviceDef.dialog = false;
                    },
                    saveDeviceDef: function () {
                        var _this = this;
                        if (!_this.deviceDef.currentRow.id) {
                            _this.$message({
                                showClose: true,
                                message: _this.lang.other.selectAnItem,
                                type: 'warning',
                                customClass: 'hw-message'
                            });
                            return;
                        }
                        _this.deviceData.deviceDefName = _this.deviceDef.currentRow.deviceName || _this.deviceDef.currentRow.code;
                        _this.deviceData.deviceDefCode = '（' + _this.deviceDef.currentRow.code + '）';
                        _this.deviceData.deviceDef = _this.deviceDef.currentRow.id;
                        _this.deviceDef.dialog = false;
                        if (_this.deviceDef.conditionDialog) {
                            _this.condition.defIdLabel = _this.deviceDef.currentRow.deviceName || _this.deviceDef.currentRow.code;
                            _this.condition.defId = _this.deviceDef.currentRow.id;
                            _this.deviceDef.conditionDialog = false;
                            _this.queryDeviceByCondition();
                        }
                        if (!_this.deviceData.id && !_this.deviceData.channel) {
                            _this.deviceData.channel = _this.deviceDef.currentRow.defaultChannel;
                        }
                        _this.deviceData.deviceProduct = '';
                        _this.deviceData.hmi = '';
                    },
                    handleDeviceDefChange: function (row) {
                        if (!row) {
                            this.deviceDef.currentRow = {};
                        } else {
                            this.deviceDef.currentRow = row;
                        }
                    },
                    handleDefCurrentChange: function (val) { //设备规格页面分页事件
                        this.deviceDef.pageNum = val;
                        this.queryDeviceDef();
                    },
                    /************************** 弹出设备空间对话框 ****************************** */
                    openSpaceDialog: function (flag) {
                        var _this = this;
                        _this.space.dialog = true;
                        if(flag=="condition"){
                            _this.space.conditionDialog=true;
                        }
                        _this.space.pageNum = 1;
                        _this.space.condition.spaceRootCode = '';
                        _this.space.condition.spaceName = '';
                        _this.querySpaceData();
                        //查询空间根(只查一次)
                        if (_this.space.spaceRoots.length == 0 && !_this.currentSpace.id) {
                            var spaceRootParams = {
                                start: 0,
                                limit: 5000,
                                condition: {}
                            };
                            thisObj.callAPIConn('/Space/0.1.0/SpaceRoot/query', spaceRootParams, 'POST', function (vm) {
                                if (vm && vm.resp && vm.resp.code == '0') {
                                    if (vm.data[0]) {
                                        const data = vm.data[0];
                                        _this.space.spaceRoots = data.spaceRoots.map(function (e) {
                                            return {
                                                id: e.id,
                                                code: e.code,
                                                spaceRootName: e.spaceRootName
                                            }
                                        });
                                    }
                                }
                            });
                        }
                    },
                    closeSpaceDialog: function () {
                        this.space.dialog=false;
                        this.space.conditionDialog = false;
                        this.space.currentRow = {};
                    },
                    saveSpace: function () {
                        var _this = this;
                        if (!_this.space.currentRow.id) {
                            _this.$message({
                                showClose: true,
                                message: _this.lang.other.selectAnItem,
                                type: 'warning',
                                customClass: 'hw-message'
                            });
                            return;
                        }
                        _this.deviceLocation.spaceLabel = _this.space.currentRow.address || _this.space.currentRow.spaceName || _this.space.currentRow.code;
                        _this.deviceLocation.space = _this.space.currentRow.id;
                        _this.space.dialog = false;
                        if (_this.space.conditionDialog) {
                            _this.condition.spaceInPathLabel = _this.space.currentRow.address;
                            _this.condition.spaceInPath = _this.space.currentRow.id;
                            _this.space.conditionDialog = false;
                            _this.queryDeviceByCondition();
                        }
                    },
                    handleSpaceChange: function (row) {
                        if (!row) {
                            this.space.currentRow = {};
                        } else {
                            this.space.currentRow = row;
                        }
                    },
                    handleSpaceCurrentChange: function (val) {
                        this.space.pageNum = val;
                        this.querySpaceData();
                    },
                    querySpaceListData: function () {
                        this.space.pageNum = 1;
                        this.querySpaceData();
                    },
                    queryCurrentSpaceTree: function (currentId) {
                        var _this = this;
                        thisObj.callAPIConn('/Space/0.1.0/querySpaceTree/' + currentId, {
                            isChildren: true,
                            querySchema: {
                                space: {
                                    children: {}
                                }
                            }
                        }, 'POST', function (vm) {
                            if (vm && vm.resp && vm.resp.code == '0') {
                                const data = vm.data[0];
                                //_this.spaceOptions = [];
                                if (data.space) {
                                    let spaceObj = {};
                                    if(data.space.hasChildren){
                                        spaceObj = {
                                            label: data.space.spaceName,
                                            value: data.space.id,
                                            children: _this.handelClickSpaceTree(data.space.children)
                                        };
                                    }else{
                                        spaceObj = {
                                            label: data.space.spaceName,
                                            value: data.space.id
                                        };
                                    }
                                    if(_this.spaceOptions && _this.spaceOptions.length > 0){
                                       _this.spaceOptions = _this.handelSpaceOptions(_this.spaceOptions , spaceObj);

                                    }else{
                                        _this.spaceOptions.push(spaceObj);
                                    }  
                                   
                                }
                                // console.log('空间树信息为：', JSON.stringify(_this.spaceOptions, null,4));
                            }
                        })
                    },
                    //查询设备规格树
                    queryCurrentDeviceTree: function (currentSpaceId) {
                        let _this = this;
                        _this.selectDataDevice =true;
                        let params = {
                            condition: { }
                        };
                        thisObj.callAPIConn('/Device/0.1.0/DeviceDefCategoryTree', params, 'POST', function (vm){
                            if (vm && vm.resp && vm.resp.code == '0') {
                                const data = vm.data[0];
                                _this.deviceDefOptions = [];
                                if (data.categories) {
                                    data.categories.forEach(item => {
                                        _this.mergeChildren(item);
                                    });
                                    let treeDataed = JSON.parse(JSON.stringify(data.categories).replace(/categoryName/g, 'label').replace(/deviceName/g, 'label'));
                                    _this.deviceDefOptions=treeDataed;
                                }

                            }
                        })
                    },
                    handelSpaceTree: function (datas) {
                        let _this = this;
                        datas.forEach(function (e) {
                            e.label = e.spaceName;
                            e.value = e.id;
                            if (e.children.length == 0) {
                                delete e.children;
                            } else {
                                e.children = _this.handelSpaceTree(e.children)
                            }
                        });
                        return datas;
                    },
                    handelClickSpaceTree: function (datas) {
                        let _this = this;
                        datas.forEach(function (e) {
                            e.label = e.spaceName;
                            e.value = e.id;
                            if (e.hasChildren) {
                                e.children = []                                
                            }else{
                                delete e.children;
                            }
                        });
                        return datas;
                    },
                    handelSpaceOptions: function (datas,data) {
                        let _this = this;                        
                        datas.forEach(function (e) {
                            if(e.value == data.value){
                                e.label = data.label;
                                e.children = data.children;
                                return;
                            }else{
                                if(e.children && e.children.length > 0){
                                    _this.handelSpaceOptions(e.children,data);
                                }
                                
                            }
                        });
                        return datas;
                    },
                    mergeChildren: function (data) {
                        // var _this = this;
                        data.value =data.id;
                        if(data.deviceDefinitions.length >0 ){
                        if (!data['children']) {
                             data['children'] = []
                        } else {
                            data['children'].forEach(v => {
                                this.mergeChildren(v)
                            })
                        }
                        (data['deviceDefinitions'] || []).forEach(item => {
                            item.label = item.deviceName;
                            item.value = item.id;
                        });
                         data['children'] = data['children'].concat(data['deviceDefinitions']);
                        }else{
                             if(data['children'] && data.children.length){
                                data['children'].forEach(v => {
                                    this.mergeChildren(v)
                                })
                            }else{
                                data.children =undefined
                            } 
                        }
                        this.treeDataMap[data.id] = data;
                    },
                    selectSpaceNode: function (data) { //条件中切换位置信息后触发查询事件
                        let spaceData = this.condition.spacePathList;
                        if (spaceData.length > 0) {
                            this.condition.spaceInPathLabel = "xxx";
                            this.condition.spaceInPath = spaceData[spaceData.length - 1];
                            this.queryDeviceByCondition();
                        }
                    },
                   
                    selectdefIdLabelNode: function (data) { //条件中切换设备规格触发查询事件

                        let selectData=[];
                        for(let i=0; i < data.length; i++){
                            let datas =data[i];
                            selectData.push(datas[data[i].length-1])
                        }
                        this.selectdeviceList =selectData;
                        this.queryDevicesList();
                    },
                    /************************** 设备规格变化后查询设备产品 **************************/
                    changeDeviceDef: function () {
                        var _this = this;
                        if (_this.deviceData.deviceDef) {
                            //查询设备产品列表，便于页面上下拉框中选择
                            var params = {
                                start: 0,
                                limit: 5000,
                                condition: {
                                    defId: {
                                        value: _this.deviceData.deviceDef,
                                        operator: '='
                                    }
                                }
                            };
                            thisObj.callAPIConn('/Device/0.1.0/DeviceProduct/query', params, 'POST', function (vm) {
                                if (vm && vm.resp && vm.resp.code == '0') {
                                    if (vm.data[0]) {
                                        const data = vm.data[0];
                                        _this.device.deviceProducts = data.deviceProducts.map(function (e) {
                                            return {
                                                id: e.id,
                                                code: e.code,
                                                name: e.productName
                                            }
                                        });
                                    }
                                }
                            });
                            //根据设备规格id查询规格组态页名称
                            var inputParams = {
                                start: 0,
                                limit: 5000,
                                deviceDefId: _this.deviceData.deviceDef
                            };
                            thisObj.callAPIConn('/Device/0.1.0/queryDeviceDefHMI', inputParams, 'POST', function (vm) {
                                if (vm && vm.resp && vm.resp.code == '0') {
                                    if (vm.data[0]) {
                                        const data = vm.data[0];
                                        _this.device.configNames = data.hmi.map(function (e) {
                                            return {
                                                value: e.id,
                                                label: e.pageName,
                                                flag: e.defaultPageFlag
                                            }
                                        });
                                        _this.device.configNames.forEach(v => {
                                            if(v.flag == "1" && !_this.isEdit){
                                                _this.deviceData.hmi = _this.deviceData.hmi ? _this.deviceData.hmi : v.value;
                                            }
                                        })

                                    }
                                }
                            });
                            //处理设备规格对应的属性信息（直接从规格中获取不再查询）,页面上显示设备的实例属性与动态属性
                            if (_this.deviceData.id) {
                                thisObj.callAPIConn('/Device/0.1.0/DeviceDef/query', {
                                    start: 0,
                                    limit: 1,
                                    condition: {
                                        id: {
                                            value: _this.deviceData.deviceDef,
                                            operator: '='
                                        }
                                    },
                                    async: false
                                }, 'POST', function (vm) {
                                    if (vm && vm.resp && vm.resp.code == '0') {
                                        if (vm.data[0]) {
                                            const data = vm.data[0];
                                            _this.deviceDef.currentRow = data.deviceDefs[0];
                                        }
                                    }
                                })
                            }
                            var deviceDefs = [];
                            if (_this.deviceDef.currentRow.deviceDefAttr && Array.isArray(_this.deviceDef.currentRow.deviceDefAttr) && _this.deviceDef.currentRow.deviceDefAttr.length > 0) {
                                deviceDefs = _this.deviceDef.currentRow.deviceDefAttr.filter(function (e) {
                                    return e.attrType == 'INSTANCE' || e.attrType == 'DYNAMIC';
                                });
                            }
                            _this.deviceDef.deviceDefAttr = deviceDefs.map(function (e) {
                                e.unit = e.attrDef.attrType ? (e.attrDef.attrType.unit ? e.attrDef.attrType.unit : '') : '';
                                e.attrLabelDisplay = e.attrDef.attrLabel;
                                if (e.unit) {
                                    e.attrLabelDisplay += '(' + e.unit.unitLabel + ')';
                                }
                                e.attrTypeDisplay = e.attrType == 'INSTANCE' ? _this.lang.addEditDialog.instanceAttribute : (e.attrType == 'DYNAMIC' ? _this.lang.addEditDialog.dynamicAttribute : '');
                                return {
                                    attributeDef: e.attrDef.id,
                                    attrLabel: e.attrDef.attrLabel,
                                    code: e.attrDef.code,
                                    isMandatory: e.isMandatory,
                                    attrType: e.attrType,
                                    primaryType: e.attrDef.attrType.primaryType,
                                    defaultValue: e.defaultValue,
                                    unit: e.unit,
                                    externalCode: e.externalCode,
                                    attrTypeDisplay: e.attrTypeDisplay,
                                    attrLabelDisplay: e.attrLabelDisplay,
                                    valueType: e.valueType,
                                    valueTypeList: []
                                }
                            });
                            _this.deviceDef.deviceDefAttr.forEach(function (m) { //多值属性的把值添加到对应的数组中，便于前端遍历显示
                                if (m.valueType == '1' && m.attrType == 'DYNAMIC') {
                                    m.valueTypeList.push(JSON.parse(JSON.stringify(m)));
                                }
                            });
                            if (!_this.deviceData.id) { //新建
                                _this.handelDeviceAttribute(_this.deviceDef.deviceDefAttr, []);
                            } else { //编辑
                                _this.handelDeviceAttribute(_this.deviceDef.deviceDefAttr, _this.device.currentDeviceAttr);
                            }
                        }
                    },
                    handelDeviceAttribute: function (deviceDefAttr, deviceAttr) {
                        // console.log('处理前设备规格中的属性：', JSON.stringify(deviceDefAttr, null, 4));
                        // console.log('处理前设备实例中的属性：', JSON.stringify(deviceAttr, null, 4));
                        var _this = this;
                        if (deviceAttr.length == 0) { //设备实例属性为空时
                            if (deviceDefAttr && Array.isArray(deviceDefAttr) && deviceDefAttr.length > 0) {
                                _this.device.deviceAttribute = deviceDefAttr.map(function (e) {
                                    e.valueTypeList.forEach(function (el) {
                                        el.action = 'PUT'
                                    });
                                    return {
                                        action: 'PUT',
                                        externalCode: e.attrType == 'DYNAMIC' ? e.externalCode : null,
                                        attributeDef: e.attributeDef,
                                        attributeValue: e.attrType == 'INSTANCE' ? e.defaultValue : null,
                                        attrType: e.attrType,
                                        attrTypeDisplay: e.attrTypeDisplay,
                                        attrLabel: e.attrLabel,
                                        code: e.code,
                                        attrLabelDisplay: e.attrLabelDisplay,
                                        isMandatory: e.isMandatory,
                                        primaryType: e.primaryType,
                                        unit: e.unit,
                                        valueType: e.valueType,
                                        valueTypeList: e.valueTypeList
                                    }
                                });
                            }
                        } else { //设备实例属性不为空时
                            var common = new Set();
                            var toAdd = [];
                            var toDelete = [];
                            deviceAttr.forEach(function (m) {
                                deviceDefAttr.forEach(function (n) {
                                    if (m.attributeDef == n.attributeDef) { //找出公共部分
                                        common.add(n.attributeDef);
                                        m.attrLabel = n.attrLabel;
                                        m.isMandatory = n.isMandatory;
                                        m.primaryType = n.primaryType;
                                        m.unit = n.unit;
                                        m.attrType = n.attrType;
                                        m.code = n.code;
                                        m.attrTypeDisplay = n.attrTypeDisplay;
                                        m.attrLabelDisplay = n.attrLabelDisplay;
                                        m.valueType = n.valueType;
                                    }
                                })
                            })
                            let attr = [];
                            let attrSet = {};
                            deviceAttr.forEach(function (m) {
                                m.action = 'CHG';
                                if (!attrSet[m.attributeDef]) {
                                    attrSet[m.attributeDef] = m;
                                    if (m.valueType == '1' && m.attrType == 'DYNAMIC') {
                                        m.valueTypeList = [];
                                        m.valueTypeList.push(JSON.parse(JSON.stringify(m)));
                                    }
                                } else {
                                    attrSet[m.attributeDef].valueTypeList.push(JSON.parse(JSON.stringify(m)));
                                }
                            })
                            for (let i in attrSet) {
                                attr.push(attrSet[i]);
                            }
                            deviceAttr = JSON.parse(JSON.stringify(attr));
                            if (common.size == 0) {
                                deviceDefAttr.forEach(function (e) {
                                    e.action = 'PUT';
                                    e.attributeValue = e.defaultValue;
                                });
                                toAdd = deviceDefAttr;
                                deviceAttr.forEach(function (e) {
                                    e.action = 'DEL';
                                });
                                toDelete = deviceAttr;
                            } else {
                                deviceDefAttr.forEach(function (m) {
                                    if (!common.has(m.attributeDef)) {
                                        if (m.valueTypeList.length == 1) {
                                            m.valueTypeList[0].action = 'PUT';
                                        }
                                        toAdd.push({
                                            action: 'PUT',
                                            attributeDef: m.attributeDef,
                                            attributeValue: null,
                                            attrLabel: m.attrLabel,
                                            code: m.code,
                                            isMandatory: m.isMandatory,
                                            attrType: m.attrType,
                                            attrTypeDisplay: m.attrTypeDisplay,
                                            attrLabelDisplay: m.attrLabelDisplay,
                                            valueType: m.valueType,
                                            valueTypeList: m.valueTypeList,
                                            externalCode: m.externalCode //新增动态属性时，默认填上设备BO中配置的外部编码
                                        });
                                    }
                                });
                                deviceAttr.forEach(function (m, index) {
                                    if (!common.has(m.attributeDef)) {
                                        m.action = 'DEL';
                                        toDelete.push(m);
                                    } else {
                                        m.action = 'CHG';
                                    }
                                });
                            }
                            deviceAttr = deviceAttr.filter(function (a) {
                                return a.action != 'DEL';
                            });
                            _this.device.deviceAttributeDelete = toDelete;
                            _this.device.deviceAttribute = deviceAttr.concat(toAdd);
                        }
                        //按属性id排序（实例属性在前，动态属性在后）
                        if (_this.device.deviceAttribute.length > 0) {
                            _this.device.deviceAttribute = _this.orderByAttrDef(_this.device.deviceAttribute);
                        }

                        let count = this.device.deviceAttribute.filter(function (e) {
                            return e.attrType == 'INSTANCE' && e.isMandatory == true
                        }).length;
                        if (count > 0) { //设置实例属性后面是否显示红色竖线标识必填
                            $('#tab-instanceAttr').attr('data-attr', '|');
                        } else {
                            $('#tab-instanceAttr').attr('data-attr', '');
                        }
                    },
                    // 处理属性信息
                    orderByAttrDef: function (attr) {
                        var newAttr = [];
                        var attrInstance = attr.filter(function (e) {
                            return e.attrType == 'INSTANCE';
                        });
                        var attrDynamic = attr.filter(function (e) {
                            return e.attrType == 'DYNAMIC';
                        });
                        if (attrInstance.length > 0) {
                            attrInstance.sort(function (a, b) {
                                return a.attributeDef - b.attributeDef;
                            });
                        }
                        if (attrDynamic.length > 0) {
                            attrDynamic.sort(function (a, b) {
                                return a.attributeDef - b.attributeDef;
                            });
                        }
                        newAttr = newAttr.concat(attrInstance).concat(attrDynamic);
                        attr = newAttr;
                        return attr;
                    },
                    valueTypeAdd: function (e) {
                        e.valueTypeList.push({
                            action: 'PUT',
                            // externalCode: e.attrType == 'DYNAMIC' ? e.externalCode : null,//新增多值属性时，默认不添加外部编码，需用户自己手工填写
                            attributeDef: e.attributeDef,
                            attributeValue: e.attrType == 'INSTANCE' ? e.defaultValue : null,
                            attrType: e.attrType,
                            attrTypeDisplay: e.attrTypeDisplay,
                            attrLabel: e.attrLabel,
                            code: e.code,
                            attrLabelDisplay: e.attrLabelDisplay,
                            isMandatory: e.isMandatory,
                            primaryType: e.primaryType,
                            unit: e.unit
                        });
                    },
                    valueTypeDel: function (item, index) {
                        if (item.valueTypeList.length == 1) {
                            return;
                        }
                        if (item.valueTypeList[index].id) {
                            //将删除的属性放入this.device.deviceAttributeDelete
                            item.valueTypeList[index].action = 'DEL';
                            this.device.deviceAttributeDelete.push(item.valueTypeList[index]);
                        }
                        item.valueTypeList.splice(index, 1);
                    },
                    //查询设备规格列表
                    queryDeviceDef: function () {
                        var _this = this;
                        var params = {
                            start: (_this.deviceDef.pageNum - 1) * _this.deviceDef.pageSize,
                            limit: _this.deviceDef.pageSize,
                            condition: {}
                        };
                        // if (_this.deviceDef.condition.deviceDefCategory) {
                        //     params.condition.deviceDefCategory = {
                        //         value: _this.deviceDef.condition.deviceDefCategory,
                        //         operator: '='
                        //     }
                        // }
                        if (_this.deviceDef.condition.defName) {
                            params.condition.defName = {
                                value: _this.deviceDef.condition.defName,
                                operator: 'like'
                            }
                        }
                        if (_this.deviceDef.condition.code) {
                            params.condition.code = {
                                value: _this.deviceDef.condition.code,
                                operator: '='
                            }
                        }
                        _this.deviceDef.loading = true;
                        thisObj.callAPIConn('/Device/0.1.0/DeviceDef/query', params, 'POST', function (vm) {
                            if (vm && vm.resp && vm.resp.code == '0') {
                                if (vm.data[0]) {
                                    _this.deviceDef.loading = false;
                                    const data = vm.data[0];
                                    _this.deviceDef.total = data.count;
                                    _this.deviceDef.datas = data.deviceDefs;
                                    //给默认渠道id带上渠道信息
                                    _this.deviceDef.datas.forEach(function (e) {
                                        e.channel = {};
                                        let channel = _this.device.deviceChannels.filter(function (m) {
                                            return m.id == e.defaultChannel;
                                        });
                                        if (channel.length == 1) {
                                            e.channel = channel[0];
                                        }
                                    });
                                }
                            }
                        });
                    },
                    //查询空间实例列表
                    querySpaceData: function (par) {
                        var _this = this;
                        var params = {
                            start: (_this.space.pageNum - 1) * _this.space.pageSize,
                            limit: _this.space.pageSize,
                            condition: {}
                        }
                        if (_this.space.condition.spaceRootCode) {
                            params.condition.spaceRootCode = {
                                value: _this.space.condition.spaceRootCode,
                                operator: '='
                            }
                        }
                        if (_this.space.condition.spaceName) {
                            params.condition.spaceName = {
                                value: _this.space.condition.spaceName,
                                operator: 'like'
                            }
                        }
                        if (_this.currentSpace.id) {
                            params.condition.pathId = {
                                value: _this.currentSpace.id,
                                operator: '='
                            }
                            if (_this.spaceRootCode) {
                                params.condition.spaceRootCode = {
                                    value: _this.spaceRootCode,
                                    operator: '='
                                }
                            }
                        }
                        _this.space.loading = true;
                        thisObj.callAPIConn('/Space/0.1.0/Space/query', params, 'POST', function (vm) {
                            if (vm && vm.resp && vm.resp.code == '0') {
                                if (vm.data[0]) {
                                    _this.space.loading = false;
                                    const data = vm.data[0];
                                    _this.space.total = data.count;
                                    _this.space.datas = data.spaces;
                                    if (Array.isArray(data.spaces) && data.spaces.length > 0) {
                                        data.spaces.forEach(function (e) {
                                            e.address = null;
                                            var addressArray = [];
                                            if (e.path && Array.isArray(e.path) && e.path.length > 0) {
                                                e.path.forEach(function (m, index) {
                                                    addressArray.push(m.spaceName);
                                                });
                                                addressArray.reverse();
                                                e.address = addressArray.join('/');
                                                if (e.spaceName) {
                                                    e.address += '/' + e.spaceName;
                                                }
                                            }
                                        });
                                    }
                                }
                            }
                        })
                    },
                    changeTab: function () {
                        var _this = this;
                        if (_this.device.activeTab == '1') {
                            _this.$refs['deviceData'].validate((valid1) => {
                                if (valid1) {
                                    var flag = _this.isDeviceExist();
                                    if (flag) {
                                        _this.$alert(_this.lang.other.deviceAlreadyExists, _this.lang.error, {
                                            confirmButtonText: _this.lang.confirmButtonText, //'确定',
                                            type: 'error',
                                            customClass: 'hw-messagebox',
                                            callback: function () {}
                                        });
                                        return;
                                    }
                                    _this.device.activeTab = '2';
                                }
                            })
                        } else {
                            _this.device.activeTab = '1';
                        }
                    },
                    qrCode: function (row) { //生成二维码
                        this.deviceList.deviceQrCode = true;
                        setTimeout(function () {
                            var canvas = document.getElementById("previewDiv");
                            canvas.innerHTML = "";
                            new QRCode(canvas, {
                                text: location.origin + "/besBaas/page#/cust_equipment_detail?id=" + row.id,
                                width: "210", //二维码的宽度
                                height: "210", //二维码的高度
                                background: "#ffffff", //二维码的后景色
                                foreground: "#000000" //二维码的前景色
                            });
                        }, 500);
                    },
                    viewDeviceAttribute: function (row) { //显示设备属性信息
                        this.deviceAttributeDialog.dialog = true;
                        this.deviceAttributeDialog.row = row;
                        this.refreshDeviceAttribute('DYNAMIC');
                    },

                    StyleTitle: function () {
                        $('#device-attributeDef-dialog  .el-dialog__title').attr('title', this.deviceAttributeDialog.row.deviceName)
                    },
                    refreshDeviceAttribute: function (type) {
                        let _this = this;
                        _this.deviceAttributeDialog.loading = true;
                        thisObj.callAPIConn('/Device/0.1.0/Device/' + _this.deviceAttributeDialog.row.id + '/attributes?attrType=' + type, {}, 'GET', function (vm) {
                            if (vm && vm.resp && vm.resp.code == '0') {
                                _this.deviceAttributeDialog.loading = false;
                                if (vm.data[0]) {
                                    _this.deviceAttributeDialog.deviceAttrDatas = (vm.data[0].deviceAttr || []).filter(e => {
                                        return e.attrType == type;
                                    });
                                    _this.deviceAttributeDialog.deviceAttrDatas.forEach(e => {
                                        e.attrTypeDisplay = e.attrType == 'INSTANCE' ? _this.lang.addEditDialog.instanceAttribute : (e.attrType == 'DYNAMIC' ? _this.lang.addEditDialog.dynamicAttribute : '');
                                        e.unit = e.attrDef.attrType ? (e.attrDef.attrType.unit ? e.attrDef.attrType.unit.code : '') : '';
                                        e.unitLabel = e.attrDef.attrType ? (e.attrDef.attrType.unit ? e.attrDef.attrType.unit.unitLabel : '') : '';
                                    });
                                }
                            }
                        });
                    },
                    /** 显示物模型绑点信息 */
                    viewDeviceModelBACnet: function (row) {
                        this.deviceModel.dialog = true;
                        this.deviceModel.row = row;
                        this.refreshDeviceModelBACnet();
                    },
                    deviceModelChangeTab: function (tab, event) {
                        this.deviceModel.tab = tab.name;
                        switch (this.deviceModel.tab) {
                            case "attr":
                                this.deviceModel.dataList = this.deviceModel.datas.deviceAttribute || [];
                                break;
                            case "service":
                                this.deviceModel.dataList = this.deviceModel.datas.deviceService || [];
                                break;
                            default:
                                break;
                        }
                    },
                    refreshDeviceModelBACnet: function () {
                        let _this = this;
                        _this.deviceModel.loading = true;
                        thisObj.callAPIConn('/Device/0.1.0/DeviceModelBACnet/' + _this.deviceModel.row.id, {}, 'GET', function (vm) {
                            if (vm && vm.resp && vm.resp.code == '0') {
                                _this.deviceModel.loading = false;
                                _this.deviceModel.datas = vm.data || {};
                                if (_this.deviceModel.dataList.length == 0) {
                                    _this.deviceModel.dataList = _this.deviceModel.datas.deviceAttribute;
                                }
                            }
                        })
                    },
                    /************** 上传设备模板文件 ****************/
                    submitUpload: function () {
                        let _this = this;
                        let list = document.getElementsByClassName('el-upload-list__item is-ready')
                        if (list.length == 0) {
                            this.$message({
                                type: 'info',
                                customClass: 'hw-message',
                                message: _this.lang.other.selectExcelFileToImport
                            })
                            return;
                        }
                        this.$refs.upload.submit();
                    },
                    uploadSectionFile: function (param) {

                        this.importFile(param.file);

                    },
                    importFile: function (fileObj) {
                        let _this = this;
                        HttpUtils.getCsrfToken(function (token) { //自动获取csrfToken
                            let filedata = new FormData();
                            filedata.append('file', fileObj, fileObj.name);
                            filedata.append('callbackService', '/service/Device/0.1.0/deviceDataImport');
                            filedata.append('templateName', _this.lang.templateName || 'Device_deviceDataImport');
                            filedata.append('operationName', 'BatchDeviceImport');
                            fetch("/native/CommonServices__BatchFileProcess/0.1.0/file/import", {
                                    method: 'POST',
                                    headers: {
                                        'csrf-token': token
                                    },
                                    body: filedata
                                }).then(r => {
                                    return r.json()
                                })
                                .then(r => {
                                    if (r.resCode == "0") {
                                        _this.uploadData.dialog = false;
                                        // "创建导入任务成功，请在 \"系统管理->数据导入导出\" 菜单中查看结果！"
                                        _this.$alert(_this.lang.other.importSuccessfull, _this.lang.prompt, {
                                            type: 'info',
                                            customClass: 'hw-messagebox',
                                            confirmButtonText: _this.lang.confirmButtonText, //'确定',
                                            callback: action => {}
                                        });
                                    } else {
                                        _this.$alert(r.resMsg, _this.lang.error, {
                                            confirmButtonText: _this.lang.confirmButtonText, //'确定',
                                            type: 'error',
                                            customClass: 'hw-messagebox',
                                            callback: function () {}
                                        });
                                    }
                                })
                        });
                    },
                    downLoadCurrentDevices: function () {
                        let _this = this;
                        if (_this.deviceList.dataList.length == 0) {
                            return;
                        }
                        let deviceIds = [];
                        _this.deviceList.dataList.forEach(function (e) {
                            deviceIds.push(e.id);
                        });
                        HttpUtils.getCsrfToken(function (token) { //获取csrfToken
                            fetch('/native/CommonServices__BatchFileProcess/0.1.0/file/export', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'csrf-token': token
                                },
                                body: JSON.stringify({
                                    "callbackService": "/service/Device/0.1.0/deviceDataExportForBatch",
                                    "operationName": "BatchExportDevices",
                                    "condition": {
                                        "deviceIds": deviceIds
                                    }
                                }),
                            }).then(response => {
                                return response.json()
                            }).then(function (r) {
                                if (r.resCode == "0") {
                                    if (r.result && r.result.logId) {
                                        _this.deviceList.downLoadStatus = true;
                                        _this.autoDownloadFile(token, r.result.logId); //循环查询并下载
                                    }
                                }
                            });
                        })
                    },
                    autoDownloadFile: function (token, logId) {
                        let _this = this;
                        var timeId = window.setInterval(function checkStoreFileName() {
                            fetch("/native/CommonServices__BatchFileProcess/0.1.0/processlog/queryById/" + logId, {
                                method: 'GET',
                                headers: {
                                    'csrf-token': token
                                }
                            }).then(function (resp) {
                                return resp.json();
                            }).then(function (data) {
                                if (data.status == 'Completed' && data.storeFileName) {
                                    let storeFileName = data.storeFileName;
                                    if (timeId) {
                                        _this.deviceList.downLoadStatus = false;
                                        window.clearInterval(timeId);
                                        timeId = null;
                                        fetch('/native/CommonServices__BatchFileProcess/0.1.0/file/download?fileType=2&fileName=' + storeFileName, {
                                            method: 'GET',
                                            headers: {
                                                'csrf-token': token
                                            },
                                            responseType: 'blob', //--设置请求数据格式
                                        }).then(response => response.blob()).then(function (fileData) {
                                            let blobUrl = window.URL.createObjectURL(fileData);
                                            if (!blobUrl) {
                                                return;
                                            }
                                            var a = document.createElement('a');
                                            a.download = storeFileName;
                                            a.href = blobUrl;
                                            a.click();
                                            _this.$alert(_this.lang.other.downloadSuccessfull + '：' + storeFileName + '. ' + _this.lang.other.checkResultMessage, _this.lang.prompt, {
                                                type: 'info',
                                                customClass: 'hw-messagebox',
                                                confirmButtonText: _this.lang.confirmButtonText, //'确定',
                                                callback: action => {}
                                            });
                                        });
                                    }
                                }
                            });
                        }, 4000)
                        setTimeout(() => { //等待1分钟还没导出的话就中断循环并提示自动导出失败
                            if (timeId) {
                                _this.deviceList.downLoadStatus = false;
                                _this.$alert(_this.lang.other.autoExportFailed + "<br/>" + _this.lang.other.resultsCanBeView, _this.lang.prompt, {
                                    type: 'warning',
                                    customClass: 'hw-messagebox',
                                    dangerouslyUseHTMLString: true,
                                    confirmButtonText: _this.lang.confirmButtonText, //'确定',
                                    callback: action => {}
                                });
                                clearInterval(timeId);
                            }
                        }, 60000);
                    },
                    downLoadAllDevices: function () {
                        let _this = this;
                        if (_this.deviceList.dataList.length == 0) {
                            return;
                        }
                        let status = '';
                        let deviceName = '';
                        let defId = '';
                        let spaceId = '';
                        let extCode = '';
                        let channel = '';
                        let gatewayId = '';
                        if (_this.condition.externalCode) {
                            extCode = _this.condition.externalCode;
                        }
                        if (_this.condition.status) {
                            status = _this.condition.status;

                        }
                        if (_this.condition.deviceName) {
                            deviceName = _this.condition.deviceName;
                        }
                        if (_this.condition.defIdLabel) {
                            defId = _this.condition.defId;
                        }
                        if (_this.condition.spaceInPathLabel) {
                            spaceId = _this.condition.spaceInPath;
                        }
                        if (_this.condition.channel) {
                            channel = _this.condition.channel;
                        }
                        if (_this.condition.gatewayId) {
                            gatewayId = _this.condition.gatewayId;
                        }
                        HttpUtils.getCsrfToken(function (token) { //获取csrfToken
                            fetch('/native/CommonServices__BatchFileProcess/0.1.0/file/export', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'csrf-token': token
                                },
                                body: JSON.stringify({
                                    "callbackService": "/service/Device/0.1.0/deviceDataExportForBatch",
                                    "operationName": "BatchExportDevices",
                                    "condition": {
                                        "start": 0,
                                        "limit": _this.deviceList.total,
                                        "exportAllFlag": "1",
                                        "status": status,
                                        "deviceName": deviceName,
                                        "spaceInPath": spaceId,
                                        "defId": defId,
                                        "channel": channel,
                                        "gatewayId": gatewayId,
                                        "externalCode": extCode
                                    }
                                }),
                            }).then(response => {
                                return response.json()
                            }).then(function (r) {
                                if (r.resCode == "0") {
                                    if (r.result && r.result.logId) {
                                        _this.deviceList.downLoadAllStatus = true;
                                        _this.$alert(_this.lang.other.downloadAllMessage, _this.lang.prompt, {
                                            type: 'info',
                                            customClass: 'hw-messagebox',
                                            confirmButtonText: _this.lang.confirmButtonText, //'确定',
                                            callback: action => {}
                                        });
                                        _this.autoDownloadAllFile(token, r.result.logId); //循环查询并下载
                                    }
                                }
                            });
                        })
                    },
                    autoDownloadAllFile: function (token, logId) {
                        let _this = this;
                        var timeId = window.setInterval(function checkStoreFileName() {
                            fetch("/native/CommonServices__BatchFileProcess/0.1.0/processlog/queryById/" + logId, {
                                method: 'GET',
                                headers: {
                                    'csrf-token': token
                                }
                            }).then(function (resp) {
                                return resp.json();
                            }).then(function (data) {
                                if (data.status == 'Completed' && data.storeFileName) {
                                    let storeFileName = data.storeFileName;
                                    if (timeId) {
                                        _this.deviceList.downLoadAllStatus = false;
                                        window.clearInterval(timeId);
                                        timeId = null;
                                        fetch('/native/CommonServices__BatchFileProcess/0.1.0/file/download?fileType=2&fileName=' + storeFileName, {
                                            method: 'GET',
                                            headers: {
                                                'csrf-token': token
                                            },
                                            responseType: 'blob', //--设置请求数据格式
                                        }).then(response => response.blob()).then(function (fileData) {
                                            let blobUrl = window.URL.createObjectURL(fileData);
                                            if (!blobUrl) {
                                                return;
                                            }
                                            var a = document.createElement('a');
                                            a.download = storeFileName;
                                            a.href = blobUrl;
                                            a.click();
                                        });
                                    }
                                }
                            });
                        }, 3000)
                    },
                    // 更新设备状态数量、百分比
                    queryDeviceStatusCount: function () {
                        var _this = this;
                        if (Studio.inReader) { //Studio.inReader=true时为运行态，=false时为开发态
                            let params = {};
                            if (_this.currentSpace.id) {
                                params.spaceInPath = _this.currentSpace.id;
                            }
                            thisObj.callAPIConn("/SmartCampus__FacilityManagement/0.1.0/Device/queryDeviceStatus", params, 'POST', function (vm) {
                                if (vm && vm.resp && vm.resp.code == '0') {
                                    if (vm.data[0]) {
                                        const data = vm.data[0];
                                        showStatusData(data);
                                    }
                                }
                            })
                        } else {
                            //开发态时读取mock数据进行显示
                            $.ajaxSettings.async = false;
                            $.getJSON(widgetBasePath + 'mock/deviceStatus.json', function (data) {
                                showStatusData(data.result[0]);
                                $.ajaxSettings.async = true;
                            });
                        }

                        function showStatusData(data) { //内部公共方法
                            _this.deviceStatus.total = data.total;
                            if (data.total == 0) {
                                _this.deviceStatus.active.count = 0;
                                _this.deviceStatus.active.percent = 0;
                                _this.deviceStatus.inactive.count = 0;
                                _this.deviceStatus.inactive.percent = 0;
                                _this.deviceStatus.deleted.count = 0;
                                _this.deviceStatus.deleted.percent = 0;
                                _this.deviceStatus.unreg.count = 0;
                                _this.deviceStatus.unreg.percent = 0;
                            } else {
                                _this.deviceStatus.active.count = data.ACTIVE;
                                _this.deviceStatus.active.percent = (Math.round(data.ACTIVE / data.total * 10000) / 100.00) || 0;
                                _this.deviceStatus.inactive.count = data.INACTIVE;
                                _this.deviceStatus.inactive.percent = (Math.round(data.INACTIVE / data.total * 10000) / 100.00) || 0;
                                _this.deviceStatus.deleted.count = data.DELETED;
                                _this.deviceStatus.deleted.percent = (Math.round(data.DELETED / data.total * 10000) / 100.00) || 0;
                                _this.deviceStatus.unreg.count = data.UNREG;
                                _this.deviceStatus.unreg.percent = (Math.round(data.UNREG / data.total * 10000) / 100.00) || 0;
                            }
                            _this.deviceStatusData.incircle.font.text = _this.deviceStatus.active.percent;
                            _this.drawCancas(_this.deviceStatusData);
                        }
                    },
                    //查询外部渠道
                    queryDeviceChannel: function () {
                        var _this = this;
                        thisObj.callAPIConn("/Device/0.1.0/Channel/query", {
                            start: 0,
                            limit: 5000,
                            condition: {}
                        }, 'POST', function (vm) {
                            if (vm && vm.resp && vm.resp.code == '0') {
                                if (vm.data[0]) {
                                    const data = vm.data[0];
                                    _this.device.deviceChannels = data.categories.map(function (e) {
                                        return {
                                            name: e.channelName,
                                            code: e.code,
                                            id: e.id
                                        }
                                    });
                                }
                            }
                        })
                    },
                    // 查询设备实例列表
                    queryDevicesList: function () {
                        var _this = this;
                        var params = {
                            start: (_this.deviceList.pageNum - 1) * _this.deviceList.pageSize,
                            limit: _this.deviceList.pageSize,
                            condition: {}
                        };
                        //当数据量达到10万 减少显示页面的数据 DTS2019081513032
                        if (_this.deviceList.pageNum > 10000) {
                            _this.pageCount = "3";
                            $('.el-pagination .el-pager li').css('min-width', '48px');
                        } else {
                            _this.pageCount = "4";
                            $('.el-pagination .el-pager li').css('min-width', '35.5px');
                        }
                        if (_this.condition.status) {
                            params.condition.status = {
                                value: _this.condition.status,
                                operator: '='
                            }
                        }
                        if (_this.condition.externalCode) {
                            params.condition.externalCode = {
                                value: _this.condition.externalCode,
                                operator: '='
                            }
                        }
                        if (_this.condition.deviceName) {
                            params.condition.deviceName = {
                                value: _this.condition.deviceName,
                                operator: 'like'
                            }
                        }
                        if (_this.condition.defIdLabel) {
                            params.condition.defId = {
                                value: _this.condition.defId,
                                operator: '='
                            }
                        }
                        if(_this.condition.defIdLabelList.length >0){
                            params.condition.defId = {
                                valueList: _this.selectdeviceList,
                                operator: 'in'
                            }
                        }
                        if (_this.condition.spaceInPathLabel) {
                            params.condition.spaceInPath = {
                                value: _this.condition.spaceInPath,
                                operator: '='
                            }
                        }
                        if (_this.condition.channel) {
                            params.condition.channel = {
                                value: _this.condition.channel,
                                operator: '='
                            }
                        }
                        if (_this.condition.gatewayId) {
                            params.condition.gatewayId = {
                                value: _this.condition.gatewayId,
                                operator: '='
                            }
                        }
                        params.querySchema = {
                            devices: {
                                deviceDef: {},
                                deviceLocation: {
                                    spaceInPath: {}
                                },
                                deviceProduct: {}
                            },
                            count: true
                        };
                        console.info("params:"+ params);
                        if (Studio.inReader) { //Studio.inReader=true时为运行态，=false时为开发态
                            _this.deviceList.loading = true;
                            thisObj.callAPIConn("/SmartCampus__FacilityManagement/0.1.0/Device/queryDevice", params, 'POST', function (vm) {
                                if (vm && vm.resp && vm.resp.code == '0') {
                                    if (vm.data[0]) {
                                        _this.deviceList.loading = false;
                                        const data = vm.data[0];
                                        handelDeviceListData(data);
                                    }
                                }
                            })
                        } else {
                            //开发态时读取mock数据进行显示
                            $.ajaxSettings.async = false;
                            $.getJSON(widgetBasePath + 'mock/deviceList.json', function (data) {
                                handelDeviceListData(data.result[0]);
                                $.ajaxSettings.async = true;
                            });
                        }

                        function handelDeviceListData(data) {
                            _this.queryDeviceStatusCount(); //查询设备各状态的数量
                            _this.deviceList.total = data.count;
                            _this.deviceList.dataList = data.devices;
                            var paramObj = {
                                layerId: "layer_123456",
                                layerIndex: 1234,
                                markers: [],
                                options: {
                                    image: _this.widgetBasePath + "images/point-cluster.png",
                                    width: 80,
                                    height: 80,
                                }
                            };
                            //处理位置信息
                            _this.deviceList.dataList.forEach(function (e) {
                                e.address = null;
                                var addressArray = [];
                                if (e.deviceLocation && e.deviceLocation.spaceInPath && Array.isArray(e.deviceLocation.spaceInPath) && e.deviceLocation.spaceInPath.length > 0) {
                                    e.deviceLocation.spaceInPath.forEach(function (m, index) {
                                        addressArray.push(m.spaceName);
                                    });
                                    addressArray.reverse();
                                    e.address = addressArray.join('/');
                                }
                                Vue.set(e, 'isCollecting', false);
                                e.address = e.address ? e.address : '';
                                let deviceParam = {
                                    code: e.code,
                                    id: e.id,
                                    deviceLocation: e.deviceLocation
                                };
                                var disabled = "";
                                if (e.status == "DELETED") {
                                    disabled = "disabled='disabled'";
                                }
                                var eDeviceName = _this.htmlEncode(e.deviceName);
                                var marker = {
                                    title: eDeviceName,
                                    image: e.deviceDef.iconUrl ? e.deviceDef.iconUrl : _this.widgetBasePath + "images/point-blue.png",
                                    width: e.deviceDef.iconUrl ? 40 : 80,
                                    height: e.deviceDef.iconUrl ? 40 : 80,
                                    imageSelected: _this.widgetBasePath + 'images/point-orange.png',
                                    widthSelected: e.deviceDef.iconUrl ? 50 : 80,
                                    heightSelected: e.deviceDef.iconUrl ? 50 : 80,
                                    tag: {},
                                    //以下入参超图无
                                    label: {
                                        text: eDeviceName,
                                        offset: [5, -25]
                                    },
                                    id: e.id,
                                    //clickZoom: 17,
                                    infoWindow: {
                                        content: "<div>" +
                                            "<span style='display:block;white-space:normal;word-break: break-all;'>" + _this.lang.other.name + ": " + _this.htmlEncode(e.deviceName) + "</span>" +
                                            "<span style='display:block;white-space:normal;word-break: break-all;'>" + _this.lang.other.number + ": " + _this.htmlEncode(e.externalCode) + "</span>" +
                                            "<span style='display:block;white-space:normal;word-break: break-all;'>" + _this.lang.other.position + ": " + _this.htmlEncode(e.address) + "</span>" +
                                            "<button type='button'  " + disabled + "style='width: 10rem;margin: 1rem;cursor: pointer;' class='map-popup-btn' onclick='operateCameraRange(" +
                                            JSON.stringify(deviceParam) + ")'><span>" + _this.lang.other.viewSurroundingCameras + "</span></button></div>",
                                        offset: [10, -10],
                                        width: 200,
                                        height: 0,
                                        boxTheme: "dark",
                                    },
                                    titleStyle: {
                                        offset: e.deviceDef.iconUrl ? null : [-10, -40],
                                    }
                                };
                                if (e.deviceLocation) {
                                    if (e.deviceLocation.coordinate && (e.deviceLocation.coordinate.indexOf(',') != -1)) {
                                        var coordinates = [];
                                        coordinates = e.deviceLocation.coordinate.split(',');
                                        if (!coordinates[0] || !coordinates[1]) {
                                            if (e.deviceLocation.spaceData) {
                                                if (e.deviceLocation.spaceData.longitude && e.deviceLocation.spaceData.latitude) {
                                                    marker.position = [e.deviceLocation.spaceData.longitude, e.deviceLocation.spaceData.latitude];
                                                }
                                            }
                                        } else {
                                            if (coordinates.length < 3) {
                                                if (coordinates.length == 2) {
                                                    marker.position = [coordinates[0], coordinates[1]];
                                                }
                                            } else {
                                                marker.position = [coordinates[0], coordinates[1]];
                                                if (coordinates.length == 5) {
                                                    marker.buildingId = coordinates[3];
                                                    marker.floorId = coordinates[4];
                                                }
                                            }
                                        }
                                    }
                                }
                                if (marker.position) {
                                    paramObj.markers.push(marker);
                                }
                                //设备在线状态 0:在线显示白色 1:离线显示黄色 2:默认值不显示
                                _this.deviceData.connectStatus = e.connectStatus ? e.connectStatus : "2";
                                console.log("e.connectStatus is ", e.connectStatus)
                                console.log("_this.connectStatus is ", _this.deviceData.connectStatus)
                            });
                            console.log("paramObj", paramObj)
                            if (_this.notInitQuery) {
                                if (paramObj.markers.length > 0) {
                                    thisObj.triggerEvent("addMarker", {
                                        append: false,
                                        clusterInfo: paramObj
                                    });
                                } else {
                                    thisObj.triggerEvent("addMarker", {
                                        append: false
                                    });
                                }
                            }
                            _this.notInitQuery = true;
                            //换页后控制鼠标效果
                            $('.ec-extension-gismap').css('cursor', 'inherit');
                            $('.ol-viewport').css('cursor', 'inherit');
                            $('.leaflet-zoom-animated').css('cursor', 'inherit');
                            $('#map').css('cursor', 'inherit');
                            //console.log("光标改成inherit");
                            $('.leaflet-interactive').css('cursor', 'pointer');
                        }
                    },
                    // 从系统参数中查询空间根编码
                    querySysParams: function () {
                        var _this = this;
                        let params = {
                            "params": ["UnifiedPortal_Mainframe_SpaceRootCode", "FacilityManagement_Channel_IOT","FacilityManagement_DynamicAttr_Show"]
                        };
                        thisObj.callAPIConn("/SmartCampus__FacilityManagement/0.1.0/SystemParams/query", params, 'POST', function (vm) {
                            if (vm && vm.resp && vm.resp.code == '0') {
                                const data = vm.data.value;
                                _this.spaceRootCode = data['UnifiedPortal_Mainframe_SpaceRootCode'];
                                _this.channelIOT = (data['FacilityManagement_Channel_IOT']).split(',');
								_this.dynamicAttrShow = data['FacilityManagement_DynamicAttr_Show'];
                                if (_this.dynamicAttrShow == "0") {
                                    _this.dynamicAttrShowFlag = true;
                                } else if (_this.dynamicAttrShow == "1") {
                                    _this.dynamicAttrShowFlag = false;
                                } else {
                                    _this.dynamicAttrShowFlag = true;
                                }
                            }
                        })
                    },
                    /******** 绘制仪表盘 *********/
                    drawCancas: function (data) {
                        var canvas = document.getElementById("myCanvas");
                        if (!canvas) {
                            return;
                        }
                        let width = 140;
                        let height = 140;
                        canvas.width = width;
                        canvas.height = height;
                        this.deviceStatusData.incircle.font.height = height / 2;
                        this.deviceStatusData.foot.height = height * 12 / 13;
                        let backgroundColor = window.getComputedStyle(document.getElementById('my-canvas'), null).backgroundColor;
                        console.log('背景颜色', backgroundColor);
                        this.deviceStatusData.backgroundColor = backgroundColor;
                        var ctx = canvas.getContext("2d");
                        ctx.fillStyle = data.backgroundColor;
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                        ctx.save();
                        ctx.translate(0, 0);
                        ctx.beginPath();
                        ctx.arc(width / 2, height / 2, width / 2 - 2, -Math.PI * 5 / 4, Math.PI / 4, false)
                        ctx.strokeStyle = data.excircle.color;
                        ctx.lineWidth = data.excircle.width;
                        ctx.stroke();
                        if (!!window.ActiveXObject || "ActiveXObject" in window) {
                            data.foot.font = "normal 16px sans-serif";
                            data.incircle.font.font = "19px sans-serif";
                        }
                        //底部文字
                        canvas_text(canvas, ctx, data.foot.text, data.foot.font, data.foot.color, this.deviceStatusData.foot.height, false);
                        //中间文字
                        canvas_text(canvas, ctx, data.incircle.font.text + '%', data.incircle.font.font, data.incircle.font.color, data.incircle.font.height, true);
                        for (let i = 135; i <= 405; i += 5) {
                            ctx.save();
                            ctx.translate(width / 2, height / 2);
                            ctx.rotate(Math.PI / 180 * i);
                            ctx.beginPath();
                            ctx.moveTo(width * 80 / 200, 0);
                            ctx.lineTo(width * 90 / 200, 0);
                            ctx.lineCap = 'square';
                            ctx.lineWidth = data.incircle.width;
                            ctx.strokeStyle = data.incircle.colorOff;
                            ctx.stroke();
                            ctx.restore();
                        }
                        let max = 135 + 2.75 * this.deviceStatusData.incircle.font.text;
                        for (let i = 135; i < max; i += 5) {
                            ctx.save();
                            ctx.translate(width / 2, height / 2);
                            ctx.rotate(Math.PI / 180 * i);
                            ctx.beginPath();
                            ctx.moveTo(width * 80 / 200, 0);
                            ctx.lineTo(width * 90 / 200, 0);
                            ctx.lineCap = 'square';
                            ctx.lineWidth = data.incircle.width;
                            ctx.strokeStyle = data.incircle.colorOn;
                            ctx.stroke();
                            ctx.restore();
                        }
                        // Canvas居中写字，参数（context对象，要写的字，字体，颜色，绘制的高度）
                        function canvas_text(canvast, _paint, _text, _fontSzie, _color, _height, shadow) {
                            ctx.save();
                            _paint.font = _fontSzie;
                            _paint.fillStyle = _color;
                            _paint.textAlign = "center";
                            _paint.textBaseline = "middle";
                            if (shadow) {
                                _paint.shadowBlur = 30;
                                _paint.shadowColor = _color;
                            }
                            _paint.fillText(_text, canvast.width / 2, _height);
                            ctx.restore();
                        }
                    },
                    // 按外部编码、来源校验设备实例是否存在
                    isDeviceExist: function () {
                        var _this = this;
                        var flag = false;
                        if (_this.deviceData.externalCode && _this.deviceData.channel) {
                            if (_this.deviceData.id) {
                                if (_this.deviceData.externalCode === _this.deviceData.externalCodeCopy && _this.deviceData.channel === _this.deviceData.channelCopy) {
                                    flag = false;
                                } else {
                                    check();
                                }
                            } else {
                                check();
                            }
                            return flag;

                            function check() {
                                thisObj.callAPIConn('/Device/0.1.0/Device/isDeviceExist', {
                                    externalCode: _this.deviceData.externalCode,
                                    channel: _this.deviceData.channel,
                                    async: false
                                }, 'POST', function (vm) {
                                    if (vm && vm.resp && vm.resp.code == '0') {
                                        if (vm.data[0] && vm.data[0].ids.length >= 1) {
                                            flag = true;
                                        } else {
                                            flag = false;
                                        }
                                    }
                                })
                            }
                        }
                    },
                    //复制文本到剪切板
                    copyText(s) {
                        let flag = false;
                        if (window.clipboardData) {
                            window.clipboardData.setData('text', s);
                            flag = true;
                        } else {
                            (function () {
                                document.oncopy = function (e) {
                                    e.clipboardData.setData('text', s);
                                    e.preventDefault();
                                    document.oncopy = null;
                                    flag = true;
                                }
                            })();
                            document.execCommand('Copy');
                        }
                        if (flag) {
                            this.$message({
                                showClose: true,
                                message: this.lang.deviceManage.tableArea.copyComplete,
                                duration: 2000,
                                type: 'success',
                                customClass: 'hw-message'
                            });
                        }
                    },
                    copyStatus(s) {
                        s = s == '2' ? this.lang.deviceManage.tableArea.notConnected : (s == '0' ? this.lang.deviceManage.tableArea.online : this.lang.deviceManage.tableArea.offline);
                        this.copyText(s)
                    },
                    cascaderNodeAddTitleSpace(data) { // el-cascader组件中手动给鼠标滑过行元素时增加一个title属性
                        if(data && data.length > 0){
                            let t = data.length;
                            this.queryCurrentSpaceTree( data[t-1]);
                        }
                        setTimeout(function () {
                            $('.el-cascader-node__label').mouseover(function () {
                                $(this)[0].title = $(this)[0].innerText;
                            });
                        }, 500);
                    },
                    // cascaderNodeAddTitleSpacePath(data) { // el-cascader组件中手动给鼠标滑过行元素时增加一个title属性
                    //     if(data && data.length > 0){
                    //         let t = data.length;
                    //        //  this.space.condition.spacePathList = data[t-1];
                    //         this.queryCurrentSpaceTree(data[t-1]);
                    //     }
                    //     setTimeout(function () {
                    //         $('.el-cascader-node__label').mouseover(function () {
                    //             $(this)[0].title = $(this)[0].innerText;
                    //         });
                    //     }, 500);
                    // },
                    cascaderNodeAddTitle(data) { // el-cascader组件中手动给鼠标滑过行元素时增加一个title属性
                        setTimeout(function () {
                            $('.el-cascader-node__label').mouseover(function () {
                                $(this)[0].title = $(this)[0].innerText;
                            });
                        }, 500);
                    },
                    cascaderTitle(className) { // 鼠标移入el-cascader组件时表单元素加title属性
                        let element = null;
                        switch (className) {
                            case 'cascader-one':
                                element = $('.cascader-one .el-cascader>div>input')[0];
                                break;
                            case 'cascader-two':
                                element = $('.cascader-two .el-cascader>div>input')[0];
                                break;
                            default:
                                break;
                        }
                        if (element) {
                            element.title = element.value;
                        }
                    },
                    spanAddBackground(e) { //鼠标移入时给文本添加背景色
                        e.target.offsetParent.children[1].style.background = '#000';
                    },
                    spanMoveBackground(e) { //鼠标移出时去掉背景色
                        e.target.offsetParent.children[1].style.background = 'none';
                    }
                }
            });
        }

        thisObj.sksBindItemEvent();
        $(window).resize(function () {
            thisObj.sksRefreshEvents();
        });
    },

    receiveLocationCbk: function (data) {
        var _this = this;
        if (data && data.eventParam && data.eventParam.lat && data.eventParam.lng) {
            console.log("采集到的数据： ", data.eventParam);
            //寻找是否有设备在采集信息
            $.each(_this.vm.deviceList.dataList || [], function (i, device) {
                if (device.isCollecting) {
                    var message = _this.vm.lang.other.obtainedLocationInformation + ":<br/>" + _this.vm.lang.addEditDialog.longitude + "：" + data.eventParam.lng + "<br/>" + _this.vm.lang.addEditDialog.latitude + "：" + data.eventParam.lat;
                    if (data.eventParam.buildingId) {
                        message = message + "<br/>" + _this.vm.lang.addEditDialog.building + "：" + data.eventParam.buildingId;
                        if (data.eventParam.floorId) {
                            message = message + '<br/>' + _this.vm.lang.addEditDialog.floor + '：' + data.eventParam.floorId;
                        }
                    }
                    _this.vm.$confirm(message, _this.vm.lang.prompt, {
                        confirmButtonText: _this.vm.lang.confirmButtonText, //'确定',
                        cancelButtonText: _this.vm.lang.other.reacquire,
                        dangerouslyUseHTMLString: true,
                        distinguishCancelAndClose: true,
                        type: 'success',
                        customClass: 'device-manage-box'
                    }).then(function () {
                        //拼接位置信息
                        var coordinate = data.eventParam.lng + ',' + data.eventParam.lat + ',0';
                        if (data.eventParam.buildingId) {
                            coordinate = coordinate + ',' + data.eventParam.buildingId;
                            if (data.eventParam.floorId) {
                                coordinate = coordinate + ',' + data.eventParam.floorId;
                            }
                        }
                        if (!device.deviceLocation) {
                            device.deviceLocation = {};
                        }
                        device.deviceLocation.coordinate = coordinate;
                        _this.vm.openDeviceDialog('edit', device);
                        _this.vm.device.activeTab = '2';
                    }).catch(function (action) {
                        if (action == 'close') {
                            Vue.set(device, 'isCollecting', false);
                            //控制鼠标效果
                            $('.ec-extension-gismap').css('cursor', 'inherit');
                            $('.ol-viewport').css('cursor', 'inherit');
                            $('.leaflet-zoom-animated').css('cursor', 'inherit');
                            $('#map').css('cursor', 'inherit');
                            //console.log("光标改成inherit");
                            $('.leaflet-interactive').css('cursor', 'pointer');
                        }
                    });
                }
            });
        }
    },

    receiveDeviceMsgCbk: function (data) {
        // console.log('地图点击设备点：', data);
        var deviceId = data.eventParam.element.id;
        var rows = this.vm.deviceList.dataList.filter(function (e) {
            return e.id == deviceId;
        });
        if (rows.length == 1) {
            this.vm.$refs.singleTable.setCurrentRow(rows[0]);
        }
    },
    /****** 通过 APIConnector 调用 CustomAPI ******/
    callAPIConn: function (service, param, type, callbackFunc, failCallBackFunc) {
        var thisObj = this;
        var connector = null;
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
                        callbackFunc.call(thisObj, response);
                    }
                })
                .fail(function (response) {
                    if (thisObj.vm.buttonSaveLoading) {
                        thisObj.vm.buttonSaveLoading = false;
                    }
                    thisObj.vm.$alert(response.response.resMsg, thisObj.vm.lang.error, {
                        confirmButtonText: thisObj.vm.lang.confirmButtonText, //'确定',
                        type: 'error',
                        customClass: 'hw-messagebox',
                        callback: function () {}
                    });
                })
        } else {
            if (failCallBackFunc) {
                failCallBackFunc.call(thisObj, "No Flow Connector!")
            }
        }
    },
    initGlobalActionHook() {
        window.startLive = data => {
            this.vm.startLive(data)
        }
        window.operateRelation = data => {
            this.vm.operateRelation(data)
        }

        window.operateCameraRange = data => {
            this.vm.operateCameraRange(data)
        }
    }
});