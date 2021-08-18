var pageProperties = {}; //存储页面所有地图组件的property
var pageMaps = {}; //存储页面所有地图组件的map实例
var pageEcharts = {};//存储页面所有地图组件的echart实例
var pageEchartsOptions = {};//存储页面所有地图组件的echart配置

function initMap() {
    Object.keys(pageProperties).forEach(function (p) {
        var properties = pageProperties[p];
        var gisMap = pageMaps[properties.cellId];
        if (!gisMap) {
            return false;
        }


        //开发态，某种地图类型回调后，初始化所有该地图类型的map
        if (!Studio.inReader && properties.mapType != window.mapTypeLoading) {
            return false;
        }
        //运行态，某种地图类型回调后，初始化所有该地图类型的未被初始化过的map
        else if (Studio.inReader && (properties.mapType != window.mapTypeLoading || pageMaps[properties.cellId]['originalMap'])) {
            return false;
        }

        var vueModel = null;
        if ($('#' + properties.cellId + ' #reader-gisMap') && $('#' + properties.cellId + ' #reader-gisMap').length > 0) {
            vueModel = $('#' + properties.cellId + ' #reader-gisMap')[0].__vue__;
        } else {
            return false;
        }


        //根据外部需求，获取echart

        var node = document.querySelector('#' + properties.cellId + ' #map');  //0513 todo
        if (!node) {
            return false;
        }

        var selectedNode = document.querySelector('#' + properties.cellId + ' #map');
        if (!vueModel.is3PartyMap) {
            pageEcharts[properties.cellId] = echarts.init(node);
            var gismapRoot = document.querySelector('#' + properties.cellId + ' #map' + ' .ec-extension-gismap');
            if (gismapRoot) {
                document.querySelector('#' + properties.cellId + ' #map').removeChild(gismapRoot);
            }
            gismapRoot = document.createElement('div');
            gismapRoot.style.cssText = 'width:100%;height:100%';
            gismapRoot.classList.add('ec-extension-gismap');
            document.querySelector('#' + properties.cellId + ' #map').appendChild(gismapRoot);
            selectedNode = document.querySelector('#' + properties.cellId + ' #map' + ' .ec-extension-gismap');
        }

        vueModel.mapCenter = [properties.longitude, properties.latitude, properties.height];
        vueModel.mapZoom = parseInt(properties.zoomLevel);
        vueModel.mapRph = [properties.roll, properties.threeDPitch, properties.heading];

        if (typeof properties.longitude == "string") {
            properties.longitude = Number(properties.longitude);
        }

        if (typeof properties.latitude == "string") {
            properties.latitude = Number(properties.latitude);
        }

        var curViewMode = properties.mapType == 'GAODE_MAP' ? properties.viewMode : properties.viewModeNew;

        var initParam = {
            container: selectedNode,
            center: vueModel.mapCenter,
            zoom: parseInt(properties.zoomLevel),
            minZoom: parseInt(properties.minZoom),
            maxZoom: parseInt(properties.maxZoom),
            viewMode: curViewMode,
            mapStyle: properties.mapStyle,
            customMapStyle: properties.customMapStyle,
            scrollWheel: Studio.inReader ? true : false, //是否可以用滚轮控制地图缩放
            accessToken: properties.token,
            rph: vueModel.mapRph,
            camDistance: properties.cameraDistance
        };

        if (properties.showImageLayer) {
            initParam.layers = {
                baseLayer: {
                    hide: !properties.showBaseLayer
                },
                imageLayers: [
                    {
                        imageUrl: properties.imageUrl,
                        bounds: [[properties.imgSwlongitude, properties.imgSwlatitude], [properties.imgNelongitude, properties.imgNelatitude]],//sw:西南，左下   ne:东北 右上
                    }
                ]
            };
        }

        //加载地图
        gisMap.loadMap(initParam, function () {
            if (properties.mapTypeControl) {
                gisMap.addControl("MapType");
            }

            if (properties.threeDControl) {
                if (properties.threeDControlSize == 'small') {
                    gisMap.addControl("ControlBar", {
                        position: {
                            right: '0px',
                            bottom: '-92px'
                        }
                    });
                    $('.amap-luopan').css('transform', 'scale(0.5,0.5)');
                } else {
                    gisMap.addControl("ControlBar");
                }

            }

            //监听地图缩放事件
            gisMap.onZoom("zoomchanged", function () {
                var zoom = gisMap.getZoom();
                var center = gisMap.getCenter();
                vueModel.handleMapZoomEvent(zoom, center);

            });

            //监听地图点击事件
            gisMap.on("click", function (e) {
                vueModel.handleMapClickEvent(e);
            });

            //监听框选结束事件
            gisMap.frameOn('end', function (e) {

                vueModel.handleFrameOn();
            });

            //给echarts用，需要修改todo......

            if (!vueModel.is3PartyMap) {
                //修改地图配置
                var options = {
                    gismap: {
                        zoom: parseInt(properties.zoomLevel),
                        mapStyle: properties.mapStyle,
                        center: [properties.longitude, properties.latitude],
                        roam: Studio.inReader ? true : 'move',
                        mapCellId: properties.cellId
                    }
                };

                var afterBoundsChanged = function () {

                    gisMap.off("boundsChanged", afterBoundsChanged);
                    pageEcharts[properties.cellId].setOption(options);
                    vueModel.getScatterData({});

                };

                var afterProjectionChanged = function () {

                    gisMap.off("projectionChanged", afterProjectionChanged);
                    gisMap.on("boundsChanged", afterBoundsChanged);
                };
                gisMap.on("projectionChanged", afterProjectionChanged);
            }

            if (properties.showTitle) {
                $('#' + properties.cellId + ' #reader-gisMap .box-content-title').css('text-align', properties.titlePosition).css('background-color', properties.titleBackColor).css('color', properties.titleColor).css('font-size', properties.titleFontSize).css('font-family', properties.titleFontFamily);
            }

            $('#' + properties.cellId + ' #reader-gisMap').css('border-top-left-radius', properties.borderTopLeftRadius + 'px').css('border-bottom-left-radius', properties.borderBottomLeftRadius + 'px').css('border-top-right-radius', properties.borderTopRightRadius + 'px').css('border-bottom-right-radius', properties.borderBottomRightRadius + 'px');

            if (properties.geoMetryControl) {
                $('#' + properties.cellId + ' #reader-gisMap .geo-wrapper').css(properties.geoMetryLeft, properties.geoHoriPercent + '%').css(properties.geoMetryTop, properties.geoVertiPercent + '%').css('background-color', properties.geoBackColor);
            }

            if (properties.zoomControl) {
                $('#' + properties.cellId + ' #reader-gisMap .zoom-wrapper').css(properties.zoomLeft, properties.zoomHoriPercent + '%').css(properties.zoomTop, properties.zoomVertiPercent + '%').css('background-color', properties.zoomBackColor);
            }

            $('#' + properties.cellId + ' #reader-gisMap .floor-wrapper').css(properties.levelLeft, properties.levelHoriPercent + '%').css(properties.levelTop, properties.levelVertiPercent + '%').css('background-color', properties.levelBackColor);

            var style = document.createElement('style');
            style.type = 'text/css';
            style.innerHTML = '.bgColor { background-color: ' + properties.bgColor + '!important; }';
            document.getElementsByTagName('head')[0].appendChild(style);
            $('#' + properties.cellId + ' #reader-gisMap .ec-extension-gismap').addClass('bgColor');


            //初始化时添加overlays
            vueModel.getOverlaysData({});
            //初始化时查询告警信息
            vueModel.getAlarmData({});

            //绑定建筑物点击事件，显示室内地图
            if (properties.levelControl) {
                gisMap.onBuilding('click', function (e) {

                    //如果当前有室内地图打开，且与点击的是同一栋楼，则不做任何操作
                    if (vueModel.isIndoorMap && vueModel.buildingInfo.buildingId == e.common.buildingId) {
                        return;
                    }

                    //记录原本的楼栋 楼层
                    var curBuilding = vueModel.buildingInfo.buildingId;
                    var curFloor = "";
                    $.each(vueModel.buildingInfo.floorList || [], function (i, floor) {
                        if (floor.flag) {
                            curFloor = floor.value;
                            return false;
                        }
                    });

                    //switchOutdoor会改变isIndoorMap的值，先记录
                    var isIndoorMapCopy = vueModel.isIndoorMap;

                    //切换楼栋前先切室外，否则室内覆盖物展示不对
                    vueModel.switchOutdoor();

                    var floorList = e.common.floors.split(',');
                    floorList.reverse();
                    if (e.common.buildingId && floorList.length > 0) {

                        vueModel.buildingInfo.buildingId = e.common.buildingId;

                        vueModel.buildingInfo.floorList = [];

                        var floorLabelList = [];
                        if (e.common.floorsLabel) {
                            floorLabelList = e.common.floorsLabel.split(',');
                            floorLabelList.reverse();
                        }
                        $.each(floorList || [], function (i, floor) {
                            var obj = {value: floor, label: floor, flag: false};
                            if (floorLabelList.length == floorList.length) {
                                obj.label = floorLabelList[i];
                            }
                            if (i == floorList.length - 1) {
                                obj.flag = true;
                            }
                            vueModel.buildingInfo.floorList.push(obj);
                        });


                        vueModel.triggerSwitchIndoorAndOutdoor({
                            fromOutToIn: isIndoorMapCopy ? false : true,
                            fromInToIn: isIndoorMapCopy ? true : false,
                            toBuilding: e.common.buildingId,
                            toFloor: floorList[floorList.length - 1],
                            fromBuilding: isIndoorMapCopy ? curBuilding : "",
                            fromFloor: isIndoorMapCopy ? curFloor : ""
                        });


                        gisMap.showIndoorMap({
                            buildingId: e.common.buildingId,
                            floorId: floorList[floorList.length - 1]
                        });

                        if (properties.openIndoorHover) {
                            gisMap.addIndoorTip(e.common.buildingId);
                        }

                        vueModel.isIndoorMap = true;
                        vueModel.showCurFloorOverlays();

                    }

                });
            }


        });

    });
}

