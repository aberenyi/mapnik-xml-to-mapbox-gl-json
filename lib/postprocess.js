const _ = require('underscore')

module.exports = postprocess

var layers = {}

/**
 * Group all layers if they have the same filter
 * @param outputJSON
 */
function postprocess(outputJSON)
{
  outputJSON['layers'].forEach(layer =>
  {
    // If no filter, just add them
    if (!layer['filter'])
      layers[JSON.stringify(layer)] = layer
    else {
      // Check if layer with similar properties already exists in layers, if it does, merge. If not
      // just add it
      if (layers[layer['id']])
        mergeLayer(layers[layer['id']], layer)
      else
        layers[layer['id']] = layer
    }
  })



  //Replace stops with correct value if stops only contain one value
  _.forEach(layers, (layer, index, list) =>
  {
    //Text size of symbols
    // try {
    //   if (layer['layout']['text-size']['stops'].length == 1) {
    //     //console.log('symbols: ' + layer['paint']['text-size']['stops'][0][1])
    //     list[index]['layout']['text-size'] = parseFloat(layer['layout']['text-size']['stops'][0][1])
    //   }
    // }
    // catch (error) {
    //   //console.log(error)
    // }

    //Line width of lines
    try {
      if (layer['paint']['line-width']['stops'].length == 1) {
        //console.log('lines: ' + layer['paint']['line-width']['stops'][0][1])
        list[index]['paint']['line-width'] = parseFloat(layer['paint']['line-width']['stops'][0][1])
      }
    }
    catch (error) {
      //console.log(error)
    }

    //Fill color of fills/polygons
    try {
      // TODO: merge if the values are the same for every 'stop"
      if (layer['paint']['fill-color']['stops'].length === 1) {
        // console.log('fill: ' + layer['paint']['fill-color']['stops'][0][1])
        list[index]['paint']['fill-color'] = layer['paint']['fill-color']['stops'][0][1]
      }
    }
    catch(error) {
      //console.log(error)
    }

    //Fill opacity color of fills/polygons
    try {
      if (layer['paint']['fill-opacity']['stops'].length === 1)
      {
        // console.log('fill: ' + layer['paint']['fill-color']['stops'][0][1])
        list[index]['paint']['fill-opacity'] = layer['paint']['fill-opacity']['stops'][0][1]
      }
    }
    catch(error) {
      //console.log(error)
    }

  })

  outputJSON.layers = Object.values(layers)
}


/**
 * Merges newLayer with originLayer, adding it's stop
 * TODO: Merge other things than stops
 * @param sourceLayer
 * @param newLayer
 */
