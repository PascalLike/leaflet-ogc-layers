const ogcLayer = {
	
	_layerBounds: null,
  metadata: {},
	styleMetadata: {},
	_tileUrl: null,

  _getMetadata: function () {
    const that = this
    return new Promise(function (resolve) {
      fetch(that._url + '?f=json')
      .then(function (response) {
        response.json()
        .then(function (data) {
          resolve(data)
        })
      })
    })
	},

  _setLayerBounds: function () {
    const bbox = this.metadata.extent.spatial.bbox
    this._layerBounds = L.latLngBounds(L.latLng(bbox[0][1], bbox[0][0]), L.latLng(bbox[0][3], bbox[0][2]))
  },

  _checkIfTileOverlapsExtent: function (tileBounds) {
    if (this._layerBounds !== null) {
      if (!tileBounds.intersects(this._layerBounds)) {
        return false
      }
    }
    return true
  },

  _tileMatrixFields: ['tileMatrixSetDefinition', 'tileMatrixSetURI', 'wellKnownScaleSet'],
  _validWebMercatorHits: ['WebMercatorQuad', 'GoogleMapsCompatible'],

  _findWebMercatorTilesetMatrix: function (tilesets) {
    for (var i = 0; i < tilesets.length; i++) {
      var tileset = tilesets[i];
      for (var ii = 0; ii < this._tileMatrixFields.length; ii++) {
        var field = this._tileMatrixFields[ii];
        for (var iii = 0; iii < this._validWebMercatorHits.length; iii++) {
          var wm = this._validWebMercatorHits[iii]
          if (tileset[field] && tileset[field].indexOf(wm) > -1) {
            for (var iiii = 0; iiii < tileset.links.length; iiii++) {
              if (tileset.links[iiii].rel.indexOf('tileset') > -1) {

                var url = tileset.links[iiii].href.split('?')[0]
                if (url[0] !== '/') return url
                var baseUrl = new URL(this._url)
                return baseUrl.origin + url
              }
            }
          }
        }
      }
    }
  },

	_getStylesMetadata: function () {
    const that = this
    return new Promise(function (resolve) {
      fetch(that._url + '/styles' + '?f=json')
      .then(function (response) {
        response.json()
        .then(function (data) {
          resolve(data)
        })
      })
    })
	},

  _findMapUrlFromStyles: function (styles) {
    for (var i = 0; i < styles.length; i++) {
      var style = styles[i]
      if (style.id === this.options.style) {
        for (var ii = 0; ii < style.links.length; ii++) {
          var link = style.links[ii]
          if (link.rel === 'map') return link.href
        }
      }
    }
    return null
  }
}

;L.OgcMapsLayer = L.TileLayer.extend({

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
		var tileUrl = this._tileUrl !== null ? this._tileUrl : this._url + '/map'
 		return tileUrl + params + '&bbox=' + tileBounds.toBBoxString()
	},

	setParams: function (params, noRedraw) {
		L.Util.extend(this.ogcMapsParams, params)
		if (!noRedraw) this.redraw()
		return this
	},

	_getStylesMetadata: function () {
    const that = this
    return new Promise(function (resolve) {
      fetch(that._url + '/styles' + '?f=json')
      .then(function (response) {
        response.json()
        .then(function (data) {
          resolve(data)
        })
      })
    })
	}
});


L.ogcMapsLayer = function ogcMapLayer(url, options) {
	return new L.OgcMapsLayer(url, options);
};
;L.OgcTilesLayer = L.TileLayer.extend({

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
