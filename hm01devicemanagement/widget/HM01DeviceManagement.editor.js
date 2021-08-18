var HM01DeviceManagement = HM01DeviceManagement.extend({
    propertiesConfig: [
        {
            headerTitle: "Connector",
            accordion: true,
            accordionState: "close",
            config: [{
                "type": "connectorV2",
                "name": "APIConnector_POST",
                "label": "APIConnector_POST",
                "model": "ViewModel"
            }, {
                "type": "connectorV2",
                "name": "APIConnector_GET",
                "label": "APIConnector_GET",
                "model": "ViewModel"
            }, {
                "type": "connectorV2",
                "name": "APIConnector_PUT",
                "label": "APIConnector_PUT",
                "model": "ViewModel"
            }, {
                "type": "connectorV2",
                "name": "APIConnector_DELETE",
                "label": "APIConnector_DELETE",
                "model": "ViewModel"
            }]
        }],
    create: function (cbk) {
        if (cbk) {
            this._super();
            cbk();
        }
    }
});

var params = {};
params.hasMultipleItems = false;
params.hasAreaSpecificEvents = false;
Studio.registerWidget("HM01DeviceManagement", "HM01DeviceManagement", params);