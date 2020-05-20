let str = 'abcabcabcabcabx'

function match (string) {
  let state = start
  for (let char of string) {
    state = state(char)
  }
  return state == end
}

function start (char) {
  if (char == 'a') {
    return findFirstB
  } else {
    return start
  }
}

function findFirstB (char) {
  if (char == 'b') {
    return findFirstC
  } else {
    return start(char)
  }
}

function findFirstC (char) {
  if (char == 'c') {
    return findSecondA
  } else {
    return start(char)
  }
}

function findSecondA (char) {
  if (char == 'a') {
    return findSecondB
  } else {
    return start(char)
  }
}

function findSecondB (char) {
  if (char == 'b') {
    return findSecondC
  } else {
    return start(char)
  }
}

function findSecondC (char) {
  if (char == 'c') {
    return findThirdA
  } else {
    return start(char)
  }
}

function findThirdA (char) {
  if (char == 'a') {
    return findThirdB
  } else {
    return start(char)
  }
}

function findThirdB (char) {
  if (char == 'b') {
    return findX
  } else {
    return start(char)
  }
}

function findX (char) {
  if (char == 'x') {
    return end
  } else {
    return findSecondC(char)
  }
}

function end (char) {
  return end
}

console.log(match(str))


