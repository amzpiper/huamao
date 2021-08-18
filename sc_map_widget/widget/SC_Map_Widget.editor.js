/*
 * (c)2002-2015 Skava. All rights reserved. The Skava system, including without
 * limitation, all software and other elements thereof, are owned or controlled
 * exclusively by Skava and protected by copyright, patent, and other laws. Use
 * without permission is prohibited. For further information contact Skava at
 * info@skava.com.
 */

var SC_Map_Widget = SC_Map_Widget.extend(
{
    /*
     * Config to define Widget Properties to be rendered in the left pane
     */
    propertiesConfig: [
		{
            config: [{	
				"type":"connectorV2",
				"name":"ScatterDataConnector",
				"label":"Connector - ScatterDataConnector",
				"model":"ScatterDataViewModel",
				"value":""			
			},
			{	
				"type":"connectorV2",
				"name":"AlarmDataConnector",
				"label":"Connector - AlarmDataConnector",
				"model":"AlarmDataViewModel",
				"value":""			
			},
			{	
				"type":"connectorV2",
				"name":"SC_OverlaysDataConnector",
				"label":"Connector - SC_OverlaysDataConnector",
				"model":"OverlaysDataViewModel",
				"value":""			
			},
			{	
				"type":"connectorV2",
				"name":"SC_MapConfigDataConnector",
				"label":"Connector - SC_MapConfigDataConnector",
				"model":"MapConfigDataViewModel",
				"value":""			
			},
			{
                "type": "connectorV2",
                "name": "FlowConnector_POST",
                "label": "API POST Connector",
                "model": "ViewModel"
            }
			]
      
        },
		
    ],

    /*
     * Triggered when the user Creates a new widget and used to initialize the widget properties
     */
    create: function(cbk)
    {
        if (cbk)
        {
            this._super();
            cbk();
        }
    }
});

var params = {};
params.hasMultipleItems = false;
params.hasAreaSpecificEvents = false;
Studio.registerWidget("SC_Map_Widget", "Widget for Displaying GIS Map", params);