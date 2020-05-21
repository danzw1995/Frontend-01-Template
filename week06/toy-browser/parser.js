let css = require('css')
const EOF = Symbol('EOF')

let currentToken = ''
let currentAttribute = null
let stack = [{ type: 'document', children: [] }]
let currentTextNode = null
let rules = []

function addCSSRules (text) {
  let ast = css.parse(text)
  rules.push(...ast.stylesheet.rules)
}

function match (element, selector) {
  if (!selector || !element.attributes) {
    return false
  } else if (selector[0] == '#') {
    let id = element.attributes.filter(attribute => attribute.name == 'id')[0]
    if (id && id == selector.substring(1)) {
      return true
    }
    return false
  } else if (selector[0] == '.') {
    let className = element.attributes.filter(attribute => attribute.name == 'class')[0]
    if (className && className == selector.substring(1)) {
      return true
    }
    return false
  }
  return selector == element.tagName
}

function specificity (selector) {
  let p = [0, 0, 0, 0]
  let selectorParts = selector.split(' ')
  selectorParts.forEach(part => {
    let pre = part.charAt(0)
    if (pre == '#') {
      p[1]++
    } else if (pre == '.') {
      p[2]++
    } else {
      p[3]++
    }
  })
  return p
}

function compare (sp1, sp2) {
  for (let i = 0; i < sp1.length; i++) {
    if (sp1[i] > sp2[i]) {
      return true
    } else if (sp1[i] < sp2[i]) {
      return false
    }
  }
  return false
}

function computeCSS (element) {
  let elements = stack.slice().reverse()
  if (!elements.computeStyle) {
    elements.computeStyle = {}
  }
  for (let rule of rules) {
    let selectorParts = rule.selectors[0].split(' ').reverse()
    if (!match(element, selectorParts[0])) {
      continue
    }
    let matched = false
    let j = 1;
    for (let i = 0; i < elements.length; i++) {
      if (matched(elements[i], selectorParts[j])) {
        j++
      }
    }
    if (j >= selectorParts.length) {
      matched = true
    }
    if (matched) {
      let sp = specificity(rule.selectors[0])
      let computeStyle = element.computeStyle
      for (let declaration of rule.declaration) {
        if (!computeStyle[declaration.property]) {
          computeStyle[declaration.property] = {}
        }
        if (!computeStyle[declaration.property].specificity) {
          computeStyle[declaration.property].value = declaration.value
          computeStyle[declaration.property].specificity = sp
        } else if (!compare(computeStyle[declaration.property].specificity, sp)) {
          computeStyle[declaration.property].value = declaration.value
          computeStyle[declaration.property].specificity = sp
        }
      }
    }
  }
}

function data (c) {
  if (c == '<') {
    return tagOpen
  } else if (c == EOF) {
    emit({
      type: EOF
    })
    return
  } else {
    emit({
      type: 'text',
      content: c
    })
    return data
  }
}

function tagOpen (c) {
  if (c == '/') {
    return endTagOpen
  } else if (/[a-zA-Z]/) {
    currentToken = {
      type: 'startTag',
      tagName: ''
    }
    return tagName(c)
  } else {
    emit({
      type: 'text',
      content: c
    })
  }
}

function endTagOpen (c) {
  if (c == '>') {
    console.log(' missing-end-tag-name parse error.')
    return data
  } else if (c == EOF) {

  } else {
    currentToken = {
      type: 'endTag',
      tagName: ''
    }
    return tagName(c)
  }

}

function tagName (c) {
  if (c == '/') {
    return selfClosingStartTag
  } else if (c.match(/[\t\n\f ]/)) {
    return beforeAttributeName
  } else if (c == '>') {
    emit(currentToken)
    return data
  } else {
    currentToken.tagName += c
    return tagName
  }
}

function beforeAttributeName (c) {
  if (c.match(/[\n\f\t ]/)) {
    return beforeAttributeName
  } else if (c == '=') {
    console.log('unexpected-equals-sign-before-attribute-name parse error')
    // return attributeName
    return beforeAttributeName
  } else if ([EOF, '/', '>'].includes(c)) {
    return afterAttributeName
  } else {
    currentAttribute = {
      name: '',
      value: ''
    }
    return attributeName(c)
  }
}

