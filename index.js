var $ltMAx$prosemirrorstate = require("prosemirror-state");
var $ltMAx$prosemirrorview = require("prosemirror-view");
var $ltMAx$prosemirrormodel = require("prosemirror-model");
var $ltMAx$prosemirrorschemabasic = require("prosemirror-schema-basic");
var $ltMAx$prosemirrorschemalist = require("prosemirror-schema-list");
var $ltMAx$prosemirrorexamplesetup = require("prosemirror-example-setup");
var $ltMAx$prosemirrorkeymap = require("prosemirror-keymap");

function $parcel$defineInteropFlag(a) {
  Object.defineProperty(a, '__esModule', {value: true, configurable: true});
}
function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$defineInteropFlag(module.exports);

$parcel$export(module.exports, "default", () => $4fa36e821943b400$export$2e2bcd8739ae039);







//linter 


let $6895e3f8c0f9debb$export$b8a1ef936d0e6c0c = new (0, $ltMAx$prosemirrorstate.Plugin)({
    state: {
        init (_, { doc: doc  }) {
            return $6895e3f8c0f9debb$var$lintDeco(doc);
        },
        apply (tr, old) {
            return tr.docChanged ? $6895e3f8c0f9debb$var$lintDeco(tr.doc) : old;
        }
    },
    props: {
        decorations (state) {
            return this.getState(state);
        },
        handleClick (view, _, event) {
            if (/lint-icon/.test(event.target.className)) {
                let { from: from , to: to  } = event.target.problem;
                view.dispatch(view.state.tr.setSelection((0, $ltMAx$prosemirrorstate.TextSelection).create(view.state.doc, from, to)).scrollIntoView());
                return true;
            }
        },
        handleDoubleClick (view, _, event) {
            if (/lint-icon/.test(event.target.className)) {
                let prob = event.target.problem;
                if (prob.fix) {
                    prob.fix(view);
                    view.focus();
                    return true;
                }
            }
        }
    }
});
function $6895e3f8c0f9debb$var$lintDeco(doc) {
    let decos = [];
    $6895e3f8c0f9debb$var$lint(doc).forEach((prob)=>{
        decos.push((0, $ltMAx$prosemirrorview.Decoration).inline(prob.from, prob.to, {
            class: "problem"
        }), (0, $ltMAx$prosemirrorview.Decoration).widget(prob.from, $6895e3f8c0f9debb$var$lintIcon(prob)));
    });
    return (0, $ltMAx$prosemirrorview.DecorationSet).create(doc, decos);
}
function $6895e3f8c0f9debb$var$lintIcon(prob) {
    let icon = document.createElement("div");
    icon.className = "lint-icon";
    icon.title = prob.msg;
    icon.problem = prob;
    return icon;
}
// Words you probably shouldn't use
const $6895e3f8c0f9debb$var$badWords = /\b(obviously|clearly|evidently|simply)\b/ig;
// Matches punctuation with a space before it
const $6895e3f8c0f9debb$var$badPunc = / ([,\.!?:]) ?/g;
// Matches punctuation with a space before it
const $6895e3f8c0f9debb$var$goToLinks = /->/ig;
function $6895e3f8c0f9debb$var$lint(doc) {
    let result = [], lastHeadLevel = null;
    function record(msg, from, to, fix) {
        result.push({
            msg: msg,
            from: from,
            to: to,
            fix: fix
        });
    }
    // For each node in the document
    doc.descendants((node, pos)=>{
        if (node.isText) {
            // Scan text nodes for suspicious patterns
            let m;
            while(m = $6895e3f8c0f9debb$var$goToLinks.exec(node.text))record(`GoTo '${m[0]}'`, pos + m.index, pos + m.index + m[0].length);
            while(m = $6895e3f8c0f9debb$var$badWords.exec(node.text))record(`Try not to say '${m[0]}'`, pos + m.index, pos + m.index + m[0].length);
            while(m = $6895e3f8c0f9debb$var$badPunc.exec(node.text))record("Suspicious spacing around punctuation", pos + m.index, pos + m.index + m[0].length, $6895e3f8c0f9debb$var$fixPunc(m[1] + " "));
        } else if (node.type.name == "heading") {
            // Check whether heading levels fit under the current level
            let level = node.attrs.level;
            if (lastHeadLevel != null && level > lastHeadLevel + 1) record(`Heading too small (${level} under ${lastHeadLevel})`, pos + 1, pos + 1 + node.content.size, $6895e3f8c0f9debb$var$fixHeader(lastHeadLevel + 1));
            lastHeadLevel = level;
        } else if (node.type.name == "image" && !node.attrs.alt) // Ensure images have alt text
        record("Image without alt text", pos, pos + 1, $6895e3f8c0f9debb$var$addAlt);
    });
    return result;
}
function $6895e3f8c0f9debb$var$fixPunc(replacement) {
    return function({ state: state , dispatch: dispatch  }) {
        dispatch(state.tr.replaceWith(this.from, this.to, state.schema.text(replacement)));
    };
}
function $6895e3f8c0f9debb$var$fixHeader(level) {
    return function({ state: state , dispatch: dispatch  }) {
        dispatch(state.tr.setNodeMarkup(this.from - 1, null, {
            level: level
        }));
    };
}
function $6895e3f8c0f9debb$var$addAlt({ state: state , dispatch: dispatch  }) {
    let alt = prompt("Alt text", "");
    if (alt) {
        let attrs = Object.assign({}, state.doc.nodeAt(this.from).attrs, {
            alt: alt
        });
        dispatch(state.tr.setNodeMarkup(this.from, null, attrs));
    }
}




