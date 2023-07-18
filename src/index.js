import {EditorState} from "prosemirror-state"
import {EditorView} from "prosemirror-view"
import {Schema, DOMParser} from "prosemirror-model"
import {schema} from "prosemirror-schema-basic"
import {addListNodes} from "prosemirror-schema-list"
import { splitListItem } from 'prosemirror-schema-list';
import {exampleSetup} from "prosemirror-example-setup"
import {keymap} from "prosemirror-keymap"
import {chainCommands, newlineInCode, createParagraphNear, liftEmptyBlock, splitBlock} from "prosemirror-commands"
import {lintPlugin} from "./customPlugins.js"
import {createCustomHighlighter} from "./highlighter.js"
import {addMentionNodes, addTagNodes,addArrowNodes, getMentionsPlugin} from './mention'

// Mix the nodes from prosemirror-schema-list into the basic schema to
// create a schema with list support.
//const mySchema = new Schema({
//  nodes: addListNodes(schema.spec.nodes, "paragraph block*", "block"),
//  marks: schema.spec.marks
//})

var createEditor = function({
  initialJson=undefined,
  initialDomValue = "",
  tagsCallbacks={
    "arrow": (e,view)=> console.log(e),
    "hashtag": (e,view)=> console.log(e),
    "at": (e,view)=> console.log(e),
  },
  tags ={
    "arrow": [{id:1,tag: '-> abc'}, {id:2,tag: '-> 123'},],
    "hashtag": [{id:1,tag: 'abc'}, {id:2,tag: '123'}, ],
    "at": [{name: 'John Doe', id: '101', email: 'joe@abc.com'}, {name: 'Joe Lewis', id: '102', email: 'lewis@abc.com'}],
  }
  }={}){
  var self={}
  var editorElement= undefined
  var tagsArrays ={
    "arrow": tags["arrow"] || [],
    "hashtag": tags["hashtag"] || [{tag: 'WikiLeaks'}, {tag: 'NetNeutrality'}, {tag: 'NetNeutrality'}],
    "at": tags["at"] || [{name: 'John Doe', id: '101', email: 'joe@gmail.com'}, {name: 'Joe Lewis', id: '102', email: 'lewis@gmail.com'}],
  }



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

  var plugins = exampleSetup({schema: mySchema}).concat(lintPlugin).concat(createCustomHighlighter())

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

  function getNodeEndpoints(context, node) {
    let offset = 0

    if(context === node) return { from: offset, to: offset + node.nodeSize }

    if(node.isBlock) {
      for(let i=0; i<context.content.content.length; i++) {
        let result = getNodeEndpoints(context.content.content[i], node)
        if(result) return {
          from: result.from + offset + (context.type.kind === null ? 0 : 1),
          to: result.to + offset + (context.type.kind === null ? 0 : 1)
        }
        offset += context.content.content[i].nodeSize
      }
      return null
    } else {
      return null
    }
  }

  const onEnter = (EditorState, dispatch, EditorView) => {
    console.log("ddd");
    console.log(EditorState);
    console.log(EditorState.selection.$head.parent.textContent);
    //check if line is indented
    var previousText =window.view.state.selection.$head.parent.textContent
    var previousLineWhitespaces = ""
    var searchIndex = 0
    console.log(previousText[1] == " ");
    console.log(previousText[1]);
    if (previousText[searchIndex] == " ") {
      while (previousText[searchIndex] == " ") {
        searchIndex++
        previousLineWhitespaces +=" "
      }
    }
    //const blockType = EditorState.selection.$head.parent;
    chainCommands(newlineInCode, createParagraphNear, liftEmptyBlock, splitBlock)(EditorState, dispatch) //The default binding for Enter tries newlineInCode, createParagraphNear, liftEmptyBlock, splitBlock, in that order
    //splitListItem(mySchema.nodes.list_item)(EditorState, dispatch)
    // const { parent } = state.selection.$from;
    // const isInline = parent.inlineContent;
      if (searchIndex > 0 ) { //add whitespaces to next line
        console.log(window.view.state.selection.$head.parent.textContent);
        const { from, to } = window.view.state.selection;
        const { tr } = window.view.state;
        // tr.setSelection()
        tr.insertText(previousLineWhitespaces, from);
        // tr.insertText("token", to + 1);
        window.view.dispatch(tr);
      }
    // if (!isInline) return false;
    return true;
    // setBlockType(blockType.type, blockType.attrs)(window.view.state, window.view.dispatch, window.view)
  }

  function insertIndent(state, dispatch,EditorView) {
    //dispatch(state.tr.insertText("    "))
    onEnter(state, dispatch, EditorView)
    // alert("fesfes")
    return true
  }

  var customKM = keymap({
    "Tab": insertTab,
      });
  var customEnter= keymap({
    "Enter": insertIndent,
      });

  function findRegExp(findTerm,caseSensitive) {
      return RegExp(findTerm, !caseSensitive ? "i" : "")
    }
  function findInNode(root, node, term) {
    console.log(findRegExp(term))
    console.log(node)
    var findResult = term;
    console.log(findResult)
    if (findResult.findRegExp == undefined){
      console.log(findResult.findRegExp )
      findResult ={
        findTerm:[],
        findRegExp:findRegExp(term),
      }
    }
    let ret = []

    if(node.text) {
      let index = 0, foundAt, ep = getNodeEndpoints(root, node)
      while((foundAt = node.textContent.slice(index).search(findResult.findRegExp)) > -1) {
        //let sel = new TextSelection(ep.from + index + foundAt + 1, ep.from + index + foundAt + findResult.findTerm.length + 1)
        let sel = node
        console.log(node)
        return node
        ret.push(sel)
        index = index + foundAt + findResult.findTerm.length
      }
    } else {
      node.content.forEach((child, i) => ret = ret.concat(findInNode(root,child, findResult)))
    }
    console.log(ret, ret)
    return ret
  }

  var mentionPlugin = getMentionsPlugin({
      functionOnClick: tagsCallbacks,
      getSuggestions: (type, text, done) => {
        console.log(text);
        setTimeout(() => {
          if (type === 'mention') {
              // pass dummy mention suggestions
              done(( tagsArrays["at"].filter(e => e.name.toLowerCase().search(text.toLowerCase()) >=0) ))
          } else if (type === 'tag') {
              // pass dummy tag suggestions
              done( ( tagsArrays["hashtag"].filter(e => e.tag.toLowerCase().search(text.toLowerCase()) >=0) ))
          }else{
              done(   ( tagsArrays["arrow"].filter(e => e.tag.toLowerCase().search(text.toLowerCase()) >=0) )  )
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


  plugins.unshift(customKM); // push it before keymap plugin to override keydown handlers
  plugins.unshift(customEnter); // push it before keymap plugin to override keydown handlers)
  plugins.unshift(mentionPlugin); // push it before keymap plugin to override keydown handlers

  //mention


  var addEditor = function (element) {
    var currentDoc =DOMParser.fromSchema(mySchema).parse(initialDomValue)
    if (initialJson) {
      currentDoc =mySchema.nodeFromJSON(initialJson)
    }
    
    if (document.querySelector("#content")) {
      currentDoc = DOMParser.fromSchema(mySchema).parse(document.querySelector("#content"))
    }

    window.view = new EditorView(element, {
    state: EditorState.create({
        doc: currentDoc,
        plugins: plugins
      // plugins: prosemirrorExampleSetup.exampleSetup({schema: prosemirrorSchemaBasic.schema}).concat(lintPlugin)
      })
    })
    editorElement = window.view 
    return window.view ;
  }
  var getEditor = function () {
    return editorElement
  }
  var setTags = function(tagName, values){
    tagsArrays[tagName] = values
  }

  var getFullText = function(){
    return editorElement.state.doc.textBetween(0, editorElement.state.doc.nodeSize - 2, '\n', '\n')
  }

  self.findInNode = findInNode
  self.getFullText = getFullText
  self.addEditor = addEditor
  self.setTags = setTags
  self.getEditor = getEditor

  return self

}

export default createEditor
