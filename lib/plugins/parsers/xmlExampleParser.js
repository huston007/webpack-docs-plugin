var path = require('path');
var parse = require('posthtml-parser');
var render = require('posthtml-render');

var Example = require('../../data/Example');
var ExampleFile = require('../../data/ExampleFile');

/**
 * @param node posthtml node
 * @returns {boolean}
 */
function hasChildren(node) {
  return node.content &&
         Array.isArray(node.content) &&
         node.content.join('').trim() != '';
}

/**
 * @param {string} content
 * @returns {Array<Example>|null}
 */
module.exports = function (content) {
  if (content.trim() == '' || content.indexOf('<example') == -1)
    return [];

  var examples = [];
  var tree = parse(content);

  tree
  .filter(function (node) { return node.tag && node.tag == 'example' })
  .forEach(function (node) {

    // Example
    var example = new Example({
      attrs: node.attrs,
      files: []
    });
    examples.push(example);

    if (!hasChildren(node))
      return;

    // Files
    node.content
    .filter(function (node) { return node.tag && node.tag == 'file' })
    .forEach(function (node, itemIndex) {
      // Skip empty file tags
      if (!hasChildren(node))
        return;

      var file = new ExampleFile({
        attrs: node.attrs,
        source: render(node.content)
      });

      file.type = file.attrs.name ? path.extname(file.attrs.name).substr(1) : null;
      file.type = file.attrs.type ? file.attrs.type : file.type;

      example.files.push(file);
    });
  });

  return examples;
};