function $b92de44e91245ffb$export$6be8a1d954707247(mentionTrigger, hashtagTrigger, allowSpace) {
    var mention = allowSpace ? new RegExp("(^|\\s)" + mentionTrigger + "([\\w-\\+]+\\s?[\\w-\\+]*)$") : new RegExp("(^|\\s)" + mentionTrigger + "([\\w-\\+]+)$");
    var arrow = new RegExp("(^|\\s)->([\\w-\\+]+\\s?[\\w-\\+]*)$");
    // hashtags should never allow spaces. I mean, what's the point of allowing spaces in hashtags?
    var tag = new RegExp("(^|\\s)" + hashtagTrigger + "([\\w-]+)$");
    return {
        mention: mention,
        tag: tag,
        arrow: arrow
    };
}
function $b92de44e91245ffb$export$26748ec468348572($position, opts) {
    // take current para text content upto cursor start.
    // this makes the regex simpler and parsing the matches easier.
    var parastart = $position.before();
    const text = $position.doc.textBetween(parastart, $position.pos, "\n", "\0");
    var regex = $b92de44e91245ffb$export$6be8a1d954707247(opts.mentionTrigger, opts.hashtagTrigger, opts.allowSpace);
    // only one of the below matches will be true.
    var mentionMatch = text.match(regex.mention);
    var tagMatch = text.match(regex.tag);
    var arrowMatch = text.match(regex.arrow);
    var match = mentionMatch || tagMatch || arrowMatch;
    // set type of match
    var type;
    if (mentionMatch) type = "mention";
    else if (tagMatch) type = "tag";
    else if (arrowMatch) type = "arrow";
    // if match found, return match with useful information.
    if (match) {
        // adjust match.index to remove the matched extra space
        match.index = match[0].startsWith(" ") ? match.index + 1 : match.index;
        match[0] = match[0].startsWith(" ") ? match[0].substring(1, match[0].length) : match[0];
        // The absolute position of the match in the document
        var from = $position.start() + match.index;
        var to = from + match[0].length;
        var queryText = match[2];
        return {
            range: {
                from: from,
                to: to
            },
            queryText: queryText,
            type: type
        };
    }
// else if no match don't return anything.
}
const $b92de44e91245ffb$export$61fc7d43ac8f84b0 = function() {
    var timeoutId = null;
    return function(func, timeout, context) {
        context = context || this;
        clearTimeout(timeoutId);
        timeoutId = setTimeout(function() {
            func.apply(context, arguments);
        }, timeout);
        return timeoutId;
    };
}();
var $b92de44e91245ffb$var$getNewState = function() {
    return {
        active: false,
        range: {
            from: 0,
            to: 0
        },
        type: "",
        text: "",
        suggestions: [],
        index: 0 // current active suggestion index
    };
};
function $b92de44e91245ffb$export$283bd57e93429c29(opts) {
    // default options
    var defaultOpts = {
        mentionTrigger: "@",
        hashtagTrigger: "#",
        functionOnClick: (event)=>console.log(event),
        allowSpace: true,
        getSuggestions: (type, text, cb)=>{
            cb([]);
        },
        getSuggestionsHTML: (items)=>'<div class="suggestion-item-list">' + items.map((i)=>'<div class="suggestion-item">' + i.name + "</div>").join("") + "</div>",
        activeClass: "suggestion-item-active",
        suggestionTextClass: "prosemirror-suggestion",
        maxNoOfSuggestions: 10,
        delay: 500
    };
    var opts = Object.assign({}, defaultOpts, opts);
    // timeoutId for clearing debounced calls
    var showListTimeoutId = null;
    // dropdown element
    var el = document.createElement("div");
    // current Idx
    var index = 0;
    // ----- methods operating on above properties -----
    var showList = function(view, state, suggestions, opts) {
        el.innerHTML = opts.getSuggestionsHTML(suggestions, state.type);
        // attach new item event handlers
        el.querySelectorAll(".suggestion-item").forEach(function(itemNode, index) {
            itemNode.addEventListener("click", function() {
                select(view, state, opts);
                view.focus();
            });
            // TODO: setIndex() needlessly queries.
            // We already have the itemNode. SHOULD OPTIMIZE.
            itemNode.addEventListener("mouseover", function() {
                setIndex(index, state, opts);
            });
            itemNode.addEventListener("mouseout", function() {
                setIndex(index, state, opts);
            });
        });
        // highlight first element by default - like Facebook.
        addClassAtIndex(state.index, opts.activeClass);
        // get current @mention span left and top.
        // TODO: knock off domAtPos usage. It's not documented and is not officially a public API.
        // It's used currently, only to optimize the the query for textDOM
        var node = view.domAtPos(view.state.selection.$from.pos);
        var paraDOM = node.node;
        var textDOM = paraDOM.querySelector("." + opts.suggestionTextClass);
        // TODO: should add null check case for textDOM
        var offset = textDOM.getBoundingClientRect();
        // TODO: think about outsourcing this positioning logic as options
        document.body.appendChild(el);
        el.classList.add("suggestion-item-container");
        el.style.position = "fixed";
        el.style.left = offset.left + "px";
        var top = textDOM.offsetHeight + offset.top;
        el.style.top = top + "px";
        el.style.display = "block";
        el.style.zIndex = "999999";
    };
    var hideList = function() {
        el.style.display = "none";
    };
    var removeClassAtIndex = function(index, className) {
        var itemList = el.querySelector(".suggestion-item-list").childNodes;
        var prevItem = itemList[index];
        prevItem.classList.remove(className);
    };
    var addClassAtIndex = function(index, className) {
        var itemList = el.querySelector(".suggestion-item-list").childNodes;
        var prevItem = itemList[index];
        prevItem.classList.add(className);
    };
    var setIndex = function(index, state, opts) {
        removeClassAtIndex(state.index, opts.activeClass);
        state.index = index;
        addClassAtIndex(state.index, opts.activeClass);
    };
    var goNext = function(view, state, opts) {
        removeClassAtIndex(state.index, opts.activeClass);
        state.index++;
        state.index = state.index === state.suggestions.length ? 0 : state.index;
        addClassAtIndex(state.index, opts.activeClass);
    };
    var goPrev = function(view, state, opts) {
        removeClassAtIndex(state.index, opts.activeClass);
        state.index--;
        state.index = state.index === -1 ? state.suggestions.length - 1 : state.index;
        addClassAtIndex(state.index, opts.activeClass);
    };
    var select = function(view, state, opts) {
        var item = state.suggestions[state.index];
        var attrs;
        if (state.type === "mention") attrs = {
            name: item.name,
            id: item.id,
            email: item.email
        };
        else if (state.type === "tag") attrs = {
            tag: item.tag
        };
        else attrs = {
            tag: item.tag,
            id: item.id,
            text: item.tag
        };
        var node = view.state.schema.nodes[state.type].create(attrs);
        var tr = view.state.tr.replaceWith(state.range.from, state.range.to, node);
        //var newState = view.state.apply(tr);
        //view.updateState(newState);
        view.dispatch(tr);
    };
    /**
   * See https://prosemirror.net/docs/ref/#state.Plugin_System
   * for the plugin properties spec.
   */ return new (0, $ltMAx$prosemirrorstate.Plugin)({
        key: new (0, $ltMAx$prosemirrorstate.PluginKey)("autosuggestions"),
        // we will need state to track if suggestion dropdown is currently active or not
        state: {
            init () {
                return $b92de44e91245ffb$var$getNewState();
            },
            apply (tr, state) {
                // compute state.active for current transaction and return
                var newState = $b92de44e91245ffb$var$getNewState();
                var selection = tr.selection;
                if (selection.from !== selection.to) return newState;
                const $position = selection.$from;
                const match = $b92de44e91245ffb$export$26748ec468348572($position, opts);
                // if match found update state
                if (match) {
                    newState.active = true;
                    newState.range = match.range;
                    newState.type = match.type;
                    newState.text = match.queryText;
                }
                return newState;
            }
        },
        // We'll need props to hi-jack keydown/keyup & enter events when suggestion dropdown
        // is active.
        props: {
            handleKeyDown (view, e) {
                var state = this.getState(view.state);
                // don't handle if no suggestions or not in active mode
                if (!state.active && !state.suggestions.length) return false;
                // if any of the below keys, override with custom handlers.
                var down, up, enter, esc;
                enter = e.keyCode === 13;
                down = e.keyCode === 40;
                up = e.keyCode === 38;
                esc = e.keyCode === 27;
                if (down) {
                    goNext(view, state, opts);
                    return true;
                } else if (up) {
                    goPrev(view, state, opts);
                    return true;
                } else if (enter) {
                    select(view, state, opts);
                    return true;
                } else if (esc) {
                    clearTimeout(showListTimeoutId);
                    hideList();
                    this.state = $b92de44e91245ffb$var$getNewState();
                    return true;
                } else // didn't handle. handover to prosemirror for handling.
                return false;
            },
            handleClick (view, _, event) {
                if (/prosemirror-mention-node/.test(event.target.className)) {
                    opts.functionOnClick(event, view);
                    // let {from, to} = event.target.problem
                    // view.dispatch(
                    //   view.state.tr
                    //     .setSelection(TextSelection.create(view.state.doc, from, to))
                    //     .scrollIntoView())
                    return true;
                }
            },
            // to decorate the currently active @mention text in ui
            decorations (editorState) {
                const { active: active , range: range  } = this.getState(editorState);
                if (!active) return null;
                return (0, $ltMAx$prosemirrorview.DecorationSet).create(editorState.doc, [
                    (0, $ltMAx$prosemirrorview.Decoration).inline(range.from, range.to, {
                        nodeName: "span",
                        class: opts.suggestionTextClass
                    })
                ]);
            }
        },
        // To track down state mutations and add dropdown reactions
        view () {
            return {
                update: (view)=>{
                    var state = this.key.getState(view.state);
                    if (!state.text) {
                        hideList();
                        clearTimeout(showListTimeoutId);
                        return;
                    }
                    // debounce the call to avoid multiple requests
                    showListTimeoutId = $b92de44e91245ffb$export$61fc7d43ac8f84b0(function() {
                        // get suggestions and set new state
                        opts.getSuggestions(state.type, state.text, function(suggestions) {
                            // update `state` argument with suggestions
                            state.suggestions = suggestions;
                            showList(view, state, suggestions, opts);
                        });
                    }, opts.delay, this);
                }
            };
        }
    });
}