function mergeLayer(sourceLayer, newLayer) {

  //Merge layers of type fill
  if (sourceLayer['type'] === 'fill' && newLayer['type'] === 'fill') {
    sourceLayer['paint']['fill-color']['stops'] = combineStops
    (
      sourceLayer['paint']['fill-color']['stops'],
      newLayer['paint']['fill-color']['stops']
    )

    sourceLayer['paint']['fill-opacity']['stops'] = combineStops
    (
      sourceLayer['paint']['fill-opacity']['stops'],
      newLayer['paint']['fill-opacity']['stops']
    )
  }

  //Merge layers of type line
  // if (sourceLayer['type'] === 'line' && newLayer['paint']['line-width']) {
  if (sourceLayer['type'] === 'line' && newLayer['type'] === 'line') {
    // originLayerStops = sourceLayer['paint']['line-width']['stops']
    // newLayerStops = newLayer['paint']['line-width']['stops']
    //
    // originLayerStops = combineStops(originLayerStops, newLayerStops)
    //
    // Write back to original layer
    // sourceLayer['paint']['line-width']['stops'] = originLayerStops

    sourceLayer['paint']['line-width']['stops'] = combineStops
    (
      sourceLayer['paint']['line-width']['stops'],
      newLayer['paint']['line-width']['stops']
    )

    sourceLayer['paint']['line-opacity']['stops'] = combineStops
    (
      sourceLayer['paint']['line-opacity']['stops'],
      newLayer['paint']['line-opacity']['stops']
    )
  }

  //Merge layers of type symbol
  if (sourceLayer['type'] === 'symbol')
  {
    // sourceLayer['paint']['text-opacity']['stops'] = combineStops
    // (
    //   sourceLayer['paint']['text-opacity']['stops'],
    //   newLayer['paint']['text-opacity']['stops']
    // )

    if (Object.keys(newLayer['layout']).length > 0)
    {
      sourceLayer['layout'] = newLayer['layout']
      // newLayer['layout']['text-size'] = newLayer['layout']['text-size']
    }

    const propsWithStops = Object.keys(sourceLayer['paint']).filter(key =>
      sourceLayer['paint'][key].hasOwnProperty('stops'))
    propsWithStops.forEach(prop =>
    {
      sourceLayer['paint'][prop]['stops'] = combineStops
      (
        sourceLayer['paint'][prop]['stops'],
        newLayer['paint'][prop]['stops']
      )
    })
  }

  // if (sourceLayer['type'] === 'symbol' && newLayer['layout']['text-field'])
  // {
    // originLayerStops = sourceLayer['layout']['text-size']['stops']
    // newLayerStops = newLayer['layout']['text-size']['stops']
    //
    // originLayerStops = combineStops(originLayerStops, newLayerStops)
    //
    // Write back to original layer
    // FI
    // sourceLayer['layout']['text-size']['stops'] = originLayerStops
  // }


  // console.log(
  //     '\nID ' + sourceLayer['id'] +
  //     '\nOrigin minzoom ' + sourceLayer['minzoom'] + ', New minzoom ' + newLayer['minzoom'] +
  //     '\nOrigin maxzoom ' + sourceLayer['maxzoom'] + ', New maxzoom ' + newLayer['maxzoom'])


  // if (sourceLayer['minzoom'])
    // if (!newLayer['minzoom'])
    //   delete sourceLayer['minzoom']
    // else
    sourceLayer['minzoom'] = _.min([sourceLayer['minzoom'], newLayer['minzoom']])
    // if (sourceLayer['paint']['text-opacity'] && sourceLayer['paint']['text-opacity']['stops'])
    // {
    //   const visibleLevels = sourceLayer['paint']['text-opacity']['stops']
    //     .filter(stop => stop[1] === 1)
    //     .map(stop => stop[0])
    //   if (sourceLayer['minzoom'] !== visibleLevels[0])
    //   {
    //     sourceLayer['minzoom'] = visibleLevels[0]
    //   }
    // }

  // if (sourceLayer['maxzoom'])
    // if (!newLayer['maxzoom'])
    //   delete sourceLayer['maxzoom']
    // else
    sourceLayer['maxzoom'] = _.max([sourceLayer['maxzoom'], newLayer['maxzoom']])



}
/**
 * Combine stops for Layers with same ID
 * @param originLayerStops
 * @param newLayerStops
 */
function combineStops(originLayerStops, newLayerStops) {
  //Combine all the stops
  originLayerStops = _.union(originLayerStops, newLayerStops)
  //Sort them by key (zoomLevel)
  originLayerStops = _.sortBy(originLayerStops, function(element) { return element[1] })
  originLayerStops = _.sortBy(originLayerStops, function(element) { return element[0] })
  originLayerStops = clearUpStops(originLayerStops)

  return originLayerStops
}
/**
 * Remove unnecessary stops: Duplicates and different values for same zoom level
 * @param originLayerStops
 */
function clearUpStops(originLayerStops) {
  var stopsToRemove = []

  _.forEach(originLayerStops, function(stop, index){
    if (originLayerStops[index+1] &&
      stop[0] == originLayerStops[index+1][0])
      if (stop[1] <= originLayerStops[index+1][1])
        stopsToRemove.push(stop)
  })

  return _.difference(originLayerStops, stopsToRemove)
}
