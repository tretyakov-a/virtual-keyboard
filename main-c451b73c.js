(()=>{"use strict";function createElement(tag,classes){const el=document.createElement(tag);return classes&&el.classList.add(classes),el}class TextArea{constructor(){this.class="textarea",this.el=this.render(),this.setCursor(this.value.length),this.el.addEventListener("click",this.handleClick),requestAnimationFrame((()=>setTimeout((()=>{const{lineHeight,paddingTop}=window.getComputedStyle(this.el);this.lineHeight=Number.parseFloat(lineHeight),this.paddingTop=Number.parseFloat(paddingTop)}),0)))}get value(){return this.el.value}set value(v){this.el.value=v}get selection(){const{selectionStart:start,selectionEnd:end}=this.el;return{start,end}}isFocused(){return document.activeElement===this.el}handleClick=e=>{this._resetMoveState();const{offsetY,offsetX}=e,{lineHeight,paddingTop}=this;offsetX>paddingTop+lineHeight&&(this.lineIndex=Math.trunc((offsetY-paddingTop)/lineHeight),this.isMouseClick=!0)};setCursor(pos){this.el.selectionStart=pos,this.el.selectionEnd=pos}addText(text){const{selection:{start,end}}=this;this.el.setRangeText(text,start,end,"end"),this._resetMoveState()}selectAll(){this.selectMode=TextArea.SELECT_MODE.RIGHT,this.el.select()}selectLeft(){const{selection:{start,end}}=this;start===end&&(this.selectMode=TextArea.SELECT_MODE.LEFT),this.selectMode===TextArea.SELECT_MODE.LEFT?this.el.setSelectionRange(0!==start?start-1:0,end):this.el.setSelectionRange(start,end-1)}selectRight(){const{selection:{start,end}}=this;start===end&&(this.selectMode=TextArea.SELECT_MODE.RIGHT),this.selectMode===TextArea.SELECT_MODE.RIGHT?this.el.setSelectionRange(start,end+1):this.el.setSelectionRange(start+1,end)}_resetMoveState(){this.isDecrease=!1,this.isBoundaryMove=!1,this.isMouseClick=!1}arrowLeft(){const{selection:{start}}=this;this.setCursor(0===start?start:start-1),this._resetMoveState()}arrowRight(){this.setCursor(this.selection.start+1),this._resetMoveState()}_getEolsPositions(){let sum=0;return this.el.value.split("\n").map((({length},i)=>{const pos=length+i+sum;return sum+=length,pos})).slice(0,-1)}_getRowsPositions(rows){const eolsPositions=this._getEolsPositions();let lastPosition=0;return rows.map(((row,i)=>{const start=lastPosition;let end=lastPosition+row.length-(i===rows.length-1?0:1);return eolsPositions.find((v=>v===end+1))&&(end+=1,lastPosition+=1),lastPosition+=row.length,{start,end}}))}_findRowIndex(){const{selection:{start:cursorPos}}=this,rows=new FormData(this.el.parentElement).get("text").split("\n"),rowsPositions=this._getRowsPositions(rows);let isWrongIndex=!1,index=rowsPositions.findIndex((({start,end},i)=>(isWrongIndex=cursorPos===start&&this.isMouseClick&&this.lineIndex===i-1,cursorPos>=start&&cursorPos<=end)));return this.isMouseClick=!1,index-=isWrongIndex,{index,rowsPositions}}_makeBoundaryMove(direction,rowStart){const{selection:{start:cursorPos}}=this,isDirectionUp=direction===TextArea.MOVE_DIRECTION.UP;this.isBoundaryMove||!isDirectionUp&&this.isDecrease||(this.prevOffset=cursorPos-rowStart),this.isBoundaryMove=!0,this.setCursor(isDirectionUp?0:this.el.value.length)}_moveVertically(direction){const{selection:{start:cursorPos}}=this,{index,rowsPositions}=this._findRowIndex();if(!rowsPositions[index+direction])return void this._makeBoundaryMove(direction,rowsPositions[index].start);const{start,end}=rowsPositions[index+direction];let rowOffset=cursorPos-rowsPositions[index].start;(this.isDecrease&&rowOffset<this.prevOffset||this.isBoundaryMove)&&(rowOffset=this.prevOffset),this.isDecrease=rowOffset>end-start,this.prevOffset=rowOffset,this.setCursor(this.isDecrease?end:start+rowOffset),this.isBoundaryMove=!1}arrowUp(){this._moveVertically(TextArea.MOVE_DIRECTION.UP)}arrowDown(){this._moveVertically(TextArea.MOVE_DIRECTION.DOWN)}enter(){this.addText("\n")}tab(){this.addText("    ")}space(){this.addText(" ")}backspace(){const{selection:{start,end}}=this;start===end&&0!==start?this.el.setRangeText("",start-1,end,"end"):this.deleteSelection()}delete(){const{selection:{start,end}}=this;start===end?this.el.setRangeText("",start,end+1,"end"):this.deleteSelection()}deleteSelection(){const{selection:{start,end}}=this;this.el.setRangeText("",start,end,"end")}render(){if(this.el)return this.el;const el=createElement("textarea",this.class);return el.setAttribute("cols","78"),el.setAttribute("rows","10"),el.setAttribute("wrap","hard"),el.setAttribute("name","text"),el.textContent="Focus me",el}}TextArea.MOVE_DIRECTION={UP:-1,DOWN:1},TextArea.SELECT_MODE={RIGHT:"right",LEFT:"left"};const text_area=TextArea,keys_common_namespaceObject=JSON.parse('{"Enter":{"value":"Enter<br>&#9166;","repeatable":true},"Backspace":{"value":"Backspace<br>&#9003;","repeatable":true},"ShiftLeft":{"value":"Shift<br>&#8679;","repeatable":false,"command":true,"commandKey":"shiftKey"},"ShiftRight":{"value":"Shift<br>&#8679;","repeatable":false,"command":true,"commandKey":"shiftKey"},"CapsLock":{"value":"Caps Lock<br>&#127280;","repeatable":false},"Tab":{"value":"Tab<br>&#11134;","repeatable":true},"Space":{"value":"","repeatable":true},"AltLeft":{"value":"Alt","repeatable":false,"command":true,"commandKey":"altKey"},"AltRight":{"value":"Alt","repeatable":false,"command":true,"commandKey":"altKey"},"ContextMenu":{"value":"&#9636;","repeatable":false},"ControlLeft":{"value":"Ctrl","repeatable":false,"command":true,"commandKey":"ctrlKey"},"ControlRight":{"value":"Ctrl","repeatable":false,"command":true,"commandKey":"ctrlKey"},"MetaLeft":{"value":"&#8984;","repeatable":false},"MetaRight":{"value":"&#8984;","repeatable":false},"ArrowUp":{"value":"&#9650;","repeatable":true},"ArrowDown":{"value":"&#9660;","repeatable":true},"ArrowLeft":{"value":"&#9664;","repeatable":true},"ArrowRight":{"value":"&#9654;","repeatable":true},"Delete":{"value":"Del<br>&#8998;","repeatable":true}}'),keyboard_layout_namespaceObject=JSON.parse('[["Backquote","Digit1","Digit2","Digit3","Digit4","Digit5","Digit6","Digit7","Digit8","Digit9","Digit0","Minus","Equal","Backspace"],["Tab","KeyQ","KeyW","KeyE","KeyR","KeyT","KeyY","KeyU","KeyI","KeyO","KeyP","BracketLeft","BracketRight","Backslash","Delete"],["CapsLock","KeyA","KeyS","KeyD","KeyF","KeyG","KeyH","KeyJ","KeyK","KeyL","Semicolon","Quote","Enter"],["ShiftLeft","KeyZ","KeyX","KeyC","KeyV","KeyB","KeyN","KeyM","Comma","Period","Slash","ArrowUp","ShiftRight"],["ControlLeft","MetaLeft","AltLeft","Space","AltRight","ArrowLeft","ArrowDown","ArrowRight","ControlRight"]]'),hotkeys_namespaceObject=JSON.parse('{"languageSwitch":["altKey","ctrlKey"],"selectAll":["ctrlKey","KeyA"],"selectLeft":["shiftKey","ArrowLeft"],"selectRight":["shiftKey","ArrowRight"]}');class Key{constructor(options){this._parseOptions(options),this.mods={active:"button_active",on:"button_on"},this.el=this.render()}_parseOptions(options){Object.keys(options).forEach((key=>{this[key]=options[key]})),this.isSpecial=void 0!==this.special,this.isRepeatable=!this.isSpecial||this.special.repeatable,this.isCommand=this.isSpecial&&this.special.command}setState(state,isOn){const method=isOn?"add":"remove";this.el.classList[method](this.mods[state])}get value(){return this._value}set value(newValue){this._value=newValue}setValue({state,languageController:{language}}){const prop=this.isSpecial?"innerHTML":"textContent";return this.value=this.isSpecial?this.special.value:this[language][state],this.el[prop]=this.value,this}setLabel(value){this.el.innerHTML=value}render(){if(this.el)return this.el;const{code,isSpecial}=this,key=createElement("div","button");return key.setAttribute("data-code",code),isSpecial&&key.classList.add(`button_${code.toLowerCase()}`),key}}Key.STATE={ACTIVE:"active",ON:"on"};const js_key=Key;class Keyboard{constructor(textArea,languageController){this.keys={},this.class="keyboard",this.languageController=languageController,this.pressedCommandKeys=new Set,this.pressedKeyCode="",this.textArea=textArea,this.hotKeys=Object.keys(hotkeys_namespaceObject).reduce(((acc,key)=>(acc[key]=new Set(hotkeys_namespaceObject[key]),acc)),{}),this.commandKeys=Object.keys(keys_common_namespaceObject).filter((key=>keys_common_namespaceObject[key].command)),this.state=Keyboard.STATE.KEY,this.isCapslock=!1,this.isShift=!1,this.repeatTimer=null,this.el=this.render(),this.mediaQuery=window.matchMedia("(max-width: 768px)"),this.handleMaxWidthChange(this.mediaQuery),this.mediaQuery.addEventListener("change",this.handleMaxWidthChange),this.el.addEventListener("mousedown",this.handleMouseDown),document.addEventListener("mouseup",this.handleMouseUp),document.addEventListener("keydown",this.handleKeyDown),document.addEventListener("keyup",this.handleKeyUp),window.addEventListener("blur",this.handleWindowBlur)}set isShift(newValue){this._isShift=newValue,this.changeState()}get isShift(){return this._isShift}set isCapslock(newValue){this._isCapslock=newValue,this.toggleButtonOn(["CapsLock"],newValue),this.changeState()}get isCapslock(){return this._isCapslock}changeState(){const{KEY,SHIFT,CAPSLOCK,CAPSANDSHIFT}=Keyboard.STATE;this.state=this.isCapslock&&this.isShift&&CAPSANDSHIFT||this.isShift&&SHIFT||this.isCapslock&&CAPSLOCK||KEY,this.updateButtons()}toggleButtonOn(btnKeys,isOn){btnKeys.forEach((key=>{this.keys[key]&&this.keys[key].setState(js_key.STATE.ON,isOn)}))}shiftLeft(value){this.isShift=value}shiftRight(value){this.shiftLeft(value)}capsLock(){this.isCapslock=!this.isCapslock}toggleCommandBtn(code,value){const{commandKey}=keys_common_namespaceObject[code],keys=Object.keys(keys_common_namespaceObject).filter((c=>keys_common_namespaceObject[c].commandKey===commandKey)),prop=`is${code}`;return this[prop]=void 0===value?!this[prop]:value,keys.forEach((key=>this.keys[key].setState(js_key.STATE.ACTIVE,this[prop]))),this[prop]}handleSpecialBtnDown({code}){const fnName=code[0].toLowerCase()+code.slice(1);this.textArea[fnName]&&this.textArea[fnName](),this[fnName]&&this[fnName]()}handleCommandBtnDown({code,isTrusted}){const{commandKey}=keys_common_namespaceObject[code],fnName=code[0].toLowerCase()+code.slice(1);this[fnName]&&this[fnName](!0),isTrusted||this.toggleCommandBtn(code)?this.pressedCommandKeys.add(commandKey):(this.pressedCommandKeys.delete(commandKey),this[fnName]&&this[fnName](!1))}handleCommandBtnUp({code,isTrusted}){const{commandKey}=keys_common_namespaceObject[code],fnName=code[0].toLowerCase()+code.slice(1);isTrusted&&(this.pressedCommandKeys.delete(commandKey),this[fnName]&&this[fnName](!1))}clearCommandKeys({isTrusted}){isTrusted||(this.pressedCommandKeys.clear(),this.commandKeys.forEach((code=>{const fnName=code[0].toLowerCase()+code.slice(1);this[fnName]&&this[fnName](!1),this.toggleCommandBtn(code,!1)})))}handleKeyDown=e=>{if(e.isTrusted&&!this.textArea.isFocused())return;e.preventDefault();const key=this.keys[e.code];if(key&&(!e.repeat||!key.isSpecial||key.isRepeatable))if(key.setState(js_key.STATE.ACTIVE,!0),key.isCommand)this.handleCommandBtnDown(e),this.handleHotkey(e)&&this.clearCommandKeys(e);else{const cmdsNumber=this.pressedCommandKeys.size;this.handleHotkey(e)||cmdsNumber&&(1!==cmdsNumber||!this.isShift)||(key.isSpecial?this.handleSpecialBtnDown(e):this.textArea.addText(key.value)),this.clearCommandKeys(e)}};handleKeyUp=e=>{if(e.isTrusted&&!this.textArea.isFocused())return;e.preventDefault();const key=this.keys[e.code];!key||e.repeat&&key.isSpecial&&!key.isRepeatable||(!e.isTrusted&&key.isCommand||key.setState(js_key.STATE.ACTIVE,!1),key.isCommand&&this.handleCommandBtnUp(e))};updateButtons(){Object.keys(this.keys).length&&Object.keys(this.languageController.keySet).forEach((keyCode=>{this.keys[keyCode].setValue(this)}))}languageSwitch(){this.languageController.toggle(),this.updateButtons()}handleHotkey({code}){const lastKey=this.keys[code],keysForCompare=new Set(this.pressedCommandKeys);return lastKey.isCommand||keysForCompare.add(code),Object.keys(this.hotKeys).some((fnName=>{const keys=this.hotKeys[fnName];if(lastKey.isCommand&&!keys.has(keys_common_namespaceObject[code].commandKey))return!1;const isEqual=function areSetsEqual(a,b){return a.size===b.size&&[...a].every((value=>b.has(value)))}(keysForCompare,keys);return isEqual&&(this.textArea[fnName]&&this.textArea[fnName](),this[fnName]&&this[fnName]()),isEqual}))}repeatBtn(code,delay){this.repeatTimer=setTimeout((()=>{document.dispatchEvent(new KeyboardEvent("keydown",{code,repeat:!0})),this.repeatBtn(code,Keyboard.REPEAT.PERIOD)}),delay)}handleMouseDown=e=>{e.preventDefault(),this.textArea.el.focus();const btn=e.target.closest(".button");if(btn){const{code}=btn.dataset;this.pressedKeyCode=code,document.dispatchEvent(new KeyboardEvent("keydown",{code})),this.keys[code].isRepeatable&&this.repeatBtn(code,Keyboard.REPEAT.DELAY)}};handleMouseUp=e=>{clearTimeout(this.repeatTimer);const btn=e.target.closest(".button");if(!btn){const pressedKey=this.keys[this.pressedKeyCode];return void(pressedKey&&!pressedKey.isCommand&&pressedKey.setState(js_key.STATE.ACTIVE,!1))}const code=this.pressedKeyCode!==btn.dataset.code?this.pressedKeyCode:btn.dataset.code;document.dispatchEvent(new KeyboardEvent("keyup",{code})),this.pressedKeyCode=""};render(){if(this.el)return this.el;const keyboard=createElement("div",this.class);return keyboard_layout_namespaceObject.forEach((layoutRow=>{const row=createElement("div",`${this.class}__row`);layoutRow.forEach((code=>{const special=keys_common_namespaceObject[code],key=new js_key({code,special,...!special&&this.languageController.getKeyValues(code)}).setValue(this);this.keys[code]=key,row.append(key.render())})),keyboard.append(row)})),keyboard}handleWindowBlur=()=>{this.pressedKeyCode="",this.pressedCommandKeys.clear(),this.commandKeys.forEach((code=>{const fnName=code[0].toLowerCase()+code.slice(1);this[fnName]&&this[fnName](!1),this.toggleCommandBtn(code,!1)})),this.isShift=!1,Object.keys(this.keys).forEach((key=>{this.keys[key].setState(js_key.STATE.ACTIVE,!1)}))};handleMaxWidthChange=({matches})=>{Object.keys(keys_common_namespaceObject).forEach((code=>{if(this.keys[code]){const{value}=this.keys[code],match=value.match(/.*<br>(.*)/);if(match){const newValue=matches?match[1]:value;this.keys[code].setLabel(newValue)}}}))}}Keyboard.STATE={KEY:"key",SHIFT:"shift",CAPSLOCK:"caps",CAPSANDSHIFT:"capsAndShift"},Keyboard.REPEAT={DELAY:200,PERIOD:40};const js_keyboard=Keyboard;class LanguageController{constructor(keySets){this._load()||(this.language=LanguageController.LANGUAGE.DEFAULT),this.keySets=keySets}get keySet(){return this.keySets[this.language]}getKeyValues(code){return Object.keys(this.keySets).reduce(((acc,key)=>(acc[key]=this.keySets[key][code],acc)),{})}get language(){return this._language}set language(newValue){this._language!==newValue&&(this._language=newValue,this._save())}toggle(){const{EN,RU}=LanguageController.LANGUAGE,newLanguage=this.language===EN?RU:EN;this.language=newLanguage}_save(){localStorage.setItem(LanguageController.STORAGE,this.language)}_load(){return this.language=localStorage.getItem(LanguageController.STORAGE),null!==this.language}}LanguageController.STORAGE="language",LanguageController.LANGUAGE={EN:"en",RU:"ru",DEFAULT:"en"};const js_languageController=LanguageController,keys_ru_namespaceObject=JSON.parse('{"Backquote":{"key":"ё","shift":"Ё","caps":"Ё","capsAndShift":"ё"},"Digit1":{"key":"1","shift":"!","caps":"1","capsAndShift":"!"},"Digit2":{"key":"2","shift":"\\"","caps":"2","capsAndShift":"\\""},"Digit3":{"key":"3","shift":"№","caps":"3","capsAndShift":"№"},"Digit4":{"key":"4","shift":";","caps":"4","capsAndShift":";"},"Digit5":{"key":"5","shift":"%","caps":"5","capsAndShift":"%"},"Digit6":{"key":"6","shift":":","caps":"6","capsAndShift":":"},"Digit7":{"key":"7","shift":"?","caps":"7","capsAndShift":"?"},"Digit8":{"key":"8","shift":"*","caps":"8","capsAndShift":"*"},"Digit9":{"key":"9","shift":"(","caps":"9","capsAndShift":"("},"Digit0":{"key":"0","shift":")","caps":"0","capsAndShift":")"},"Minus":{"key":"-","shift":"_","caps":"-","capsAndShift":"_"},"Equal":{"key":"=","shift":"+","caps":"=","capsAndShift":"+"},"KeyQ":{"key":"й","shift":"Й","caps":"Й","capsAndShift":"й"},"KeyW":{"key":"ц","shift":"Ц","caps":"Ц","capsAndShift":"ц"},"KeyE":{"key":"у","shift":"У","caps":"У","capsAndShift":"у"},"KeyR":{"key":"к","shift":"К","caps":"К","capsAndShift":"к"},"KeyT":{"key":"е","shift":"Е","caps":"Е","capsAndShift":"е"},"KeyY":{"key":"н","shift":"Н","caps":"Н","capsAndShift":"н"},"KeyU":{"key":"г","shift":"Г","caps":"Г","capsAndShift":"г"},"KeyI":{"key":"ш","shift":"Ш","caps":"Ш","capsAndShift":"ш"},"KeyO":{"key":"щ","shift":"Щ","caps":"Щ","capsAndShift":"щ"},"KeyP":{"key":"з","shift":"З","caps":"З","capsAndShift":"з"},"BracketLeft":{"key":"х","shift":"Х","caps":"Х","capsAndShift":"х"},"BracketRight":{"key":"ъ","shift":"Ъ","caps":"Ъ","capsAndShift":"ъ"},"Backslash":{"key":"\\\\","shift":"/","caps":"\\\\","capsAndShift":"/"},"KeyA":{"key":"ф","shift":"Ф","caps":"Ф","capsAndShift":"ф"},"KeyS":{"key":"ы","shift":"Ы","caps":"Ы","capsAndShift":"ы"},"KeyD":{"key":"в","shift":"В","caps":"В","capsAndShift":"в"},"KeyF":{"key":"а","shift":"А","caps":"А","capsAndShift":"а"},"KeyG":{"key":"п","shift":"П","caps":"П","capsAndShift":"п"},"KeyH":{"key":"р","shift":"Р","caps":"Р","capsAndShift":"р"},"KeyJ":{"key":"о","shift":"О","caps":"О","capsAndShift":"о"},"KeyK":{"key":"л","shift":"Л","caps":"Л","capsAndShift":"л"},"KeyL":{"key":"д","shift":"Д","caps":"Д","capsAndShift":"д"},"Semicolon":{"key":"ж","shift":"Ж","caps":"Ж","capsAndShift":"ж"},"Quote":{"key":"э","shift":"Э","caps":"Э","capsAndShift":"э"},"Slash":{"key":".","shift":",","caps":".","capsAndShift":","},"Period":{"key":"ю","shift":"Ю","caps":"Ю","capsAndShift":"ю"},"Comma":{"key":"б","shift":"Б","caps":"Б","capsAndShift":"б"},"KeyM":{"key":"ь","shift":"Ь","caps":"Ь","capsAndShift":"ь"},"KeyN":{"key":"т","shift":"Т","caps":"Т","capsAndShift":"т"},"KeyB":{"key":"и","shift":"И","caps":"И","capsAndShift":"и"},"KeyV":{"key":"м","shift":"М","caps":"М","capsAndShift":"м"},"KeyC":{"key":"с","shift":"С","caps":"С","capsAndShift":"с"},"KeyX":{"key":"ч","shift":"Ч","caps":"Ч","capsAndShift":"ч"},"KeyZ":{"key":"я","shift":"Я","caps":"Я","capsAndShift":"я"}}'),keys_en_namespaceObject=JSON.parse('{"Backquote":{"key":"`","caps":"`","capsAndShift":"~","shift":"~"},"Digit1":{"key":"1","shift":"!","caps":"1","capsAndShift":"!"},"Digit2":{"shift":"@","caps":"2","capsAndShift":"@","key":"2"},"Digit3":{"key":"3","shift":"#","caps":"3","capsAndShift":"#"},"Digit4":{"key":"4","shift":"$","caps":"4","capsAndShift":"$"},"Digit5":{"key":"5","shift":"%","caps":"5","capsAndShift":"%"},"Digit6":{"key":"6","shift":"^","caps":"6","capsAndShift":"^"},"Digit7":{"key":"7","shift":"&","caps":"7","capsAndShift":"&"},"Digit8":{"key":"8","shift":"*","caps":"8","capsAndShift":"*"},"Digit9":{"key":"9","shift":"(","caps":"9","capsAndShift":"("},"Digit0":{"key":"0","shift":")","caps":"0","capsAndShift":")"},"Minus":{"key":"-","shift":"_","caps":"-","capsAndShift":"_"},"Equal":{"key":"=","shift":"+","caps":"=","capsAndShift":"+"},"KeyQ":{"key":"q","shift":"Q","caps":"Q","capsAndShift":"q"},"KeyW":{"key":"w","shift":"W","caps":"W","capsAndShift":"w"},"KeyE":{"key":"e","shift":"E","caps":"E","capsAndShift":"e"},"KeyR":{"key":"r","shift":"R","caps":"R","capsAndShift":"r"},"KeyT":{"key":"t","shift":"T","caps":"T","capsAndShift":"t"},"KeyY":{"key":"y","shift":"Y","caps":"Y","capsAndShift":"y"},"KeyU":{"key":"u","shift":"U","caps":"U","capsAndShift":"u"},"KeyI":{"key":"i","shift":"I","caps":"I","capsAndShift":"i"},"KeyO":{"key":"o","shift":"O","caps":"O","capsAndShift":"o"},"KeyP":{"key":"p","shift":"P","caps":"P","capsAndShift":"p"},"BracketLeft":{"key":"[","shift":"{","caps":"[","capsAndShift":"{"},"BracketRight":{"key":"]","shift":"}","caps":"]","capsAndShift":"}"},"Backslash":{"key":"\\\\","shift":"|","caps":"\\\\","capsAndShift":"|"},"KeyA":{"key":"a","shift":"A","caps":"A","capsAndShift":"a"},"KeyS":{"key":"s","shift":"S","caps":"S","capsAndShift":"s"},"KeyD":{"key":"d","shift":"D","caps":"D","capsAndShift":"d"},"KeyF":{"key":"f","shift":"F","caps":"F","capsAndShift":"f"},"KeyG":{"key":"g","shift":"G","caps":"G","capsAndShift":"g"},"KeyH":{"key":"h","shift":"H","caps":"H","capsAndShift":"h"},"KeyJ":{"key":"j","shift":"J","caps":"J","capsAndShift":"j"},"KeyK":{"key":"k","shift":"K","caps":"K","capsAndShift":"k"},"KeyL":{"key":"l","shift":"L","caps":"L","capsAndShift":"l"},"Semicolon":{"key":";","shift":":","caps":";","capsAndShift":":"},"Quote":{"key":"\'","shift":"\\"","caps":"\'","capsAndShift":"\\""},"KeyZ":{"key":"z","shift":"Z","caps":"Z","capsAndShift":"z"},"KeyX":{"key":"x","shift":"X","caps":"X","capsAndShift":"x"},"KeyC":{"key":"c","shift":"C","caps":"C","capsAndShift":"c"},"KeyV":{"key":"v","shift":"V","caps":"V","capsAndShift":"v"},"KeyB":{"key":"b","shift":"B","caps":"B","capsAndShift":"b"},"KeyN":{"key":"n","shift":"N","caps":"N","capsAndShift":"n"},"KeyM":{"key":"m","shift":"M","caps":"M","capsAndShift":"m"},"Comma":{"key":",","shift":"<","caps":",","capsAndShift":"<"},"Period":{"key":".","shift":">","caps":".","capsAndShift":">"},"Slash":{"key":"/","shift":"?","caps":"/","capsAndShift":"?"}}');document.addEventListener("DOMContentLoaded",(()=>{const{EN,RU}=js_languageController.LANGUAGE,languageController=new js_languageController({[EN]:keys_en_namespaceObject,[RU]:keys_ru_namespaceObject}),container=createElement("div","container"),textArea=new text_area,form=createElement("form");form.append(textArea.render());const keyboard=new js_keyboard(textArea,languageController);container.insertAdjacentHTML("afterbegin",'\n  <header class="header">\n    <h1>Virtual Keyboard</h1>\n  </header>\n'),container.append(form),container.append(keyboard.render()),container.insertAdjacentHTML("beforeend",'\n  <footer class="footer">\n    <div class="footer__info">\n      <p>Keyboard was created in Windows OS</p>\n      <p>Language switch: Ctrl + Alt</p>\n    </div>\n    <div class="footer__right">\n    <a class="footer__github-link" href="https://github.com/tretyakov-a" title="GitHub" target="_blank">\n      <svg width="1024" height="1024" viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg">\n        <path fill-rule="evenodd" clip-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z" transform="scale(64)"/>\n      </svg>\n      tretyakov-a\n    </a>\n    <div class="footer__year">\n      2022&nbsp;\n    </div>\n    <a class="rsschool-logo" href="https://rs.school/js/" title="https://rs.school/js/" target="_blank">\n      <svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 552.8 205.3">\n        <style>.st0{fill:#fff}.st1{clip-path:url(#SVGID_2_)}.st2{clip-path:url(#SVGID_4_)}.st3{clip-path:url(#SVGID_6_)}.st4{clip-path:url(#SVGID_8_)}.st5{fill:#fff;stroke-width:4;stroke-miterlimit:10}.st6{clip-path:url(#SVGID_8_)}.st6,.st7{fill:none;stroke-width:4;stroke-miterlimit:10}.st8,.st9{clip-path:url(#SVGID_10_)}.st9{fill:none;stroke-width:4;stroke-miterlimit:10}</style>\n        <title>RS School JS</title>\n        <path class="logo-path" d="M285.4 68l26.3-1.7c.6 4.3 1.7 7.5 3.5 9.8 2.9 3.6 6.9 5.4 12.2 5.4 3.9 0 7-.9 9.1-2.8 2-1.5 3.2-3.9 3.2-6.4 0-2.4-1.1-4.7-3-6.2-2-1.8-6.7-3.6-14.1-5.2-12.1-2.7-20.8-6.3-25.9-10.9-5.1-4.3-8-10.6-7.8-17.3 0-4.6 1.4-9.2 4-13 3-4.3 7.1-7.7 12-9.6 5.3-2.3 12.7-3.5 22-3.5 11.4 0 20.1 2.1 26.1 6.4 6 4.2 9.6 11 10.7 20.3l-26 1.5c-.7-4-2.1-6.9-4.4-8.8s-5.3-2.8-9.2-2.8c-3.2 0-5.6.7-7.2 2-1.5 1.2-2.5 3-2.4 5 0 1.5.8 2.9 2 3.8 1.3 1.2 4.4 2.3 9.3 3.3 12.1 2.6 20.7 5.2 26 7.9 5.3 2.7 9.1 6 11.4 9.9 2.4 4 3.6 8.6 3.5 13.3 0 5.6-1.6 11.2-4.8 15.9-3.3 4.9-7.9 8.7-13.3 11-5.7 2.5-12.9 3.8-21.5 3.8-15.2 0-25.7-2.9-31.6-8.8S286.1 77 285.4 68zM6.3 97.6V8.2h46.1c8.5 0 15.1.7 19.6 2.2 4.4 1.4 8.3 4.3 10.9 8.2 2.9 4.3 4.3 9.3 4.2 14.5.3 8.8-4.2 17.2-11.9 21.6-3 1.7-6.3 2.9-9.7 3.5 2.5.7 5 1.9 7.2 3.3 1.7 1.4 3.1 3 4.4 4.7 1.5 1.7 2.8 3.6 3.9 5.6l13.4 25.9H63L48.2 70.2c-1.9-3.5-3.5-5.8-5-6.9-2-1.4-4.4-2.1-6.8-2.1H34v36.3H6.3zM34 44.4h11.7c2.5-.2 4.9-.6 7.3-1.2 1.8-.3 3.4-1.3 4.5-2.8 2.7-3.6 2.3-8.7-1-11.8-1.8-1.5-5.3-2.3-10.3-2.3H34v18.1zM0 174.2l26.3-1.7c.6 4.3 1.7 7.5 3.5 9.8 2.8 3.6 6.9 5.5 12.2 5.5 3.9 0 7-.9 9.1-2.8 2-1.6 3.2-3.9 3.2-6.4 0-2.4-1.1-4.7-3-6.2-2-1.8-6.7-3.6-14.2-5.2-12.1-2.7-20.8-6.3-25.9-10.9-5.1-4.3-8-10.6-7.8-17.3 0-4.6 1.4-9.2 4-13 3-4.3 7.1-7.7 12-9.6 5.3-2.3 12.7-3.5 22-3.5 11.4 0 20.1 2.1 26.1 6.4s9.5 11 10.6 20.3l-26 1.5c-.7-4-2.1-6.9-4.4-8.8-2.2-1.9-5.3-2.8-9.2-2.7-3.2 0-5.6.7-7.2 2.1-1.6 1.2-2.5 3-2.4 5 0 1.5.8 2.9 2 3.8 1.3 1.2 4.4 2.3 9.3 3.3 12.1 2.6 20.7 5.2 26 7.9 5.3 2.7 9.1 6 11.4 9.9 2.4 4 3.6 8.6 3.6 13.2 0 5.6-1.7 11.1-4.8 15.8-3.3 4.9-7.9 8.7-13.3 11-5.7 2.5-12.9 3.8-21.5 3.8-15.2 0-25.7-2.9-31.6-8.8-5.9-6-9.2-13.4-10-22.4z"/>\n        <path class="logo-path" d="M133 167.2l24.2 7.3c-1.3 6.1-4 11.9-7.7 17-3.4 4.5-7.9 8-13 10.3-5.2 2.3-11.8 3.5-19.8 3.5-9.7 0-17.7-1.4-23.8-4.2-6.2-2.8-11.5-7.8-16-14.9-4.5-7.1-6.7-16.2-6.7-27.3 0-14.8 3.9-26.2 11.8-34.1s19-11.9 33.4-11.9c11.3 0 20.1 2.3 26.6 6.8 6.4 4.6 11.2 11.6 14.4 21l-24.4 5.4c-.6-2.1-1.5-4.2-2.7-6-1.5-2.1-3.4-3.7-5.7-4.9-2.3-1.2-4.9-1.7-7.5-1.7-6.3 0-11.1 2.5-14.4 7.6-2.5 3.7-3.8 9.6-3.8 17.6 0 9.9 1.5 16.7 4.5 20.4 3 3.7 7.2 5.5 12.7 5.5 5.3 0 9.3-1.5 12-4.4 2.7-3.1 4.7-7.4 5.9-13zm56.5-52.8h27.6v31.3h30.2v-31.3h27.8v89.4h-27.8v-36.2h-30.2v36.2h-27.6v-89.4z"/>\n        <path class="logo-path" d="M271.3 159.1c0-14.6 4.1-26 12.2-34.1 8.1-8.1 19.5-12.2 34-12.2 14.9 0 26.3 4 34.4 12S364 144 364 158.4c0 10.5-1.8 19-5.3 25.7-3.4 6.6-8.7 12-15.2 15.6-6.7 3.7-15 5.6-24.9 5.6-10.1 0-18.4-1.6-25-4.8-6.8-3.4-12.4-8.7-16.1-15.2-4.1-7-6.2-15.7-6.2-26.2zm27.6.1c0 9 1.7 15.5 5 19.5 3.3 3.9 7.9 5.9 13.7 5.9 5.9 0 10.5-1.9 13.8-5.8s4.9-10.8 4.9-20.8c0-8.4-1.7-14.6-5.1-18.4-3.4-3.9-8-5.8-13.8-5.8-5.1-.2-10 2-13.4 5.9-3.4 3.9-5.1 10.4-5.1 19.5zm93.4-.1c0-14.6 4.1-26 12.2-34.1 8.1-8.1 19.5-12.2 34-12.2 14.9 0 26.4 4 34.4 12S485 144 485 158.4c0 10.5-1.8 19-5.3 25.7-3.4 6.6-8.7 12-15.2 15.6-6.7 3.7-15 5.6-24.9 5.6-10.1 0-18.4-1.6-25-4.8-6.8-3.4-12.4-8.7-16.1-15.2-4.1-7-6.2-15.7-6.2-26.2zm27.6.1c0 9 1.7 15.5 5 19.5 3.3 3.9 7.9 5.9 13.7 5.9 5.9 0 10.5-1.9 13.8-5.8 3.3-3.9 4.9-10.8 4.9-20.8 0-8.4-1.7-14.6-5.1-18.4-3.4-3.9-8-5.8-13.8-5.8-5.1-.2-10.1 2-13.4 5.9-3.4 3.9-5.1 10.4-5.1 19.5z"/>\n        <path class="logo-path" d="M482.1 114.4h27.6v67.4h43.1v22H482v-89.4z"/>\n        <ellipse transform="rotate(-37.001 420.46 67.88)" class="st0" cx="420.5" cy="67.9" rx="63" ry="51.8"/><defs><ellipse id="SVGID_1_" class="st0" transform="rotate(-37.001 420.46 67.88)" cx="420.5" cy="67.9" rx="63" ry="51.8"/></defs><clipPath id="SVGID_2_"><use xlink:href="#SVGID_1_" overflow="visible"/></clipPath><g class="st1"><path transform="rotate(-37.001 420.82 68.353)" class="st0" d="M330.9-14.2h179.8v165.1H330.9z"/><g id="Layer_2_1_"><defs><path id="SVGID_3_" transform="rotate(-37.001 420.82 68.353)" d="M330.9-14.2h179.8v165.1H330.9z"/></defs><clipPath id="SVGID_4_"><use xlink:href="#SVGID_3_" overflow="visible"/></clipPath><g id="Layer_1-2" class="st2"><ellipse transform="rotate(-37.001 420.46 67.88)" class="st0" cx="420.5" cy="67.9" rx="63" ry="51.8"/><defs><ellipse id="SVGID_5_" transform="rotate(-37.001 420.46 67.88)" cx="420.5" cy="67.9" rx="63" ry="51.8"/></defs><clipPath id="SVGID_6_"><use xlink:href="#SVGID_5_" overflow="visible"/></clipPath><g class="st3"><path transform="rotate(-37 420.799 68.802)" class="st0" d="M357.8 17h125.9v103.7H357.8z"/><defs><path id="SVGID_7_" transform="rotate(-37 420.799 68.802)" d="M357.8 17h125.9v103.7H357.8z"/></defs><clipPath id="SVGID_8_"><use xlink:href="#SVGID_7_" overflow="visible"/></clipPath><g class="st4"><ellipse transform="rotate(-37.001 420.46 67.88)" class="st5" cx="420.5" cy="67.9" rx="63" ry="51.8"/></g><path transform="rotate(-37 420.799 68.802)" class="st6" d="M357.8 17h125.9v103.7H357.8z"/><ellipse transform="rotate(-37.001 420.46 67.88)" class="st7" cx="420.5" cy="67.9" rx="63" ry="51.8"/><path transform="rotate(-37 420.799 68.802)" class="st0" d="M357.8 17h125.9v103.7H357.8z"/><defs><path id="SVGID_9_" transform="rotate(-37 420.799 68.802)" d="M357.8 17h125.9v103.7H357.8z"/></defs><clipPath id="SVGID_10_"><use xlink:href="#SVGID_9_" overflow="visible"/></clipPath><g class="st8"><ellipse transform="rotate(-37.001 420.46 67.88)" class="st5" cx="420.5" cy="67.9" rx="63" ry="51.8"/></g><path transform="rotate(-37 420.799 68.802)" class="st9" d="M357.8 17h125.9v103.7H357.8z"/><path transform="rotate(-37.001 420.82 68.353)" class="st7" d="M330.9-14.2h179.8v165.1H330.9z"/></g><ellipse transform="rotate(-37.001 420.46 67.88)" class="st7" cx="420.5" cy="67.9" rx="63" ry="51.8"/>\n        <path class="st1" d="M392.4 61.3l10-7 12.3 17.5c2.1 2.8 3.7 5.8 4.9 9.1.7 2.5.5 5.2-.5 7.6-1.3 3-3.4 5.5-6.2 7.3-3.3 2.3-6.1 3.6-8.5 4-2.3.4-4.7 0-6.9-1-2.4-1.2-4.5-2.9-6.1-5.1l8.6-8c.7 1.1 1.6 2.1 2.6 2.9.7.5 1.5.8 2.4.8.7 0 1.4-.3 1.9-.7 1-.6 1.7-1.8 1.6-3-.3-1.7-1-3.4-2.1-4.7l-14-19.7zm30 11.1l9.1-7.2c1 1.2 2.3 2.1 3.7 2.6 2 .6 4.1.2 5.8-1.1 1.2-.8 2.2-1.9 2.6-3.3.6-1.8-.4-3.8-2.2-4.4-.3-.1-.6-.2-.9-.2-1.2-.1-3.3.4-6.4 1.7-5.1 2.1-9.1 2.9-12.1 2.6-2.9-.3-5.6-1.8-7.2-4.3-1.2-1.7-1.8-3.7-1.9-5.7 0-2.3.6-4.6 1.9-6.5 1.9-2.7 4.2-5 7-6.8 4.2-2.9 7.9-4.3 11.1-4.3 3.2 0 6.2 1.5 9 4.6l-9 7.1c-1.8-2.3-5.2-2.8-7.5-1l-.3.3c-1 .6-1.7 1.5-2.1 2.6-.3.8-.1 1.7.4 2.4.4.5 1 .9 1.7.9.8.1 2.2-.3 4.2-1.2 5-2.1 8.8-3.3 11.4-3.7 2.2-.4 4.5-.2 6.6.7 1.9.8 3.5 2.2 4.6 3.9 1.4 2 2.2 4.4 2.3 6.9.1 2.6-.6 5.1-2 7.3-1.8 2.7-4.1 5-6.8 6.8-5.5 3.8-10 5.4-13.6 4.8-3.9-.6-7.1-2.6-9.4-5.5z"/></g></g></g>\n      </svg>\n    </a>\n    </div>\n  </footer>\n'),document.body.append(container)}))})();