/**
 * See https://prosemirror.net/docs/ref/#model.NodeSpec
 */ const $f01aa23d71207f11$export$dbe73ad4b798c202 = {
    group: "inline",
    inline: true,
    atom: true,
    attrs: {
        id: "",
        name: "",
        email: ""
    },
    selectable: false,
    draggable: false,
    toDOM: (node)=>{
        return [
            "span",
            {
                "data-mention-id": node.attrs.id,
                "data-mention-name": node.attrs.name,
                "data-mention-email": node.attrs.email,
                class: "prosemirror-mention-node"
            },
            "@" + node.attrs.name
        ];
    },
    parseDOM: [
        {
            // match tag with following CSS Selector
            tag: "span[data-mention-id][data-mention-name][data-mention-email]",
            getAttrs: (dom)=>{
                var id = dom.getAttribute("data-mention-id");
                var name = dom.getAttribute("data-mention-name");
                var email = dom.getAttribute("data-mention-email");
                return {
                    id: id,
                    name: name,
                    email: email
                };
            }
        }
    ]
};
const $f01aa23d71207f11$export$c5923750b3608ed7 = {
    group: "inline",
    inline: true,
    atom: true,
    attrs: {
        tag: ""
    },
    selectable: false,
    draggable: false,
    toDOM: (node)=>{
        return [
            "span",
            {
                "data-tag": node.attrs.tag,
                class: "prosemirror-tag-node"
            },
            "#" + node.attrs.tag
        ];
    },
    parseDOM: [
        {
            // match tag with following CSS Selector
            tag: "span[data-tag]",
            getAttrs: (dom)=>{
                var tag = dom.getAttribute("data-tag");
                return {
                    tag: tag
                };
            }
        }
    ]
};
const $f01aa23d71207f11$export$a60ac68fb46161c9 = {
    group: "inline",
    inline: true,
    atom: true,
    attrs: {
        id: "",
        tag: "",
        text: ""
    },
    selectable: false,
    draggable: false,
    toDOM: (node)=>{
        return [
            "span",
            {
                "data-mention-id": node.attrs.id,
                "data-mention-tag": node.attrs.tag,
                class: "prosemirror-mention-node"
            },
            node.attrs.tag || node.attrs.text
        ];
    },
    parseDOM: [
        {
            // match tag with following CSS Selector
            tag: "span[data-mention-id][data-mention-tag]",
            getAttrs: (dom)=>{
                var id = dom.getAttribute("data-mention-id");
                var tag = dom.getAttribute("data-mention-tag");
                var text = dom.getAttribute("data-mention-tag");
                return {
                    id: id,
                    tag: tag
                };
            }
        }
    ]
};


