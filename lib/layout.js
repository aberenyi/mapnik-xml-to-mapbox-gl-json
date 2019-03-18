const helper = require('./helper.js')

module.exports = layout

function layout(inputRule)
{
  // ignore if undefined or field name is not specified
  if (inputRule['TextSymbolizer'] && inputRule['TextSymbolizer']['_'])
  {
    return TextSymbolizer(inputRule['TextSymbolizer'])
  }
  else if (inputRule['LineSymbolizer'])
  {
    return LineSymbolizer(inputRule['TextSymbolizer'])
  }
}

function TextSymbolizer(textSymbolizer)
{
  const layout = {}
  layout['text-field'] = '{' + textSymbolizer['_'].replace(/(\[|\])/g, '') + '}'

  // layout['text-max-size'] = 22
  // layout['text-max-width'] = 10

  if (textSymbolizer['face-name'])
  {
    // DejaVu Sans is not hosted on tilehosting.com
    layout['text-font'] = [textSymbolizer['face-name'].replace('DejaVu', 'Noto')]
  }

  if (textSymbolizer['allow-overlap'])
  {
    layout['text-allow-overlap'] = textSymbolizer['allow-overlap'] === 'true'
  }

  if (textSymbolizer['size'])
  {
    const textSize = parseFloat(textSymbolizer['size'])
    const stops = []

    if (textSymbolizer['MaxScaleDenominator'])
    {
      stops.push([helper.scaleDenominatorToZoomLevel(parseInt(textSymbolizer['MaxScaleDenominator'])), textSize])
    }

    if (textSymbolizer['MinScaleDenominator'])
    {
      stops.push([helper.scaleDenominatorToZoomLevel(parseInt(textSymbolizer['MinScaleDenominator'])), textSize])
    }

    //Same text size for all zoom levels
    if (!parseInt(textSymbolizer['MinScaleDenominator']) && !parseInt(textSymbolizer['MaxScaleDenominator']))
    {
      layout['text-size'] = parseFloat(textSymbolizer['size'])
    }
    else
    {
      layout['text-size'] = { stops }
    }
  }

  return layout
}


  // TODO PointSymbolizers
  /*if (inputRule['PointSymbolizer']) {
      var inputPointSymbol = inputRule['PointSymbolizer']
      var path = ''
      var iconImage = inputPointSymbol['file'].split('.')[0]
      layout['icon-image'] = 'Textures/enkeltminner_punkt_ark'
  }*/

function LineSymbolizer(lineSymbolizer)
{
  const layout = {}

  if (lineSymbolizer['stroke-linecap'])
  {
    layout['line-cap'] = lineSymbolizer['stroke-linecap']
  }

  if (lineSymbolizer['stroke-linejoin'])
  {
    layout['line-join'] = lineSymbolizer['stroke-linejoin']
  }

  return layout
}
