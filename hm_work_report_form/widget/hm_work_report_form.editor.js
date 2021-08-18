
hm_work_report_form = hm_work_report_form.extend({
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
			},{
            "type": "connectorV2",
            "name": "APIConnector_POST",
            "label": "APIConnector_POST",
            "model": "ViewModel",
            "value": "global_connector_APIConnector"
        }, {
            "type": "connectorV2",
            "name": "APIConnector_GET",
            "label": "APIConnector_GET",
            "model": "ViewModel",
            "value": "global_connector_APIConnector"
        }, {
            "type": "connectorV2",
            "name": "APIConnector_PUT",
            "label": "APIConnector_PUT",
            "model": "ViewModel",
            "value": "global_connector_APIConnector"
        }, {
            "type": "connectorV2",
            "name": "APIConnector_DELETE",
            "label": "APIConnector_DELETE",
            "model": "ViewModel",
            "value": "global_connector_APIConnector"
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
Studio.registerWidget("hm_work_report_form", "hm_work_report_form", params);