function $5ef5dfae394b4f9c$export$d1f78ce1d47a0eb9(nodes) {
    return nodes.append({
        mention: (0, $f01aa23d71207f11$export$dbe73ad4b798c202)
    });
}
function $5ef5dfae394b4f9c$export$5adad8d72519ec85(nodes) {
    return nodes.append({
        tag: (0, $f01aa23d71207f11$export$c5923750b3608ed7)
    });
}
function $5ef5dfae394b4f9c$export$de6371a67e6f66ab(nodes) {
    return nodes.append({
        arrow: (0, $f01aa23d71207f11$export$a60ac68fb46161c9)
    });
}





// Mix the nodes from prosemirror-schema-list into the basic schema to
// create a schema with list support.
//const mySchema = new Schema({
//  nodes: addListNodes(schema.spec.nodes, "paragraph block*", "block"),
//  marks: schema.spec.marks
//})
var $4fa36e821943b400$var$mySchema = new (0, $ltMAx$prosemirrormodel.Schema)({
    nodes: (0, $5ef5dfae394b4f9c$export$de6371a67e6f66ab)((0, $5ef5dfae394b4f9c$export$5adad8d72519ec85)((0, $5ef5dfae394b4f9c$export$d1f78ce1d47a0eb9)((0, $ltMAx$prosemirrorschemalist.addListNodes)((0, $ltMAx$prosemirrorschemabasic.schema).spec.nodes, "paragraph block*", "block")))),
    marks: (0, $ltMAx$prosemirrorschemabasic.schema).spec.marks
});
//Mention
/**
 * IMPORTANT: outer div's "suggestion-item-list" class is mandatory. The plugin uses this class for querying.
 * IMPORTANT: inner div's "suggestion-item" class is mandatory too for the same reasons
 */ var $4fa36e821943b400$var$getMentionSuggestionsHTML = (items)=>'<div class="suggestion-item-list">' + items.map((i)=>'<div class="suggestion-item">' + i.name + "</div>").join("") + "</div>";
