import {EditorState} from "prosemirror-state"
import {EditorView} from "prosemirror-view"
import {Schema, DOMParser} from "prosemirror-model"
import {schema} from "prosemirror-schema-basic"
import {addListNodes} from "prosemirror-schema-list"
import {exampleSetup} from "prosemirror-example-setup"
import {keymap} from "prosemirror-keymap"
import {lintPlugin} from "./customPlugins.js"
import {addMentionNodes, addTagNodes,addArrowNodes, getMentionsPlugin} from './mention'

// Mix the nodes from prosemirror-schema-list into the basic schema to
// create a schema with list support.
//const mySchema = new Schema({
//  nodes: addListNodes(schema.spec.nodes, "paragraph block*", "block"),
//  marks: schema.spec.marks
//})


var mySchema = new Schema( {
    nodes: addArrowNodes( addTagNodes( addMentionNodes(addListNodes(schema.spec.nodes, "paragraph block*", "block")) ) ),
    marks: schema.spec.marks
});


//Mention
/**
 * IMPORTANT: outer div's "suggestion-item-list" class is mandatory. The plugin uses this class for querying.
 * IMPORTANT: inner div's "suggestion-item" class is mandatory too for the same reasons
 */
var getMentionSuggestionsHTML = items => '<div class="suggestion-item-list">'+
  items.map(i => '<div class="suggestion-item">'+i.name+'</div>').join('')+
'</div>';

/**
 * IMPORTANT: outer div's "suggestion-item-list" class is mandatory. The plugin uses this class for querying.
 * IMPORTANT: inner div's "suggestion-item" class is mandatory too for the same reasons
 */
var getTagSuggestionsHTML = items => '<div class="suggestion-item-list">'+
  items.map(i => '<div class="suggestion-item">'+i.tag+'</div>').join('')+
'</div>';

var plugins = exampleSetup({schema: mySchema}).concat(lintPlugin)

// function insertTab(state, dispatch) {
//   let type = mySchema.nodes.text
//   let {$from} = state.selection
//   if (!$from.parent.canReplaceWith($from.index(), $from.index(), type))
//     return false
//   dispatch(state.tr.replaceSelectionWith(type.create()))
//   return true
// }
function insertTab(state, dispatch) {
  dispatch(state.tr.insertText("    "))
  return true
}


var customKM = keymap({
  "Tab": insertTab,
    });

function findRegExp(findTerm,caseSensitive) {
    return RegExp(findTerm, !caseSensitive ? "i" : "")
  }
function findInNode(node, findRegExp) {
  console.log(findRegExp)
  console.log(node)
  let findResult ={
    findTerm:[],
    findRegExp:findRegExp,
  }
  let ret = []

  if(node.isTextblock) {
    let index = 0, foundAt, ep = getNodeEndpoints(pm.doc, node)
    while((foundAt = node.textContent.slice(index).search(findResult.findRegExp)) > -1) {
      let sel = new TextSelection(ep.from + index + foundAt + 1, ep.from + index + foundAt + findResult.findTerm.length + 1)
      ret.push(sel)
      index = index + foundAt + findResult.findTerm.length
    }
  } else {
    node.content.forEach((child, i) => ret = ret.concat(findInNode(child, findResult)))
  }
  return ret
}

var mentionPlugin = getMentionsPlugin({
    functionOnClick: (event, view)=> {
      //findInNode(view.doc, "test")
      console.log("teest")
    },
    getSuggestions: (type, text, done) => {
      setTimeout(() => {
        if (type === 'mention') {
            // pass dummy mention suggestions
            done([{name: 'John Doe', id: '101', email: 'joe@gmail.com'}, {name: 'Joe Lewis', id: '102', email: 'lewis@gmail.com'}])
        } else if (type === 'tag') {
            // pass dummy tag suggestions
            done([{tag: 'WikiLeaks'}, {tag: 'NetNeutrality'}, {tag: 'NetNeutrality'}])
        }else{
            done([{id:1,tag: '-> WikiLeaks'}, {id:2,tag: '-> NetNeutrality'}, {id:3,tag: '-> NetNeutrality'}])
        }
        
      }, 0);
    },
    getSuggestionsHTML: (items, type) =>  {
      if (type === 'mention') {
        return getMentionSuggestionsHTML(items)
      } else if (type === 'tag') {
        return getTagSuggestionsHTML(items)
      } else if (type === 'arrow') {
        return getTagSuggestionsHTML(items)
      }
      
    }
});

plugins.unshift(mentionPlugin); // push it before keymap plugin to override keydown handlers
plugins.unshift(customKM); // push it before keymap plugin to override keydown handlers

//mention


var createEditor = function (element) {

  window.view = new EditorView(element, {
  state: EditorState.create({
      doc: DOMParser.fromSchema(mySchema).parse(document.querySelector("#content")),
      plugins: plugins
     // plugins: prosemirrorExampleSetup.exampleSetup({schema: prosemirrorSchemaBasic.schema}).concat(lintPlugin)
    })
  })
  return window.view ;
}

export default createEditor
