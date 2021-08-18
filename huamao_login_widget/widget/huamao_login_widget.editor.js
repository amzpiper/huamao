
var huamao_login_widget = huamao_login_widget.extend({
    /*
     * Config to define Widget Properties
     */
    propertiesConfig:[{
		headerTitle: "Connector",
		accordion: true,
		accordionState: "close",
		config: [{
			"type": "connectorV2",
			"name": "FlowConnector_POST",
			"label": "FlowConnector_POST",
			"model": "ViewModel"
		}, {
			"type": "connectorV2",
			"name": "FlowConnector_GET",
			"label": "FlowConnector_GET",
			"model": "ViewModel"
		}, {
			"type": "connectorV2",
			"name": "FlowConnector_PUT",
			"label": "FlowConnector_PUT",
			"model": "ViewModel"
		}, {
			"type": "connectorV2",
			"name": "FlowConnector_DELETE",
			"label": "FlowConnector_DELETE",
			"model": "ViewModel"
		}]
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
Studio.registerWidget("huamao_login_widget", "huamao_login_widget", params);