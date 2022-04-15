import './styles/index.scss';
import ruKeys from './assets/keys-ru.json';
import enKeys from './assets/keys-en.json';
import keyboardLayout from './assets/keyboard-layout.json';

// const text = document.querySelector('textarea');
// text.onkeydown = text.onkeyup = e => e.preventDefault();

let language = 'en';
const languageSwitch = new Set(['AltLeft', 'ShiftLeft']);

const pressedKeys = new Set();

const areSetsEqual = (a, b) => a.size === b.size && [...a].every(value => b.has(value));

const operations = {
  languageSwitch: {
    keys: new Set(['AltLeft', 'ShiftLeft']),
    fn: () => {
      language = language === 'en' ? 'ru' : 'en';
      console.log('Language switched to ', language);
    }
  }
}

const handleKeyDown = e => {
  console.log(e);

  pressedKeys.add(e.code);

  const keys = language === 'en' ? enKeys : ruKeys;
  const ch = e.getModifierState("Shift") ? keys[e.code].shift : keys[e.code].key;
  
  // text.value += ch;

  console.log(pressedKeys, languageSwitch);

  Object.keys(operations).forEach(key => {
    const op = operations[key];
    if (areSetsEqual(pressedKeys, op.keys)) {
      op.fn.call();
    }
  });
}

const handleKeyUp = e => {
  pressedKeys.delete(e.code);
}

document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);

// const keyA = document.querySelector('#KeyA');

// keyA.addEventListener('mousedown', (e) => {
//   e.preventDefault();
//   // text.focus();
//   document.dispatchEvent(new KeyboardEvent('keydown', {'code': 'KeyA'} ));
// });

// keyA.addEventListener('mouseup', () => {
//   document.dispatchEvent(new KeyboardEvent('keyup' , {'code': 'KeyA'} ));
// });

// text.addEventListener('blur', () => {
  // TODO: save cursor position here and restore

  // setTimeout(() => {
  //   text.focus();
  // });
// })

const uniqButtons = new Set(['Backspace', 'Tab', 'CapsLock', 'Enter', 'ShiftLeft', 'ShiftRight', 'ControlLeft', 'Space']);

function createElement(tag, classes) {
  const el = document.createElement(tag);
  el.classList.add(classes);
  return el;
}

function generateKeyboard(container, keys, layout) {
  console.log(layout);
  const className = 'keyboard';
  const keyboard = createElement('div', className);

  layout.forEach(row => {
    const rowEl = createElement('div', `${className}__row`);
    row.forEach(keyCode => {

      console.log('generate button: ', keyCode);

      if (Array.isArray(keyCode)) {
        const btnGroup = createElement('div', 'button-group');
        keyCode.forEach(groupKeyCode => {
          const className = groupKeyCode === '' ? 'button-group__empty-space' : 'button';
          const button = createElement('div', className);
          button.textContent = groupKeyCode === '' ? '' : keys[groupKeyCode].key;
          btnGroup.insertAdjacentElement('beforeend', button);
        })
        rowEl.insertAdjacentElement('beforeend', btnGroup);
      } else {
        const button = createElement('div', 'button');
        if (uniqButtons.has(keyCode)) {
          button.classList.add(`button_${keyCode.toLowerCase()}`);
        }
        button.textContent = keys[keyCode].key;
        rowEl.insertAdjacentElement('beforeend', button);
      }      
    })
    keyboard.insertAdjacentElement('beforeend', rowEl);
  });

  container.insertAdjacentElement('afterbegin', keyboard);
}

generateKeyboard(
  document.querySelector('body'),
  enKeys,
  keyboardLayout
);