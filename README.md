# leaflet-ogc-layers
A plugin for using an OGC Maps or Tiles Layer with leafletjs

### Installing
Download the `/dist/OgcLayers.js`

*Note* Compatible with Leaflet v1.7+

### Usage
**Step 1.** Include the required js in your document 

```html
   	<script src="./OgcLayers.js"></script>
```

**Step 2.** Add your layer to map using the `ogcMapLayer` function

``` js
		// Using the default style
		L.ogcMapsLayer('https://test.cubewerx.com/cubewerx/cubeserv/demo/ogcapi/Winnipeg_2019/collections/dtm_1m').addTo(map)

		// Using the hillshade style
		L.ogcMapsLayer('https://test.cubewerx.com/cubewerx/cubeserv/demo/ogcapi/Winnipeg_2019/collections/dtm_1m', {
			style: 'hillshade',
			f: 'png',
			zIndex: 3
		}).addTo(map)

		// Using the tiles
		L.ogcTilesLayer('http://5.9.22.176:8080/ogcapi/collections/HRDEM-RedRiver:DTM:2m').addTo(map)

```
