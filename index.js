const _ = require('underscore')
const argv = require('optimist').argv
const preprocess = require('./lib/preprocess.js')
const postprocess = require('./lib/postprocess.js')
const layers = require('./lib/layers.js')
const hide = require('./lib/additions/hide.js')

module.exports = generateJSON

function generateJSON(inputXML, settings, callback)
{
  // take care of the filters
  preprocess(inputXML)

  // this is where all the styles are processed
  const outputJSON = settings
  outputJSON["layers"] = layers(inputXML, settings)

  postprocess(outputJSON)

  if (argv.c)
  {
    _.each(outputJSON["layers"], function(layer, index, layerList)
    {
      layerList[index] = hide(layer)
    })
  }

  return callback(null, outputJSON)
}


