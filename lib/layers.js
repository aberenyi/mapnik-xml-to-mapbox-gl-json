const helper = require('./helper.js')
const layout = require('./layout.js')
const paint = require('./paint.js')
const zoom = require('./zoom.js')

module.exports = layers

function layers(inputXML, settings)
{
  let layers =  settings.layers || []
  let source = 'mapbox'
  if (settings)
  {
    for (const s in settings.sources)
    {
      source = s
    }
  }

  // for each 'Rule', build Mapbox layers
  // can be multiple layers depending on filters
  const inputLayers = Array.isArray(inputXML["Layer"]) ? inputXML["Layer"] : [inputXML["Layer"]]
  inputLayers.forEach(inputLayer =>
  {
    inputLayer['styles']
      .filter(style => style)
      .forEach(inputStyle =>
      {
        const inputRules = [...inputStyle['Rule']]
        inputRules.forEach(inputRule =>
        {
          const layer = buildLayer(inputLayer, inputStyle, inputRule, source)
          if (layer) { layers = [...layers, ...layer] }
        })
      })
  })

  return layers
}

/**
 * Builds layer according to the Mapbox Style Specification
 * https://www.mapbox.com/mapbox-gl-style-spec/#layers
 *
 * @param inputLayer
 * @param inputStyle
 * @param inputRule
 * @param source
 * @returns {*}
 */
function buildLayer(inputLayer, inputStyle, inputRule, source)
{
  // determine types within the rule
  const types = helper.types(inputRule)

  return types
  // only return if type is truthy, i.e. shout if unsupported type found
    .filter(type => !!type)
    .map(type =>
    {
      const layer =
      {
        id: id(inputLayer, inputStyle, inputRule, type),
        type,
        source,
        minzoom: undefined,
        maxzoom: undefined,
        'source-layer': inputLayer['name'],
        filter: inputRule['Filter'],
        layout: layout(inputRule),
        paint: paint(inputRule, type)
      }

      // adjust min- and maxzoom based on text opacity for TextSymbol layers
      if (layer.paint['text-opacity'] && layer.paint['text-opacity'].stops)
      {
        // find the first opacity 1 and overwrite minzoom
        const opacityToMinZoom = layer.paint['text-opacity'].stops.find(stop => stop[1] === 1)
        layer.minzoom = opacityToMinZoom ? opacityToMinZoom[0] : undefined

        // find the last 0 opacity and overwrite maxzoom
        const opacityToMaxZoomIdx = layer.paint['text-opacity'].stops
          .map(stop => stop[1] === 0)
          .lastIndexOf(true)
        layer.maxzoom = layer.paint['text-opacity'].stops[opacityToMaxZoomIdx]
          ? layer.paint['text-opacity'].stops[opacityToMaxZoomIdx][0]
          : undefined
      }
      else
      {
        layer.minzoom = inputRule['MaxScaleDenominator'] ? zoom.minZoom(inputRule) : undefined
        layer.maxzoom = inputRule['MinScaleDenominator'] ? zoom.maxZoom(inputRule) : undefined
      }

      return layer
    })
}

/**
 * Combines layer, style and filter names into an unique ID
 * @param inputLayer
 * @param inputStyle
 * @param inputRule
 * @param type
 * @returns {string}
 */
function id(inputLayer, inputStyle, inputRule, type)
{
  let id = `${inputLayer['name']}-${inputStyle['name']}-${type}`

  // Add filter name to ID if exists
  if (inputRule.hasOwnProperty('Filter'))
  {
    inputRule.Filter.forEach(filter => id += '-' + filter)
  }

  // Layers can get same ID if filters are the same. This is used to get unique IDs.
  /*
  if (inputRule['MaxScaleDenominator'])
      id += '-' + helper.scaleDenominatorToZoomLevel(parseInt(inputRule['MaxScaleDenominator']))
  if (inputRule['MinScaleDenominator'])
      id += '-' + helper.scaleDenominatorToZoomLevel(parseInt(inputRule['MinScaleDenominator']))
  */

  return id
}