var SC_Map_Widget = StudioWidgetWrapper.extend({
    init: function () {
        var thisObj = this;
        thisObj._super.apply(thisObj, arguments);
        thisObj.render();
        if ((typeof (Studio) != "undefined") && Studio) {
            // -------------------- Event --------------------
            //点击地图触发的事件
            Studio.registerEvents(thisObj, "clickTheMap", "Click The Map", []);

            //点击某个Marker
            Studio.registerEvents(thisObj, "markerElementSelection", "Marker Element Selection", []);

            //点击散点图中的某个点
            Studio.registerEvents(thisObj, "scatterPointSelection", "Scatter Point Selection", []);

            //缩放地图触发的事件
            Studio.registerEvents(thisObj, "zoomTheMap", "Zoom The Map", []);

            //框选结束触发的事件
            Studio.registerEvents(thisObj, "frameOnEnd", "Frame On End", []);

            //切换室内外触发的事件
            Studio.registerEvents(thisObj, "switchIndoorAndOutdoor", "Switch Indoor And Outdoor", []);

            //获取地图某些接口的出参
            Studio.registerEvents(thisObj, "sendMapApiOuputs", "Send Map API Outputs", []);

            // 51定制事件-点击区域轮廓
            Studio.registerEvents(thisObj, "rangeSelection", "Range Selection", []);
            // 51定制事件-点击POI
            Studio.registerEvents(thisObj, "poiSelection", "POI Selection", []);


            // -------------------- Action --------------------
            //修改地图配置数据
            Studio.registerAction(thisObj, "modifyMapConfig", "Modify Map Configuration", [], $.proxy(thisObj.modifyMapConfigCbk, thisObj), []);

            //在地图上添加或清除覆盖物
            Studio.registerAction(thisObj, "addMarkerElements", "Add Marker Elements", [], $.proxy(thisObj.addOrClearOverlaysCbk, thisObj), []);

            //清除某类或某个覆盖物
            Studio.registerAction(thisObj, "clearOverlaysByCon", "Clear Overlays By Condition", [], $.proxy(thisObj.clearOverlaysByConCbk, thisObj), []);

            //刷新散点图
            Studio.registerAction(thisObj, "refreshScatter", "Refresh Scatter", [], $.proxy(thisObj.getEchartsOptionsCbk, thisObj), []);

            // 在地图上定位某个元素
            Studio.registerAction(thisObj, "locateElement", "Locate Element", [], $.proxy(thisObj.locateElementCbk, thisObj), []);

            //切换天气（3D）
            Studio.registerAction(thisObj, "changeWeather", "Change Scene Weather", [], $.proxy(thisObj.changeWeatherCbk, thisObj), []);

            //切换时间（3D）
            Studio.registerAction(thisObj, "setSceneTime", "Set Scene Time", [], $.proxy(thisObj.setSceneTimeCbk, thisObj), []);

            //设置地图某些接口的入参
            Studio.registerAction(thisObj, "setMapApiInputParams", "Set Map API Input Parameters", [], $.proxy(thisObj.setMapApiInputParamsCbk, thisObj), []);


            //51定制动作，管网操作
            Studio.registerAction(thisObj, "hidePipeline", "管网操作", [], $.proxy(thisObj.hidePipelineCbk, thisObj), []);
            //51定制动作，楼宇拆解
            Studio.registerAction(thisObj, "buildingDismantling", "楼宇拆解-动作", [], $.proxy(thisObj.buildingDismantlingCbk, thisObj), []);

            //51定制动作，开启取点工具
            Studio.registerAction(thisObj, "openPointTool", "开启取点工具-动作", [], $.proxy(thisObj.openPointToolCbk, thisObj), []);

            //51定制动作，范围圈定
            Studio.registerAction(thisObj, "addRange", "添加区域轮廓-动作", [], $.proxy(thisObj.addRangeCbk, thisObj), []);
            //51定制动作，更新范围圈定点或者样式
            Studio.registerAction(thisObj, "updateRange", "更新区域轮廓点或样式-动作", [], $.proxy(thisObj.updateRangeCbk, thisObj), []);

            //51定制动作，模拟覆盖物点击
            Studio.registerAction(thisObj, "simClickCovering", "模拟覆盖物点击-动作", [], $.proxy(thisObj.simClickCoveringCbk, thisObj), []);

            //51定制动作，显示/隐藏指定类型的覆盖物
            Studio.registerAction(thisObj, "showHideCovering", "显示/隐藏覆盖物-动作", [], $.proxy(thisObj.showHideCoveringCbk, thisObj), []);
        }
    },

    /*
     * Triggered from init method and is used to render the widget
     */
    render: function () {
        var thisObj = this;
        var widgetProperties = thisObj.getProperties();
        var elem = thisObj.getContainer();

        /*
         * API to get base path of your uploaded widget API file
         */
        var widgetBasePath = thisObj.getWidgetBasePath();
        if (elem) {

            const i18n = HttpUtils.getI18n({
                locale: HttpUtils.getLocale(),
                messages: thisObj.getMessages()
            });

            var defaultMapProps = {
                mapType: 'GAODE_MAP',
                baiduKey: '',
                gaodeKey: '',
                googleKey: '',
                viewMode: '3D', //仅高德地图使用
                viewModeNew: '2D',  //其余地图使用
                mapStyle: 'dark',
                customMapStyle: '',
                longitude: 114.05771866980714,
                latitude: 22.657455992129975,
                height: 600,
                heading: 0,
                threeDPitch: 70,
                roll: 0,
                zoomLevel: 17,
                minZoom: 1,
                maxZoom: 22,
                mapCode: '',
                serviceURL: "",
                token: "",
                workspaceSerices: "",
                cameraDistance: 200, // 仅3D地图使用

                mapTypeControl: false,
                threeDControl: true,
                threeDControlSize: 'small',
                showTitle: false,
                title: '地图组件',
                titleBackColor: 'rgba(12, 40, 70, 1)',
                titleColor: 'rgba(255, 255, 255, 1)',
                titleFontSize: 16,
                titleFontFamily: 'sans-serif',
                titlePosition: 'center',
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0,
                bgColor: "rgba(42, 49, 67, 1)",
                geoMetryControl: false,
                geoMetryLeft: 'left',
                geoHoriPercent: 1,
                geoMetryTop: 'top',
                geoVertiPercent: 1,
                geoBackColor: "rgba(44,53,81,.9)",
                zoomControl: false,
                zoomLeft: 'right',
                zoomHoriPercent: 1,
                zoomTop: 'bottom',
                zoomVertiPercent: 1,
                zoomBackColor: "rgba(44,53,81,.9)",
                levelControl: true,
                levelLeft: 'right',
                levelHoriPercent: 1,
                levelTop: 'top',
                levelVertiPercent: 20,
                levelBackColor: "rgba(44,53,81,.9)",
                showBaseLayer: true,
                showImageLayer: false,
                imageUrl: widgetBasePath + "images/exp1.jpg",
                imgSwlongitude: 114.04944731195641,
                imgSwlatitude: 22.651096623876576,
                imgNelongitude: 114.06770789839172,
                imgNelatitude: 22.66179581254578,
                useGISBOConfig: false,
                openIndoorHover: false,
                securityMode: 0

            };
            var mapProps = widgetProperties.mapProps ? $.extend({}, defaultMapProps, JSON.parse(widgetProperties.mapProps)) : defaultMapProps;

            thisObj.vm = new Vue({
                el: $('#reader-gisMap', elem)[0],
                i18n: i18n,
                data: {
                    //mapKey: mapKey,
                    cellId: '',
                    markerInfoList: [],
                    indoorMarkerInfoList: [],
                    markerInfo: {},
                    flashMarkerInfoList: [],
                    indoorFlashMkInfoList: [],
                    flashMarkerInfo: {},
                    clusterInfo: {},
                    clusterInfoList: [],
                    polylines: [],
                    polylineList: [],
                    geometrys: [],
                    geometryList: [],
                    infoWins: [],
                    mapProps: mapProps,
                    mapCenter: [],
                    mapZoom: null,
                    mapRph: [],
                    isIndoorMap: false,
                    buildingInfo: {
                        buildingId: '',
                        floorList: [],

                    },
                    straightLinePath: {},
                    routePlanPath: {},
                    is3PartyMap: mapProps.mapType != 'BAIDU_MAP' && mapProps.mapType != 'GAODE_MAP' && mapProps.mapType != 'GOOGLE_MAP',
                    effectsList: [],
                    imageLayerList: [],
                    addrDeSearch: {
                        type: '',
                        radius: 100
                    }
                },
                methods: {
                    getScatterData: function (params) {
                        var getScatterDataCbk = function (vm) {
                            if (vm.options) {
                                var data = {};
                                data.eventParam = {};
                                data.eventParam.options = vm.options;
                                thisObj.getEchartsOptionsCbk(data);
                            }

                        };
                        var connector = thisObj.getConnectorInstanceByName('ScatterDataConnector') || '';
                        thisObj.callFlowConn(connector, params, getScatterDataCbk, "ScatterDataConnector");
                    },
                    getOverlaysData: function (params) {
                        var getOverlaysDataCbk = function (vm) {
                            if (vm) {
                                var data = {};
                                data.eventParam = vm;
                                thisObj.addOrClearOverlaysCbk(data);
                            }
                        };
                        var connector = thisObj.getConnectorInstanceByName('SC_OverlaysDataConnector') || '';
                        thisObj.callFlowConn(connector, params, getOverlaysDataCbk, "SC_OverlaysDataConnector");
                    },
                    getAlarmData: function (params) {
                        var getAlarmDataCbk = function (vm) {
                            if (vm) {
                                var data = {};
                                data.eventParam = vm;
                                thisObj.addOrClearOverlaysCbk(data);
                            }

                        };
                        var connector = thisObj.getConnectorInstanceByName('AlarmDataConnector') || '';
                        thisObj.callFlowConn(connector, params, getAlarmDataCbk, "AlarmDataConnector");
                    },

                    triggerSwitchIndoorAndOutdoor: function (params) {
                        console.log("室内外切换和楼层切换信息：", params);
                        thisObj.triggerEvent("switchIndoorAndOutdoor", params);
                    },

                    handleEchartsEvent: function (eventType, callback, echartsData) {

                        thisObj.triggerEvent("scatterPointSelection", {
                            callback: callback,
                            eventType: eventType,
                            echartsData: echartsData
                        });

                    },
                    handleMapZoomEvent: function (zoom, center) {
                        thisObj.triggerEvent("zoomTheMap", {zoom: zoom, center: center});
                    },
                    handleMapClickEvent: function (e) {
                        var _thisObj = thisObj;
                        var mapRph = [];
                        var mapCenter = [];
                        if (pageProperties[this.cellId].viewModeNew === "3D") {
                            var mapView = pageMaps[this.cellId].getMapView();
                            mapRph = mapView.rph;
                            mapCenter = mapView.center;
                        } else {
                            mapCenter = pageMaps[this.cellId].getCenter();
                        }

                        var data = {
                            poiId: e.poiId,
                            rangeId: e.rangeId,
                            coordResult: e.coordResult || [],
                            lat: e.lngLat ? e.lngLat.lat : null,
                            lng: e.lngLat ? e.lngLat.lng : null,
                            alt: e.lngLat ? e.lngLat.alt : null,
                            buildingId: e.buildingId,
                            floorId: e.floorId,
                            spaceCode: e.spaceCode,
                            mapRph: mapRph,
                            mapCenter: mapCenter
                        };

                        var addrDeSearchCbk = function (e1) {
                            data.addrDeSearchResults = [];
                            (e1 || []).forEach(function (addr) {
                                if (addr.searchResult) {
                                    data.addrDeSearchResults.push(addr.searchResult);
                                }
                            })
                            _thisObj.triggerEvent("clickTheMap", data);
                            console.log("点击地图获取到的信息：", data);

                        };

                        if (pageProperties[this.cellId].viewModeNew === "3D" || !this.is3PartyMap) {
                            if (data.rangeId) {
                                _thisObj.triggerEvent("rangeSelection", data);
                            } else if (data.poiId) {
                                _thisObj.triggerEvent("poiSelection", data);
                            } else {
                                _thisObj.triggerEvent("clickTheMap", data);
                                console.log("点击地图获取到的信息：", data);
                            }
                        } else {
                            //搜索周边POI
                            pageMaps[this.cellId].addrDeSearch(data.lng, data.lat, this.addrDeSearch.radius, addrDeSearchCbk, this.addrDeSearch.type);
                        }

                    },
                    handleFrameOn: function () {
                        var _this = this;
                        this.$confirm("确定要获取框选结果吗？", '提示', {
                            confirmButtonText: '确定',
                            cancelButtonText: '取消',
                            type: 'success'
                        })
                            .then(function () {
                                //获取marker圈选结果
                                pageMaps[_this.cellId].getSelectedMarkers(function (markers) {

                                    //获取热力圈选结果
                                    var heatPoints = pageMaps[_this.cellId].getSelectedHeatObjects({
                                        style: {
                                            fillColor: '#FF0000',
                                            radius: 30,
                                            fillOpacity: 0
                                        }
                                    });


                                    thisObj.triggerEvent("frameOnEnd", {
                                        markers: markers,
                                        heatPoints: heatPoints
                                    });
                                    pageMaps[_this.cellId].disableSelectMode();
                                });


                            })
                            .catch(function () {
                                pageMaps[_this.cellId].disableSelectMode();
                            });
                    },

                    onMarkerClick: function (mk, flag, e) {
                        var _this = this;
                        //点击后聚焦
                        var pos = e.marker.position;
                        if (e.marker.positionNew) {
                            pos = e.marker.positionNew;
                        }

                        if (pageProperties[this.cellId].viewModeNew == "3D") {
                            pageMaps[_this.cellId].flyTo({
                                center: [pos[0], pos[1], pageMaps[_this.cellId].getZoom()],
                                rph: [0, 90, 0]
                            });

                        } else if (flag == 'cluster') {  //2D
                            pageMaps[_this.cellId].centerPoint({
                                center: pos
                            });
                        } else {   //2D
                            pageMaps[_this.cellId].setZoom({
                                center: pos,
                                zoom: mk.clickZoom || pageMaps[_this.cellId].getZoom()
                            });
                        }

                        //向外部发送被点击marker信息
                        thisObj.triggerEvent("markerElementSelection", {element: mk});

                        //打开marker的信息窗口
                        if (mk.infoWindow && mk.infoWindow.content) {
                            //打开前先关闭
                            pageMaps[_this.cellId].closePopup();
                            setTimeout(function () {
                                pageMaps[_this.cellId].addPopup({
                                    position: pos,
                                    content: mk.infoWindow.content, //content[0]如果传入dom结构的话
                                    offset: mk.infoWindow.offset,
                                    width: mk.infoWindow.width,
                                    height: mk.infoWindow.height,

                                    boxTheme: mk.infoWindow.boxTheme
                                });


                            }, 0);
                        }
                    },
                    bindClickMarker: function (e) {
                        var _this = this;
                        var find = false;

                        //找到被点击的marker
                        $.each(_this.markerInfoList || [], function (i, mkInfo) {
                            $.each(mkInfo.markers || [], function (j, mk) {
                                if (mk.mapSideId == e.markerId) {
                                    find = true;
                                    _this.onMarkerClick(mk, false, e);
                                    return false;
                                }
                            });
                        });

                        if (find) {
                            return;
                        }

                        $.each(_this.indoorMarkerInfoList || [], function (i, mkInfo) {
                            $.each(mkInfo.markers || [], function (j, mk) {
                                if (mk.mapSideId == e.markerId) {
                                    find = true;
                                    _this.onMarkerClick(mk, false, e);
                                    return false;
                                }
                            });
                        });

                        if (find) {
                            return;
                        }

                        //找到被点击的FlashMarker
                        $.each(_this.flashMarkerInfoList || [], function (i, mkInfo) {
                            $.each(mkInfo.markers || [], function (j, mk) {
                                if (mk.mapSideId == e.markerId) {
                                    find = true;
                                    _this.onMarkerClick(mk, false, e);
                                    return false;
                                }
                            });
                        });

                        if (find) {
                            return;
                        }

                        $.each(_this.indoorFlashMkInfoList || [], function (i, mkInfo) {
                            $.each(mkInfo.markers || [], function (j, mk) {
                                if (mk.mapSideId == e.markerId) {
                                    find = true;
                                    _this.onMarkerClick(mk, false, e);
                                    return false;
                                }
                            });
                        });

                        if (find) {
                            return;
                        }

                        //从cluster中找
                        $.each(_this.clusterInfoList || [], function (i, mkInfo) {
                            $.each(mkInfo.markers || [], function (j, mk) {
                                if (mk.mapSideId == e.markerId) {
                                    find = true;
                                    _this.onMarkerClick(mk, "cluster", e);
                                    return false;
                                }
                            });
                        });


                    },
                    bindZoomCluster: function (e) {
                        thisObj.triggerEvent("sendMapApiOuputs", {zoomClusterResult: e});
                    },
                    addMarkers: function () {
                        var _this = this;
                        // 创建标记
                        if (JSON.stringify(this.markerInfo) != '{}') {
                            var outdoorMkInfo = {
                                layerId: this.markerInfo.layerId,
                                layerIndex: this.markerInfo.layerIndex,
                                markers: []
                            };
                            var indoorMkInfo = {
                                layerId: this.markerInfo.layerId,
                                layerIndex: this.markerInfo.layerIndex,
                                markers: []
                            };
                            $.each(this.markerInfo.markers || [], function (i, mk) {
                                if (mk.buildingId && mk.floorId && pageProperties[_this.cellId].mapType == 'WAZH_LITE_MAP') {
                                    indoorMkInfo.markers.push(mk);
                                } else {
                                    outdoorMkInfo.markers.push(mk);
                                }
                            });


                            if (outdoorMkInfo.markers.length > 0) {
                                this.markerInfoList.push(outdoorMkInfo);
                                var ids = pageMaps[this.cellId].addMarker(outdoorMkInfo);
                                //标记成功后
                                if (ids && (ids.length == outdoorMkInfo.markers.length)) {
                                    $.each(outdoorMkInfo.markers || [], function (i, mk) {
                                        mk.mapSideId = ids[i];

                                        //判断是否标记后立刻聚焦，用于只标记一个marker的情况
                                        if (mk.focusPoint) {

                                            if (pageProperties[_this.cellId].viewModeNew == "3D") {
                                                pageMaps[_this.cellId].flyTo({
                                                    center: [mk.position[0], mk.position[1], 500],
                                                    rph: [0, 90, 0]
                                                });
                                            } else {
                                                pageMaps[_this.cellId].centerPoint({
                                                    center: mk.position
                                                });
                                            }


                                        }

                                        //为Marker绑定点击事件
                                        pageMaps[_this.cellId].onMarker('click', ids[i], _this.bindClickMarker);

                                    });
                                }
                            }

                            if (indoorMkInfo.markers.length > 0) {
                                this.indoorMarkerInfoList.push(indoorMkInfo);
                                //检查室内地图是否打开
                                if (_this.isIndoorMap) {
                                    _this.showCurFloorOverlays();
                                }
                            }

                        }

                        // 创建闪烁标记
                        if (JSON.stringify(this.flashMarkerInfo) != '{}') {
                            var outdoorMkInfo = {
                                layerId: this.flashMarkerInfo.layerId,
                                layerIndex: this.flashMarkerInfo.layerIndex,
                                markers: []
                            };
                            var indoorMkInfo = {
                                layerId: this.flashMarkerInfo.layerId,
                                layerIndex: this.flashMarkerInfo.layerIndex,
                                markers: []
                            };
                            $.each(this.flashMarkerInfo.markers || [], function (i, mk) {
                                if (mk.buildingId && mk.floorId && pageProperties[_this.cellId].mapType == 'WAZH_LITE_MAP') {
                                    indoorMkInfo.markers.push(mk);
                                } else {
                                    outdoorMkInfo.markers.push(mk);
                                }
                            });

                            if (outdoorMkInfo.markers.length > 0) {
                                this.flashMarkerInfoList.push(outdoorMkInfo);
                                var ids = pageMaps[this.cellId].addFlashMarker(outdoorMkInfo);
                                //标记成功后
                                if (ids && (ids.length == outdoorMkInfo.markers.length)) {
                                    $.each(outdoorMkInfo.markers || [], function (i, mk) {
                                        mk.mapSideId = ids[i];

                                        //判断是否标记后立刻聚焦，用于只标记一个marker的情况
                                        if (mk.focusPoint) {
                                            if (pageProperties[_this.cellId].viewModeNew == "3D") {
                                                pageMaps[_this.cellId].flyTo({
                                                    center: [mk.position[0], mk.position[1], 500],
                                                    rph: [0, 90, 0]
                                                });
                                            } else {
                                                pageMaps[_this.cellId].centerPoint({
                                                    center: mk.position
                                                });
                                            }

                                        }

                                        //为Marker绑定点击事件
                                        pageMaps[_this.cellId].onMarker('click', ids[i], _this.bindClickMarker);

                                    });
                                }
                            }

                            if (indoorMkInfo.markers.length > 0) {
                                this.indoorFlashMkInfoList.push(indoorMkInfo);
                                //检查室内地图是否打开
                                if (_this.isIndoorMap) {
                                    _this.showCurFloorOverlays();
                                }
                            }

                        }

                        // 创建cluster标记
                        if (JSON.stringify(this.clusterInfo) != '{}') {
                            if (pageProperties[this.cellId].mapType == 'WAZH_MAP') {
                                pageMaps[this.cellId].onCluster('animationend', "", this.bindZoomCluster);
                            }

                            this.clusterInfoList.push(this.clusterInfo);
                            var ids = pageMaps[this.cellId].addClusterMarker(this.clusterInfo);
                            //标记成功后
                            if (ids && (ids.length == this.clusterInfo.markers.length)) {
                                $.each(this.clusterInfo.markers || [], function (i, mk) {
                                    mk.mapSideId = ids[i];

                                    //判断是否标记后立刻聚焦，用于只标记一个marker的情况
                                    if (mk.focusPoint) {
                                        if (pageProperties[_this.cellId].viewModeNew == "3D") {
                                            pageMaps[_this.cellId].flyTo({
                                                center: [mk.position[0], mk.position[1], 500],
                                                rph: [0, 90, 0]
                                            });
                                        } else {
                                            pageMaps[_this.cellId].centerPoint({
                                                center: mk.position
                                            });
                                        }

                                    }

                                    //为Marker绑定点击事件
                                    pageMaps[_this.cellId].onMarker('click', ids[i], _this.bindClickMarker);

                                });
                            }
                        }


                    },
                    showCurFloorOverlays: function () {
                        var _this = this;
                        var curBuilding = _this.buildingInfo.buildingId;
                        var curFloor;
                        $.each(_this.buildingInfo.floorList || [], function (i, floor) {
                            if (floor.flag) {
                                curFloor = floor.value;
                                return false;
                            }
                        });
                        //一个加一层
                        $.each(_this.indoorMarkerInfoList || [], function (i, mkInfo) {
                            $.each(mkInfo.markers || [], function (j, mk) {
                                if (mk.buildingId == curBuilding && mk.floorId == curFloor && !mk.mapSideId) {
                                    var id = pageMaps[_this.cellId].addMarker({
                                        layerId: mkInfo.layerId,
                                        layerIndex: mkInfo.layerIndex,
                                        markers: [mk]
                                    });
                                    mk.mapSideId = id[0];

                                    //判断是否标记后立刻聚焦，用于只标记一个marker的情况


                                    //为Marker绑定点击事件
                                    pageMaps[_this.cellId].onMarker('click', id[0], _this.bindClickMarker);
                                }
                            });
                        });

                        $.each(_this.indoorFlashMkInfoList || [], function (i, mkInfo) {
                            $.each(mkInfo.markers || [], function (j, mk) {
                                if (mk.buildingId == curBuilding && mk.floorId == curFloor && !mk.mapSideId) {
                                    var id = pageMaps[_this.cellId].addFlashMarker({
                                        layerId: mkInfo.layerId,
                                        layerIndex: mkInfo.layerIndex,
                                        markers: [mk]
                                    });
                                    mk.mapSideId = id[0];

                                    //判断是否标记后立刻聚焦，用于只标记一个marker的情况


                                    //为Marker绑定点击事件
                                    pageMaps[_this.cellId].onMarker('click', id[0], _this.bindClickMarker);
                                }
                            });
                        });

                    },
                    addStraightLinePath: function () {
                        pageMaps[this.cellId].drawCustomPath(this.straightLinePath);
                    },
                    addRoutePlanPath: function () {
                        var _this = this;
                        var _thisObj = thisObj;
                        this.routePlanPath.showAll = true;
                        this.routePlanPath.finished = function (pathList, distance) {
                            _thisObj.triggerEvent("sendMapApiOuputs", {
                                calcRoutePathResult: {
                                    distance: distance
                                }
                            });
                        };
                        pageMaps[this.cellId].calcRoutePath(this.routePlanPath);
                    },
                    addPolylines: function () {
                        var _this = this;
                        // 创建折线
                        $.each(this.polylines || [], function (i, vali) {
                            var id = pageMaps[_this.cellId].addPolyline({
                                path: vali.path,
                                strokeColor: vali.strokeColor,         //线颜色
                                strokeOpacity: vali.strokeOpacity,     //线透明度
                                strokeWeight: vali.strokeWeight,       //线宽

                                id: vali.id,
                                clickHide: vali.clickHide,
                                clickRoutePlan: vali.clickRoutePlan,

                            });

                            if (id) {
                                vali.mapSideId = id;
                                _this.polylineList.push(vali);
                            }

                            //设置id


                        });

                        //绑定事件(不能再取vali了)
                        pageMaps[_this.cellId].onPolyline("click", function (e) {
                            if (e.options.clickHide) {
                                $.each(_this.polylineList || [], function (i, line) {
                                    if (line.mapSideId == e.id) {
                                        pageMaps[_this.cellId].deletePolyline(e.id);
                                    }
                                });
                            }

                            if (e.options.clickRoutePlan) {
                                pageMaps[_this.cellId].calcRoutePath({
                                    color: '#4DAAED',
                                    opacity: 1,
                                    weight: 4,
                                    dashArray: '',
                                    wayPoints: [{
                                        coords: e.options.path[0],
                                    }, {
                                        coords: e.options.path[e.options.path.length - 1],
                                    }]
                                });
                            }

                        });

                    },
                    addGeometrys: function () {
                        var _this = this;
                        // 创建几何体
                        $.each(this.geometrys || [], function (i, vali) {
                            pageMaps[_this.cellId].setGeometry(vali);
                            $.each(_this.geometryList || [], function (i, geo) {
                                if (geo.geometryId == vali.geometryId) {
                                    _this.geometryList.splice(i, 1);
                                    return false;
                                }
                            });
                            _this.geometryList.push(vali);
                        });
                    },
                    addInfoWins: function () {
                        var _this = this;

                        pageMaps[_this.cellId].closePopup();

                        // 创建信息窗口
                        $.each(this.infoWins || [], function (i, vali) {
                            pageMaps[_this.cellId].addPopup({
                                position: vali.position,
                                content: vali.content,
                                offset: vali.offset || [0, 0],
                                width: vali.width,
                                height: vali.height,
                                enableAutoPan: vali.enableAutoPan,
                                boxTheme: vali.boxTheme
                            });
                        });
                    },
                    zoomIn: function () {
                        pageMaps[this.cellId].zoomIn();
                    },
                    zoomOut: function () {
                        pageMaps[this.cellId].zoomOut();
                    },
                    resetMap: function () {
                        if (pageProperties[this.cellId].viewModeNew == "3D") {
                            pageMaps[this.cellId].setMapView({
                                center: this.mapCenter,
                                rph: this.mapRph
                            });
                        } else {
                            pageMaps[this.cellId].setZoom({
                                center: this.mapCenter,
                                zoom: this.mapZoom
                            });
                        }

                    },
                    switchOutdoor: function (sendEvent) {
                        var _this = this;
                        pageMaps[this.cellId].switchOutdoor();
                        this.isIndoorMap = false;

                        var curBuilding = this.buildingInfo.buildingId;
                        var curFloor;
                        $.each(this.buildingInfo.floorList || [], function (i, floor) {
                            if (floor.flag) {
                                curFloor = floor.value;
                                return false;
                            }
                        });

                        if (sendEvent) {
                            this.triggerSwitchIndoorAndOutdoor({
                                fromInToOut: true,
                                fromBuilding: curBuilding,
                                fromFloor: curFloor,
                            });
                        }

                        $.each(this.indoorMarkerInfoList || [], function (i, mkInfo) {
                            $.each(mkInfo.markers || [], function (j, mk) {
                                if (mk.buildingId == curBuilding && mk.floorId == curFloor && mk.mapSideId) {
                                    pageMaps[_this.cellId].deleteMarker(mk.mapSideId);
                                    delete mk.mapSideId;
                                }
                            });
                        });

                        $.each(this.indoorFlashMkInfoList || [], function (i, mkInfo) {
                            $.each(mkInfo.markers || [], function (j, mk) {
                                if (mk.buildingId == curBuilding && mk.floorId == curFloor && mk.mapSideId) {
                                    pageMaps[_this.cellId].deleteMarker(mk.mapSideId);
                                    delete mk.mapSideId;
                                }
                            });
                        });

                    },
                    enableSelectMode: function (mode) {
                        var _this = this;
                        pageMaps[this.cellId].enableSelectMode({
                            type: mode,
                            style: {
                                fillColor: '#388bff',
                                fillOpacity: 0.3,
                                color: "#388bff",
                                weight: 4,
                                dashArray: ''
                            }
                        });
                    },
                    disableSelectMode: function () {
                        pageMaps[this.cellId].disableSelectMode();
                    },
                    openIndoorMap: function (bId, fId) {
                        var _this = this;

                        //记录当前楼栋
                        var curBuilding = this.buildingInfo.buildingId;

                        //如果当前有室内地图打开，且即将打开的是同一栋楼and the same floor，则不做任何操作
                        var curFloor = "";
                        $.each(this.buildingInfo.floorList || [], function (i, floor) {
                            if (floor.flag) {
                                curFloor = floor.value;
                            }
                        });
                        if (this.isIndoorMap && this.buildingInfo.buildingId == bId && curFloor == fId) {
                            return;
                        }


                        pageMaps[this.cellId].getBuildingInfo(bId, function (e) {
                            var floorList = e.common.floors.split(',');
                            floorList.reverse();
                            if (e.common.buildingId && floorList.length > 0) {

                                _this.buildingInfo.buildingId = e.common.buildingId;

                                _this.buildingInfo.floorList = [];

                                var floorLabelList = [];
                                if (e.common.floorsLabel) {
                                    floorLabelList = e.common.floorsLabel.split(',');
                                    floorLabelList.reverse();
                                }

                                $.each(floorList || [], function (i, floor) {
                                    var obj = {value: floor, label: floor, flag: false};
                                    if (floorLabelList.length == floorList.length) {
                                        obj.label = floorLabelList[i];
                                    }

                                    if (fId == obj.value) { //校验fId是否在floorList内
                                        obj.flag = true;
                                    }
                                    _this.buildingInfo.floorList.push(obj);
                                });

                                //一定要在vueModel.switchOutdoor();前 因为会改变isIndoorMap原本的值为false
                                _this.triggerSwitchIndoorAndOutdoor({
                                    fromOutToIn: _this.isIndoorMap ? false : true,
                                    fromInToIn: _this.isIndoorMap ? true : false,
                                    toBuilding: e.common.buildingId,
                                    toFloor: fId,
                                    fromBuilding: _this.isIndoorMap ? curBuilding : "",
                                    fromFloor: _this.isIndoorMap ? curFloor : ""
                                });

                                //切换建筑物前先切室外
                                _this.switchOutdoor();


                                pageMaps[_this.cellId].showIndoorMap({
                                    buildingId: e.common.buildingId,
                                    floorId: fId
                                });
                                _this.isIndoorMap = true;
                                _this.showCurFloorOverlays();

                            }

                        });

                    },
                    selectFloor: function (option) {
                        var _this = this;

                        //记录原本的楼栋 楼层
                        var exBuilding = _this.buildingInfo.buildingId;
                        var exFloor = "";
                        $.each(_this.buildingInfo.floorList || [], function (i, floor) {
                            if (floor.flag) {
                                exFloor = floor.value;
                                return false;
                            }
                        });
                        var curBuilding = "";
                        var curFloor = "";


                        if (option == 'up') {
                            $.each(_this.buildingInfo.floorList || [], function (i, floor) {
                                if (floor.flag) {
                                    if (i > 0) {  //如果还有更高楼层
                                        _this.switchOutdoor();//先换到室外，再变楼层，否则删不掉之前楼层的覆盖物
                                        _this.buildingInfo.floorList[i - 1].flag = true;
                                        floor.flag = false;
                                        pageMaps[_this.cellId].showIndoorMap({
                                            buildingId: _this.buildingInfo.buildingId,
                                            floorId: _this.buildingInfo.floorList[i - 1].value
                                        });
                                        //记录现在的楼栋楼层
                                        curBuilding = _this.buildingInfo.buildingId;
                                        curFloor = _this.buildingInfo.floorList[i - 1].value;
                                        _this.isIndoorMap = true;
                                        _this.showCurFloorOverlays();
                                    } else {   //如果已经是顶楼

                                    }
                                    return false;
                                }
                            });
                        } else if (option == 'down') {
                            $.each(_this.buildingInfo.floorList || [], function (i, floor) {
                                if (floor.flag) {
                                    if (i < _this.buildingInfo.floorList.length - 1) {  //如果还有更低楼层
                                        _this.switchOutdoor();
                                        _this.buildingInfo.floorList[i + 1].flag = true;
                                        floor.flag = false;
                                        pageMaps[_this.cellId].showIndoorMap({
                                            buildingId: _this.buildingInfo.buildingId,
                                            floorId: _this.buildingInfo.floorList[i + 1].value
                                        });
                                        //记录现在的楼栋楼层
                                        curBuilding = _this.buildingInfo.buildingId;
                                        curFloor = _this.buildingInfo.floorList[i + 1].value;
                                        _this.isIndoorMap = true;
                                        _this.showCurFloorOverlays();
                                    } else {   //如果已经是最低楼

                                    }
                                    return false;
                                }
                            });
                        } else {
                            $.each(_this.buildingInfo.floorList || [], function (i, floor) {
                                if (floor.value == option) {
                                    _this.switchOutdoor();
                                    floor.flag = true;
                                    $.each(_this.buildingInfo.floorList || [], function (j, fr) {
                                        if (i != j) {
                                            fr.flag = false;
                                        }
                                    });
                                    pageMaps[_this.cellId].showIndoorMap({
                                        buildingId: _this.buildingInfo.buildingId,
                                        floorId: floor.value
                                    });
                                    //记录现在的楼栋楼层
                                    curBuilding = _this.buildingInfo.buildingId;
                                    curFloor = floor.value;
                                    _this.isIndoorMap = true;
                                    _this.showCurFloorOverlays();
                                }
                                //不能在switchOutdoor之前改变flag

                            });

                        }

                        //点up和down到极限则不发事件
                        if (curBuilding && curFloor) {
                            this.triggerSwitchIndoorAndOutdoor({
                                fromInToIn: true,
                                fromBuilding: exBuilding,
                                fromFloor: exFloor,
                                toBuilding: curBuilding,
                                toFloor: curFloor
                            });
                        }

                    },
                    newGISMap: function () {
                        var mapKey = "";
                        switch (pageProperties[this.cellId].mapType) {
                            case "GAODE_MAP":
                                mapKey = pageProperties[this.cellId].gaodeKey;
                                break;

                            case "BAIDU_MAP":
                                mapKey = pageProperties[this.cellId].baiduKey;
                                break;

                            case "GOOGLE_MAP":
                                mapKey = pageProperties[this.cellId].googleKey;
                                break;
                            default:
                                break;
                        }
                        pageMaps[this.cellId] = new hgis.Hmap2D({
                            mapType: pageProperties[this.cellId].mapType,
                            key: mapKey,
                            serviceURL: pageProperties[this.cellId].serviceURL,
                            workspaceSerices: pageProperties[this.cellId].workspaceSerices,
                            securityMode: pageProperties[this.cellId].securityMode
                        }, initMap);
                    },
                    processMap: function () {
                        var _this = this;
                        var connectorPost = thisObj.getConnectorInstanceByName('FlowConnector_POST');
                        if (!connectorPost) {
                            console.log("请为地图组件配置API Connector。");
                            this.queryMapInstanceDetail();
                        } else {
                            //获取系统参数的值
                            var paramObj = {
                                "parameterNames": [
                                    "GISBO_ExternalCodeSource"
                                ]
                            };
                            thisObj.callAPIConn('/GIS/0.1.0/getSysParameters', paramObj, 'POST', function (vm) {
                                if (vm.resp.code == '0' && vm.data[0] && vm.data[0].parameters) {
                                    if (vm.data[0].parameters['GISBO_ExternalCodeSource'] == 'Space') {
                                        if (sessionStorage.getItem('currentSpaceData')) {
                                            var extCode = JSON.parse(sessionStorage.getItem('currentSpaceData')).spaceCode;
                                            //根据extCode查询地图实例
                                            thisObj.callAPIConn('/GIS/0.1.0/GISMapInstance/query', {extCode: extCode}, 'POST', function (vm) {
                                                if (vm.resp.code == '0' && vm.data[0].mapInstances && vm.data[0].mapInstances[0]) {
                                                    if (vm.data[0].mapInstances[0].properties && vm.data[0].mapInstances[0].properties[0]) {
                                                        var pro = vm.data[0].mapInstances[0].properties[0];
                                                        Object.keys(pro || {}).forEach(function (key) {
                                                            if (pro[key]) {
                                                                var newKey = key.substr(0, 1).toLowerCase() + key.substr(1, key.length);
                                                                pageProperties[_this.cellId][newKey] = pro[key];
                                                            }
                                                        });
                                                    }

                                                    pageProperties[_this.cellId]['mapType'] = vm.data[0].mapInstances[0]['GisCodeName'];
                                                    pageProperties[_this.cellId]['mapCode'] = vm.data[0].mapInstances[0]['name'];
                                                    _this.is3PartyMap = pageProperties[_this.cellId].mapType != "BAIDU_MAP" && pageProperties[_this.cellId].mapType != "GAODE_MAP" && pageProperties[_this.cellId].mapType != "GOOGLE_MAP";
                                                }

                                                _this.queryMapInstanceDetail();
                                            });
                                        } else {
                                            _this.queryMapInstanceDetail();
                                        }
                                    } else {
                                        var getMapConfigCbk = function (vm) {
                                            Object.keys(vm || {}).forEach(function (key) {
                                                if (vm[key]) {
                                                    pageProperties[_this.cellId][key] = vm[key];
                                                }
                                            });
                                            _this.is3PartyMap = pageProperties[_this.cellId].mapType != "BAIDU_MAP" && pageProperties[_this.cellId].mapType != "GAODE_MAP" && pageProperties[_this.cellId].mapType != "GOOGLE_MAP";
                                            _this.queryMapInstanceDetail();
                                        };
                                        var connector = thisObj.getConnectorInstanceByName('SC_MapConfigDataConnector');
                                        if (connector) {
                                            thisObj.callFlowConn(connector, {}, getMapConfigCbk, "SC_MapConfigDataConnector");
                                        } else {
                                            _this.queryMapInstanceDetail();
                                        }

                                    }
                                }
                            });


                        }


                    },
                    queryMapInstanceDetail: function () {
                        var _this = this;
                        if (this.is3PartyMap) {
                            thisObj.callAPIConn('/GIS/0.1.0/MapConfiguration/query', {mapCode: pageProperties[this.cellId].mapCode}, 'POST', function (vm) {
                                if (vm && vm.resp && vm.resp.code == '0') {
                                    if (vm.data[0] && vm.data[0].mapConfig) {
                                        //_this.mapProps.token = vm.data[0].mapConfig.token;
                                        //_this.mapProps.serviceURL = vm.data[0].mapConfig.ServiceURL;
                                        //_this.mapProps.workspaceSerices = vm.data[0].mapConfig.WorkspaceServices;

                                        pageProperties[_this.cellId].token = vm.data[0].mapConfig.token;
                                        pageProperties[_this.cellId].serviceURL = vm.data[0].mapConfig.ServiceURL;
                                        pageProperties[_this.cellId].workspaceSerices = vm.data[0].mapConfig.WorkspaceServices;
                                        pageProperties[_this.cellId].securityMode = vm.data[0].mapConfig.securityMode;

                                        _this.newGISMap();

                                    }
                                }
                            });
                        } else {
                            _this.newGISMap();
                        }
                    },


                    // 定制定制对应函数
                    hidePipeline(param) {
                        pageMaps[this.cellId].hidePipeline(param);
                    },
                    buildingDismantling(param) {
                        pageMaps[this.cellId].buildingDismantling(param);
                    },
                    openPointTool(operation) {
                        pageMaps[this.cellId].openPointTool(operation);
                    },
                    addRange(param) {
                        pageMaps[this.cellId].addRange(param);
                    },
                    updateRange(param) {
                        pageMaps[this.cellId].updateRange(param);
                    },
                    simClickCovering(param) {
                        pageMaps[this.cellId].simClickCovering(param);
                    },
                    showHideCovering(param){
                        pageMaps[this.cellId].showHideCovering(param);
                    }
                },

                created: function () {
                    this.cellId = $(thisObj.el.context).attr("id");//获取页面中widget的唯一标识

                    //pageProperties[this.cellId] = this.mapProps;
                    pageProperties[this.cellId] = JSON.parse(JSON.stringify(this.mapProps));
                    pageProperties[this.cellId].cellId = this.cellId;

                    $(window).resize(function () {
                        var overflow = $("#reader-gisMap").css('overflow');
                        if (overflow === 'hidden') {
                            $("#" + this.cellId + " #reader-gisMap").css('overflow', 'visible');
                        } else if (overflow === 'visible') {
                            $("#" + this.cellId + " #reader-gisMap").css('overflow', 'hidden');
                        }
                    });


                },
                mounted: function () {
                    var _this = this;
                    if (this.mapProps.useGISBOConfig) {
                        var catalogName = Studio.inReader ? STUDIO_DATA.catalogName : magno.pageService.catalogObj.global.catalogName; //运行态:开发态
                        //去掉末尾租户id
                        catalogName = catalogName.substr(0, catalogName.lastIndexOf('_'));
                        if (catalogName == 'SmartCampus__IntelligentSecurity') {
                            catalogName = 'SmartCampus__SecurityManagement';
                        }
                        thisObj.callAPIConn('/GIS/0.1.0/GISMapProperty/query', {catalogName: catalogName}, 'POST', function (vm) {
                            if (vm && vm.resp && vm.resp.code == '0' && vm.data && vm.data[0] && vm.data[0].mapProperties) {
                                Object.keys(vm.data[0].mapProperties[0] || {}).forEach(function (key) {
                                    var key2 = key.substr(0, 1).toLowerCase() + key.substr(1, key.length);
                                    if (pageProperties[_this.cellId].hasOwnProperty(key2) && vm.data[0].mapProperties[0][key]) {
                                        pageProperties[_this.cellId][key2] = vm.data[0].mapProperties[0][key];
                                        //console.log(key2 + "------>" + vm.data[0].mapProperties[0][key]);
                                    }
                                });
                                _this.is3PartyMap = pageProperties[_this.cellId].mapType != "BAIDU_MAP" && pageProperties[_this.cellId].mapType != "GAODE_MAP" && pageProperties[_this.cellId].mapType != "GOOGLE_MAP";
                                _this.processMap();
                            }
                        });
                    } else {
                        _this.processMap();
                    }
                }
            });

            //编辑窗口
            if (!Studio.inReader) {
                thisObj.editVm = new Vue({
                    i18n: i18n,
                    template: $("#edit-wrap", elem)[0],
                    data: {
                        mapProps: thisObj.vm.mapProps,
                        activeCollapse: '1',
                        mapTypeOpt: [{value: 'BAIDU_MAP', label: '百度地图'}, {
                            value: 'GAODE_MAP',
                            label: '高德地图'
                        }, {value: 'GOOGLE_MAP', label: '谷歌地图'}],
                        viewModeOpt: [{value: '2D', label: '2D'}, {value: '3D', label: '3D'}],
                        mapStyleOpt: [{value: 'normal', label: '默认'}, {value: 'dark', label: '深黑'}, {
                            value: 'blue',
                            label: '海蓝'
                        }, {value: 'darkBlue', label: '深蓝'}, {value: 'light', label: '浅天蓝'}, {
                            value: 'lightBlue',
                            label: '浅灰蓝'
                        }, {value: 'dianqinglan', label: '靛青蓝'}, {
                            value: 'lightGreen',
                            label: '浅灰绿'
                        }, {value: 'yueguangyin', label: '月光银'}, {value: 'yashihui', label: '雅士灰'}],
                        threeDCtrlSizeOpt: [{value: 'normal', label: '正常'}, {value: 'small', label: '小'}],
                        titleTileOpt: [{value: 'left', label: '靠左'}, {
                            value: 'center',
                            label: '居中'
                        }, {value: 'right', label: '靠右'}],
                        labelFontFamilyOpt: [{value: 'serif', label: 'serif'}, {
                            value: 'sans-serif',
                            label: 'sans-serif'
                        }, {value: 'Arial', label: 'Arial'}, {
                            value: 'monospace',
                            label: 'monospace'
                        }, {value: 'Courier New', label: 'Courier New'}, {
                            value: 'Microsoft YaHei',
                            label: 'Microsoft YaHei'
                        }, {value: 'Din-Light', label: 'Din-Light'}],
                        isThirdParty: thisObj.vm.mapProps.mapType != 'BAIDU_MAP' && thisObj.vm.mapProps.mapType != 'GAODE_MAP' && thisObj.vm.mapProps.mapType != 'GOOGLE_MAP',
                        geoMetryLeftOpt: [{value: 'left', label: '左'}, {value: 'right', label: '右'}],
                        geoMetryTopOpt: [{value: 'top', label: '上'}, {value: 'bottom', label: '下'}],
                        mapList: [{value: 'areaJ', label: 'areaJ'}],
                        configSources: [{value: false, label: '自定义配置'}, {value: true, label: '全局配置'}],
                    },
                    created: function () {
                        if (this.isThirdParty) {
                            this.queryMapListByType(this.mapProps.mapType);
                        }

                    },
                    mounted: function () {
                        var _this = this;
                        /*if(window.Adapter) {
                            var findThirdPartyMap = false;
                            $.each(this.mapTypeOpt || [], function(i, opt){
                                if(opt.value == Adapter.getThirdPartyMapName()) {
                                    findThirdPartyMap = true;
                                    return false;
                                }
                            });

                            if(!findThirdPartyMap) {
                                var obj = {
                                    value: Adapter.getThirdPartyMapName(),
                                    label: Adapter.getThirdPartyMapLabel()
                                }
                                this.mapTypeOpt.push(obj);
                            }

                        }*/
                        if (window.adapterMap) {
                            Object.keys(window.adapterMap || {}).forEach(function (key) {
                                _this.mapTypeOpt.push(window.adapterMap[key]);
                            })
                        }
                    },
                    computed: {
                        viewMode: function () {
                            return this.mapProps.viewMode;
                        },
                        mapType: function () {
                            return this.mapProps.mapType;
                        }
                    },
                    watch: {

                        viewMode: function (newValue, oldValue) {
                            this.mapProps.threeDControl = this.mapProps.viewMode == '3D' ? true : false;
                        },
                        mapType: function (newValue, oldValue) {
                            this.isThirdParty = this.mapProps.mapType != 'BAIDU_MAP' && this.mapProps.mapType != 'GAODE_MAP' && this.mapProps.mapType != 'GOOGLE_MAP' ? true : false;
                            if (this.isThirdParty) {
                                this.queryMapListByType(this.mapProps.mapType);
                            }
                        }

                    },
                    methods: {
                        save: function () {
                            skObj.savePropertiesForWidget({
                                mapProps: JSON.stringify(this.mapProps)
                            });
                        },
                        queryMapListByType: function (mapType) {
                            var _this = this;
                            //_this.mapList = [];
                            var params = {
                                gisCode: mapType,
                                status: "Active"
                            };
                            thisObj.callAPIConn('/GIS/0.1.0/GISMapInstance/query', params, 'POST', function (vm) {
                                if (vm && vm.resp && vm.resp.code == '0') {
                                    _this.mapList = [];
                                    if (vm.data[0]) {
                                        var find = false;
                                        $.each(vm.data[0].mapInstances || [], function (i, map) {
                                            var obj = {"value": map.name, "label": map.MapName};
                                            _this.mapList.push(obj);
                                            if (_this.mapProps.mapCode == map.name) {
                                                find = true;
                                            }
                                        });
                                        //if(_this.mapList.length>0) {
                                        if (!find) {
                                            //_this.mapProps.mapCode = _this.mapList[0].value;
                                            _this.mapProps.mapCode = _this.mapList.length > 0 ? _this.mapList[0].value : "";
                                        }
                                        _this.queryMapConfigByCode(_this.mapProps.mapCode);
                                        //}

                                    }
                                }
                            });
                        },
                        queryMapConfigByCode: function (mapCode) {
                            var _this = this;
                            var _thisObj = thisObj;
                            var params = {
                                mapCode: mapCode
                            };
                            thisObj.callAPIConn('/GIS/0.1.0/MapConfiguration/query', params, 'POST', function (vm) {
                                if (vm && vm.resp && vm.resp.code == '0') {
                                    if (vm.data[0] && vm.data[0].mapConfig) {

                                        _this.mapProps.token = vm.data[0].mapConfig.token;
                                        _this.mapProps.serviceURL = vm.data[0].mapConfig.ServiceURL;
                                        _this.mapProps.workspaceSerices = vm.data[0].mapConfig.WorkspaceServices;
                                        _this.mapProps.securityMode = vm.data[0].mapConfig.securityMode;

                                    }
                                }
                            });
                        },
                        handleMapTypeChange: function () {


                        },
                        handleMapCodeChange: function () {
                            if (this.isThirdParty) {
                                this.queryMapConfigByCode(this.mapProps.mapCode);
                            }

                        },
                    }
                });

                thisObj.sksAddSetting(thisObj.editVm, {title: '地图设置'});
            }
        }

        thisObj.sksBindItemEvent();

        $(window).resize(function () {
            thisObj.sksRefreshEvents();
        });
    },


    modifyMapConfigCbk: function (data) {
        if (data && data.eventParam && pageMaps[this.vm.cellId]) {

            if (pageProperties[this.vm.cellId].viewModeNew == "3D") {
                pageMaps[this.vm.cellId].setMapView({
                    center: data.eventParam.center,
                    rph: data.eventParam.rph
                });
            } else {
                if (data.eventParam.zoom && data.eventParam.center && data.eventParam.center.length >= 2) {
                    pageMaps[this.vm.cellId].setZoom({
                        center: data.eventParam.center,
                        zoom: data.eventParam.zoom
                    });
                } else if (data.eventParam.zoom) {
                    pageMaps[this.vm.cellId].setZoom({
                        zoom: data.eventParam.zoom
                    });
                } else if (data.eventParam.center && data.eventParam.center.length >= 2) {
                    pageMaps[this.vm.cellId].centerPoint({
                        center: data.eventParam.center
                    });
                }
            }


            if (data.eventParam.mapStyle) {
                pageMaps[this.vm.cellId].setTheme({mapStyle: data.eventParam.mapStyle});
            }

        }
    },

    addOrClearOverlaysCbk: function (data) {
        var _this = this;
        if (data && data.eventParam && pageMaps[this.vm.cellId]) {
            this.vm.markerInfo = {};
            this.vm.flashMarkerInfo = {};
            this.vm.clusterInfo = {};
            this.vm.geometrys = [];
            this.vm.polylines = [];
            this.vm.straightLinePath = {};
            this.vm.routePlanPath = {};
            if (!data.eventParam.append) {
                pageMaps[this.vm.cellId].clearOverlays();
                pageMaps[this.vm.cellId].clearHeatMap();
                $.each(this.vm.imageLayerList || [], function (i, layer) {
                    pageMaps[_this.vm.cellId].removeImageLayer(layer.layerId);
                });
                this.vm.imageLayerList = [];
                this.vm.markerInfoList = [];
                this.vm.indoorMarkerInfoList = [];
                this.vm.flashMarkerInfoList = [];
                this.vm.indoorFlashMkInfoList = [];
                this.vm.clusterInfoList = [];
                this.vm.polylineList = [];
                this.vm.geometryList = [];
                this.vm.effectsList = [];

            }
            //添加markers（图标）
            if (data.eventParam.markerInfo && data.eventParam.markerInfo.markers && data.eventParam.markerInfo.markers.length > 0) {
                this.vm.markerInfo.layerId = data.eventParam.markerInfo.layerId;
                this.vm.markerInfo.layerIndex = data.eventParam.markerInfo.layerIndex;
                this.vm.markerInfo.markers = [];
                $.each(data.eventParam.markerInfo.markers || [], function (i, mk) {
                    if (mk.position && mk.position.length > 1) {
                        var isValid = true;
                        $.each(mk.position || [], function (j, pos) {
                            if (!pos || pos == "") {
                                isValid = false;
                                return false;
                            }
                        });
                        if (isValid) {
                            delete mk.mapSideId;
                            _this.vm.markerInfo.markers.push(mk);
                        }
                    }
                });

            }

            //添加flashMarkers（闪烁图标）
            if (data.eventParam.flashMarkerInfo && data.eventParam.flashMarkerInfo.markers && data.eventParam.flashMarkerInfo.markers.length > 0) {
                this.vm.flashMarkerInfo = JSON.parse(JSON.stringify(data.eventParam.flashMarkerInfo));
                this.vm.flashMarkerInfo.layerId = data.eventParam.flashMarkerInfo.layerId;
                this.vm.flashMarkerInfo.layerIndex = data.eventParam.flashMarkerInfo.layerIndex;
                this.vm.flashMarkerInfo.markers = [];
                $.each(data.eventParam.flashMarkerInfo.markers || [], function (i, mk) {
                    if (mk.position && mk.position.length > 1) {
                        var isValid = true;
                        $.each(mk.position || [], function (j, pos) {
                            if (!pos || pos == "") {
                                isValid = false;
                                return false;
                            }
                        });
                        if (isValid) {
                            delete mk.mapSideId;
                            _this.vm.flashMarkerInfo.markers.push(mk);
                        }
                    }
                });
            }

            //添加cluster（聚合marker）
            if (data.eventParam.clusterInfo && data.eventParam.clusterInfo.markers && data.eventParam.clusterInfo.markers.length > 0) {
                if (pageProperties[this.vm.cellId].mapType == "WAZH_LITE_MAP") {
                    //用添加普通marker代替添加聚合marker
                    this.vm.markerInfo.layerId = data.eventParam.clusterInfo.layerId;
                    this.vm.markerInfo.layerIndex = data.eventParam.clusterInfo.layerIndex;
                    this.vm.markerInfo.markers = [];
                    $.each(data.eventParam.clusterInfo.markers || [], function (i, mk) {
                        if (mk.position && mk.position.length > 1) {
                            var isValid = true;
                            $.each(mk.position || [], function (j, pos) {
                                if (!pos || pos == "") {
                                    isValid = false;
                                    return false;
                                }
                            });
                            if (isValid) {
                                delete mk.mapSideId;
                                _this.vm.markerInfo.markers.push(mk);
                            }
                        }
                    });
                } else {
                    this.vm.clusterInfo.layerId = data.eventParam.clusterInfo.layerId;
                    this.vm.clusterInfo.layerIndex = data.eventParam.clusterInfo.layerIndex;
                    this.vm.clusterInfo.options = data.eventParam.clusterInfo.options;
                    this.vm.clusterInfo.markers = [];
                    $.each(data.eventParam.clusterInfo.markers || [], function (i, mk) {
                        if (mk.position && mk.position.length > 1) {
                            var isValid = true;
                            $.each(mk.position || [], function (j, pos) {
                                if (!pos || pos == "") {
                                    isValid = false;
                                    return false;
                                }
                            });
                            if (isValid) {
                                delete mk.mapSideId;
                                _this.vm.clusterInfo.markers.push(mk);
                            }
                        }
                    });
                }


            }

            if (this.vm.markerInfo && this.vm.markerInfo.markers && this.vm.markerInfo.markers.length > 0 ||
                this.vm.flashMarkerInfo && this.vm.flashMarkerInfo.markers && this.vm.flashMarkerInfo.markers.length > 0 ||
                this.vm.clusterInfo && this.vm.clusterInfo.markers && this.vm.clusterInfo.markers.length > 0) {
                this.vm.addMarkers();
            }

            //添加polylines（折线数组）
            if (data.eventParam.polylines && data.eventParam.polylines.length > 0) {
                this.vm.polylines = JSON.parse(JSON.stringify(data.eventParam.polylines));
                this.vm.addPolylines();
            }

            //添加几何体（圆、矩形、多边形）
            if (data.eventParam.geometrys && data.eventParam.geometrys.length > 0) {
                this.vm.geometrys = JSON.parse(JSON.stringify(data.eventParam.geometrys));
                this.vm.addGeometrys();
            }

            //添加infoWins（信息窗体数组（当前一次只能添加一个））
            if (data.eventParam.infoWins && data.eventParam.infoWins.length > 0) {
                this.vm.infoWins = JSON.parse(JSON.stringify(data.eventParam.infoWins));
                this.vm.addInfoWins();
            }

            //添加直线路径
            if (data.eventParam.straightLinePath && data.eventParam.straightLinePath.points && data.eventParam.straightLinePath.points.length > 0) {
                this.vm.straightLinePath = JSON.parse(JSON.stringify(data.eventParam.straightLinePath));
                this.vm.addStraightLinePath();
            }

            //添加路径规划后的路径（室内和室外）
            if (data.eventParam.routePlanPath && data.eventParam.routePlanPath.wayPoints && data.eventParam.routePlanPath.wayPoints.length > 0) {
                this.vm.routePlanPath = JSON.parse(JSON.stringify(data.eventParam.routePlanPath));
                this.vm.addRoutePlanPath();
            }

            //添加热力图
            if (data.eventParam.heatMapInfo && data.eventParam.heatMapInfo.heatPoints && data.eventParam.heatMapInfo.heatPoints.length > 0) {
                var input = JSON.parse(JSON.stringify(data.eventParam.heatMapInfo));
                pageMaps[this.vm.cellId].showHeatMap(input.heatPoints, input.heatRadius, input.opacity);
            }

            //添加特效
            if (data.eventParam.effectInfo && data.eventParam.effectInfo.effects && data.eventParam.effectInfo.effects.length > 0) {
                var input = JSON.parse(JSON.stringify(data.eventParam.effectInfo));
                pageMaps[this.vm.cellId].addEffect(input);
                this.vm.effectsList.push(input);
            }

            //添加图片
            if (data.eventParam.imageLayerInfo && data.eventParam.imageLayerInfo.data && data.eventParam.imageLayerInfo.data.length > 0) {
                var input = JSON.parse(JSON.stringify(data.eventParam.imageLayerInfo));
                pageMaps[this.vm.cellId].addImageLayer(input);
                this.vm.imageLayerList.push(input);
            }
        }
    },

    clearOverlaysByConCbk: function (data) {
        var _this = this;
        if (data && data.eventParam && pageMaps[this.vm.cellId]) {

            //根据Id清除
            if (data.eventParam.overlayIds && data.eventParam.overlayIds.length > 0) {
                $.each(data.eventParam.overlayIds || [], function (k, id) {

                    $.each(_this.vm.markerInfoList || [], function (i, mkInfo) {
                        $.each(mkInfo.markers || [], function (j, mk) {
                            if (mk.id == id) {
                                pageMaps[_this.vm.cellId].deleteMarker(mk.mapSideId);
                                mkInfo.markers.splice(j, 1);
                                return false;
                            }
                        });
                    });

                    $.each(_this.vm.indoorMarkerInfoList || [], function (i, mkInfo) {
                        $.each(mkInfo.markers || [], function (j, mk) {
                            if (mk.id == id && mk.mapSideId) {
                                pageMaps[_this.vm.cellId].deleteMarker(mk.mapSideId);
                            }
                            if (mk.id == id) {
                                mkInfo.markers.splice(j, 1);
                                return false;
                            }
                        });
                    });

                    $.each(_this.vm.flashMarkerInfoList || [], function (i, mkInfo) {
                        $.each(mkInfo.markers || [], function (j, mk) {
                            if (mk.id == id) {
                                pageMaps[_this.vm.cellId].deleteMarker(mk.mapSideId);
                                mkInfo.markers.splice(j, 1);
                                return false;
                            }
                        });
                    });

                    $.each(_this.vm.indoorFlashMkInfoList || [], function (i, mkInfo) {
                        $.each(mkInfo.markers || [], function (j, mk) {
                            if (mk.id == id && mk.mapSideId) {
                                pageMaps[_this.vm.cellId].deleteMarker(mk.mapSideId);
                            }
                            if (mk.id == id) {
                                mkInfo.markers.splice(j, 1);
                                return false;
                            }
                        });
                    });

                    $.each(_this.vm.clusterInfoList || [], function (i, mkInfo) {
                        $.each(mkInfo.markers || [], function (j, mk) {
                            if (mk.id == id) {
                                pageMaps[_this.vm.cellId].deleteMarker(mk.mapSideId);
                                mkInfo.markers.splice(j, 1);
                                return false;
                            }
                        });
                    });

                    $.each(_this.vm.geometryList || [], function (i, geo) {
                        if (geo.geometryId == id) {
                            pageMaps[_this.vm.cellId].removeGeometry(id);
                            _this.vm.geometryList.splice(i, 1);
                            return false;
                        }
                    });

                    $.each(_this.vm.effectsList || [], function (i, effectInfo) {
                        $.each(effectInfo.effects || [], function (j, eff) {
                            if (eff.effectId == id) {
                                pageMaps[_this.vm.cellId].deleteEffect({
                                    'effectId': id
                                });
                                effectInfo.effects.splice(j, 1);
                                return false;
                            }
                        });
                    });


                });
            }

            //根据类型清除
            if (data.eventParam.overlayTypes && data.eventParam.overlayTypes.length > 0) {
                $.each(data.eventParam.overlayTypes || [], function (k, overlayType) {

                    if ('Marker' == overlayType) {
                        $.each(_this.vm.markerInfoList || [], function (i, mkInfo) {
                            pageMaps[_this.vm.cellId].deleteLayer({layerId: mkInfo.layerId});
                        });
                        _this.vm.markerInfoList = [];

                        $.each(_this.vm.indoorMarkerInfoList || [], function (i, mkInfo) {
                            pageMaps[_this.vm.cellId].deleteLayer({layerId: mkInfo.layerId});
                        });
                        _this.vm.indoorMarkerInfoList = [];

                    } else if ('FlashMarker' == overlayType) {
                        $.each(_this.vm.flashMarkerInfoList || [], function (i, mkInfo) {
                            pageMaps[_this.vm.cellId].deleteLayer({layerId: mkInfo.layerId});
                        });
                        _this.vm.flashMarkerInfoList = [];

                        $.each(_this.vm.indoorFlashMkInfoList || [], function (i, mkInfo) {
                            pageMaps[_this.vm.cellId].deleteLayer({layerId: mkInfo.layerId});
                        });
                        _this.vm.indoorFlashMkInfoList = [];
                    } else if ('ClusterMarker' == overlayType) {
                        pageMaps[_this.vm.cellId].clearClusterMarker();
                    } else if ('Geometry' == overlayType) {
                        $.each(_this.vm.geometryList || [], function (i, geo) {
                            pageMaps[_this.vm.cellId].removeGeometry();
                        });
                        _this.vm.geometryList = [];
                    } else if ('InfoWindow' == overlayType) {
                        pageMaps[_this.vm.cellId].closePopup();
                    } else if ('Path' == overlayType) {
                        $.each(_this.vm.polylineList || [], function (i, line) {
                            pageMaps[_this.vm.cellId].deletePolyline(line.mapSideId);
                        });
                        _this.vm.polylineList = [];
                        pageMaps[_this.vm.cellId].clearPath();
                        pageMaps[_this.vm.cellId].clearRoutePath();
                    } else if ('HeatMap' == overlayType) {
                        pageMaps[_this.vm.cellId].clearHeatMap();
                    } else if ('ImageLayer' == overlayType) {
                        $.each(_this.vm.imageLayerList || [], function (i, layer) {
                            pageMaps[_this.vm.cellId].removeImageLayer(layer.layerId);
                        });
                        _this.vm.imageLayerList = [];
                    } else if ('range' === overlayType) {
                        pageMaps[_this.vm.cellId].clearRange(data);
                    } else if ('poi' === overlayType) {
                        pageMaps[_this.vm.cellId].clearPOI(data);
                    }

                });

            }

            //根据图层列表
            if (data.eventParam.layers && data.eventParam.layers.length > 0) {
                $.each(data.eventParam.layers || [], function (i, layerInfo) {
                    pageMaps[_this.vm.cellId].deleteLayer({layerId: layerInfo});
                    $.each(_this.vm.markerInfoList || [], function (j, mkInfo) {
                        if (mkInfo.layerId = layerInfo) {
                            _this.vm.markerInfoList.splice(j, 1);
                            return false;
                        }
                    });
                    $.each(_this.vm.indoorMarkerInfoList || [], function (j, mkInfo) {
                        if (mkInfo.layerId = layerInfo) {
                            _this.vm.indoorMarkerInfoList.splice(j, 1);
                            return false;
                        }
                    });
                    $.each(_this.vm.flashMarkerInfoList || [], function (j, mkInfo) {
                        if (mkInfo.layerId = layerInfo) {
                            _this.vm.flashMarkerInfoList.splice(j, 1);
                            return false;
                        }
                    });
                    $.each(_this.vm.indoorFlashMkInfoList || [], function (j, mkInfo) {
                        if (mkInfo.layerId = layerInfo) {
                            _this.vm.indoorFlashMkInfoList.splice(j, 1);
                            return false;
                        }
                    });
                });
            }
        }
    },

    //init和update
    getEchartsOptionsCbk: function (data) {
        if (data && data.eventParam && data.eventParam.options) {
            var options = data.eventParam.options;
            if (!options.gismap) {
                options.gismap = {};
            }
            if (pageMaps[this.vm.cellId].mapType == 'BAIDU_MAP' && data.eventParam.setFitView) {
                var viewport = pageMaps[this.vm.cellId].getFitView(data.eventParam.setFitView);
                options.gismap.zoom = viewport.zoom;
                options.gismap.center = viewport.center;
            } else {
                options.gismap.zoom = parseInt(pageProperties[this.vm.cellId].zoomLevel);
                options.gismap.center = [pageProperties[this.vm.cellId].longitude, pageProperties[this.vm.cellId].latitude];
            }

            options.gismap.mapStyle = pageProperties[this.vm.cellId].mapStyle;
            options.gismap.roam = Studio.inReader ? true : 'move';
            options.gismap.mapCellId = this.vm.cellId;
            pageEcharts[this.vm.cellId].setOption(options);


            //echarts event
            var _this = this;
            $.each(options.echartEvents || [], function (i, event) {
                pageEcharts[_this.vm.cellId].off(event.eventType);
                pageEcharts[_this.vm.cellId].on(event.eventType, function (echartsData) {

                    _this.vm.handleEchartsEvent(event.eventType, event.callback, echartsData);
                });

            });

        }

        if (data && data.eventParam && data.eventParam.setFitView && pageMaps[this.vm.cellId].mapType != 'BAIDU_MAP') {
            pageMaps[this.vm.cellId].setFitView(data.eventParam.setFitView);

        }

        //走connector刷新路线 a
        if (data && data.eventParam && data.eventParam.scatterInput) {
            this.vm.getScatterData(scatterInput);
        }

    },

    locateElementCbk: function (data) {
        var _this = this;
        if (data && data.eventParam && data.eventParam.id) {

            var find = false;
            //找marker
            $.each(_this.vm.markerInfoList || [], function (i, mkInfo) {
                $.each(mkInfo.markers || [], function (j, mk) {
                    if (mk.id == data.eventParam.id) {
                        if (mk.buildingId && mk.floorId) {
                            _this.vm.openIndoorMap(mk.buildingId, mk.floorId);
                        }
                        pageMaps[_this.vm.cellId].trigger(mk.mapSideId, 'click');
                        find = true;
                        return false;
                    }
                });
            });

            if (find) {
                return;
            }

            $.each(_this.vm.indoorMarkerInfoList || [], function (i, mkInfo) {
                $.each(mkInfo.markers || [], function (j, mk) {
                    if (mk.id == data.eventParam.id) {
                        if (mk.buildingId && mk.floorId) {
                            _this.vm.openIndoorMap(mk.buildingId, mk.floorId);
                        }

                        var timerId = setInterval(function () {
                            if (mk.mapSideId) {
                                pageMaps[_this.vm.cellId].trigger(mk.mapSideId, 'click');
                                clearInterval(timerId);
                            }
                        }, 200);

                        find = true;
                        return false;
                    }
                });
            });

            if (find) {
                return;
            }

            //找FlashMarker
            $.each(_this.vm.flashMarkerInfoList || [], function (i, mkInfo) {
                $.each(mkInfo.markers || [], function (j, mk) {
                    if (mk.id == data.eventParam.id) {
                        if (mk.buildingId && mk.floorId) {
                            _this.vm.openIndoorMap(mk.buildingId, mk.floorId);
                        }
                        pageMaps[_this.vm.cellId].trigger(mk.mapSideId, 'click');
                        find = true;
                        return false;
                    }
                });
            });

            if (find) {
                return;
            }

            $.each(_this.vm.indoorFlashMkInfoList || [], function (i, mkInfo) {
                $.each(mkInfo.markers || [], function (j, mk) {
                    if (mk.id == data.eventParam.id) {
                        if (mk.buildingId && mk.floorId) {
                            _this.vm.openIndoorMap(mk.buildingId, mk.floorId);
                        }

                        var timerId = setInterval(function () {
                            if (mk.mapSideId) {
                                pageMaps[_this.vm.cellId].trigger(mk.mapSideId, 'click');
                                clearInterval(timerId);
                            }
                        }, 200);

                        find = true;
                        return false;
                    }
                });
            });

            if (find) {
                return;
            }

            //找clusterMarker
            $.each(_this.vm.clusterInfoList || [], function (i, mkInfo) {
                $.each(mkInfo.markers || [], function (j, mk) {
                    if (mk.id == data.eventParam.id) {
                        if (mk.buildingId && mk.floorId) {
                            _this.vm.openIndoorMap(mk.buildingId, mk.floorId);
                        }
                        pageMaps[_this.vm.cellId].trigger(mk.mapSideId, 'click');
                        find = true;
                        return false;
                    }
                });
            });

        }
    },

    changeWeatherCbk: function (data) {
        if (data && data.eventParam && pageMaps[this.vm.cellId]) {
            pageMaps[this.vm.cellId].setWeather(data.eventParam);
        }
    },

    setSceneTimeCbk: function (data) {
        if (data && data.eventParam && pageMaps[this.vm.cellId]) {
            pageMaps[this.vm.cellId].setSceneTime(data.eventParam);
        }
    },

    setMapApiInputParamsCbk: function (data) {
        if (data && data.eventParam) {
            if (data.eventParam.addrDeSearch) {
                this.vm.addrDeSearch.radius = data.eventParam.addrDeSearch.radius ? data.eventParam.addrDeSearch.radius : this.vm.addrDeSearch.radius;
                this.vm.addrDeSearch.type = data.eventParam.addrDeSearch.type ? data.eventParam.addrDeSearch.type : this.vm.addrDeSearch.type;
            }
        }
    },

    /**
     * 51VR定制动作Cbk，管网操作
     * @param param
     */
    hidePipelineCbk: function (param) {
        if (param && pageMaps[this.vm.cellId]) {
            this.vm.hidePipeline(param);
        }
    },

    /**
     * 51VR定制动作Cbk，楼宇拆解
     * @param param
     */
    buildingDismantlingCbk: function (param) {
        if (param && pageMaps[this.vm.cellId]) {
            this.vm.buildingDismantling(param);
        }
    },

    /**
     * 51VR定制动作Cbk，开启取点工具
     * @param operation 入参为 POI 则限制单个取点
     */
    openPointToolCbk: function (operation) {
        if (pageMaps[this.vm.cellId]) {
            this.vm.openPointTool(operation);
        }
    },

    /**
     * 51VR定制动作Cbk，范围圈定
     * @param param
     */
    addRangeCbk: function (param) {
        if (pageMaps[this.vm.cellId]) {
            this.vm.addRange(param);
        }
    },

    /**
     * 51VR定制动作Cbk，更新范围圈定
     * @param param
     */
    updateRangeCbk: function (param) {
        if (pageMaps[this.vm.cellId]) {
            this.vm.updateRange(param);
        }
    },

    /**
     * 51VR定制动作Cbk，模拟覆盖物点击
     * @param param
     */
    simClickCoveringCbk(param) {
        if (pageMaps[this.vm.cellId]) {
            this.vm.simClickCovering(param);
        }
    },
    /**
     * 51VR定制动作Cbk，显示/隐藏指定类型的覆盖物
     * @param param
     */
    showHideCoveringCbk(param){
        if (pageMaps[this.vm.cellId]) {
            this.vm.showHideCovering(param);
        }
    },


    /**
     * 统一Connector调用
     */
    callFlowConn: function (connector, param, callbackFunc, connectorName) {
        var _this = this;
        if (connector) {
            connector.connectorParams.async = true;
            connector.connectorParams.input = param;
            connector.process(function (response) {
                if (response) {
                    callbackFunc.call(_this, response);
                }
            });
        }
    },

    /**
     * 通过 APIConnector 调用 CustomAPI
     **/
    callAPIConn: function (service, param, type, callbackFunc) {
        var thisObj = this;
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
            connector.setInputParams({service: service, needSchema: 'data'});	//异步（默认）
            if (param.async === false) {
                connector.setInputParams({service: service, needSchema: 'data', async: false});	//同步
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
                    console.log("Call API Failed: ", response);
                    if (response && response.response && response.response.resMsg) {
                        thisObj.vm.$alert(response.response.resMsg, 'Error', {
                            confirmButtonText: 'Confirm',
                            type: 'error',
                        }).then(function () {
                        });
                    }
                })
        } else {
            console.log("调用服务时没有获取到connector: ", service);
            if (!Studio.inReader) {
                thisObj.vm.$confirm("调用服务时没有获取到API Connector.", 'Information', {
                    confirmButtonText: 'Confirm',
                    type: 'warning'
                }).then(function () {
                });
            }

        }
    }
});