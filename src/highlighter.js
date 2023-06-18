//linter 

import {Decoration, DecorationSet} from "prosemirror-view"
import {Plugin,PluginKey, TextSelection} from "prosemirror-state"

var toLint = [
  {regexExp:/=== .* ===/ig, classSuffix:"knot", quickStyle:{bold:true,color:"#11a88c"}},
  {regexExp:/\*/ig, classSuffix:"choice", quickStyle:{bold:true,color:"#11a88c"}}, 
  {regexExp:/\[(.*?)\]/gi, classSuffix:"suppressor", quickStyle:{bold:true,color:false}},
]

function addCss(cssText){
  var style = document.createElement('style');
  style.innerHTML = cssText;
  document.head.appendChild(style);
}

var createCustomHighlighter = function(){
  
  var cssToAdd = ''
  for (let i = 0; i < toLint.length; i++) {
    if (toLint[i].quickStyle){
      cssToAdd +=".prose_highlight_"+toLint[i].classSuffix+"{"
      if (toLint[i].quickStyle.bold){
        cssToAdd +="font-weight: bold;"
      }
      if (toLint[i].quickStyle.italic){
        cssToAdd +="font-style: italic;"
      }
      if (toLint[i].quickStyle.color){
        cssToAdd +="color:"+toLint[i].quickStyle.color+";"
      }
      cssToAdd +="}";
      addCss(cssToAdd)
    }
  }



  function lintDeco(doc) {
    let decos = []
    lint(doc).forEach(prob => {
      decos.push(Decoration.inline(prob.from, prob.to, {class: "prose_highlight_"+prob.classSuffix}),
                 Decoration.widget(prob.from, lintIcon(prob)))
    })
    return DecorationSet.create(doc, decos)
  }

  function lintIcon(prob) {
    let icon = document.createElement("div")
    icon.className = "lint-icon"
    icon.title = prob.msg
    icon.problem = prob
    return icon
  }

  const knots = /=== .* ===/ig

  // Words you probably shouldn't use
  const badWords = /\b(obviously|clearly|evidently|simply)\b/ig
  // Matches punctuation with a space before it
  const badPunc = / ([,\.!?:]) ?/g
  // Matches punctuation with a space before it
  const goToLinks = /->/ig

  function lint(doc) {
    let result = [], lastHeadLevel = null

    function record(msg, from, to,classSuffix, fix) {
      result.push({msg, from, to, classSuffix, fix})
    }

    // For each node in the document
    doc.descendants((node, pos) => {
      if (node.isText) {
        // Scan text nodes for suspicious patterns
        let m
        
        for (let i = 0; i < toLint.length; i++) {
          while (m = toLint[i].regexExp.exec(node.text)){
            record(`${toLint[i].classSuffix} '${m[0]}'`, pos + m.index, pos + m.index + m[0].length, toLint[i].classSuffix)
          }
        }
        

          
      //   while (m = goToLinks.exec(node.text))
      //     record(`GoTo '${m[0]}'`,
      //            pos + m.index, pos + m.index + m[0].length)
      //   while (m = badWords.exec(node.text))
      //     record(`Try not to say '${m[0]}'`,
      //            pos + m.index, pos + m.index + m[0].length)
      //   while (m = badPunc.exec(node.text))
      //     record("Suspicious spacing around punctuation",
      //            pos + m.index, pos + m.index + m[0].length,
      //            fixPunc(m[1] + " "))
      // } else if (node.type.name == "heading") {
        // Check whether heading levels fit under the current level
      //   let level = node.attrs.level
      //   if (lastHeadLevel != null && level > lastHeadLevel + 1)
      //     record(`Heading too small (${level} under ${lastHeadLevel})`,
      //            pos + 1, pos + 1 + node.content.size,
      //            fixHeader(lastHeadLevel + 1))
      //   lastHeadLevel = level
      // } else if (node.type.name == "image" && !node.attrs.alt) {
        // Ensure images have alt text
      //   record("Image without alt text", pos, pos + 1, addAlt)
      }
    })

    return result
  }

  function fixPunc(replacement) {
    return function({state, dispatch}) {
      dispatch(state.tr.replaceWith(this.from, this.to,
                                    state.schema.text(replacement)))
    }
  }

  function fixHeader(level) {
    return function({state, dispatch}) {
      dispatch(state.tr.setNodeMarkup(this.from - 1, null, {level}))
    }
  }

  function addAlt({state, dispatch}) {
    let alt = prompt("Alt text", "")
    if (alt) {
      let attrs = Object.assign({}, state.doc.nodeAt(this.from).attrs, {alt})
      dispatch(state.tr.setNodeMarkup(this.from, null, attrs))
    }
  }


  return new Plugin({
    key: new PluginKey("customHighlighter"),
    state: {
      init(_, {doc}) { return lintDeco(doc) },
      apply(tr, old) { return tr.docChanged ? lintDeco(tr.doc) : old }
    },
    props: {
      decorations(state) { return this.getState(state) },
      handleClick(view, _, event) {
        if (/lint-icon/.test(event.target.className)) {
          let {from, to} = event.target.problem
          view.dispatch(
            view.state.tr
              .setSelection(TextSelection.create(view.state.doc, from, to))
              .scrollIntoView())
          return true
        }
      },
      handleDoubleClick(view, _, event) {
        if (/lint-icon/.test(event.target.className)) {
          let prob = event.target.problem
          if (prob.fix) {
            prob.fix(view)
            view.focus()
            return true
          }
        }
      }
    }
  })

}





export {createCustomHighlighter}



