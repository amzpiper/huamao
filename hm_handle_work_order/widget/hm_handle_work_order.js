var hm_handle_work_order = StudioWidgetWrapper.extend({
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
                el: $("#hm_handle_work_order", elem)[0],
                data: {
                    img: "",
                    name: "",
                    summary: "",
                    arr: [],
                    l: '' ,//数组长度,
                    changeNum:"2",
                    timer:null
                },
                created() {
                    // 表格显示5行数据，此处复制开头的5条数据实现无缝
                    // this.arr = this.arr.concat(this.arr.slice(0, 5))
                },
                mounted: function () {
                    console.log("start renderHandleData...")
                    this.renderHandleData()
                    
                    //旧版定时
                    // setInterval(() => {
                    //     console.log("start renderHandleData...")
                    //     this.renderHandleData()
                    // }, 60000)
                },
                methods: {
                    async renderHandleData() {
                        await this.queryOffering();
                        this.InsertKeyframes1();
                    },
                    // async queryOffering() {
                    queryOffering() {
                        return new Promise(resolve => {
                            thisObj.callFlowConn("APIBridge", {
                                service: "hm_bigScreen__HMSecurityManagement/1.0.0/processingLinkWorkOrderList"
                            }, {
                                testField: "A"
                            }, result => {
                                this.arr = result.data[0].listData || [];
                                
                                // // test Data
                                // if(this.changeNum=="1"){
                                //     this.arr = [
                                //         {"category":"工程维修","company":"北京华贸物业顾问有限公司第一分公司","desc":"地毯翘起来了请报修谢谢","level":"1","orderId":"66666","overTime":"--","project":"北京华贸中心写字楼一期","proposer":"安成元","space":"T1-10层-男卫生间门口通道","startTime":"2021-07-15 10:01:31","state1":"1","state2":"0","state3":"0","state4":"0","supervise":"--"},{"category":"工程维修","company":"北京华贸物业顾问有限公司第一分公司","desc":"一盏顶灯不亮","level":"1","orderId":"40127880898","overTime":"--","project":"北京华贸中心写字楼二期","proposer":"唐成国","space":"T3-1层-北侧大堂车库梯","startTime":"2021-07-15 09:57:52","state1":"1","state2":"1","state3":"0","state4":"0","supervise":"--"},{"category":"工程维修","company":"北京华贸物业顾问有限公司第一分公司","desc":"北侧消防通道步梯上方灯闪烁","level":"1","orderId":"40127880256","overTime":"--","project":"北京华贸中心写字楼二期","proposer":"魏辉","space":"T3-32层-35层","startTime":"2021-07-15 09:45:41","state1":"1","state2":"1","state3":"1","state4":"0","supervise":"--"},{"category":"工程维修","company":"北京华贸物业顾问有限公司第一分公司","desc":"35层女卫进门左手第2个隔断门马桶按钮坏","level":"1","orderId":"40127859332","overTime":"--","project":"北京华贸中心写字楼二期","proposer":"于林","space":"T3-32层-女卫","startTime":"2021-07-15 09:23:05","state1":"1","state2":"0","state3":"0","state4":"0","supervise":"--"},{"category":"工程维修","company":"北京华贸物业顾问有限公司第一分公司","desc":"厕隔门脱落","level":"1","orderId":"40127857964","overTime":"--","project":"中心商业-购物中心","proposer":"魏辉","space":"购物中心-B1-2号楼B1女卫生间","startTime":"2021-07-15 08:56:28","state1":"1","state2":"1","state3":"1","state4":"0","supervise":"--"},{"category":"客服环境","company":"北京华贸物业顾问有限公司第一分公司","desc":"地上有客户把咖啡打翻","level":"1","orderId":"40127857228","overTime":"--","project":"北京华贸中心公共设施","proposer":"魏辉","space":"公共设施-1-二号楼车库出口","startTime":"2021-07-15 08:47:10","state1":"1","state2":"1","state3":"1","state4":"0","supervise":"--"},{"category":"工程维修","company":"北京华贸物业顾问有限公司第一分公司","desc":"3号8号大盘纸盒坏了","level":"1","orderId":"40127807517","overTime":"--","project":"中心商业-购物中心","proposer":"魏辉","space":"购物中心-2-2群2层女卫生间","startTime":"2021-07-14 17:17:34","state1":"1","state2":"1","state3":"1","state4":"0","supervise":"--"},{"category":"客服环境","company":"北京华贸物业顾问有限公司第一分公司","desc":"小便池堵了请报修谢谢","level":"1","orderId":"40127813731","overTime":"17小时1分钟","project":"北京华贸中心写字楼一期","proposer":"金星","space":"T1-22层-男卫生间","startTime":"2021-07-14 16:27:55","state1":"1","state2":"1","state3":"2","state4":"0","supervise":"田丹丹"},{"category":"工程维修","company":"北京华贸物业顾问有限公司第一分公司","desc":"进门右手第1个隔断门，门合页坏","level":"1","orderId":"40127799444","overTime":"--","project":"北京华贸中心写字楼二期","proposer":"魏辉","space":"T3-9层-女卫","startTime":"2021-07-14 15:11:34","state1":"1","state2":"1","state3":"1","state4":"0","supervise":"--"},{"category":"工程维修","company":"北京华贸物业顾问有限公司第一分公司","desc":"进门左手第3个隔断门马桶水箱常流水","level":"1","orderId":"40127803781","overTime":"--","project":"北京华贸中心写字楼二期","proposer":"魏辉","space":"T3-9层-女卫","startTime":"2021-07-14 15:07:47","state1":"1","state2":"1","state3":"1","state4":"0","supervise":"--"},{"category":"工程维修","company":"北京华贸物业顾问有限公司第一分公司","desc":"洗手液盒漏液","level":"1","orderId":"40127803514","overTime":"--","project":"中心商业-购物中心","proposer":"魏辉","space":"购物中心-b1-2号楼B1男卫生间","startTime":"2021-07-14 14:55:47","state1":"1","state2":"1","state3":"1","state4":"0","supervise":"--"},{"category":"工程维修","company":"北京华贸物业顾问有限公司第一分公司","desc":"空调面板没电","level":"1","orderId":"40127796221","overTime":"--","project":"北京华贸中心写字楼一期","proposer":"魏辉","space":"T2-13层-1309","startTime":"2021-07-14 14:17:25","state1":"1","state2":"1","state3":"1","state4":"0","supervise":"--"},{"category":"工程维修","company":"北京华贸物业顾问有限公司第一分公司","desc":"一号楼1308蓝驰租区因漏水需更换天花板一块，请师傅前往","level":"1","orderId":"40127800841","overTime":"--","project":"北京华贸中心写字楼一期","proposer":"魏辉","space":"T1-13层-一号楼1308蓝驰","startTime":"2021-07-14 13:42:54","state1":"1","state2":"1","state3":"1","state4":"0","supervise":"--"},{"category":"工程维修","company":"--","desc":"小会议室空调风大，温度低，需要调整","level":"--","orderId":"40127779942","overTime":"--","project":"北京华贸中心写字楼一期","proposer":"魏辉","space":"T2-6-前台","startTime":"2021-07-14 13:06:10","state1":"1","state2":"1","state3":"1","state4":"0","supervise":"--"},{"category":"工程维修","company":"北京华贸物业顾问有限公司第一分公司","desc":"进门左手第2个隔断门马桶按钮坏","level":"1","orderId":"40127779249","overTime":"--","project":"北京华贸中心写字楼二期","proposer":"魏辉","space":"T3-32层-35层女卫","startTime":"2021-07-14 12:31:52","state1":"1","state2":"1","state3":"1","state4":"0","supervise":"--"},{"category":"工程维修","company":"北京华贸物业顾问有限公司第一分公司","desc":"棚顶天花板掉下来了，麻烦师傅过来修一下，谢谢","level":"1","orderId":"40127791002","overTime":"--","project":"北京华贸中心写字楼一期","proposer":"魏辉","space":"T2-17-空置单元","startTime":"2021-07-14 12:16:56","state1":"1","state2":"1","state3":"1","state4":"0","supervise":"--"},{"category":"工程维修","company":"北京华贸物业顾问有限公司第一分公司","desc":"商场东边买睡衣店铺对面，一盏顶灯不亮","level":"1","orderId":"40127789463","overTime":"--","project":"中心商业-购物中心","proposer":"魏辉","space":"购物中心-2层-强电","startTime":"2021-07-14 11:37:16","state1":"1","state2":"1","state3":"1","state4":"0","supervise":"--"},{"category":"工程维修","company":"北京华贸物业顾问有限公司第一分公司","desc":"租区内有异味","level":"1","orderId":"40127789155","overTime":"--","project":"北京华贸中心写字楼一期","proposer":"魏辉","space":"T1-3-飘亚健身","startTime":"2021-07-14 11:28:16","state1":"1","state2":"1","state3":"1","state4":"0","supervise":"--"},{"category":"工程维修","company":"北京华贸物业顾问有限公司第一分公司","desc":"租区内空调和鲜风机没启动，请师傅查看，谢谢","level":"1","orderId":"40127786682","overTime":"--","project":"中心商业-购物中心","proposer":"康俊","space":"购物中心-4-北京宴","startTime":"2021-07-14 10:35:53","state1":"1","state2":"0","state3":"0","state4":"0","supervise":"--"},{"category":"工程维修","company":"北京华贸物业顾问有限公司第一分公司","desc":"2号楼B4","level":"1","orderId":"40127773779","overTime":"--","project":"北京华贸中心写字楼一期","proposer":"魏辉","space":"T2-b4层-保洁开水间污水井不抽水。","startTime":"2021-07-14 09:07:37","state1":"1","state2":"1","state3":"1","state4":"0","supervise":"--"},{"category":"工程维修","company":"北京华贸物业顾问有限公司第一分公司","desc":"第7个马桶堵了","level":"1","orderId":"40127715190","overTime":"--","project":"中心商业-购物中心","proposer":"魏辉","space":"购物中心-b1-2号楼B1女卫生间","startTime":"2021-07-13 15:51:11","state1":"1","state2":"1","state3":"1","state4":"0","supervise":"--"},{"category":"工程维修","company":"北京华贸物业顾问有限公司第一分公司","desc":"男卫生间小便器一用地漏就冒水","level":"1","orderId":"40127692624","overTime":"--","project":"北京华贸中心写字楼一期","proposer":"魏辉","space":"T1-b4-1号楼B4","startTime":"2021-07-13 11:28:39","state1":"1","state2":"1","state3":"1","state4":"0","supervise":"--"},{"category":"工程维修","company":"北京华贸物业顾问有限公司第一分公司","desc":"小便器堵了","level":"1","orderId":"40127678031","overTime":"--","project":"中心商业-购物中心","proposer":"魏辉","space":"购物中心-b1-2号楼B1男卫生间","startTime":"2021-07-13 09:09:49","state1":"1","state2":"1","state3":"1","state4":"0","supervise":"--"},{"category":"工程维修","company":"北京华贸物业顾问有限公司第一分公司","desc":"小便器堵了","level":"1","orderId":"40127684954","overTime":"--","project":"中心商业-购物中心","proposer":"魏辉","space":"购物中心-b1-2号楼B1男卫生间","startTime":"2021-07-13 09:09:31","state1":"1","state2":"1","state3":"1","state4":"0","supervise":"--"},{"category":"工程维修","company":"北京华贸物业顾问有限公司第一分公司","desc":"小便器堵了","level":"1","orderId":"40127684938","overTime":"--","project":"中心商业-购物中心","proposer":"魏辉","space":"购物中心-b1-2号楼B1男卫生间","startTime":"2021-07-13 09:09:15","state1":"1","state2":"1","state3":"1","state4":"0","supervise":"--"},{"category":"工程维修","company":"北京华贸物业顾问有限公司第一分公司","desc":"租区内漏水严重，请师傅查看，谢谢","level":"1","orderId":"40127617757","overTime":"--","project":"中心商业-购物中心","proposer":"魏辉","space":"购物中心-4-北京宴","startTime":"2021-07-12 14:53:11","state1":"1","state2":"1","state3":"1","state4":"0","supervise":"--"},{"category":"工程维修","company":"北京华贸物业顾问有限公司第一分公司","desc":"小便器不出水","level":"1","orderId":"40127358559","overTime":"--","project":"中心商业-购物中心","proposer":"康俊","space":"购物中心-2-2群2层男卫生间","startTime":"2021-07-09 13:28:49","state1":"1","state2":"0","state3":"0","state4":"0","supervise":"--"},{"category":"工程维修","company":"北京华贸物业顾问有限公司第一分公司","desc":"新装联信世纪专线1条3000元，需进入竖井进行穿线及跳线工作。计入月结。","level":"1","orderId":"40127092814","overTime":"--","project":"中心商业-购物中心","proposer":"杨军杰","space":"购物中心-3-L315贝特比","startTime":"2021-07-06 13:54:48","state1":"1","state2":"0","state3":"0","state4":"0","supervise":"--"},
                                //     ];
                                //     console.log("changeNum:",this.changeNum)
                                //     this.changeNum = "2"
                                //     console.log("changeNum:",this.changeNum)
                                // }
                                // // test Data
                                // else if(this.changeNum=="2"){
                                //     this.arr = [
                                //         {"category":"工程维修","company":"北京华贸物业顾问有限公司第一分公司","desc":"蹲坑防滑条掉了","level":"1","orderId":"40127872361","overTime":"--","project":"北京华贸中心写字楼二期","proposer":"李金河","space":"T3-b2层-男卫生间","startTime":"2021-07-15 10:17:00","state1":"1","state2":"0","state3":"0","state4":"0","supervise":"--"},
                                //         {"category":"工程维修","company":"北京华贸物业顾问有限公司第一分公司","desc":"蹲坑防滑条掉了","level":"1","orderId":"40127872361","overTime":"--","project":"北京华贸中心写字楼二期","proposer":"李金河","space":"T3-b2层-男卫生间","startTime":"2021-07-15 10:17:00","state1":"1","state2":"0","state3":"0","state4":"0","supervise":"--"},
                                //         {"category":"工程维修","company":"北京华贸物业顾问有限公司第一分公司","desc":"蹲坑防滑条掉了","level":"1","orderId":"40127872361","overTime":"--","project":"北京华贸中心写字楼二期","proposer":"李金河","space":"T3-b2层-男卫生间","startTime":"2021-07-15 10:17:00","state1":"1","state2":"0","state3":"0","state4":"0","supervise":"--"},
                                //         {"category":"工程维修","company":"北京华贸物业顾问有限公司第一分公司","desc":"蹲坑防滑条掉了","level":"1","orderId":"40127872361","overTime":"--","project":"北京华贸中心写字楼二期","proposer":"李金河","space":"T3-b2层-男卫生间","startTime":"2021-07-15 10:17:00","state1":"1","state2":"0","state3":"0","state4":"0","supervise":"--"},
                                //         {"category":"工程维修","company":"北京华贸物业顾问有限公司第一分公司","desc":"蹲坑防滑条掉了","level":"1","orderId":"40127872361","overTime":"--","project":"北京华贸中心写字楼二期","proposer":"李金河","space":"T3-b2层-男卫生间","startTime":"2021-07-15 10:17:00","state1":"1","state2":"0","state3":"0","state4":"0","supervise":"--"}
                                //     ];
                                //     console.log("changeNum:",this.changeNum)
                                //     this.changeNum = "1"
                                //     console.log("changeNum:",this.changeNum)
                                // }
                                
                                //获取数据长度
                                this.l = this.arr.length;
                                console.log("----------queryOffering,this.l:" + this.l)
                                //拼接数据
                                if (this.l > 6) {
                                    this.arr = this.arr.concat(this.arr.slice(0, 6))
                                }
                                
                                //gyh-动态时间定时请求
                                console.log("动态时间定时请求...")
                                var waittime = this.l == '0' ? 0 : ((this.l + 6) * 2)
                                console.log("ready to renderHandleData wait :"+ waittime +"s")
                                clearInterval(this.timer);
                                this.timer = setInterval(() => {
                                    console.log("start renderHandleData...")
                                    this.renderHandleData()
                                }, ((this.l + 6) * 2)*1000)
                                
                                resolve()
                            })
                        })
                    },
                    InsertKeyframes1() {
                        if (this.arr == null) {
                            return
                        }
                        if (this.l > 6) {
                            //当条数大于6时添加滚动样式
                            let row = -this.l * 80;
                            console.log("----------InsertKeyframes1,this.l:" + this.l);
                            console.log("----------InsertKeyframes1,row:" + row);
                            
                            //旧版本控制页面滚动的逻辑
                            // console.log(this.l)
                            // console.log(row)
                            // let scrollLength = row
                            // let style = document.styleSheets[0];
                            // // var rules = style.cssRules;
                            // // for(i=0,rules.length;i++){
                            // //     style.deleteRule(i)
                            // // }
                            // style.insertRule(`.handle_list {
                            //     animation: handle_scroll ${(this.l + 6) * 2}s  linear infinite;
                            //     position: relative;
                            //     }`, 0);
                            // style.insertRule(`@keyframes handle_scroll {from { top: 0; } to { top: ${row}px }}`, 0);//写入样式
                            // console.log("document.styleSheets[0]:",style)
                            
                            //新滚动逻辑
                            var cssValue = "@keyframes menu-box-trans{ 0%{ top: 0px; } 100% { top:"+row+"px;}}";
                            var webkitCssValue = "@-webkit-keyframes menu-box-trans{ 0%{ top: 0px; } 100% { top:"+row+"px;}}";
                            $("#defineHtml").html(
                                "<style>"+
                                cssValue+webkitCssValue
                                +"</style>"
                                );
                            $(".handle_list").css("animation","menu-box-trans "+((this.l + 6) * 2)+"s linear infinite");
                            $(".handle_list").css("-webkit-animation","menu-box-trans "+((this.l + 6) * 2)+"s linear infinite");
                        }else{
                            //当条数不大于6时修改滚动样式为不滚动
                            var cssValue = "@keyframes menu-box-trans{ 0%{ top: 0px; } 100% { top:"+0+"px;}}";
                            var webkitCssValue = "@-webkit-keyframes menu-box-trans{ 0%{ top: 0px; } 100% { top:"+0+"px;}}";
                            $("#defineHtml").html(
                                "<style>"+
                                cssValue+webkitCssValue
                                +"</style>"
                                );
                            $(".handle_list").css("animation","menu-box-trans "+((this.l + 6) * 2)+"s linear infinite");
                            $(".handle_list").css("-webkit-animation","menu-box-trans "+((this.l + 6) * 2)+"s linear infinite");
                        }
                    },
                    circle(state) {
                        switch (state) {
                            case "0":
                                return 'circle-yellow';
                            case "1":
                                return 'circle-green';
                            case "2":
                                return 'circle-red'
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