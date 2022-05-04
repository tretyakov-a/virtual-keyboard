import '../styles/index.scss';
import ruKeys from './data/keys-ru.json';
import enKeys from './data/keys-en.json';
import keyboardLayout from './data/keyboard-layout.json';

import { createElement, areSetsEqual } from './utils';
import TextArea from './text-area';

let textArea = null;

const buttons = {};
let language = 'en';
let currentKeySet = enKeys;

const pressedKeys = new Set();

const operations = {
  languageSwitch: {
    keys: new Set(['AltLeft', 'ShiftLeft']),
    fn: () => {
      language = language === 'en' ? 'ru' : 'en';
      currentKeySet = language === 'en' ? enKeys : ruKeys;
      console.log('Language switched to ', language);
    },
  },
};

const specialButtons = Object.keys(enKeys).reduce((acc, keyCode) => {
  const {
    key, caps, shift, capsAndShift,
  } = enKeys[keyCode];
  if (key === caps && key === shift && key === capsAndShift) {
    acc.add(keyCode);
  }
  return acc;
}, new Set());

const specialButtonFns = {
  space() {
    textArea.addCh(' ');
  },
  backspace() {
    const { start, end } = textArea.selection;
    if (start === end && start !== 0) {
      textArea.value = textArea.value.slice(0, start - 1) + textArea.value.slice(end);
      textArea.setCursor(start - 1);
    } else {
      textArea.deleteSelection();
    }
  },
  delete() {
    const { start, end } = textArea.selection;
    if (start === end && end !== 0) {
      textArea.value = textArea.value.slice(0, start) + textArea.value.slice(end + 1);
      textArea.setCursor(start);
    } else {
      textArea.deleteSelection();
    }
  },
};

function handleSpecialBtnPress(keyCode) {
  console.log('SPECIAL BTN PRESSED: ', keyCode);
  const fnName = keyCode[0].toLowerCase() + keyCode.slice(1);
  if (specialButtonFns[fnName]) specialButtonFns[fnName]();
}

const handleKeyDown = (e) => {
  if ((e.isTrusted && document.activeElement !== textArea.render()) || !buttons[e.code]) {
    return;
  }

  const isSpecialBtnPressed = specialButtons.has(e.code);
  if ((e.isTrusted && !isSpecialBtnPressed) || e.key === 'Tab' || e.key === 'Alt') {
    e.preventDefault();
  }
  const currentKey = currentKeySet[e.code];
  buttons[e.code].classList.add('button_active');

  pressedKeys.add(e.code);

  const ch = e.getModifierState('Shift') ? currentKey.shift : currentKey.key;

  if (isSpecialBtnPressed && !e.isTrusted) {
    handleSpecialBtnPress(e.code);
  } else if (!isSpecialBtnPressed) {
    textArea.addCh(ch);
  }

  Object.keys(operations).forEach((key) => {
    const op = operations[key];
    if (areSetsEqual(pressedKeys, op.keys)) {
      op.fn();
    }
  });
};

const handleKeyUp = (e) => {
  if (!buttons[e.code]) {
    return;
  }
  buttons[e.code].classList.remove('button_active');
  pressedKeys.delete(e.code);
};

let pressedKeyCode = '';

function handleKeyboardKeyDown(e) {
  e.preventDefault();
  const btn = e.target.closest('.button');
  if (btn) {
    const { code } = btn.dataset;
    pressedKeyCode = code;
    document.dispatchEvent(new KeyboardEvent('keydown', { code }));
  }
}

function handleKeyboardKeyUp(e) {
  e.preventDefault();
  const btn = e.target.closest('.button');

  const code = (btn && (pressedKeyCode !== btn.dataset.code)) || !btn
    ? pressedKeyCode
    : btn.dataset.code;

  document.dispatchEvent(new KeyboardEvent('keyup', { code }));
  pressedKeyCode = '';
}

function renderKeyboard(keys, layout) {
  // console.log(layout);
  const className = 'keyboard';
  const keyboard = createElement('div', className);

  layout.forEach((layoutRow) => {
    const rowItems = createElement('div', `${className}__row`);
    layoutRow.forEach((keyCode) => {
      // console.log('generate button: ', keyCode);
      let rowItem = null;
      if (Array.isArray(keyCode)) {
        rowItem = createElement('div', 'button-group');
        keyCode.forEach((groupKeyCode) => {
          const btnClassName = groupKeyCode === '' ? 'button-group__empty-space' : 'button';
          const button = createElement('div', btnClassName);
          button.setAttribute('data-code', groupKeyCode);
          button.textContent = groupKeyCode === '' ? '' : keys[groupKeyCode].key;
          if (groupKeyCode !== '') {
            buttons[groupKeyCode] = button;
          }
          rowItem.insertAdjacentElement('beforeend', button);
        });
      } else {
        rowItem = createElement('div', 'button');
        if (specialButtons.has(keyCode)) {
          rowItem.classList.add(`button_${keyCode.toLowerCase()}`);
        }
        rowItem.setAttribute('data-code', keyCode);
        rowItem.textContent = keys[keyCode].key;
        buttons[keyCode] = rowItem;
      }

      rowItems.insertAdjacentElement('beforeend', rowItem);
    });
    keyboard.insertAdjacentElement('beforeend', rowItems);
  });

  return keyboard;
}

document.addEventListener('DOMContentLoaded', () => {
  const keyboard = renderKeyboard(
    enKeys,
    keyboardLayout,
  );
  keyboard.addEventListener('mousedown', handleKeyboardKeyDown);
  document.addEventListener('mouseup', handleKeyboardKeyUp);
  const container = createElement('div', 'container');

  textArea = new TextArea();
  container.append(textArea.render());
  container.append(keyboard);
  document.body.append(container);

  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('keyup', handleKeyUp);
});