function attributeName (c) {
  if (c.match(/[\n\f\t ]/) || [EOF, '/', '>'].includes(c)) {
    return afterAttributeName
  } else if (c == '=') {
    return beforeAttributeValue
  } else if (['"', '\'', '<'].includes(c)) {
    console.log('unexpected-character-in-attribute-name parse error')
    return attributeName
    // throw new Error('unexpected-character-in-attribute-name parse error')
  } else {
    currentAttribute.name += c
    return attributeName
  }
}

function beforeAttributeValue (c) {
  if (c.match(/[\n\f\t ]/)) {
    return beforeAttributeValue
  } else if (c == '"') {
    return doubleQuotedAttributeValue
  } else if (c == '\'') {
    return singleQuotedAttributeValue
  } else if (c == '>') {
    // emit({})
    return data
  } else {
    return unquotedAttributeValue(c)
  }
}


function doubleQuotedAttributeValue (c) {
  if (c == '"') {
    currentToken[currentAttribute.name] = currentAttribute.value
    return afterAttributeQuotedValue
  } else if (c == '\u0000') {

  } else if (c == EOF) {

  } else {
    currentAttribute.value += c
    return doubleQuotedAttributeValue
  }
}

function singleQuotedAttributeValue (c) {
  if (c == '\'') {
    currentToken[currentAttribute.name] = currentAttribute.value
    return afterAttributeQuotedValue
  } else if (c == '\u0000') {

  } else if (c == EOF) {

  } else {
    currentAttribute.value += c
    return singleQuotedAttributeValue
  }
}

function unquotedAttributeValue (c) {
  if (c.match(/[\n\f\t ]/)) {
    currentToken[currentAttribute.name] = currentAttribute.value
    return beforeAttributeName
  } else if (c == '>') {
    currentToken[currentAttribute.name] = currentAttribute.value
    emit(currentToken)
    return data
  } else if (c == '/') {
    return selfClosingStartTag
  } else if (c == EOF) {

  } else {
    currentAttribute.value += c
    return unquotedAttributeValue
  }
}

function afterAttributeQuotedValue (c) {
  if (c.match(/[\n\f\t ]/)) {
    return beforeAttributeName
  } else if (c == '/') {
    return selfClosingStartTag
  } else if (c == '>') {
    currentToken[currentAttribute.name] = currentAttribute.value
    emit(currentToken)
    return data
  } else if (c == EOF) {

  } else {
    console.log('missing-whitespace-between-attributes parse error')
    return beforeAttributeName(c)
  }
}

function afterAttributeName (c) {
  if (c.match(/[\n\f\t ]/)) {
    return afterAttributeName
  } else if (c == '/') {
    return selfClosingStartTag
  } else if (c == '=') {
    return beforeAttributeValue
  } else if (c == '>') {
    currentToken[currentAttribute.name] = currentAttribute.value
    emit(currentToken)
    return data
  } else if (c == EOF) {

  } else {
    currentToken[currentAttribute.name] = currentAttribute.value
    currentAttribute = {
      name: '',
      value: ''
    }
    return attributeName(c)
  }
}

function selfClosingStartTag (c) {
  if (c == '>') {
    emit(currentToken)
    return data
  } else if (c == EOF) {

  } else {
    console.log('unexpected-solidus-in-tag parse error')
    return beforeAttributeName(c)
  }
}

function emit (token) {
  let top = stack[stack.length - 1];

  if (token.type === "startTag") {
    let element = {
      type: "element",
      children: [],
      attributes: []
    };

    element.tagName = token.tagName;

    for (let p in token) {
      if (p !== "type" && p !== "tagName") {
        element.attributes.push({
          name: p,
          value: token[p]
        });
      }
    }

    computeCSS(element);

    top.children.push(element);

    if (!token.isSelfClosing) {
      stack.push(element);
    }

    currentTextNode = null;

  } else if (token.type === "endTag") {
    if (top.tagName !== token.tagName) {
      // throw new Error("Tag start end doesn't match!");
    } else {
      if (top.tagName === 'style') {
        addCSSRules(top.children[0].content);
      }
      stack.pop();
    }
    currentTextNode = null;
  } else if (token.type === 'text') {
    if (currentTextNode === null) {
      currentTextNode = {
        type: "text",
        content: ""
      };
      top.children.push(currentTextNode);
    }
    currentTextNode.content += token.content;
  }
}

function parseHTML (html) {
  let state = data
  for (let c of html) {
    state = state(c)
  }
  state = state(EOF)
  return stack[0]
}

module.exports = {
  parseHTML: parseHTML
}