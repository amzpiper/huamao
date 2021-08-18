var HM_Camera_Control_Widget = HM_Camera_Control_Widget.extend({
	propertiesConfig: [{
			headerTitle: "Player Style",
			accordion: true,
			accordionState: "open",
			config: [{
					"type": "text",
					"name": "width",
					"label": "Width",
					"value": ""
				},
				{
					"type": "text",
					"name": "height",
					"label": "Height",
					"value": ""
				},
				{
					"type": "select",
					"name": "position",
					"label": "Position",
					"options": [{
						"label": "default",
						"value": "unset"
					}, {
						"label": "fixed",
						"value": "fixed",
						"selected": true
					}]
				},
				{
					"type": "text",
					"name": "vTop",
					"label": "Top",
					"value": "0"
				},
				{
					"type": "text",
					"name": "vBottom",
					"label": "Bottom",
					"value": "0"
				},
				{
					"type": "text",
					"name": "vLeft",
					"label": "Left",
					"value": "28.5rem"
				},
				{
					"type": "text",
					"name": "vRight",
					"label": "Right",
					"value": "0"
				},
				{
					"type": "number",
					"name": "zIndex",
					"label": "z-index",
					"value": "999"
				}
			]
		}, {
			headerTitle: "Parameters",
			accordion: true,
			accordionState: "close",
			config: [
			{
				"type": "text",
				"name": "ptzControl",
				"label": "云台控制服务接口地址，默认调用videoProxy封装好的服务，即：/VideoProxy/0.1.0/ptz",
				"value": "/VideoProxy/0.1.0/ptz"
			}
			
		]
		},
		{
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
		}
	],
	create: function (cbk) {
		if (cbk) {
			this._super();
			cbk();
		}
	}
});

var params = {};
Studio.registerWidget("HM_Camera_Control_Widget", "HM_Camera_Control_Widget", params);