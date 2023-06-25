import { createAdler } from "./adler3.js"

var HelloWorld = createAdler({
    tag:'hello-world',
    html:()=>/*html*/`
        <div class="target">target</div>
    `,
    onConnect:(self) =>{
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