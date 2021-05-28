L.OgcTilesLayer = L.TileLayer.extend({

	options: {
		f: 'png',
		style: 'default'
	},

	tilesMetadata: {},

	initialize: function (url, options) {
    var that = this
		this._url = url;
		options = L.Util.setOptions(this, options)
    L.Util.extend(this, ogcLayer)

		this._getMetadata()
    .then(function (data) {
      that.metadata = data
      if (that.metadata) that._setLayerBounds()
    })

		this._getTilesMetadata()
		.then(function (data) {
      that.tilesMetadata = data
      if (that.tilesMetadata) {
				that._tileUrl = that._findWebMercatorTilesetMatrix(that.tilesMetadata.tilesets)
				that.redraw()
			}
    })
		
	},
	
	onAdd: function (map) {
		this._crs = this.options.crs || map.options.crs
		L.TileLayer.prototype.onAdd.call(this, map)
	},

	getTileUrl: function (coords) {
		if (this._tileUrl === null) return ''
    const tileBounds = this._tileCoordsToBounds(coords)
    if (!this._checkIfTileOverlapsExtent(tileBounds)) return ''
    return this._tileUrl + '/' + this._getZoomForUrl() + '/' + coords.y + '/' + coords.x + '.' + this.options.f
	},

	_getTilesMetadata: function () {
    const that = this
    return new Promise(function (resolve) {
      fetch(that._url + '/map/tiles' + '?f=json')
      .then(function (response) {
        response.json()
        .then(function (data) {
          resolve(data)
        })
      })
    })
	}

});


L.ogcTilesLayer = function ogcTileLayer(url, options) {
	return new L.OgcTilesLayer(url, options);
};
