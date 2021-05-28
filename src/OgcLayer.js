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

