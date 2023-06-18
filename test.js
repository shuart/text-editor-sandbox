import createEditor from './dist/module.js'
import { createReader } from './reader.js'

//var editor = createEditor({container:document.querySelector('.element')})
var editor = createEditor()
editor.addEditor(document.querySelector('.element'))


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

