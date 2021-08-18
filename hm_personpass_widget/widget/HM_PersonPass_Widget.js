var HM_PersonPass_Widget = StudioWidgetWrapper.extend({
    init: function () {
        var thisObj = this;
        thisObj._super.apply(thisObj, arguments);
        thisObj.render();
        if ((typeof (Studio) != "undefined") && Studio) {
            Studio.registerAction(thisObj, "confirmLocationWidgetCbk", "confirmLocationWidgetCbk", [], $.proxy(thisObj.confirmLocationWidgetCbk, thisObj), []);
        }
    },
    render: function () {
        var thisObj = this;
        var elem = thisObj.getContainer();

        /*
         * API to get base path of your uploaded widget API file
         */
        if (elem) {
            var containerDiv = $(".scfClientRenderedContainer", elem);
            if (containerDiv.length) {
                $(containerDiv).empty();
            }
            else {
                containerDiv = document.createElement('div');
                containerDiv.className = "scfClientRenderedContainer";
                $(elem).append(containerDiv);
            }

            var i18n = HttpUtils.getI18n({
                locale: HttpUtils.getLocale(),
                messages: thisObj.getMessages()
            });

            thisObj.vm = new Vue({
                i18n: i18n,
                el: $("#IOC_PersonPass_Widget", elem)[0],
                data() {
                    return {
                        lang: {},
                        times: [], // 开始时间、结束时间,
                        name: '', // 事件编号
                        orgName:'',
                        way: '',
                        type: '',
                        status: '',
                        maxTime: 30,
                        tableData: [],
                        loading: false,
                        disabled: false,
                        isRecognise: false,
                        isAccess: false,
                        isType: false,
                        //search
                        personType: [{
                            label: '员工',
                            value: 'Staff'
                        }, {
                            label: '访客',
                            value: 'Visitor'
                        }, {
                            label: '未知',
                            value: 'Unknown'
                        }],
                        accessType: [{
                            label: 'PAD',
                            value: 'PAD'
                        }, {
                            label: "ID卡",
                            value: 'ID CARD'
                        }],
                        accessDOFlag: [{
                            label: '是',
                            value: true
                        }, {
                            label: "否",
                            value: false
                        }],
                        accessResult: [],
                        queryCondition: {
                            start: 0,
                            limit: 10,
                            condition: {}
                        },
                        pagination: false,
                        numPerPage: 10,
                        pageNum: 1,
                        totalCount: 0,
                        accessMap: {
                            true: "是",
                            false: "否"
                        },
                        trafficDirection: {
                            Out: "出",
                            In: "入"
                        },
                        personTypeMap: {
                            "Staff": "员工",
                            "Visitor": "访客"
                        },
                        pickerOptions: {},
                        doFlag: false,
                        parkFlag: false,
                        parkJSON: {},
                        parkCode: "",
                        spaceCode: "",
                        // spaceString: "",
                        spaceList: [],
                        spaceCodeList: [],
                        accessTypeValue: []
                    };
                },
                methods: {
                    reset() {
                        // this.spaceParkCode();
                        this.resetDate();
                        this.name = ''; // 事件编号
                        this.orgName = '';
                        this.way = '';
                        this.type = '';
                        this.status = '';
                        this.pageNum = 1;
                        this.queryCondition = {
                            start: 0,
                            limit: 10,
                            condition: {
                                doFlag: '',
                                park_code: '',
                                beginTime: '',
                                endTime: ''
                            }
                        }
                        this.queryCondition.condition['doFlag'] = this.doFlag;
                        this.queryCondition.condition['park_code'] = this.spaceCode;
                        this.queryCondition.condition['space'] = this.spaceList;
                        if (this.times && this.times.length) {
                            this.queryCondition.condition['beginTime'] = this.times[0];
                            this.queryCondition.condition['endTime'] = this.times[1];
                        }
                        this.queryCondition.condition = this.clearNull(this.queryCondition.condition);
                        this.queryFaceAccess(this.queryCondition);
                    },
                    // 每页多少条切换
                    handleSizeChange(val) {
                        // this.spaceParkCode();
                        this.numPerPage = val;
                        this.queryCondition.start = 0;
                        this.queryCondition.limit = this.numPerPage;
                        this.queryCondition.condition = {
                            personName: this.name,
                            organizationName: this.orgName,
                            personType: this.type,
                            accessType: this.way,
                            triggerOpenGate: this.status
                        };
                        this.queryCondition.condition['doFlag'] = this.doFlag;
                        this.queryCondition.condition['park_code'] = this.spaceCode;
                        this.queryCondition.condition['space'] = this.spaceList;
                        if (this.times && this.times.length) {
                            this.queryCondition.condition['beginTime'] = this.times[0];
                            this.queryCondition.condition['endTime'] = this.times[1];
                        }
                        this.queryCondition.condition = this.clearNull(this.queryCondition.condition);
                        this.queryFaceAccess(this.queryCondition);
                    },
                    // 页码切换
                    handleCurrentChange(val) {
                        // this.spaceParkCode();
                        this.pageNum = val;
                        this.queryCondition.start = this.pageNum == 1 ? 0 : ((this.pageNum - 1) * this.numPerPage);
                        this.queryCondition.limit = this.numPerPage;
                        this.queryCondition.condition = {
                            personName: this.name,
                            organizationName: this.organizationName,
                            personType: this.type,
                            accessType: this.way,
                            triggerOpenGate: this.status
                        };
                        this.queryCondition.condition['doFlag'] = this.doFlag;
                        this.queryCondition.condition['park_code'] = this.spaceCode;
                        this.queryCondition.condition['space'] = this.spaceList;
                        if (this.times && this.times.length) {
                            this.queryCondition.condition['beginTime'] = this.times[0];
                            this.queryCondition.condition['endTime'] = this.times[1];
                        }
                        this.queryCondition.condition = this.clearNull(this.queryCondition.condition);
                        this.queryFaceAccess(this.queryCondition);
                    },
                    // 空间节点园区查询
                    spaceParkCode() {
                        if (!this.spaceList.length) {
                            this.$notify({
                                title: this.lang.notifyTitle,
                                message: this.lang.notifyMinTip,
                                customClass: 'hw-notify',
                                duration: 8000,
                                iconClass: 'el-icon-warning-outline'
                            });
                        } else if (this.spaceList.length > 50) {
                            this.$notify({
                                title: this.lang.notifyTitle,
                                message: this.lang.notifyMaxTip,
                                customClass: 'hw-notify',
                                duration: 8000,
                                iconClass: 'el-icon-warning-outline'
                            });
                        }
                    },
                    // 来源切换
                    doFlagChange(val) {
                        this.doFlag = val;
                        this.parkFlag = false;
                        if (!this.spaceList.length) {
                            this.doFlag = false;
                            this.$notify({
                                title: this.lang.notifyTitle,
                                message: this.lang.notifyMinTip,
                                customClass: 'hw-notify',
                                duration: 8000,
                                iconClass: 'el-icon-warning-outline'
                            });
                            return;
                        } else if (this.spaceList.length > 50) {
                            this.doFlag = false;
                            this.$notify({
                                title: this.lang.notifyTitle,
                                message: this.lang.notifyMaxTip,
                                customClass: 'hw-notify',
                                duration: 8000,
                                iconClass: 'el-icon-warning-outline'
                            });
                            return;
                        }
                        this.parkFlagChange(this.parkFlag);
                    },

                    // 是否关联
                    parkFlagChange(val) {
                        // this.parkFlag = val;
                        this.parkFlag = true;
                        // if (this.parkFlag !== true) {
                        //     this.spaceCode = ""
                        // } else {
                        //     this.spaceCode = this.spaceString
                        // }
                        this.pageNum = 1;
                        this.queryCondition.start = 0;
                        this.queryCondition.limit = this.numPerPage;
                        this.queryCondition.condition = {
                            personName: this.name,
                            organizationName: this.orgName,
                            personType: this.type,
                            accessType: this.way,
                            triggerOpenGate: this.status
                        };
                        this.queryCondition.condition['doFlag'] = this.doFlag;
                        this.queryCondition.condition['park_code'] = this.spaceCode;
                        this.queryCondition.condition['space'] = this.spaceList;
                        if (this.times && this.times.length) {
                            this.queryCondition.condition['beginTime'] = this.times[0];
                            this.queryCondition.condition['endTime'] = this.times[1];
                        }
                        this.queryCondition.condition = this.clearNull(this.queryCondition.condition);
                        this.queryFaceAccess(this.queryCondition);
                        this.queryFaceRecogniseStatistics({ condition: { doFlag: this.doFlag, park_code: this.spaceCode }, spaceInfo: this.parkJSON.spaceInfo });
                        this.queryFaceAccessStatistics({ condition: { doFlag: this.doFlag, park_code: this.spaceCode }, spaceInfo: this.parkJSON.spaceInfo });
                        this.queryPersonAccessTypeStatistics({ condition: { doFlag: this.doFlag, park_code: this.spaceCode }, spaceInfo: this.parkJSON.spaceInfo });
                    },

                    /****** 通过 ApiConnector 调用 CustomAPI ******/
                    callConn: function (service, param, type, callbackFunc) {
                        var _this = this;
                        var connector = null;
                        switch (type.toUpperCase()) {
                            case 'POST':
                                connector = thisObj.getConnectorInstanceByName('APIConnector_POST');
                                break;
                            case 'GET':
                                connector = thisObj.getConnectorInstanceByName('APIConnector_GET');
                                break;
                            case 'PUT':
                                connector = thisObj.getConnectorInstanceByName('APIConnector_PUT');
                                break;
                            case 'DELETE':
                                connector = thisObj.getConnectorInstanceByName('APIConnector_DELETE');
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
                            connector
                                .query(param)
                                .done(function (response) {
                                    if (response.resp && response.resp.code) {
                                        callbackFunc.call(_this, response);
                                    }
                                })
                                .fail(function (response) {
                                    console.log("Call Flow Fail: ", response);
                                    if (service == "/SmartCampus__PersonPass/1.0.0/queryFaceRecogniseStatistics") {
                                        _this.isRecognise = false;
                                    } else if (service == "/SmartCampus__PersonPass/1.0.0/queryFaceAccessStatistics") {
                                        _this.isAccess = false;
                                    } else if (service == "/SmartCampus__PersonPass/1.0.0/queryPersonAccessTypeStatistics") {
                                        _this.isType = false;
                                    }
                                    _this.$confirm(response.response.resMsg, _this.lang.error, {
                                        type: "error",
                                        confirmButtonText: _this.lang.confirm,
                                        callback: action => { },
                                        customClass: 'hw-messageBox'
                                    });
                                })
                        } else {
                            console.log("No Flow Connector!");
                        }
                    },
                    createNewPromise(option) {
                        let _this = this;
                        return new Promise(function (resolve, reject) {
                            _this.callConn(option.url, option.data, option.type, (res) => {
                                resolve(res);
                            });
                            //  HttpUtils.getCsrfToken(function (token) {
                            //     $.ajax({
                            //          url: option.url,
                            //          type: option.type,
                            //          data: JSON.stringify(option.data),
                            //          dataType: 'json',
                            //          headers: {
                            //             'baas-method': option.type.toLowerCase(),
                            //             "Content-Type": "application/json",
                            //             "csrf-token": token
                            //          },
                            //          success: function (data) {
                            //              resolve(data);
                            //          },
                            //          error: function (error) {
                            //              reject(error);
                            //          }
                            //     });
                            //  })
                        });
                    },
                    getSpTree(id) {
                        this.spaceList = [];
                        this.spaceCodeList = [];
                        this.spaceCode = "";
                        var _this = this;
                        var param = {
                            isChildren: false
                        };
                        var option = {
                            type: "POST",
                            url: "/Space/0.1.0/querySpaceTree/" + id,
                            data: param
                        };
                        var spaceTree = _this.createNewPromise(option);
                        return spaceTree.then(function (data) {
                            if (data.data[0].space && data.data[0].space.level && data.data[0].space.level.code == "PARK") {
                                _this.spaceList.push(data.data[0].space.id);
                                _this.spaceCodeList.push(data.data[0].space.code);
                            }
                            if (data.data[0].space.children && data.data[0].space.children.length > 0) {
                                const arr = data.data[0].space.children.reduce(function f(pre, cur) {
                                    const callee = f;
                                    pre.push(cur);
                                    if (cur.children && cur.children.length > 0) {
                                        cur.children.reduce(callee, pre)
                                    }
                                    return pre;
                                }, []).map((cur) => {
                                    cur.children = [];
                                    return cur
                                })
                                arr.forEach(item => {
                                    if (item.level && item.level.code == "PARK") {
                                        _this.spaceList.push(item.id);
                                        _this.spaceCodeList.push(item.code);
                                    }
                                })
                            }
                            // _this.spaceParkCode();
                            // _this.spaceCode = _this.spaceCodeList.toString();
                            // _this.spaceString = _this.spaceCodeList.toString();
                            // _this.spaceCode = _this.spaceString;
                            _this.getAcceessType();
                        })
                    },
                    queryPersonType() {
                        var _this = this;
                        var param = {
                            start: 0,
                            limit: 500,
                            condition: {}
                        };
                        var option = {
                            type: "POST",
                            url: "/Person/0.1.0/PersonDef/query",
                            data: param
                        };
                        var preContinue = _this.createNewPromise(option);
                        return preContinue.then(function (data) {
                            _this.personType = [];
                            data.data[0].personDefs.forEach(item => {
                                _this.personType.push({
                                    value: item.code,
                                    label: item.typeName
                                })
                            });
                            _this.reset()
                        })
                    },
                    queryFaceAccess(condition) {
                        // if (!this.times || !this.times.length) {
                        //     this.$refs.timeRange.focus();
                        //     this.$message({
                        //         message: this.lang.noTimeSegmentError,
                        //         type: 'warning'
                        //     })
                        //     return;
                        // }
                        var _this = this;
                        if (!this.spaceList.length || this.spaceList.length > 50) {
                            this.loading = false;
                        } else {
                            this.loading = true;
                        }
                        // let codeNum = 0;
                        // let codeList = [];
                        // this.spaceCodeList.forEach((item,index) => {
                        //     if (codeNum < 3) {
                        //         codeList.push(item);
                        //     } else if (codeNum == 3) {
                        //         console.log(codeNum, codeList);
                        //         codeList = [];
                        //         codeList.push(item);
                        //         codeNum = 0;
                        //     }
                        //     if (index == this.spaceCodeList.length - 1) {
                        //         console.log(codeNum, codeList);
                        //     }
                        //     codeNum += 1;
                        // })
                        // var param = condition || { start: 0, limit: 10, condition: { doFlag: this.doFlag, park_code: this.spaceCode, space: this.spaceList, beginTime: this.times[0], endTime: this.times[1] } };
                        var param = condition || { start: 0, limit: 10, condition: {} };
                        var option = {
                            type: "POST",
                            url: "/hm_bigScreen__hm/1.0.0/hmQueryFaceAccess",
                            data: param
                        };
                        var preContinue = _this.createNewPromise(option);
                        return preContinue.then(function (data) {
                            _this.tableData = [];
                            // data.data[0].access.forEach(item => {
                                data.data.access.forEach(item => {
                                let personType = "";
                                _this.personType.forEach(type => {
                                    if (type.value == item['personType']) {
                                        personType = type.label;
                                    }
                                });
                                _this.tableData.push({
                                    time: item['accessBeginTime'],
                                    name: item['personName'],
                                    type: personType,
                                    way: item['accessType'],
                                    // status: _this.accessMap[item['triggerOpenGate']],
                                    status: _this.accessMap[item['accessResult']],
                                    url: item['faceUrl'],
                                    guard: item['accessGuard'],
                                    direction: item['direction'],
                                    location: item['accessLocation'],
                                    // location: _this.trafficDirection[item['accessLocation']],
                                    // direction: item['accessLocation'],
                                    // accessLocation: _this.trafficDirection[item['direction']],
                                    showUrl: false
                                })
                            });
                            _this.totalCount = data.data.count;
                            _this.loading = false
                        })
                    },
                    queryFaceRecogniseStatistics(condition) {
                        var _this = this;
                        this.isRecognise = true;
                        var param = { condition: { doFlag: this.doFlag, park_code: this.spaceCode }, spaceInfo: this.parkJSON.spaceInfo };
                        var option = {
                            type: "POST",
                            url: "/SmartCampus__PersonPass/1.0.0/queryFaceRecogniseStatistics",
                            data: param
                        };
                        var preContinue = _this.createNewPromise(option);
                        return preContinue.then(function (data) {
                            _this.isRecognise = false;
                            var widget9 = document.getElementById("id_skcAbsoluteWidget_54").children[0].children[0].children[0].children[0].children[0].children[0].children[0].children[0];
                            var myChart = echarts.init(widget9);
                            var arrayColor = [];
                            var arrayName = [];
                            echarts.init(widget9)._chartsViews[0]._data._itemVisuals.forEach((item, index) => {
                                if (index == 12) {
                                    arrayColor.push("#2f4554")
                                } else {
                                    arrayColor.push(item.color)
                                }
                            });
                            data.data[0].dataValue[0].value.forEach(item => {
                                arrayName.push(item.name)
                            });
                            var options = {
                                color: arrayColor,
                                legend: {
                                    data: arrayName
                                },
                                series: [{
                                    data: data.data[0].dataValue[0].value
                                }]
                            }
                            myChart.setOption(options);
                        })
                    },
                    queryFaceAccessStatistics(condition) {
                        var _this = this;
                        this.isAccess = true;
                        var param = { condition: { doFlag: this.doFlag, park_code: this.spaceCode }, spaceInfo: this.parkJSON.spaceInfo };
                        var option = {
                            type: "POST",
                            url: "/SmartCampus__PersonPass/1.0.0/queryFaceAccessStatistics",
                            data: param
                        };
                        var preContinue = _this.createNewPromise(option);
                        return preContinue.then(function (data) {
                            _this.isAccess = false;
                            var widget11 = document.getElementById("id_skcAbsoluteWidget_56").children[0].children[0].children[0].children[0].children[0].children[0].children[0].children[0];
                            var myChart = echarts.init(widget11);
                            var arrayColor = [];
                            var arrayName = [];
                            echarts.init(widget11)._chartsViews[0]._data._itemVisuals.forEach((item, index) => {
                                if (index == 12) {
                                    arrayColor.push("#2f4554")
                                } else {
                                    arrayColor.push(item.color)
                                }
                            });
                            data.data[0].dataValue[0].value.forEach(item => {
                                arrayName.push(item.name)
                            });
                            var options = {
                                color: arrayColor,
                                legend: {
                                    data: arrayName
                                },
                                series: [{
                                    data: data.data[0].dataValue[0].value
                                }]
                            }
                            myChart.setOption(options);
                        })
                    },
                    queryPersonAccessTypeStatistics(condition) {
                        var _this = this;
                        this.isType = true;
                        var param = { start: 0, limit: 1, condition: { doFlag: this.doFlag, park_code: this.spaceCode, accessTypeValue: this.accessTypeValue, accessType: this.accessType }, spaceInfo: this.parkJSON.spaceInfo };
                        var option = {
                            type: "POST",
                            url: "/SmartCampus__PersonPass/1.0.0/queryPersonAccessTypeStatistics",
                            data: param
                        };
                        var preContinue = _this.createNewPromise(option);
                        return preContinue.then(function (data) {
                            _this.isType = false;
                            if (data.data && data.data.length) {
                                var widget12 = document.getElementById("id_skcAbsoluteWidget_70").children[0].children[0].children[0].children[0].children[0].children[0].children[0].children[0];
                                var myChart = echarts.init(widget12);
                                var arrayColor = [];
                                var arrayName = [];
                                echarts.init(widget12)._chartsViews[0]._data._itemVisuals.forEach((item, index) => {
                                    if (index == 12) {
                                        arrayColor.push("#2f4554")
                                    } else {
                                        arrayColor.push(item.color)
                                    }
                                });
                                data.data[0].dataValue[0].value.forEach(item => {
                                    arrayName.push(item.name)
                                });
                                var options = {
                                    color: arrayColor,
                                    legend: {
                                        data: arrayName
                                    },
                                    series: [{
                                        data: data.data[0].dataValue[0].value
                                    }]
                                }
                                myChart.setOption(options);
                            }
                        })
                    },
                    searchTable() {
                        // this.spaceParkCode();
                        this.queryCondition.condition = {
                            personName: this.name,
                            organizationName: this.orgName,
                            // personType: this.type,
                            // accessType: this.way,
                            // triggerOpenGate: this.status
                        };
                        // this.queryCondition.condition['doFlag'] = this.doFlag;
                        // this.queryCondition.condition['park_code'] = this.spaceCode;
                        // this.queryCondition.condition['space'] = this.spaceList;
                        // if (this.times && this.times.length) {
                        //     this.queryCondition.condition['beginTime'] = this.times[0];
                        //     this.queryCondition.condition['endTime'] = this.times[1];
                        // }
                        this.queryCondition.condition = this.clearNull(this.queryCondition.condition);
                        if (JSON.stringify(this.queryCondition.condition) != '{}') {
                            this.queryCondition.start = 0;
                        }
                        this.queryFaceAccess(this.queryCondition);
                    },
                    showImage(row) {
                        row.showUrl = true;
                    },
                    hideImage(row) {
                        console.log(row);
                        row.showUrl = false;
                    },
                    clearNull(obj) {
                        for (let i in obj) {
                            if (obj[i] === '' || obj[i] === undefined) {
                                delete obj[i];
                            }
                        }
                        return obj;
                    },
                    resetDate() {
                        var nowDate = new Date();
                        var time0 = new Date(nowDate - 24 * 60 * 60 * 1000 * 7);
                        let year0 = time0.getFullYear();
                        let month0 = time0.getMonth() + 1;
                        let date0 = time0.getDate();
                        let hours0 = time0.getHours();
                        let minute0 = time0.getMinutes();
                        let second0 = time0.getSeconds();
                        if (month0 < 10) { month0 = '0' + month0 }
                        if (date0 < 10) { date0 = '0' + date0 }
                        if (hours0 < 10) { hours0 = '0' + hours0 }
                        if (minute0 < 10) { minute0 = '0' + minute0 }
                        if (second0 < 10) { second0 = '0' + second0 }
                        var beginTime = year0 + '-' + month0 + '-' + date0 + ' ' + hours0 + ':' + minute0 + ':' + second0;
                        var time1 = nowDate;
                        let year1 = time1.getFullYear();
                        let month1 = time1.getMonth() + 1;
                        let date1 = time1.getDate();
                        let hours1 = time1.getHours();
                        let minute1 = time1.getMinutes();
                        let second1 = time1.getSeconds();
                        if (month1 < 10) { month1 = '0' + month1 }
                        if (date1 < 10) { date1 = '0' + date1 }
                        if (hours1 < 10) { hours1 = '0' + hours1 }
                        if (minute1 < 10) { minute1 = '0' + minute1 }
                        if (second1 < 10) { second1 = '0' + second1 }
                        var endTime = year1 + '-' + month1 + '-' + date1 + ' ' + hours1 + ':' + minute1 + ':' + second1;
                        this.times = [beginTime, endTime]; // 开始时间、结束时间,
                    },
                    getAcceessType() {
                        var _this = this;
                        var picklistId = "0004000000TCxiHyuxyi";
                        var option = {
                            type: "GET",
                            //url: "/Common/0.1.0/queryPicklistById?picklistId=" + picklistId,
                            url: "/Common/0.1.0/queryPicklistById",
                            data: {
                                "picklistId": picklistId
                            }
                        };
                        var promise = _this.createNewPromise(option);
                        promise.then(function (data) {
                            var accessTypeArray = [];
                            _this.accessTypeValue = [];
                            if (data && data.data.length) {
                                var accessTypeData = data.data[0].picklistData || [];
                                accessTypeData.forEach(item => {
                                    accessTypeArray.push({
                                        label: item.label,
                                        value: item.value
                                    });
                                    _this.accessTypeValue.push(item.value);
                                });
                            }
                            _this.accessType = accessTypeArray;
                            _this.getSystemParameter();
                        });
                    },
                    getSystemParameter() {
                        var _this = this;
                        var option = {
                            type: "POST",
                            url: "/SmartCampus__PersonPass/1.0.0/getPersonPassConfig",
                            data: {}
                        };
                        var systemParame = _this.createNewPromise(option);
                        systemParame.then(function (data) {
                            if (data && data.data && data.data.configList && data.data.configList.length) {
                                (data.data.configList || []).forEach(config => {
                                    if (config.name == "PersonManagement_PersonAccessTimeFrame") {
                                        _this.maxTime = config.value;
                                    }
                                });
                            }
                            _this.pickerOptions = {
                                disabledDate: (time) => {
                                    var maxDate = new Date();
                                    var timeDate = maxDate - 24 * 60 * 60 * 1000 * _this.maxTime;
                                    var minDate = new Date(timeDate);
                                    return time.getTime() < minDate || time > maxDate;
                                }
                            };
                            _this.resetDate();
                            _this.queryFaceAccess();
                            // _this.queryFaceAccess().then(data => {
                            //     new Viewer(document.getElementById('event-pictures'), {
                            //         url: function (image) {
                            //             // 用于添加当图片进行压缩后获取原图URL的逻辑
                            //             return image.src;
                            //         }
                            //     });
                            // })
                        });
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
                                ELEMENT.locale({ "el": this.lang.el != undefined ? this.lang.el : ELEMENT.lang.en });
                                break;
                        }
                    }
                },
                mounted() {
                    this.changeElementUILocale(HttpUtils.getLocale());
                    this.pagination = true;
                },
                created() {
                    this.lang = i18n.messages[i18n.locale] || i18n.messages["en-US"];
                    this.accessResult = [{
                        label: this.lang.yesTrue,
                        value: true
                    }, {
                        label: this.lang.noFalse,
                        value: false
                    }];
                    this.accessMap['true'] = this.lang.yesTrue;
                    this.accessMap['false'] = this.lang.noFalse;
                    this.trafficDirection['Out'] = this.lang.outOut;
                    this.trafficDirection['In'] = this.lang.inIn;
                    this.queryPersonType();
                    this.doFlag = false;
                    this.parkFlag = false;
                    this.parkJSON = JSON.parse(sessionStorage.getItem("currentSpaceData"));
                    if (this.parkJSON && this.parkJSON.spaceInfo && this.parkJSON.spaceInfo[0]) {
                        this.getSpTree(this.parkJSON.spaceInfo[0].id);
                    }
                    if (this.parkJSON && this.parkJSON.spaceCode) {
                        this.parkCode = this.parkJSON.spaceCode;
                        this.spaceCode = this.parkJSON.spaceCode;
                    } else {
                        this.parkCode = "";
                        this.spaceCode = "";
                    }
                    // this.reset();
                },
                computed: {
                    getSwitch() {
                        if (this.isRecognise || this.isAccess || this.isType || !this.spaceList.length || this.spaceList.length > 50) {
                            this.disabled = true;
                        } else {
                            this.disabled = false;
                        }
                    },
                    getWay() {
                        if (this.tableData && this.tableData.length && this.accessType && this.accessType.length) {
                            this.tableData.forEach(item => {
                                this.accessType.forEach(access => {
                                    if (item.way === access.value) {
                                        item.way = access.label;
                                    }
                                });
                            });
                        }
                        console.log(this.tableData)
                        return this.tableData;
                    }
                }
            });
        }

        /*
         * API to bind global events to the item DOM, it should not be deleted if there will some events to trigger in this widget.
         */
        thisObj.sksBindItemEvent();

        /*
         * API to refresh the previously bound events when a resize or orientation change occurs.
         */
        $(window).resize(function () {
            thisObj.sksRefreshEvents();
        });
    },
});