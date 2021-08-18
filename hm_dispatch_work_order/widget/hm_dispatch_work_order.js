var hm_dispatch_work_order = StudioWidgetWrapper.extend({
    /*
     * Triggered when initializing a widget and will have the code that invokes rendering of the widget
     */
    init: function () {
        var thisObj = this;
        thisObj._super.apply(thisObj, arguments);
        thisObj.render();
        if ((typeof (Studio) != "undefined") && Studio) {
            /*
             * Register custom event or action here, and trigger the event afterwards.
             * Studio.registerEvents(thisObj, "", "", EventConfig), 
             * Studio.registerAction(thisObj, "", "", ActionConfig, $.proxy(this.Cbk, this), );
             * thisObj.triggerEvent("", )
             */
        }
    },

    /*
     * Triggered from init method and is used to render the widget
     */
    render: function () {
        var thisObj = this;
        var widgetProperties = thisObj.getProperties();
        var elem = thisObj.getContainer();
        var items = thisObj.getItems();
        var connectorProperties = thisObj.getConnectorProperties();

        /*
         * API to get base path of your uploaded widget API file
         */
        var widgetBasePath = thisObj.getWidgetBasePath();
        if (elem) {

            thisObj.vm = new Vue({
                el: $("#hm_dispatch_work_order", elem)[0],
                data() {
                    return {
                        img: "",
                        name: "",
                        summary: "",
                        dispatch_arr: [],
                        l: '', //数组长度,
                        changeNum: "2",
                        timer: null
                    }

                },
                created() {
                    // 表格显示5行数据，此处复制开头的5条数据实现无缝
                },
                mounted() {
                    console.log("start renderData...")
                    this.renderData()

                    //旧版定时
                    // setInterval(() => {
                    //     this.renderData()
                    // }, 60000)
                },
                methods: {
                    async renderData() {
                        await this.queryOffering();
                        this.InsertKeyframes();
                    },
                    // async queryOffering() {
                    queryOffering() {
                        return new Promise(resolve => {
                            thisObj.callFlowConn("APIBridge", {
                                service: "hm_bigScreen__HMSecurityManagement/1.0.0/dispatchOrder"
                            }, {
                                testField: "A"
                            }, result => {
                                this.dispatch_arr = result.data[0].listData;
                                
                                // // test Data
                                // if(this.changeNum=="1"){
                                //     this.dispatch_arr = [
                                //         {
                                //             "category": "工程维修",
                                //             "company": "北京华贸物业顾问有限公司第一分公司",
                                //             "desc": "总控主机报出2#B2阀室B2右一压力低   联动控制设备动作  无法复位",
                                //             "level": "1",
                                //             "orderId": "40129437168",
                                //             "overtime": "1小时19分钟",
                                //             "project": "北京华贸中心写字楼一期",
                                //             "proposer": "郭玉林",
                                //             "space": "T2-b2层-2#B2阀室",
                                //             "startTime": "2021-08-02 08:00:18",
                                //             "supervise": "--"
                                //           },
                                //           {
                                //             "category": "工程维修",
                                //             "company": "北京华贸物业顾问有限公司第一分公司",
                                //             "desc": "总控主机报出2#B2阀室B2右一压力低   联动控制设备动作  无法复位",
                                //             "level": "1",
                                //             "orderId": "40129437167",
                                //             "overtime": "1小时19分钟",
                                //             "project": "北京华贸中心写字楼一期",
                                //             "proposer": "郭玉林",
                                //             "space": "T2-b2层-2#B2阀室",
                                //             "startTime": "2021-08-02 08:00:13",
                                //             "supervise": "--"
                                //           },
                                //           {
                                //             "category": "工程维修",
                                //             "company": "北京华贸物业顾问有限公司第一分公司",
                                //             "desc": "总控主机报出2#B2阀室B2右一压力低   联动控制设备动作  无法复位",
                                //             "level": "1",
                                //             "orderId": "40129437165",
                                //             "overtime": "1小时19分钟",
                                //             "project": "北京华贸中心写字楼一期",
                                //             "proposer": "郭玉林",
                                //             "space": "T2-b2层-2#B2阀室",
                                //             "startTime": "2021-08-02 08:00:05",
                                //             "supervise": "--"
                                //           }
                                //     ];
                                //     console.log("changeNum:",this.changeNum)
                                //     this.changeNum = "2"
                                //     console.log("changeNum:",this.changeNum)
                                // }
                                // // test Data
                                // else if(this.changeNum=="2"){
                                //     this.dispatch_arr = [
                                //         {
                                //             "category": "工程维修",
                                //             "company": "北京华贸物业顾问有限公司第一分公司",
                                //             "desc": "2#B2阀室B2右一压力低 联动控制设备动作  无法复位。",
                                //             "level": "1",
                                //             "orderId": "40129440895",
                                //             "overtime": "48分钟",
                                //             "project": "北京华贸中心写字楼一期",
                                //             "proposer": "郭玉林",
                                //             "space": "T2-b2层-2#B2阀室",
                                //             "startTime": "2021-08-02 08:31:24",
                                //             "supervise": "--"
                                //           },
                                //           {
                                //             "category": "客服环境",
                                //             "company": "北京华贸物业顾问有限公司第一分公司",
                                //             "desc": "b2阀室b2右1压力低",
                                //             "level": "1",
                                //             "orderId": "40129440309",
                                //             "overtime": "50分钟",
                                //             "project": "北京华贸中心写字楼一期",
                                //             "proposer": "李嘉",
                                //             "space": "T2-b2层-b2阀室",
                                //             "startTime": "2021-08-02 08:28:46",
                                //             "supervise": "--"
                                //           },
                                //           {
                                //             "category": "工程维修",
                                //             "company": "北京华贸物业顾问有限公司第一分公司",
                                //             "desc": "2#B2阀室B2右一压力低 联动控制设备动作 无法复位。",
                                //             "level": "1",
                                //             "orderId": "40129428443",
                                //             "overtime": "54分钟",
                                //             "project": "北京华贸中心写字楼一期",
                                //             "proposer": "郭玉林",
                                //             "space": "T2-b2层-2#B2阀室",
                                //             "startTime": "2021-08-02 08:25:21",
                                //             "supervise": "--"
                                //           },
                                //           {
                                //             "category": "工程维修",
                                //             "company": "北京华贸物业顾问有限公司第一分公司",
                                //             "desc": "总控主机报出2#B2阀室B2右一压力低  联动控制设备动作  无法复位。",
                                //             "level": "1",
                                //             "orderId": "40129437679",
                                //             "overtime": "1小时16分钟",
                                //             "project": "北京华贸中心写字楼一期",
                                //             "proposer": "郭玉林",
                                //             "space": "T2-b2层-2#B2阀室",
                                //             "startTime": "2021-08-02 08:02:44",
                                //             "supervise": "--"
                                //           },
                                //           {
                                //             "category": "工程维修",
                                //             "company": "北京华贸物业顾问有限公司第一分公司",
                                //             "desc": "总控主机报出2#B2阀室B2右一压力低  联动控制设备动作  无法复位。",
                                //             "level": "1",
                                //             "orderId": "40129437677",
                                //             "overtime": "1小时16分钟",
                                //             "project": "北京华贸中心写字楼一期",
                                //             "proposer": "郭玉林",
                                //             "space": "T2-b2层-2#B2阀室",
                                //             "startTime": "2021-08-02 08:02:40",
                                //             "supervise": "--"
                                //           },
                                //           {
                                //             "category": "工程维修",
                                //             "company": "北京华贸物业顾问有限公司第一分公司",
                                //             "desc": "总控主机报出2#B2阀室B2右一压力低  联动控制设备动作  无法复位。",
                                //             "level": "1",
                                //             "orderId": "40129437674",
                                //             "overtime": "1小时16分钟",
                                //             "project": "北京华贸中心写字楼一期",
                                //             "proposer": "郭玉林",
                                //             "space": "T2-b2层-2#B2阀室",
                                //             "startTime": "2021-08-02 08:02:38",
                                //             "supervise": "--"
                                //           },
                                //           {
                                //             "category": "工程维修",
                                //             "company": "北京华贸物业顾问有限公司第一分公司",
                                //             "desc": "总控主机报出2#B2阀室B2右一压力低  联动控制设备动作  无法复位。",
                                //             "level": "1",
                                //             "orderId": "40129426816",
                                //             "overtime": "1小时16分钟",
                                //             "project": "北京华贸中心写字楼一期",
                                //             "proposer": "郭玉林",
                                //             "space": "T2-b2层-2#B2阀室",
                                //             "startTime": "2021-08-02 08:02:35",
                                //             "supervise": "--"
                                //           },
                                //           {
                                //             "category": "工程维修",
                                //             "company": "北京华贸物业顾问有限公司第一分公司",
                                //             "desc": "总控主机报出2#B2阀室B2右一压力低   联动控制设备动作  无法复位",
                                //             "level": "1",
                                //             "orderId": "40129437168",
                                //             "overtime": "1小时19分钟",
                                //             "project": "北京华贸中心写字楼一期",
                                //             "proposer": "郭玉林",
                                //             "space": "T2-b2层-2#B2阀室",
                                //             "startTime": "2021-08-02 08:00:18",
                                //             "supervise": "--"
                                //           },
                                //           {
                                //             "category": "工程维修",
                                //             "company": "北京华贸物业顾问有限公司第一分公司",
                                //             "desc": "总控主机报出2#B2阀室B2右一压力低   联动控制设备动作  无法复位",
                                //             "level": "1",
                                //             "orderId": "40129437167",
                                //             "overtime": "1小时19分钟",
                                //             "project": "北京华贸中心写字楼一期",
                                //             "proposer": "郭玉林",
                                //             "space": "T2-b2层-2#B2阀室",
                                //             "startTime": "2021-08-02 08:00:13",
                                //             "supervise": "--"
                                //           },
                                //           {
                                //             "category": "工程维修",
                                //             "company": "北京华贸物业顾问有限公司第一分公司",
                                //             "desc": "总控主机报出2#B2阀室B2右一压力低   联动控制设备动作  无法复位",
                                //             "level": "1",
                                //             "orderId": "40129437165",
                                //             "overtime": "1小时19分钟",
                                //             "project": "北京华贸中心写字楼一期",
                                //             "proposer": "郭玉林",
                                //             "space": "T2-b2层-2#B2阀室",
                                //             "startTime": "2021-08-02 08:00:05",
                                //             "supervise": "--"
                                //           }
                                //     ];
                                //     console.log("changeNum:",this.changeNum)
                                //     this.changeNum = "1"
                                //     console.log("changeNum:",this.changeNum)
                                // }
                                
                                //获取数据长度
                                this.l = this.dispatch_arr.length;
                                console.log("长度", this.l)
                                //拼接数据
                                if (this.l > 5) {
                                    this.dispatch_arr = this.dispatch_arr.concat(this.dispatch_arr.slice(0, 5))
                                }
                                
                                //gyh-动态时间定时请求
                                console.log("动态时间定时请求...")
                                var waittime = this.l == '0' ? 0 : ((this.l + 6) * 2)
                                console.log("ready to renderData wait :"+ waittime +"s")
                                clearInterval(this.timer);
                                this.timer = setInterval(() => {
                                    console.log("start renderData...")
                                    this.renderData()
                                }, ((this.l + 6) * 2)*1000)

                                resolve()
                            
                            })
                        })
                    },
                    InsertKeyframes() {
                        if (this.dispatch_arr == null) {
                            return
                        }
                        if (this.l > 5) {
                            let row = -this.l * 80;
                            console.log("调度----------InsertKeyframes1,this.l:" + this.l);
                            console.log("调度----------InsertKeyframes1,row:" + row);

                            //旧版本控制页面滚动的逻辑
                            // var scrollLength = row
                            // var style = document.styleSheets[0];
                            // style.insertRule(`.dispatch_list {
                            //   animation: dispatch_scroll ${(this.l+5) * 2}s  linear infinite;
                            //   position: relative;
                            // }`,0);
                            //  console.log(style);
                            // style.insertRule(`@keyframes dispatch_scroll {from { top: 0; } to { top: ${scrollLength}px }}`,0);//写入样式
                            
                            //新滚动逻辑
                            var cssValue = "@keyframes dispatch_scroll{ 0%{ top: 0px; } 100% { top:"+row+"px;}}";
                            var webkitCssValue = "@-webkit-keyframes dispatch_scroll{ 0%{ top: 0px; } 100% { top:"+row+"px;}}";
                            $("#dispatchHtml").html(
                                "<style>"+
                                cssValue+webkitCssValue
                                +"</style>"
                                );
                            $(".dispatch_list").css("animation","dispatch_scroll "+((this.l + 6) * 2)+"s linear infinite");
                            $(".dispatch_list").css("-webkit-animation","dispatch_scroll "+((this.l + 6) * 2)+"s linear infinite");
                        
                        } else {
                            //当条数不大于6时修改滚动样式为不滚动
                            var cssValue = "@keyframes dispatch_scroll{ 0%{ top: 0px; } 100% { top:"+0+"px;}}";
                            var webkitCssValue = "@-webkit-keyframes dispatch_scroll{ 0%{ top: 0px; } 100% { top:"+0+"px;}}";
                            $("#dispatchHtml").html(
                                "<style>"+
                                cssValue+webkitCssValue
                                +"</style>"
                                );
                            $(".dispatch_list").css("animation","dispatch_scroll "+((this.l + 6) * 2)+"s linear infinite");
                            $(".dispatch_list").css("-webkit-animation","dispatch_scroll "+((this.l + 6) * 2)+"s linear infinite");
                        }
                    }
                }
            })
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

    callFlowConn: function (connectorName, inputParam, param, cbk, errorCbk) {
        var thisObj = this;
        var connector = thisObj.getConnectorInstanceByName(connectorName);
        if (connector) {
            connector.setInputParams(inputParam);
            connector.query(param)
                .done(result => {
                    cbk && cbk.call(thisObj, result);
                }).fail(function (err) {
                    errorCbk && errorCbk.call(thisObj, result);
                })
        }
    },
});