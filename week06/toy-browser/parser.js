let stack = []
const EOF = symbol('EOF')

let currentToken = ''

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
    return tagClose
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

function endTagOpen () { }

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