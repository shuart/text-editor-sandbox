/**
 * See https://prosemirror.net/docs/ref/#model.NodeSpec
 */
export const mentionNode = {
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

  toDOM: node => {
    return [
      "span",
      {
        "data-mention-id": node.attrs.id,
        "data-mention-name": node.attrs.name,
        "data-mention-email": node.attrs.email,
        class: "prosemirror-mention-node"
      },
      "@" + node.attrs.name || node.attrs.email
    ];
  },

  parseDOM: [
    {
      // match tag with following CSS Selector
      tag: "span[data-mention-id][data-mention-name][data-mention-email]",

      getAttrs: dom => {
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

/**
 * See https://prosemirror.net/docs/ref/#model.NodeSpec
 */
export const tagNode = {
  group: "inline",
  inline: true,
  atom: true,

  attrs: {
    id: "",
    tag: ""
  },

  selectable: false,
  draggable: false,

  toDOM: node => {
    return [
      "span",
      {
        "data-tag-id": node.attrs.id,
        "data-tag": node.attrs.tag,
        class: "prosemirror-tag-node"
      },
      "#" + node.attrs.tag
    ];
  },

  parseDOM: [
    {
      // match tag with following CSS Selector
      tag: "span[data-tag][data-tag-id]",

      getAttrs: dom => {
        var tag = dom.getAttribute("data-tag");
        var id = dom.getAttribute("data-tag-id");
        return {
          tag: tag,
          id: id
        };
      }
    }
  ]
};

/**
 * See https://prosemirror.net/docs/ref/#model.NodeSpec
 */
export const arrowNode = {
  group: "inline",
  inline: true,
  atom: true,

  attrs: {
    id: "",
    tag:"",
    text:"",
  },

  selectable: false,
  draggable: false,

  toDOM: node => {
    return [
      "span",
      {
        "data-arrow-id": node.attrs.id,
        "data-arrow-tag": node.attrs.tag,
        class: "prosemirror-arrow-node"
      },
       node.attrs.tag || node.attrs.text
    ];
  },

  parseDOM: [
    {
      // match tag with following CSS Selector
      tag: "span[data-arrow-id][data-arrow-tag]",

      getAttrs: dom => {
        var id = dom.getAttribute("data-arrow-id");
        var tag = dom.getAttribute("data-arrow-tag");
        var text = dom.getAttribute("data-arrow-tag");
        return {
          id: id,
          tag: tag,
        };
      }
    }
  ]
};
