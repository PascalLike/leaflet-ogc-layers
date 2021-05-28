L.OgcMapsLayer = L.TileLayer.extend({

	defaultOgcMapsParams: {
			f: 'image/jpg',
			transparent: true,
			width: 256,
			height: 256,
			crs: 'CRS84',
	},

	options: {
		style: 'default'
	},

	initialize: function (url, options) {
		this._url = url

		var ogcMapsParams = L.Util.extend({}, this.defaultOgcMapsParams);
		for (var i in options) {
			if (!(i in this.options)) {
				ogcMapsParams[i] = options[i]
			}
		}

		options = L.Util.setOptions(this, options);
		var realRetina = options.detectRetina && retina ? 2 : 1
		var tileSize = this.getTileSize()
		ogcMapsParams.width = tileSize.x * realRetina
		ogcMapsParams.height = tileSize.y * realRetina
		this.ogcMapsParams = ogcMapsParams
    
		L.Util.extend(this, ogcLayer)
		var that = this

    this._getMetadata()
    .then(function (data) {
      that.metadata = data
      if (that.metadata) that._setLayerBounds()
    })

		this._getStylesMetadata()
		.then(function (data) {
      that.styleMetadata = data
      if (that.styleMetadata && that.options.style !== 'default') {
				that._tileUrl = that._findMapUrlFromStyles(that.styleMetadata.styles)
				that.redraw()
			}
    })

	},
	
	onAdd: function (map) {
		this._crs = this.options.crs || map.options.crs
		L.TileLayer.prototype.onAdd.call(this, map)
	},

	getTileUrl: function (coords) {
		const tileBounds = this._tileCoordsToBounds(coords)
		if (!this._checkIfTileOverlapsExtent(tileBounds)) return ''
		const params = L.Util.getParamString(this.ogcMapsParams)
		var tileUrl = this.options.style !=='default' ? this._url + '/styles/' + this.options.style  + '/map' : this._url + '/map'
 		return tileUrl + params + '&bbox=' + tileBounds.toBBoxString()
	},

	setParams: function (params, noRedraw) {
		L.Util.extend(this.ogcMapsParams, params)
		if (!noRedraw) this.redraw()
		return this
	}

});


L.ogcMapsLayer = function ogcMapLayer(url, options) {
	return new L.OgcMapsLayer(url, options);
};
