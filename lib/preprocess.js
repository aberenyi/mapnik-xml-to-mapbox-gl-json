const _ = require('underscore')
const filter = require('./filter.js')

module.exports = preprocess

function preprocess(inputXML)
{
  // add support for lone layers
  const layers = Array.isArray(inputXML['Layer']) ? inputXML['Layer'] : [inputXML['Layer']]
  const styles = Array.isArray(inputXML['Style']) ? inputXML['Style'] : [inputXML['Style']]
  
  // Merges the Style into their corresponding Layer
  layers.forEach((layer, index, layers) =>
  {
    // Get all styles from 'Style' array if the current 'StyleName' matches

    // Skip layers without styles
    if (!layer['StyleName'] || layer['StyleName'] === '')
      return 

    if (!_.isArray(layers[index].styles))
      layers[index].styles = []

    if (_.isArray(layer['StyleName']))
      layer['StyleName'].forEach(function(styleName) {
        layers[index].styles.push(_.find(styles, function(style) {
          return style['name'] == styleName
        }))
      })
    else
      layers[index].styles.push(_.find(styles, function(style) {
        return style['name'] == layer['StyleName']
      }))

    delete layers[index]['StyleName']

  })

  // Parse all filters using filter.js
  layers.forEach(layer =>
  {
    // Skip layers without styles
    if (!layer['styles']) {
      return 
    }

    // Loop all styles previously added to 'Layer'
    layer['styles']
      .filter(style => style)
      .forEach(style =>
      {
        // Are there more than one rule?
        if (Array.isArray(style['Rule']))
        {
          style['Rule'].forEach(rule =>
          {
            // For each rule, parse its filter.. if exists
            if (rule.hasOwnProperty('Filter'))
            {
              rule['Filter'] = filter(rule['Filter'])
            }
          })
        }
        // Only one rule, parse its filter if it exists
        else if (style['Rule'] && style['Rule'].hasOwnProperty('Filter'))
        {
          style['Rule']['Filter'] = filter(style['Rule']['Filter'])
        }
    })
  })

  delete inputXML['Style']

}
