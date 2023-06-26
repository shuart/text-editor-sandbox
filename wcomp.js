import { createAdler } from "./adler3.js"
// import style from "https://unpkg.com/chota@latest"

var HelloWorld = createAdler({
    tag:'hello-world',
    html:()=>/*html*/`
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/purecss@3.0.0/build/pure-min.css" integrity="sha384-X38yfunGUhNzHpBaEBsWLO+A0HDYOQi8ufWDkZ0k9e0eXz/tH3II7uKZ9msv++Ls" crossorigin="anonymous">
        <div class="target">target</div>
        <button class="pure-button">A Pure Button</button>
    `,
    onRender:(self) =>{
        self.useEffect(
            ()=>{
                console.log(self.shadowRoot);
              self.query('.target').innerText = self.test 
            }
        );

        setTimeout(function (params) {
            self.test = 45
        },3000)
    },
})

export {HelloWorld}