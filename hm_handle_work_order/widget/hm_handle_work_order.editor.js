
hm_handle_work_order = hm_handle_work_order.extend({
    /*
     * Config to define Widget Properties
     */
    propertiesConfig:[{
        config: [{
				"type": "connectorV2",
				"name": "APIBridge",
				"model": "ViewModel",
				"label": "API Bridge",
				"value": ""
			}
        ]
    }],
    
    /*
     * Triggered when the user Creates a new widget and used to initialize the widget properties
     */
    create : function(cbk)
    {
        if(cbk)
        {
            this._super();
            cbk();
        }
    }
});

var params = {};
Studio.registerWidget("hm_handle_work_order", "hm_handle_work_order", params);