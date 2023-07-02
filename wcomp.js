import { createAdler } from "./adler3.js"
// import style from "https://unpkg.com/chota@latest"

var HelloWorld = createAdler({
    tag:'hello-world',
    props:{
        to_print:"plouf",
        to_print_reac:"plouf2",
    },
    attributes:[
        "to_print",
        "to_print_reac",
    ],
    html:()=>/*html*/`
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/purecss@3.0.0/build/pure-min.css" integrity="sha384-X38yfunGUhNzHpBaEBsWLO+A0HDYOQi8ufWDkZ0k9e0eXz/tH3II7uKZ9msv++Ls" crossorigin="anonymous">
        <div class="target2">target</div>
        <button class="pure-button"><div class="target">target</div></button>
    `,
    onRender:(self) =>{
        self.useEffect(
            ()=>{
                console.trace(self.shadowRoot);
              self.query('.target').innerText = self.to_print 
            }
        );
        self.useEffect(
            ()=>{
                console.trace(self.shadowRoot);
              self.query('.target2').innerText = self.to_print_reac 
            }
        );
        console.trace("whole restart why???");
        setTimeout(function (params) {
            self.to_print = 45
        },3000)
    },
})

export {HelloWorld}