L.OgcTilesLayer = L.TileLayer.extend({

	options: {
		f: 'png',
		style: 'default'
	},

	tilesMetadata: {},

	_tileBaseUrl: null,

	initialize: function (url, options) {
    var that = this
		this._url = url;
		options = L.Util.setOptions(this, options)
    L.Util.extend(this, ogcLayer)

		this._getMetadata()
    .then(function (data) {
      that.metadata = data
      if (that.metadata) {
				that._setLayerBounds()
				that._getTileBaseUrl()
			}
    })
	},
	
	onAdd: function (map) {
		this._crs = this.options.crs || map.options.crs
		L.TileLayer.prototype.onAdd.call(this, map)
	},

  _getTileBaseUrl: function () {
		if (this.options.style === 'default') {
			this._tileBaseUrl = this._findTilesUrlBaseFromLinks(this.metadata.links)
			this._setTileUrl()
		} else {
			var that = this
			this._getStylesMetadata()
			.then(function (data) {
				that.styleMetadata = data
				if (that.styleMetadata) {
					that.options.style = that.styleMetadata.defaultStyle ? that.styleMetadata.defaultStyle : that.styleMetadata.styles[0].id 
					that._tileBaseUrl = that._findTilesUrlFromStyles(that.styleMetadata.styles)
					that._setTileUrl()
				}
			})
		}
	},

	_setTileUrl: function () {
		var that = this
		that._getStyledTileMetadata()
		.then(function (data) {
			that.tilesMetadata = data
			if (that.tilesMetadata) {
				that._tileUrl = that._findWebMercatorTilesetMatrix(that.tilesMetadata.tilesets)
				that.redraw()
			}
		})
	},

	getTileUrl: function (coords) {
		if (this._tileUrl === null) return ''
    const tileBounds = this._tileCoordsToBounds(coords)
    if (!this._checkIfTileOverlapsExtent(tileBounds)) return ''
		return this._tileUrl + '/' + this._getZoomForUrl() + '/' + coords.y + '/' + coords.x + '.' + this.options.f
	},

	_getStyledTileMetadata: function () {
    const that = this
    return new Promise(function (resolve) {
      fetch(that._tileBaseUrl)
      .then(function (response) {
        response.json()
        .then(function (data) {
          resolve(data)
        })
      })
    })
	},

	_findTilesUrlFromStyles: function (styles) {
    for (var i = 0; i < styles.length; i++) {
      var style = styles[i]
      if (style.id === this.options.style) {
        for (var ii = 0; ii < style.links.length; ii++) {
          var link = style.links[ii]
          if (link.rel.indexOf('tilesets') > -1) {
						var url = this._cleanUrlOfParams(link.href)
						return this._ensureAbsoluteUrl(url)
					}
        }
      }
    }
    return null
  },

	_findTilesUrlBaseFromLinks: function (links) {
    for (var i = 0; i < links.length; i++) {
      var link = links[i]
			if (link.rel.indexOf('tilesets-map') > -1) {
				var url = this._cleanUrlOfParams(link.href)
				return this._ensureAbsoluteUrl(url)
			}
    }
    return null
	}

});


L.ogcTilesLayer = function ogcTileLayer(url, options) {
	return new L.OgcTilesLayer(url, options);
};
