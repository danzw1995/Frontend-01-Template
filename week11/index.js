var oContainer = document.getElementById('container')
var oSearch = document.getElementById('search')
var oClear = document.getElementById('clear')
var oX = document.getElementById('x')
var oY = document.getElementById('y')
let map = localStorage.getItem('map') ? JSON.parse(localStorage.getItem('map')) : new Array(10000).fill(0)


function render () {
  let html = ''
  for (let y = 0; y < 100; y++) {
    for (let x = 0; x < 100; x++) {
      let t = map[x + 100 * y]
      html += `<div class="cell ${t == 1 ? 'active' : ''}" dataset-x="${x}" dataset-y="${y}" dataset-active="${t}"></div>`
    }
  }
  oContainer.innerHTML = html
}

render()

document.onmousedown = function () {
  oContainer.onmouseover = function (e) {
    const target = e.target
    if (!target.classList.contains('cell')) {
      return
    }
    target.classList.toggle('active')
    let active = target.getAttribute('dataset-active')
    let x = target.getAttribute('dataset-x')
    let y = target.getAttribute('dataset-y')
    active = active == '1' ? 0 : 1
    target.setAttribute('dataset-active', active)
    map[Number(x) + 100 * y] = active
  }
}

document.onmouseup = function () {
  oContainer.onmouseover = null
}

window.onbeforeunload = function () {
  localStorage.setItem('map', JSON.stringify(map))
}

oClear.onclick = function () {
  map = new Array(10000).fill(0)
  render()
}

oSearch.onclick = function () {
  if (!oX.value || !oY.value) {
    return alert('请输入完整的坐标')
  }
  findPath([0, 0], [oX.value, oY.value], map)
}

async function findPath (start, end, map) {
  let queue = [start]
  map = map.slice()
  while (queue.length) {
    let [x, y] = queue.shift()
    if (x == end[0] && y == end[1]) {
      while (x != start[0] || y != start[1]) {
        oContainer.children[x + 100 * y].classList.add('pink');
        ([x, y] = map[x + 100 * y])
      }
      oContainer.children[x + 100 * y].classList.add('pink');
      return true
    }
    await insert(x - 1, y, [x, y])
    await insert(x + 1, y, [x, y])
    await insert(x, y - 1, [x, y])
    await insert(x, y + 1, [x, y])
    await insert(x - 1, y - 1, [x, y])
    await insert(x + 1, y - 1, [x, y])
    await insert(x - 1, y + 1, [x, y])
    await insert(x + 1, y + 1, [x, y])
  }
  return false
  async function insert (x, y, pre) {
    if (x < 0 || y < 0 || x > 100 || y > 100) {
      return
    }
    if (map[x + 100 * y] != 0) {
      return
    }
    map[x + 100 * y] = pre
    oContainer.children[x + 100 * y].classList.add('visited')
    await sleep(5)
    queue.push([x, y])
  }
}

async function sleep (time) {
  return new Promise(resolve => {
    setTimeout(resolve, time)
  })
}