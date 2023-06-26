import createEditor from './dist/module.js'
import { createReader } from './reader.js'
import { HelloWorld } from './wcomp.js'
import { treeView } from './treeView.js'

//var editor = createEditor({container:document.querySelector('.element')})
var editor = createEditor()
editor.addEditor(document.querySelector('.element'))




var webcomp = document.createElement("hello-world")

document.body.appendChild(webcomp)
console.log(webcomp.test);
webcomp.test = 8
console.log(webcomp.test);

var attTest = document.createElement("div")
document.body.appendChild(attTest)
attTest.innerHTML ='<hello-world test="2"></hello-world> <tree-view test="2"></tree-view>'

document.querySelector(".json").addEventListener('click', function(){

  console.log(editor);
  var jsonstate = editor.getEditor().state.toJSON()
  console.log(editor.getFullText());
  document.querySelector(".json").innerHTML= JSON.stringify(jsonstate, null, 3)
  console.log(JSON.stringify(jsonstate, null, 3) )

  var reader = createReader(editor.getFullText())
  document.body.appendChild(reader.getDomElement())
  reader.play()
})

