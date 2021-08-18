var hm_work_report_form = StudioWidgetWrapper.extend({
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
        el: $("#hm_work_report_form", elem)[0],
        data: {
          img: "",
          name: "",
          summary: "",
          arr:[],
        },
        mounted: function () {
          this.queryOffering();
          setInterval(()=>{
            this.queryOffering();
          },28800000)
        },
        computed:{
          Arr: function (){
           return  this.arr.sort(this.compare('child_type'))
        }
        },
        methods: {
          compare(property){
            return function(a,b){
                var value1 = a[property];
                var value2 = b[property];
                return value1 - value2;
            }

        },

        queryOffering: function () {
            var _this = this
            thisObj.callAPIConn("/hm_bigScreen__HMSecurityManagement/1.0.0/departmentCompletion", {}, "POST", (res) => {
                console.log(res)
                                _this.arr = res.data[0].listData;
                                    });
          }



        //   queryOffering: function () {
        //     thisObj.callFlowConn("APIBridge", {
        //       service: "hm_bigScreen__HMSecurityManagement/1.0.0/departmentCompletion"
        //     }, {
        //       testField: "A"
        //     }, result => {
        //         this.arr = result.data[0].listData;
        //         console.log(this.arr)
        //     })
        //   }
        },
        
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