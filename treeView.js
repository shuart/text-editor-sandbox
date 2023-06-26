import { createAdler } from "./adler3.js"
// import style from "https://unpkg.com/chota@latest"





var renderFolder = function (self, folder, level) {
    var folderTemplate = self.tpl((p)=>`<p> >${p.name}<p>`)
    console.log(self.treeJson);

    var domElement = folderTemplate({name:folder.name})
    domElement.style.paddingLeft= (self.paddingSize*level)+"px"
    domElement.addEventListener("click", ()=> {
        folder.closed= !folder.closed
        console.log(self.treeJson);
        self.update()
    })
    self.query('.tree_area').appendChild(domElement)

    if (folder.children && !folder.closed) {
        for (let i = 0; i < folder.children.length; i++) {
            const child = folder.children[i];
            if (child.type == "folder") {
                renderFolder(self, child, (level+1))
            }else if(child.type == "file"){
                renderFile(self, child, (level+1))
            }
        }
        
    }
}

var renderFile = function (self,file, level) {
    var fileTemplate = self.tpl((p)=>`<p> file=${p.name}<p>`)
    var domElement = fileTemplate({name:file.name})
    domElement.style.paddingLeft= (self.paddingSize*level)+"px"
    domElement.addEventListener("click", ()=> console.log(file))
    self.query('.tree_area').appendChild(domElement)
}

var renderComponent = function (self) {
    
    if (self.treeJson) {
        self.query('.tree_area').innerHTML =""

        for (let i = 0; i < self.treeJson.length; i++) {
            if (self.treeJson[i].type == "folder") {
                renderFolder(self, self.treeJson[i],0)
            }else if(self.treeJson.type == "file"){

            }
        }
    }else{
        self.query('.tree_area').innerHTML ="No tree"
    }
}

var treeView = createAdler({
    tag:'tree-view',
    props:{
        treeJson:undefined,
        paddingSize:10,
    },
    html:()=>/*html*/`
        <div class="tree_area">target</div>
        <button class="pure-button">A Pure Button</button>
    `,
    onBeforeRender:(self) =>{
        self.treeJson=[
            {name:"test", type:"folder"},
            {name:"test2", type:"folder",  children:[
                {name:"test", type:"file"},
                {name:"test2b", type:"folder", children:[
                    {name:"testb", type:"file"},
                ]},
            ]},
            {name:"test3", type:"folder"},
            {name:"test4", type:"folder"},
        ]
    },
    onRender:(self) =>{
        self.useEffect(
            ()=>{
                renderComponent(self)
            }
        );
    },
})

export {treeView}