/**
 * IMPORTANT: outer div's "suggestion-item-list" class is mandatory. The plugin uses this class for querying.
 * IMPORTANT: inner div's "suggestion-item" class is mandatory too for the same reasons
 */ var $4fa36e821943b400$var$getTagSuggestionsHTML = (items)=>'<div class="suggestion-item-list">' + items.map((i)=>'<div class="suggestion-item">' + i.tag + "</div>").join("") + "</div>";
var $4fa36e821943b400$var$plugins = (0, $ltMAx$prosemirrorexamplesetup.exampleSetup)({
    schema: $4fa36e821943b400$var$mySchema
}).concat((0, $6895e3f8c0f9debb$export$b8a1ef936d0e6c0c));
// function insertTab(state, dispatch) {
//   let type = mySchema.nodes.text
//   let {$from} = state.selection
//   if (!$from.parent.canReplaceWith($from.index(), $from.index(), type))
//     return false
//   dispatch(state.tr.replaceSelectionWith(type.create()))
//   return true
// }
function $4fa36e821943b400$var$insertTab(state, dispatch) {
    dispatch(state.tr.insertText("    "));
    return true;
}
function $4fa36e821943b400$var$getNodeEndpoints(context, node) {
    let offset = 0;
    if (context === node) return {
        from: offset,
        to: offset + node.nodeSize
    };
    if (node.isBlock) {
        for(let i = 0; i < context.content.content.length; i++){
            let result = $4fa36e821943b400$var$getNodeEndpoints(context.content.content[i], node);
            if (result) return {
                from: result.from + offset + (context.type.kind === null ? 0 : 1),
                to: result.to + offset + (context.type.kind === null ? 0 : 1)
            };
            offset += context.content.content[i].nodeSize;
        }
        return null;
    } else return null;
}
var $4fa36e821943b400$var$customKM = (0, $ltMAx$prosemirrorkeymap.keymap)({
    "Tab": $4fa36e821943b400$var$insertTab
});
function $4fa36e821943b400$var$findRegExp(findTerm, caseSensitive) {
    return RegExp(findTerm, !caseSensitive ? "i" : "");
}
function $4fa36e821943b400$var$findInNode(root, node, term) {
    console.log($4fa36e821943b400$var$findRegExp(term));
    console.log(node);
    var findResult = term;
    console.log(findResult);
    if (findResult.findRegExp == undefined) {
        console.log(findResult.findRegExp);
        findResult = {
            findTerm: [],
            findRegExp: $4fa36e821943b400$var$findRegExp(term)
        };
    }
    let ret = [];
    if (node.text) {
        let index = 0, foundAt, ep = $4fa36e821943b400$var$getNodeEndpoints(root, node);
        while((foundAt = node.textContent.slice(index).search(findResult.findRegExp)) > -1){
            let sel = new TextSelection(ep.from + index + foundAt + 1, ep.from + index + foundAt + findResult.findTerm.length + 1);
            ret.push(sel);
            index = index + foundAt + findResult.findTerm.length;
        }
    } else node.content.forEach((child, i)=>ret = ret.concat($4fa36e821943b400$var$findInNode(root, child, findResult)));
    console.log(ret);
    return ret;
}
var $4fa36e821943b400$var$mentionPlugin = (0, $b92de44e91245ffb$export$283bd57e93429c29)({
    functionOnClick: (event, view)=>{
        console.log(view);
        $4fa36e821943b400$var$findInNode(view.state.doc, view.state.doc, "test");
    //console.log("teest")
    },
    getSuggestions: (type, text, done)=>{
        setTimeout(()=>{
            if (type === "mention") // pass dummy mention suggestions
            done([
                {
                    name: "John Doe",
                    id: "101",
                    email: "joe@gmail.com"
                },
                {
                    name: "Joe Lewis",
                    id: "102",
                    email: "lewis@gmail.com"
                }
            ]);
            else if (type === "tag") // pass dummy tag suggestions
            done([
                {
                    tag: "WikiLeaks"
                },
                {
                    tag: "NetNeutrality"
                },
                {
                    tag: "NetNeutrality"
                }
            ]);
            else done([
                {
                    id: 1,
                    tag: "-> WikiLeaks"
                },
                {
                    id: 2,
                    tag: "-> NetNeutrality"
                },
                {
                    id: 3,
                    tag: "-> NetNeutrality"
                }
            ]);
        }, 0);
    },
    getSuggestionsHTML: (items, type)=>{
        if (type === "mention") return $4fa36e821943b400$var$getMentionSuggestionsHTML(items);
        else if (type === "tag") return $4fa36e821943b400$var$getTagSuggestionsHTML(items);
        else if (type === "arrow") return $4fa36e821943b400$var$getTagSuggestionsHTML(items);
    }
});
$4fa36e821943b400$var$plugins.unshift($4fa36e821943b400$var$mentionPlugin); // push it before keymap plugin to override keydown handlers
$4fa36e821943b400$var$plugins.unshift($4fa36e821943b400$var$customKM); // push it before keymap plugin to override keydown handlers
//mention
var $4fa36e821943b400$var$createEditor = function(element) {
    window.view = new (0, $ltMAx$prosemirrorview.EditorView)(element, {
        state: (0, $ltMAx$prosemirrorstate.EditorState).create({
            doc: (0, $ltMAx$prosemirrormodel.DOMParser).fromSchema($4fa36e821943b400$var$mySchema).parse(document.querySelector("#content")),
            plugins: $4fa36e821943b400$var$plugins
        })
    });
    return window.view;
};
var $4fa36e821943b400$export$2e2bcd8739ae039 = $4fa36e821943b400$var$createEditor;


//# sourceMappingURL=index.js.map
