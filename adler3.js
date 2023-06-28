var subscriberStore =[];
var currentListener = undefined;
var currentComponent = undefined;

function createSignal(initialValue) {
    var self = {}
	let value = initialValue;
	// a set of callback functions, from createEffect
	const subscribers = new Set();
    const SignalObjectHandler = {
        get: (target, key) => {
            if(typeof target[key] === "object" && target[key] !== null) {
            return new Proxy(target[key], SignalObjectHandler)
            }
    
            return target[key]
        },
        set: (target, prop, value) => {
            target[prop] = value
            console.log("A change was made in a deep object!")
            subscribers.forEach((fn) => fn[0](fn[1]));
            return true
        }
    }

	const read = () => {
		if (currentListener !== undefined && currentComponent !== undefined) {
			// before returning, track the current listener
			subscribers.add([currentListener, currentComponent]);
		}
        if (typeof value === "object") {
            return new Proxy(value, SignalObjectHandler)
        }
		return value;
	};
	const write = (newValue) => {
		value = newValue;
		// after setting the value, run any subscriber, aka effect, functions
		subscribers.forEach((fn) => fn[0](fn[1]));
	};

    const isSignal =()=> true;

    self.set = write
    self.get = read
    self.isSignal = isSignal
	return self;
}

function createEffect(callback, component) {
	currentListener = callback;
	currentComponent = component;
    console.log(component);
	callback(component);
	currentListener = undefined;
	currentComponent = undefined;
}

var createAdler = function ({
    tag = 'new-element',
    props={
        test:5,
        test2:8,
    },
    attributes=[
        "test",
    ],
    onRender=(self) => console.log("on connect",self),
    onBeforeRender=(self) => console.log("on before render",self),
    lifeCycle = [
        ["connected", (self)=> console.log(self)]
    ],
    events = [
        ["click", 'p', (event, self)=> console.log(self)]
    ],
    effects=[
        (d)=> console.log("i am an effect at", d.test),
    ],
    html = ()=>/*html*/`<p>Hello World</p>`,
    css=/*css*/`:host {color: deeppink;}`,
    cssfiles=[],
    debugLog= false,
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
    var setProps = function (component, holderData) {
        for (const key in props) {
            if (props.hasOwnProperty(key)) {
                // holderData[key] = props[key]
                holderData[key] = createSignal(props[key])
                Object.defineProperty(component, key, { //add getters and setters https://stackoverflow.com/questions/68769030/js-define-getter-for-every-property-of-a-class
                    get() {
                        if (debugLog) {console.log(`(Getting "${key}")`); }
                        
                        // return holderData.get(this)[key];
                        return holderData[key].get();
                    },
                    set(value) {
                        if (debugLog) {console.trace(`(Setting "${key}" to "${value}")`); }
                        
                        holderData[key].set(value);
                        // holderData.get(this)[key] = value;
                    }
                }); 
                console.log(`${key}: ${props[key]}`);
            }
        }
    }
    var setEffects = function (component) {
        for (let i = 0; i < effects.length; i++) {
            const effect = effects[i];
            createEffect(effect, component);
        }
    }
    var utilsToDomElement = function (html) {
        var element = document.createElement("div")
        element.innerHTML = html
        return element
    }
    var utilsToTemplate = function (htmlFunction) {
        return function(p){
            var element = document.createElement("div")
            element.innerHTML = htmlFunction(p)
            return element
        }
    }
    var createWebcomponent = function () {
        const stylesheet = new CSSStyleSheet()
        stylesheet.replaceSync(css)

        class newComponent extends HTMLElement {

            #holderData ={}
            shadowRoot = this.attachShadow({ mode: "open" })
            //ADLER METHODS
            useEffect = function (callback) {
                createEffect(callback, this)
            }
            query = function (selector) {
                return this.shadowRoot.querySelector(selector)
            }
            toDom = utilsToDomElement
            tpl = utilsToTemplate
            
            //END ADLER METHODS

            constructor() {
                super();
                
                setProps(this, this.#holderData)
                
                console.log("component created", this);
            }
            
            static get observedAttributes() {
                return attributes;
            }

            beforeRender = function () {
                onBeforeRender(this)
            }

            renderElement = function () {
                setEffects(this)
                
                this.shadowRoot.adoptedStyleSheets = [stylesheet].concat(cssfiles) //Add local css or external stylesheets
                this.shadowRoot.innerHTML = currentHtml();
                iterateLifeCycle(lifeCycle, 'connected', this)
                onRender(this)
                iterateEvents(events, this )// Add event listeners when connected
            }
            update = function () {
                setEffects(this)
                this.shadowRoot.innerHTML = currentHtml();
                iterateLifeCycle(lifeCycle, 'connected', this)
                onRender(this)
                iterateEvents(events, this )// Add event listeners when connected
            }

            connectedCallback() {
                this.beforeRender()
                this.renderElement()
            }

            disconnectedCallback() {
                disconnectEvents(this)// Remove the registered event listeners when disconnected
                iterateLifeCycle(lifeCycle, 'disconnected', this)
            }

            attributeChangedCallback(name, oldValue, newValue) {  
                console.log(name,newValue);
                if (oldValue == newValue) {return}
                this[name] = newValue //use the setters and getters to record change in local state
            }

        } 
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