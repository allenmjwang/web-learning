import Input from './input';
import createThemeSelect from './themeSelect';
import {createPad, updatePad} from './pad';
import layout1 from './layout1.json';
import layout2 from './layout2.json';

const input = new Input({clearCallback: clearResult});
// 简单的乘法器
function appendResult (content) {
  var result = document.getElementById('mul-result');
  result.value += content;
}
function clearResult () {
  var result = document.getElementById('mul-result');
  result.value = '';
}
function buttonClickHandler (event) {
  var value = event.target.value;
  appendResult(value);
}
function numberClickHandler (event) {
  var number = Number(event.target.value);
  input.addNumber(number);
  buttonClickHandler(event);
}
function resultClickHandler (event) {
  if (input.isEnd()) {
    clearResult();
    return;
  }
  buttonClickHandler(event);
  input.end();
  appendResult(input.getResult());
}
function clearClickHandler (event) {
  buttonClickHandler(event);
  clearResult();
}
function opClickHandler (event) {
  var value = event.target.value;
  appendResult(value);
  input.addOperator(value);
}

const callbacks = {
  'mul-1': {cb: numberClickHandler},
  'mul-2': {cb: numberClickHandler},
  'mul-3': {cb: numberClickHandler},
  'mul-4': {cb: numberClickHandler},
  'mul-5': {cb: numberClickHandler},
  'mul-6': {cb: numberClickHandler},
  'mul-7': {cb: numberClickHandler},
  'mul-8': {cb: numberClickHandler},
  'mul-9': {cb: numberClickHandler},
  'mul-0': {cb: numberClickHandler},
  'mul-+': {cb: opClickHandler},
  'mul--': {cb: opClickHandler},
  'mul-*': {cb: opClickHandler},
  'mul-／': {cb: opClickHandler},
  'mul-=': {cb: resultClickHandler},
  'mul-clr': {cb: clearClickHandler}
};
function createMapFromLayout ({layout, callbacks}) {
  const infoMap = new Map();
  const keys = Object.keys(layout);
  keys.forEach(key => {
    infoMap[key] = Object.assign({}, layout[key], {cb: callbacks[key].cb});
  });
  return infoMap;
}

const themes = {
  '主题1': createMapFromLayout({layout: layout1, callbacks}),
  '主题2': createMapFromLayout({layout: layout2, callbacks})
};

const httpRequest = new XMLHttpRequest();
function requestThemes ({onFinish}) {
  httpRequest.onreadystatechange = onFinish;
  const url = 'http://localhost:4000/layouts';
  httpRequest.open('GET', url);
  httpRequest.send();
}
function layoutsCB({onSuccess,onFail}) {
  if (httpRequest.readyState === XMLHttpRequest.DONE) {
    if (httpRequest.status === 200) {
        console.log('request done: ' + httpRequest.responseText);
        onSuccess({body:httpRequest.responseText});
    } else {
        onFail({status: httpRequest.status});
    }
  }
}
function createPage (content) {
  content.innerHTML = '<h2>简单乘法器</h2>' +
        '<div id="multiplier">' +
        '<input id="mul-result" type="text" class="form-control" readonly />' +
        '</div>'
    ;

  const container = document.getElementById('multiplier');
  requestThemes({onFinish: ()=>{
      layoutsCB({
          onSuccess:({body})=>{
              const jsonArray = JSON.parse(body);
              console.log("jsonArray=="+JSON.stringify(jsonArray));
              console.log("jsonArray layout1=="+JSON.stringify(jsonArray[0]));

              createThemeSelect({parentNode: container, themes, onSelect: (selectInfo) => updatePad(container, selectInfo)});
              createPad(container, Object.values(themes)[0]);
          },
          onFail:({status})=>{
              console.log('request fail');
          }
      });
  }});
}

export default createPage;
