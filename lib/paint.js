const helper = require('./helper.js')

module.exports = paint

function paint(inputRule, type)
{
  switch (type)
  {
    case 'fill':
      return paintFill(inputRule)
    case 'line':
      return paintLine(inputRule)
    case 'symbol':
      return paintSymbol(inputRule)
  }
}

function paintFill(inputRule)
{
  if (inputRule['PolygonSymbolizer'])
  {
    return paintFillPolygon(inputRule)
  }

  if (inputRule['PolygonPatternSymbolizer'])
  {
    return paintFillImage(inputRule['PolygonPatternSymbolizer']['file'])
  }
}

function paintFillPolygon(inputRule)
{
  // Default grey according to Mapnik XML reference
  // FIXME? check this...maybe make this configurable?
  let fill = '#e3e3e3'
  let fillOpacity = 1
  if (inputRule['PolygonSymbolizer']['fill'])
  {
    fill = inputRule['PolygonSymbolizer']['fill']
  }
  if (inputRule['PolygonSymbolizer']['fill-opacity'])
  {
    fillOpacity = parseFloat(inputRule['PolygonSymbolizer']['fill-opacity'])
  }
  const fillColorStops = []
  const fillOpacityStops = []
  if (inputRule['MaxScaleDenominator'])
  {
    fillColorStops.push([helper.scaleDenominatorToZoomLevel(parseInt(inputRule['MaxScaleDenominator'])), fill])
    fillOpacityStops.push([helper.scaleDenominatorToZoomLevel(parseInt(inputRule['MaxScaleDenominator'])), fillOpacity])
  }

  if (inputRule['MinScaleDenominator'])
  {
    fillColorStops.push([helper.scaleDenominatorToZoomLevel(parseInt(inputRule['MinScaleDenominator'])), fill])
    fillOpacityStops.push([helper.scaleDenominatorToZoomLevel(parseInt(inputRule['MinScaleDenominator'])), fillOpacity])
  }

  return {
    'fill-color': { stops: fillColorStops },
    'fill-opacity': { stops: fillOpacityStops }
  }
}

function paintFillImage(inputImage)
{
  return {
    // Split on '.' and keep first index in order to remove .png, .jpeg etc..
    'fill-image': inputImage.split('.')[0]
  }
}

function paintLine(inputRule)
{
  const paint = {}
  const inputLine = inputRule['LineSymbolizer']

  if (inputLine['stroke'])
  {
    paint['line-color'] = inputLine['stroke']
  }

  if (inputLine['stroke-opacity'])
  {
    const opacityStops = []
    const opacity = inputLine['stroke-opacity']
    if (inputRule['MaxScaleDenominator'])
    {
      opacityStops.push
      ([
        helper.scaleDenominatorToZoomLevel(parseInt(inputRule['MaxScaleDenominator'])),
        parseFloat(opacity)
      ])
    }

    if (inputRule['MinScaleDenominator'])
    {
      opacityStops.push
      ([
        helper.scaleDenominatorToZoomLevel(parseInt(inputRule['MinScaleDenominator'])),
        parseFloat(opacity)
      ])
    }

    paint['line-opacity'] = opacityStops.length > 0
      ? {stops: opacityStops}
      : parseFloat(inputLine['stroke-opacity'])
  }

  // line-width stops
  var lineWidth
  if (inputLine['stroke-width']) {
    lineWidth = parseFloat(inputLine['stroke-width'])

    stops = []

    if (inputRule['MaxScaleDenominator'])
      stops.push([helper.scaleDenominatorToZoomLevel(parseInt(inputRule['MaxScaleDenominator'])), lineWidth])

    if (inputRule['MinScaleDenominator'])
      stops.push([helper.scaleDenominatorToZoomLevel(parseInt(inputRule['MinScaleDenominator'])), lineWidth])


    if (stops.length > 0) {
      paint['line-width'] = {
        'stops': stops
      }
    }
    else
      paint['line-width'] = lineWidth
  }

  if (inputLine['stroke-dasharray']) {
    paint['line-dasharray'] = paintLineDashArray(inputLine['stroke-dasharray'], lineWidth)
  }

  /*
  if (inputLine['stroke']) {
      var lineStroke = paintLineDashArray(inputLine['stroke'])

      stops = []
      if (inputRule['MaxScaleDenominator'])
          stops.push([helper.scaleDenominatorToZoomLevel(parseInt(inputRule['MaxScaleDenominator'])), lineStroke])

      if (inputRule['MinScaleDenominator'])
          stops.push([helper.scaleDenominatorToZoomLevel(parseInt(inputRule['MinScaleDenominator'])), lineStroke])

      paint['line-color'] = {
          'stops': stops
      }
  }*/



  return paint
}

function paintLineDashArray(inputDashArray, lineWidth) {
  // var temp = inputDashArray.split(',')
  // var lineDashArray = []
  //
  // for(var i = 0; i < temp.length; i++)
  //   lineDashArray[i] = lineWidth ? parseFloat(temp[i]) / lineWidth : parseFloat(temp[i])
  //
  // return lineDashArray
  return inputDashArray
    .split(',')
    .map(v => parseInt(v.trim()))
}

function paintSymbol(inputRule) {

  // TODO Make two separate functions for TextSymbolizer and PointSymbolizer
  if (inputRule['TextSymbolizer'])
    return paintTextSymbol(inputRule)

  // if (inputRule['PointSymbolizer'])
  //     return paintPointSymbol(inputRule['PointSymbolizer']['file'])


}

// FIXME: move text-size from paint to layout
function paintTextSymbol(inputRule)
{
  const paint = {}
  const inputSymbol = inputRule['TextSymbolizer']

  if (inputSymbol['fill'])
  {
    paint['text-color'] = inputSymbol['fill']
  }

  // this is used to derive min- and maxzoom for TextSymbolizer layers, see layers.js #L74
  if (inputSymbol['opacity'])
  {
    const opacityStops = []
    if (inputRule['MaxScaleDenominator'])
    {
      opacityStops.push([helper.scaleDenominatorToZoomLevel(parseInt(inputRule['MaxScaleDenominator'])),
        parseFloat(inputSymbol['opacity'])])
    }
    else if (inputRule['MinScaleDenominator'])
    {
      opacityStops.push([helper.scaleDenominatorToZoomLevel(parseInt(inputRule['MinScaleDenominator'])),
        parseFloat(inputSymbol['opacity'])])
    }

    paint['text-opacity'] = {stops: opacityStops}
  }

  if (inputSymbol['halo-fill'])
  {
    paint['text-halo-color'] = inputSymbol['halo-fill']
  }

  if (inputSymbol['halo-radius'])
  {
    const haloRadiusStops = []
    if (inputRule['MaxScaleDenominator'])
    {
      haloRadiusStops.push([helper.scaleDenominatorToZoomLevel(parseInt(inputRule['MaxScaleDenominator'])),
        parseFloat(inputSymbol['halo-radius'])])
    }
    else if (inputRule['MinScaleDenominator'])
    {
      haloRadiusStops.push([helper.scaleDenominatorToZoomLevel(parseInt(inputRule['MinScaleDenominator'])),
        parseFloat(inputSymbol['halo-radius'])])
    }

    paint['text-halo-width'] = {stops: haloRadiusStops}
  }


  return paint
}
