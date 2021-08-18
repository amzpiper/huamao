
var HM_Organization_Widget = HM_Organization_Widget.extend({
    /*
     * Config to define Widget Properties
     */
    propertiesConfig: [{
        headerTitle: "Connector",
        accordion: true,
        accordionState: "close",
        config: [{
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
Studio.registerWidget("HM_Organization_Widget", "HM_Organization_Widget", params);