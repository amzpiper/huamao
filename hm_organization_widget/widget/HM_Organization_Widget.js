var HM_Organization_Widget = StudioWidgetWrapper.extend({
    /*
     * Triggered when initializing a widget and will have the code that invokes rendering of the widget
     */
    init : function()
    {
        var thisObj = this;
        thisObj._super.apply(thisObj, arguments);
        thisObj.render();
        if((typeof(Studio) != "undefined") && Studio)
        {
            Studio.registerAction(thisObj, "confirmLocationWidgetCbk", "confirmLocationWidgetCbk", [], $.proxy(thisObj.confirmLocationWidgetCbk, thisObj), []);
            /*
             * Register custom event or action here, and trigger the event afterwards. Install Mangnocode extension, and then can use Mangno.registerEvents and other snippets
             * Studio.registerEvents(thisObj, "", "", EventConfig), 
             * Studio.registerAction(thisObj, "", "", ActionConfig, $.proxy(this.Cbk, this), );
             * thisObj.triggerEvent("", )
             */
        }
    },
     
    /*
     * Triggered from init method and is used to render the widget
     */
    render : function()
    {
        var thisObj = this;
        var widgetProperties = thisObj.getProperties();
        var elem = thisObj.getContainer();
        var items = thisObj.getItems();
        var connectorProperties = thisObj.getConnectorProperties();
        var i18n = HttpUtils.getI18n({
            locale: HttpUtils.getLocale(),
            messages: thisObj.getMessages()
        });
        const _lang = i18n.messages[i18n.locale] || i18n.messages["en-US"];
        
        /*
         * API to get base path of your uploaded widget API file
         */
        var widgetBasePath = thisObj.getWidgetBasePath();
        if(elem)
        {
            var containerDiv = $(".scfClientRenderedContainer", elem);
            if(containerDiv.length)
            {
                $(containerDiv).empty();
            }
            else
            {
                containerDiv = document.createElement('div');
                containerDiv.className = "scfClientRenderedContainer";
                $(elem).append(containerDiv);
            }
            

			
            new Vue({
                el: $("#IOC_PersonPass_Widget", elem)[0],
				i18n: i18n,
                data() {
                    return {
                        suffix:"",
                        uploadImageUrl:"",
                        tableId:"",
                        labelPosition: "top",
                        lang: _lang,
                        rules: {
                            // name: [
                            //     { required: true, message: _lang.messages.enterconferenceroomname, trigger: 'blur' },
                            //     { validator: validateConferenceName, trigger: 'blur' },
                            //     { min: 1, max: 20, message: _lang.messages.lengthranges, trigger: 'blur' }
                            // ],
                            // maxBookTime: [
                            //     { required: true, message: _lang.messages.entermaxreservationduration, trigger: 'blur' },
                            //     { validator: validateMaxBookTime, trigger: 'blur' }
                            // ],
                            // maxPerson: [
                            //     { required: true, message: _lang.messages.integerranging999, trigger: 'blur' },
                            //     { validator: validateMaxBookPerson, trigger: 'blur' }
                            // ],
                            // maxBookDay: [
                            //     { required: true, message: _lang.messages.integerrange9, trigger: 'blur' },
                            //     { validator: validateMaxBookDay, trigger: 'blur' }
                            // ],
                            // spaceId: [
                            //     { required: true, message: _lang.messages.selectarea, trigger: 'change' },
                            // ],
                            // selectOrganization: [
                            //     { required: true, message: _lang.messages.opendepartment, trigger: 'change' }
                            // ],
                            // updateOrganization: [
                            //     { required: true, message: _lang.messages.opendepartment, trigger: 'change' }
                            // ]
                        },
                        conference: {
                            dialog: false,
                            formData: {
                                name: "",
                                maxBookTime: "",
                                maxBookDay: "",
                                maxPerson: "",
                                photoUrl: '',
                                showPhotoUrl: '',
                                spaceId: [],
                                fnc: [],
                                selectOrganization: [],
                            }
                        },
                        objectStrogeProxy:"",
                        formDatas:"",
                        headers:{},
                        imageUrl:{},
                        dialogImageUrl: 'https://pics6.baidu.com/feed/e850352ac65c10381b12716fb10e1f1bb17e89d2.jpeg?token=e9efbb1b2fcd3edb60829cca5af7056f',
                        dialogVisible: false,
                        fileList: [{}],
                        orgName:'',
                        region:'',
                        organization:[],
                        lang: {},
                        times: [], // 开始时间、结束时间,
                        name: '', // 事件编号
                        way: '',
                        type: '',
                        status: '',
                        maxTime: 30,
                        tableData: [{
                            time: '2019/03/01 02:12:20',
                            name: '陈某某',
                            type: '访客',
                            way: '文案示例',
                            status: '是'
                        }],
                        loading: false,
                        //search
                        personType:[{
                            label:'员工',
                            value:'Staff'
                        }, {
                            label: '访客',
                            value: 'Visitor'
                        },{
                            label:'未知',
                            value: 'Unknown'
                        }],
                        accessType:[{
                            label:'PAD',
                            value:'PAD'
                        },{
                            label:"ID卡",
                            value:'ID CARD'
                        },{
                            label:"二维码",
                            value:'QR_CARD'
                        }],
                        accessDOFlag:[{
                            label:'是',
                            value:true
                        },{
                            label:"否",
                            value:false
                        }],
                        accessResult: [],
                        queryCondition:{
                            start: 0,
                            limit: 10,
                            condition:{}
                        },
                        //pagination
                        numPerPage: 10,
                        pageNum: 1,
                        totalCount: 100,

                        //table
                        accessMap:{
                            true:"是",
                            false:"否"
                        },
                        trafficDirection:{
                            Out:"出",
                            In:"入"
                        },
                        personTypeMap:{
                            "Staff":"员工",
                            "Visitor":"访客"
                        },
                        pickerOptions: {},
                        doFlag: false,
                        parkFlag: false,
                        spaceCode: "",
                        // parkCode: JSON.parse(sessionStorage.getItem("currentSpaceData"))
                        parkJSON: {},
                        parkCode: "",
                        accessTypeValue: []
                    };
                },
                methods: {
                    uploadComLogo(param){
                        return new Promise(resolve => {
                            this.callConn("/hm_bigScreen__HMSecurityManagement/1.0.0/uploadComLogo", param, "POST", (res) => {
                                this.reset();
                            })})
                    },
                    submitPic(){
                        this.dialogVisible = false;
                        this.uploadImageUrl = this.conference.formData.showPhotoUrl
                        if(this.conference.formData.showPhotoUrl){
                            let param = {
                                "comLogo":this.conference.formData.photoUrl,
                                "orgId":this.tableId
                            }
                            this.uploadComLogo(param)
                        }


                    },
                    getPrefixUrl(){
                        var url = document.URL.substring(0,document.URL.indexOf("/magno"));
                        this.suffix = url
                    },
                    uploadPhoto(param) {
                        var _this = this;
                        var fileObj = param.file;
                        console.log(param)
                        _this.upload(fileObj).then(data => {
                            if (data.resCode == "0") {
                                console.log("上传", data);
                                
                                _this.conference.formData.photoUrl = data.result.object;
                                _this.conference.formData.showPhotoUrl = _this.suffix + _this.objectStrogeProxy + data.result.object;
                                // _this.getObjectProxy(data.result.object);
                                // _this.$alert(_this.lang.uploadsuccess, _this.lang.information, {
                                //     type: 'success',
                                //     confirmButtonText: _this.lang.oktext1,
                                //     customClass: 'hw-messagebox',
                                //     callback: action => { }
                                // });
                            } else {
                                _this.$alert(data.resMsg, _this.lang.errortext1, {
                                    type: 'error',
                                    confirmButtonText: _this.lang.oktext1,
                                    customClass: 'hw-messagebox',
                                    callback: action => { }
                                });
                            }
                        })
                    },
                    upload(fileObj) {
                        return new Promise(function (resolve, reject) {
                            var filename = "/ubains/" + "ubains" + new Date().getTime() + fileObj.name;
                            HttpUtils.getCsrfToken(function (token) {	//自动获取csrfToken
                                console.log("token==>"+token)
                                fetch('/u-route/baas/sys/v1.1/connectors/objectstorageproxy/SmartCampus__FileOperator/putobject?acl=public-read&object=' + filename, {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'csrf-token': token
                                    },
                                    body: fileObj,
                                    credentials: 'same-origin'
                                }).then(function (resp) {
                                    return resp.json();
                                }).then(function (data) {
                                    return resolve(data);
                                }).catch(err => {
                                    reject(err);
                                });
                            });
                        })
                    },
                    handleAvatarSuccess(res, file) {
                        this.imageUrl = URL.createObjectURL(file.raw);
                    },
                    beforeAvatarUpload(file) {
                        const isJPG = file.type === 'image/jpeg';
                        if (!isJPG) {
                            this.$message.error({ message: this.lang.messages.avatarpicture, customClass: 'hw-message' });
                        }
                        return isJPG;
                    },
                    getObjectStrogeProxy() {
                        var _this = this
                        thisObj.callAPIConn('/meeting__demo/1.0.0/getObjectProxy', {
                            "sysParams": "meeting_objectStrogeProxy"
                        }, 'GET', function (vm) {
                            if (vm && vm.resp && vm.resp.code == '0') {
                                console.log(vm)
                                _this.objectStrogeProxy = vm.data[0].proxyUrl;
                            }
                        })
                    },

                    getObjectProxy(){
                        var _this = this
                        let url = '/SmartCampus__UnifiedPortal/1.0.0/getObjectStorageProxy?'
                        thisObj.callAPIConn(url,{},'GET',function(vm){
                            if (vm && vm.resp && vm.resp.code == '0') {
                                console.log(vm)
                                _this.objectStrogeProxy = vm.data[0].urlPrefix;
                            }
                            _this.initData();
                                
                        })
                        
                        
                    },
                    getCsrfToken(){
                        HttpUtils.getCsrfToken(token => {
                            this.headers = {
                                'cache-control': 'no-cache',
                                'csrf-token': token
                            }
                            console.log(token)
                        })
                    },
                    // upload(file){
                    //     this.getToken()
                        
                    //     widgetBasePath = thisObj.getWidgetBasePath();

                    //     console.log("token==>",token)
                    //     console.log('file==>',file)
                    //     console.log(1234)
                    //     console.log("widgetBasePath==>",widgetBasePath)
                    // },
                    getToken() {
                        let settings = {
                            async: false,
                            url: this.tokenUrl,
                            type: 'POST',
                            headers: {
                                'Content-Type': 'application/json;charset=UTF-8'
                            },
                            dataType: 'json'
                        }
                        return new Promise((resolve, reject) => {
                            $.ajax(settings).done(result => {
                                if (result.resCode == 0 && result.result) {
                                    resolve && resolve(result.result)
                                } else {
                                    reject && reject()
                                }
                            }).fail(error => reject && reject())
                            console.log(resolve)

                        })
                    },

                    handleRemove(file, fileList) {
                        console.log(file, fileList);
                      },
                      handlePictureCardPreview(file) {
                        this.dialogImageUrl = file.url;
                        this.dialogVisible = true;
                      },
                    handleClose(done) {
                        console.log("关闭")
                        this.conference.formData.showPhotoUrl = ""
                        done();
                        // this.$confirm('确认关闭？')
                        //   .then(_ => {
                        //     done();
                        //   })
                        //   .catch(_ => {});
                      },
                    handleCloseDialog(){
                        this.conference.formData.showPhotoUrl = ""
                        this.dialogVisible = false;
                    },
                    reset() {
                        this.resetDate();
                        this.orgName=''; // 事件编号
                        this.region='';
                        this.numPerPage=10;
                        this.queryCondition={
                            start:0,
                            limit:10,
                            condition:{

                            }
                        }
                        this.queryCondition.condition = this.clearNull(this.queryCondition.condition);
                        this.queryOrganization(this.queryCondition);
                    },
                    // 每页多少条切换
                    //hgzz
                    handleSizeChange(val) {
                        this.numPerPage = val;
                        this.queryCondition.start =0;
                        this.queryCondition.limit = this.numPerPage;
                        this.queryCondition.condition = {
                        };

                        this.queryCondition.condition = this.clearNull(this.queryCondition.condition);
                        if(this.orgName){
                            this.queryCondition.condition['organizationName'] = {
                                "operator": "like",
                                "value": this.orgName,
                            }
                        }
                        if(this.region){
                            this.queryCondition.condition['region'] = {
                                "operator":"like",
                                "value":this.region
                            }
                        }
                        this.queryOrganization(this.queryCondition)
                    },

                    // 页码切换
                    handleCurrentChange(val) {
                        this.pageNum = val;
                        this.queryCondition.start = this.pageNum == 1 ? 0 : ((this.pageNum-1) * this.numPerPage);
                        // this.queryCondition.start = (val-1)*this.numPerPage;
                        this.queryCondition.limit = this.numPerPage;
                        this.queryCondition.condition = {
                        };
                        this.queryCondition.condition = this.clearNull(this.queryCondition.condition);
                        if(this.orgName){
                            this.queryCondition.condition['organizationName'] = {
                                "operator": "like",
                                "value": this.orgName,
                            }
                        }
                        if(this.region){
                            this.queryCondition.condition['region'] = {
                                "operator":"like",
                                "value":this.region
                            }
                        }
                        this.queryOrganization(this.queryCondition)
                    },

                    // 来源切换
                    doFlagChange(val) {
                        console.log(val)
                        this.doFlag = val;
                        this.parkFlag = false;
                        this.parkFlagChange(this.parkFlag);
                    },

                    // 是否关联
                    parkFlagChange(val) {
                        console.log(val)
                        // this.parkFlag = val;
                        this.parkFlag = true;
                        if (this.parkFlag !== true) {
                           this.spaceCode = ""
                        } else {
                            // if (this.parkCode && this.parkCode.spaceCode) {
                            //     this.spaceCode = this.parkCode.spaceCode
                            // } else {
                            //     this.spaceCode = ""
                            // }
                            this.spaceCode = this.parkCode
                        }
                        this.pageNum = 1;
                        this.queryCondition.start = 0;
                        this.queryCondition.limit = this.numPerPage;
                        this.queryCondition.condition = {
                            personName: this.name,
                            personType: this.type,
                            accessType: this.way,
                            triggerOpenGate: this.status
                        };
                        this.queryCondition.condition['doFlag'] = this.doFlag;
                        this.queryCondition.condition['park_code'] = this.spaceCode;
                        if (this.times && this.times.length) {
                            this.queryCondition.condition['beginTime'] = this.times[0];
                            this.queryCondition.condition['endTime'] = this.times[1];
                        }
                        this.queryCondition.condition = this.clearNull(this.queryCondition.condition);
                        this.queryFaceAccess(this.queryCondition);
                        this.queryFaceRecogniseStatistics({condition:{doFlag: this.doFlag, park_code: this.spaceCode}});
                        this.queryFaceAccessStatistics({condition:{doFlag: this.doFlag, park_code: this.spaceCode}});
                        this.queryPersonAccessTypeStatistics({condition:{doFlag: this.doFlag, park_code: this.spaceCode}});
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
                                    _this.$confirm(response.response.resMsg, '错误', {
                                        type: "error",
                                        confirmButtonText: "确定",
                                        callback: action => {},
                                        customClass: 'hw-messageBox'
                                    });
                                })
                        } else {
                            console.log("No Flow Connector!");
                        }
                    },
                    createNewPromise(option) {

                        let _this=this;
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
                    queryPersonType() {
                        var _this = this;
                        this.loading = true;
                        var param ={
                            start:0,
                            limit:500,
                            condition:{}
                        } ;
                        var option = {
                            type: "POST",
                            url: "/Person/0.1.0/PersonType/query",
                            data: param
                        };
                        var preContinue = _this.createNewPromise(option);
                        return preContinue.then(function (data) {
                            _this.personType = [{
                                value:"UNRegister",
                                label: _this.lang.personTypeNoneSelect
                            }];
                            data.data[0].personType.forEach(item=>{
                                _this.personType.push({
                                    value:item.name,
                                    label:item.typeName
                                })
                            });
                        })
                    },
                    queryFaceRecogniseStatistics(condition) {
                        var _this = this;
                        this.loading = true;
                        var param = {condition:{doFlag: this.doFlag, park_code: this.spaceCode}};
                        var option = {
                            type: "POST",
                            url: "/SmartCampus__PersonPass/1.0.0/queryFaceRecogniseStatistics",
                            data: param
                        };
                        var preContinue = _this.createNewPromise(option);
                        return preContinue.then(function (data) {
                            _this.loading = false;
                            var widget9 = document.getElementById("id_skcAbsoluteWidget_54").children[0].children[0].children[0].children[0].children[0].children[0].children[0].children[0];
                            var myChart = echarts.init(widget9);
                            console.log(data)
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
                            var option = {
                                color: arrayColor,
                                legend: {
                                    data: arrayName
                                },
                                series: [{
                                    data: data.data[0].dataValue[0].value
                                }]
                            }
                            myChart.setOption(option);
                        })
                    },
                    queryFaceAccessStatistics(condition) {
                        console.log(this.spaceCode)
                        var _this = this;
                        this.loading = true;
                        var param = {condition:{doFlag: this.doFlag, park_code: this.spaceCode}};
                        var option = {
                            type: "POST",
                            url: "/SmartCampus__PersonPass/1.0.0/queryFaceAccessStatistics",
                            data: param
                        };
                        var preContinue = _this.createNewPromise(option);
                        return preContinue.then(function (data) {
                            _this.loading = false;
                            var widget11 = document.getElementById("id_skcAbsoluteWidget_56").children[0].children[0].children[0].children[0].children[0].children[0].children[0].children[0];
                            var myChart = echarts.init(widget11);
                            var arrayColor = [];
                            var arrayName = [];
                            echarts.init(widget11)._chartsViews[0]._data._itemVisuals.forEach((item, index)=>{
                                if (index == 12) {
                                    arrayColor.push("#2f4554")
                                } else {
                                    arrayColor.push(item.color)
                                }
                            });
                            data.data[0].dataValue[0].value.forEach(item => {
                                arrayName.push(item.name)
                            });
                            var option = {
                                color: arrayColor,
                                legend: {
                                    data: arrayName
                                },
                                series: [{
                                    data: data.data[0].dataValue[0].value
                                }]
                            }
                            myChart.setOption(option);
                        })
                    },
                    queryPersonAccessTypeStatistics(condition) {
                        var _this = this;
                        this.loading = true;
                        var param = {start:0,limit:1,condition:{doFlag: this.doFlag, park_code: this.spaceCode, accessTypeValue: this.accessTypeValue, accessType: this.accessType}};
                        var option = {
                            type: "POST",
                            url: "/SmartCampus__PersonPass/1.0.0/queryPersonAccessTypeStatistics",
                            data: param
                        };
                        var preContinue = _this.createNewPromise(option);
                        preContinue.then(function (data) {
                            _this.loading = false;
                            if (data.data && data.data.length) {
                                var widget12 = document.getElementById("id_skcAbsoluteWidget_70").children[0].children[0].children[0].children[0].children[0].children[0].children[0].children[0];
                                var myChart = echarts.init(widget12);
                                var arrayColor = [];
                                var arrayName = [];
                                echarts.init(widget12)._chartsViews[0]._data._itemVisuals.forEach((item, index)=>{
                                    if (index == 12) {
                                        arrayColor.push("#2f4554")
                                    } else {
                                        arrayColor.push(item.color)
                                    }
                                });
                                data.data[0].dataValue[0].value.forEach(item => {
                                    arrayName.push(item.name)
                                });
                                var option = {
                                    color: arrayColor,
                                    legend: {
                                        data: arrayName
                                    },
                                    series: [{
                                        data: data.data[0].dataValue[0].value
                                    }]
                                }
                                myChart.setOption(option);
                            };
                        })
                    },
                    //hgzz
                    searchTable() {
                        let param = {
                            start: (this.pageNum - 1)* this.numPerPage,
                            limit: this.numPerPage,
                            condition: {
                            }
                        }
                        if(this.orgName){
                            param.condition['organizationName'] = {
                                "operator": "like",
                                "value": this.orgName,
                            }
                        }
                        if(this.region){
                            param.condition['region'] = {
                                "operator":"like",
                                "value":this.region
                            }
                        }
                        this.queryOrganization(param)
                        // this.queryCondition.condition = {
                        //     personName: this.name,
                        //     personType: this.type,
                        //     accessType: this.way,
                        //     triggerOpenGate: this.status
                        // };
                        // this.queryCondition.condition['doFlag'] = this.doFlag;
                        // this.queryCondition.condition['park_code'] = this.spaceCode;
                        // if (this.times && this.times.length) {
                        //     this.queryCondition.condition['beginTime'] = this.times[0];
                        //     this.queryCondition.condition['endTime'] = this.times[1];
                        // }
                        // this.queryCondition.condition = this.clearNull(this.queryCondition.condition);
                        // if (JSON.stringify(this.queryCondition.condition) != '{}') {
                        //     this.queryCondition.start = 0;
                        // }
                        // this.queryFaceAccess(this.queryCondition);
                    },
                    showImage(row){
                        row.showUrl=true;
                    },
                    //hgzz
                    hideImage(row){
                        row.f = false;
                        this.tableId = row.id
                        this.uploadImageUrl = this.conference.formData.showPhotoUrl
                        this.conference.formData.showPhotoUrl = row.comLogo
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
                        if (month0 < 10) { month0 = '0' + month0 };
                        if (date0 < 10) { date0 = '0' + date0 };
                        if (hours0 < 10) { hours0 = '0' + hours0 };
                        if (minute0 < 10) { minute0 = '0' + minute0 };
                        if (second0 < 10) { second0 = '0' + second0 };
                        var beginTime = year0 + '-' + month0 + '-' + date0 + ' ' + hours0 + ':' + minute0 + ':' + second0;
                        var time1 = nowDate;
                        let year1 = time1.getFullYear();
                        let month1 = time1.getMonth() + 1;
                        let date1 = time1.getDate();
                        let hours1 = time1.getHours();
                        let minute1 = time1.getMinutes();
                        let second1 = time1.getSeconds();
                        if (month1 < 10) { month1 = '0' + month1 };
                        if (date1 < 10) { date1 = '0' + date1 };
                        if (hours1 < 10) { hours1 = '0' + hours1 };
                        if (minute1 < 10) { minute1 = '0' + minute1 };
                        if (second1 < 10) { second1 = '0' + second1 };
                        var endTime = year1 + '-' + month1 + '-' + date1 + ' ' + hours1 + ':' + minute1 + ':' + second1;
                        this.times=[beginTime, endTime]; // 开始时间、结束时间,
                    },
                    getAcceessType() {
                        var _this = this;
                        var picklistId = "0004000000TCxiHyuxyi";
                        var option = {
                            type: "GET",
                            //url: "/Common/0.1.0/queryPicklistById?picklistId=" + picklistId,
                            url: "/Common/0.1.0/queryPicklistById",
                            data: {
                                "picklistId":picklistId
                            }
                        };
                        var promise = _this.createNewPromise(option);
                        promise.then(function (data) {
                            var accessTypeArray = [];
                            _this.accessTypeValue = [];
                            if (data && data.data.length) {
                                var accessTypeData = data.data[0].picklistData || [];
                                accessTypeData.forEach(item=>{
                                    accessTypeArray.push({
                                        label: item.label,
                                        value: item.value
                                    });
                                    _this.accessTypeValue.push(item.value);
                                });
                            }
                            _this.accessType = accessTypeArray;
                            // _this.getSystemParams();
                            _this.getSystemParameter();
                        });
                    },
                    // getSystemParams() {
                    //     var _this = this;
                    //     var param = {paraNameList: ["PersonPass_AccessRecordsQueriedbyDOFlag"]};
                    //     var option = {
                    //         type: "POST",
                    //         url: "/SmartCampus__PersonPass/1.0.0/getPersonPassSysParams",
                    //         data: param
                    //     };
                    //     var systemParams = _this.createNewPromise(option);
                    //     systemParams.then(function (data) {
                    //         if (data.data && data.data.length) {
                    //             _this.doFlag  = data.data[0].paraValueList[0].value;
                    //         }
                    //     });
                    // },
                    //hgzz
                    getSystemParameter() {
                        var _this = this;
                        var param = {paraNameList: ["PersonManagement_PersonAccessTimeFrame"]};
                        var option = {
                            type: "POST",
                            url: "/SmartCampus__UnifiedPortal/1.0.0/getSystemParameter",
                            data: param
                        };
                        var systemParame = _this.createNewPromise(option);
                        systemParame.then(function (data) {
                            if (data.data && data.data.length) {
                                _this.maxTime = data.data[0].paraValueList[0].value;
                            }
                            _this.pickerOptions = {
                                disabledDate: (time)=>{
                                    var maxDate = new Date();
                                    var timeDate = maxDate - 24 * 60 * 60 * 1000 * _this.maxTime;
                                    var minDate = new Date(timeDate);
                                    return time.getTime() < minDate || time > maxDate;
                                }
                            };
                            _this.resetDate();
                    //         // _this.queryFaceAccess().then(data=>{
                    //             // new Viewer(document.getElementById('event-pictures'), {
                    //             //     url: function (image) {
                    //             //         // 用于添加当图片进行压缩后获取原图URL的逻辑
                    //             //         return image.src;
                    //             //     }
                    //             // });
                    //         // })
                    _this.loading = false
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
                    },
                    initData(){
                            let param = {
                            start: (this.pageNum - 1)* this.numPerPage,
                            limit: this.numPerPage,
                            condition: {

                            }
                        }
                        this.queryOrganization(param)
                    },
                    queryOrganization(queryCondition) {
                        // let param = {
                        //     start: (this.pageNum - 1)* this.numPerPage,
                        //     limit: this.numPerPage,
                        //     condition: {

                        //     }
                        // }
                        return new Promise(resolve => {
                            this.callConn("/hm_bigScreen__HMSecurityManagement/1.0.0/queryOrganization ", queryCondition, "POST", (res) => {
                                if (res.resp.code == '0') {
                                    console.log(res.data[0].organizations)
                                    res.data[0].organizations.forEach(organization=>{
                                        organization.organizationAttribute.forEach(attr=>{
                                            // console.log(attr)
                                            if(attr.attrDef.code == "establishDate"){
                                                organization.establishDate = attr.attrValue
                                            }
                                            if(attr.attrDef.code == "comLevel"){
                                                organization.comLevel = attr.attrValue==1?"普通":"黑钻"
                                            }
                                            if(attr.attrDef.code == "industry"){
                                                organization.industry = attr.attrValue
                                            }
                                            if(attr.attrDef.code == "region"){
                                                organization.region = attr.attrValue
                                            }
                                            if(attr.attrDef.code == "comStatus"){
                                                organization.comStatus = attr.attrValue
                                            }
                                            if(attr.attrDef.code == "comLogo"){
                                                organization.comLogo = this.suffix + this.objectStrogeProxy + attr.attrValue
                                            }
    
                                        })

                                    })
                                    this.organization = res.data[0].organizations
                                    this.totalCount = res.data[0].count
                                    resolve(res.data[0].organizations);
                                }
                            });
                        })
                    },
                    
                },
                mounted() {                   
                    this.changeElementUILocale(HttpUtils.getLocale());
                    this.getObjectProxy();
                    this.getPrefixUrl()
                },
                created(){
                    this.getCsrfToken();
                    // this.getObjectStrogeProxy();
                    this.lang =  i18n.messages[i18n.locale] || i18n.messages["en-US"];
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
                    this.getAcceessType();
                    this.doFlag = false;
                    this.parkFlag = false;
                    this.parkJSON = JSON.parse(sessionStorage.getItem("currentSpaceData"));
                    if (this.parkJSON && this.parkJSON.spaceCode) {
                        this.parkCode = this.parkJSON.spaceCode;
                        this.spaceCode = this.parkJSON.spaceCode;
                    } else {
                        this.parkCode = "";
                        this.spaceCode = "";
                    }
                    // this.spaceCode = "";
                    // this.queryOrganization();
                    // this.initData();
                },
                computed: {
                    getWay() {
                        // if (this.tableData && this.tableData.length && this.accessType && this.accessType.length) {
                        //     this.tableData.forEach(item => {
                        //         this.accessType.forEach(access => {
                        //             if (item.way === access.value) {
                        //                 item.way = access.label;
                        //             }
                        //         });
                        //     });
                        // }
                        // return this.tableData;
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
        $(window).resize(function() {
            thisObj.sksRefreshEvents();
        });
    },
    /****** 通过 APIConnector 调用 CustomAPI ******/
    callAPIConn: function (service, param, type, callbackFunc) {
        var thisObj = this;
        var connector = null;
        switch (type.toUpperCase()) {
            case 'POST': connector = thisObj.getConnectorInstanceByName('APIConnector_POST'); break;
            case 'GET': connector = thisObj.getConnectorInstanceByName('APIConnector_GET');
                if (connector) {
                    connector.getConnectorParams().requestMethod = 'get';
                }
                break;
            case 'PUT': connector = thisObj.getConnectorInstanceByName('APIConnector_PUT'); break;
            case 'DELETE': connector = thisObj.getConnectorInstanceByName('APIConnector_DELETE');
                if (connector) {
                    connector.getConnectorParams().requestMethod = 'delete';
                }
                break;
            default: connector = thisObj.getConnectorInstanceByName('APIConnector_POST'); break;
        }
        if (connector) {
            connector.setInputParams({ service: service, needSchema: 'data' });	//异步（默认）
            if (param.async === false) {
                connector.setInputParams({ service: service, needSchema: 'data', async: false });	//同步
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
                    callbackFunc.call(thisObj, response);
                    thisObj.vm.$alert(response.response.resMsg, thisObj.vm.lang.messages.errortext1, {
                        confirmButtonText: thisObj.vm.lang.messages.oktext1,
                        type: 'error',
                        customClass: 'hw-messagebox',
                        callback: function () { }
                    });
                })
        } else {
            console.log("No Flow Connector!");
        }
    }
});