var hm_work_time = StudioWidgetWrapper.extend({
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
                el: $("#hm_work_time", elem)[0],
                data: {
                    img: "",
                    name: "",
                    summary: "",
                    lastWorkTime: "",
                    NowDate: ''
                },
                mounted: function () {
                    //  this.queryOffering();
                    this.lastWorkTime = this.getLastWork()
                    this.NowDate = this.getNowDate()
                    setInterval(() => {
                        this.getLastWork = this.getLastWork();
                        this.NowDate = this.getNowDate()
                    }, 21600000)
                },
                methods: {
                    getNowDate() {
                        var date = new Date();
                        var strYear = date.getFullYear();
                        var strDay = date.getDate();
                        var strMonth = date.getMonth() + 1;
                        if(strMonth<10)//给个位数的月、日补零
                        {
                            strMonth="0"+strMonth;
                        }
                        if(strDay<10)
                        {
                            strDay="0"+strDay;
                        }
                        //var strSecond = date.getSeconds();
                        datastr = strYear + "-" + strMonth + "-" + strDay;
                        // datastr = strYear+"-"+strMonth+"-"+strDay+strSecond;
                        return datastr;
                    },
                    getLastWork() {
                        var date = new Date();
                        var strYear = date.getFullYear();
                        var strDay = date.getDate();
                        var strMonth = date.getMonth() + 1;
                        //    var strYear = date.getFullYear();
                        // var strDay = 2;
                        // var strMonth = 12;
                        var daysInMonth = new Array([0], [31], [28], [31], [30], [31], [30], [31], [31], [30], [31], [30], [31]);
                        if (strYear % 4 == 0 && strYear % 100 != 0) {//一、解决闰年平年的二月份天数   //平年28天、闰年29天//能被4整除且不能被100整除的为闰年
                            daysInMonth[2] = 29;
                        }

                        if (strDay > 7) {
                            strDay = strDay - 7
                        } else {
                            if (strMonth - 1 == 0) //二、解决跨年问题
                            {
                                strYear -= 1;
                                strMonth = 12;
                                strDay = 7 - strDay;
                                strDay = daysInMonth[strMonth] - strDay
                            } else {
                                strMonth -= 1;
                                strDay = 7 - strDay;
                                strDay = daysInMonth[strMonth] - strDay
                            }

                        }
                        if (strMonth < 10)//给个位数的月、日补零
                        {
                            strMonth = "0" + strMonth;
                        }
                        if (strDay < 10) {
                            strDay = "0" + strDay;
                        }
                        let lastWorkTime = strYear + '-' + strMonth + '-' + strDay
                        return lastWorkTime
                    },
                    queryOffering: function () {
                        thisObj.callFlowConn("APIBridge", {
                            service: "hm_bigScreen__hm/0.1.0/getStudentName"
                        }, {
                            testField: "A"
                        }, result => {
                            if (result.resp.code == '0') {
                                this.name = result.data[0].name;
                            }
                        })
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