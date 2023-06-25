var createAdler = function ({
    tag = 'new-element',
    lifeCycle = [
        ["connected", (self)=> console.log(self)]
    ],
    events = [
        ["click", 'p', (event, self)=> console.log(self)]
    ],
    html = `<p>Hello World</p>`,
    css=`:host {color: deeppink;}`,
    cssfiles=[],
}={}) {
    var self = {}
    var componentTag = tag
    var eventToDisconnect =[]
    var currentHtml = html
    var currentCss = css

    var iterateLifeCycle = function (items, category, componentClass) {
        for (let i = 0; i  < items.length; i++) {
            const event = items[i];
            if (event[0] == category) {
                event[1](componentClass)
            }
        }
    }
    var iterateEvents = function (items, componentClass) {
        for (let i = 0; i  < items.length; i++) {
            const event = items[i];
            var eventCallback = function (ev) {
                event[2](ev,componentClass)
            }
            const target = componentClass.shadowRoot.querySelector(event[1]);
            if (target) {
                // componentClass.ownerDocument.addEventListener(event[0], eventCallback)
                target.addEventListener(event[0], eventCallback)
                eventToDisconnect.push(event[0], target, eventCallback)
            }
            
        }
    }
    var disconnectEvents = function (componentClass) {
        for (let i = 0; i  < eventToDisconnect.length; i++) {
            const event = eventToDisconnect[i];
            // componentClass.ownerDocument.removeEventListener(eventToDisconnect[0], eventToDisconnect[2])
            eventToDisconnect[1].removeEventListener(eventToDisconnect[0], eventToDisconnect[2])
        }
    }

    var createWebcomponent = function () {
        const stylesheet = new CSSStyleSheet()

        stylesheet.replaceSync(css)
        class newComponent extends HTMLElement {
            #time = Date.now()
            shadowRoot = this.attachShadow({ mode: "open" })
            // This gets called automatically by the browser
            connectedCallback() {
                // this.start()
                // this.textContent = 'Hello World!';
                this.shadowRoot.adoptedStyleSheets = [stylesheet].concat(cssfiles) //Add local css or external stylesheets
                this.shadowRoot.innerHTML = currentHtml;
                iterateLifeCycle(lifeCycle, 'connected', this)
                iterateEvents(events, this )// Add event listeners when connected
            }

            disconnectedCallback() {
                disconnectEvents(this)// Remove the registered event listeners when disconnected
                iterateLifeCycle(lifeCycle, 'disconnected', this)
            }
        
            start() {
                console.log("timer started")
            }
          
        } //add getters and setters
        // for (const name of ["def", "x", "y", "z"]) {
        //     Object.defineProperty(Holder.prototype, name, {
        //         get() {
        //             console.log(`(Getting "${name}")`);
        //             return holderData.get(this)[name];
        //         },
        //         set(value) {
        //             console.log(`(Setting "${name}" to "${value}")`);
        //             holderData.get(this)[name] = value;
        //         }
        //     });
        // }
        console.log("register "+ componentTag);
        customElements.define( componentTag, newComponent );
        
    }
    
    var createComponenentElement = function () {
        var instance = document.createElement(componentTag)
        return instance
    }

    var instance = function () {
        var element =  createComponenentElement()
        return element
    }

    var mount = function (target) {
        var targetElement = document.body
        if (target) {
            targetElement = document.querySelector(target)
        }
        var element =  createComponenentElement()
        targetElement.appendChild(element)
    }

    var init = function () {
        createWebcomponent()
    }

    init()

    self.mount = mount
    self.instance = instance
    return self
}
export{createAdler}