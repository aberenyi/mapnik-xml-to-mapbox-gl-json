const helper = require('./helper.js')

module.exports =
{
  minZoom,
  maxZoom
}

function minZoom(inputRule)
{
  return helper.scaleDenominatorToZoomLevel(parseInt(inputRule['MaxScaleDenominator']))
}

function maxZoom(inputRule)
{
  return helper.scaleDenominatorToZoomLevel(parseInt(inputRule['MinScaleDenominator']))
}
