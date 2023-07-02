import { createAdler } from "./adler3.js"
// import style from "https://unpkg.com/chota@latest"


// var svgRender = function (path) {
//     return "<svg viewBox='0 0 24 24' stroke-linecap='round' stroke='black' stroke-width='2' fill='none' widht='18' height='18' ><path d='"+path+"'></path></svg>"
// }


var renderFolder = function (self, folder, level) {
    console.log(self.folderIconPath);
    var folderTemplate = self.tpl((p)=>`<p class="folder">${self.folderIconPath} ${p.name}<p>`)
    var domElement = folderTemplate({name:folder.name})
    domElement.style.paddingLeft= (self.paddingSize*level)+"px"
    domElement.addEventListener("click", ()=> {
        folder.closed= !folder.closed
        console.log(self.treeJson);
        // self.update()
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
    var fileTemplate = self.tpl((p)=>`<p class="file">${self.fileIconPath}  file=${p.name}<p>`)
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
        folderIconPath:`<svg viewBox="0 0 24 24" width="18" height="18" stroke="black" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>`,
        fileIconPath:`<svg viewBox="0 0 24 24" width="18" height="18" stroke="black" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>`,
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
    css:/*css*/`
    :host {
        color: deeppink;
    }
    .file {
        color: black;
        cursor:pointer;
    }
    .folder:hover {
        margin-left:2px;
    }
    .folder {
        color: black;
        cursor:pointer;
    }
    `,
})

export {treeView}