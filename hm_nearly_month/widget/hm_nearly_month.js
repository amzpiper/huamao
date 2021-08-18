var hm_nearly_month = StudioWidgetWrapper.extend({
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
        el: $("#hm_nearly_month", elem)[0],
        data: {
          img: "",
          name: "",
          summary: "",
          LastMonthYestdy:'',
          NowDate:''
        },
        mounted: function () {
          //this.queryOffering();
          this.LastMonthYestdy = this.getLastMonthYestdy();
          this.NowDate = this.getNowDate()
          setInterval(()=>{
            this.LastMonthYestdy = this.getLastMonthYestdy();
            this.NowDate = this.getNowDate()
          },21600000)
         
        },
        methods: {
          getNowDate(){
            var date = new Date();
            date.setTime(date.getTime()-24*60*60*1000);
            var strYear = date.getFullYear();
            var strDay = date.getDate();
            var strMonth = date.getMonth()+1;
            if(strMonth<10)//给个位数的月、日补零
            {
              strMonth="0"+strMonth;
            }
            if(strDay<10)
            {
              strDay="0"+strDay;
            }
            //var strSecond = date.getSeconds();
            datastr = strYear+"-"+strMonth+"-"+strDay;
            // datastr = strYear+"-"+strMonth+"-"+strDay+strSecond;
            return datastr;
          },
          getLastMonthYestdy(){
            var date = new Date();
            console.log(date);
             //        1    2    3    4    5    6    7    8    9   10    11   12月
            var daysInMonth = new Array([0],[31],[28],[31],[30],[31],[30],[31],[31],[30],[31],[30],[31]);
            var strYear = date.getFullYear();
            var strDay = date.getDate();
            var strMonth = date.getMonth()+1;
            if(strYear%4 == 0 && strYear%100 != 0){//一、解决闰年平年的二月份天数   //平年28天、闰年29天//能被4整除且不能被100整除的为闰年
                daysInMonth[2] = 29;
            }
            if(strMonth - 1 == 0) //二、解决跨年问题
            {
                strYear -= 1;
                strMonth = 12;
            }
            else
            {
                strMonth -= 1;
            }
    //        strDay = daysInMonth[strMonth] >= strDay ? strDay : daysInMonth[strMonth];
            strDay = Math.min(strDay,daysInMonth[strMonth]);//三、前一个月日期不一定和今天同一号，例如3.31的前一个月日期是2.28；9.30前一个月日期是8.30
    
            if(strMonth<10)//给个位数的月、日补零
            {
                strMonth="0"+strMonth;
            }
            if(strDay<10)
            {
                strDay="0"+strDay;
            }
            datastr = strYear+"-"+strMonth+"-"+strDay;
            return datastr;
    
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