
HMLogin = HMLogin.extend({
    /*
     * Config to define Widget Properties
     */
    propertiesConfig:[{
        config: [
            /* add properties here. Install Mangnocode extension, and then can use Mangno.addTextProperty and other snippets to add a property*/
            {
                "type" : "connectorV2",
                "name" : "PostAPIConnector",
                "label" : "Post API Connector",
                "model" : "ViewModel"
            },
            {
                "type" : "connectorV2",
                "name" : "GetAPIConnector",
                "label" : "Get API Connector",
                "model" : "ViewModel"
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
Studio.registerWidget("HMLogin", "HMLogin", params);