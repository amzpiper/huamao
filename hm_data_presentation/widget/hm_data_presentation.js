var hm_data_presentation = StudioWidgetWrapper.extend({
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
    var widgetProperties = thisObj.getProperties();
    
    /*
     * API to get base path of your uploaded widget API file
     */
    var widgetBasePath = thisObj.getWidgetBasePath();
    if (elem) {

      thisObj.vm = new Vue({
        el: $(".hm_data_presentation", elem)[0],
        data: {
          img: "",
          name: "",
          summary: "",
          sumOrder:"123",
          completeOrder:"23",
          overOrder:"45"
        },
        mounted: function () {
          this.queryOffering();
          setInterval(()=>{
            this.queryOffering();
          },30000)
        },
        methods: {
          queryOffering: function () {
            thisObj.callFlowConn("APIBridge", {
              service: "hm_bigScreen__HMSecurityManagement/0.1.0/monthSumOrder"
            }, {
              testField: "A"
            }, result => {
                console.log("result:",result)
                this.sumOrder = result.data[0].listData[0].sumOrder
                this.completeOrder = result.data[0].listData[0].completeOrder
                this.overOrder = result.data[0].listData[0].overOrder
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