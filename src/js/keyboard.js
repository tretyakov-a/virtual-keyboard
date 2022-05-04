import { createElement, areSetsEqual } from './utils';
import ruKeys from './data/keys-ru.json';
import enKeys from './data/keys-en.json';
import keyboardLayout from './data/keyboard-layout.json';

class Keyboard {
  constructor(textArea) {
    this.buttons = {};
    this.language = 'en';
    this.currentKeySet = enKeys;
    this.pressedKeys = new Set();
    this.pressedKeyCode = '';
    this.textArea = textArea;
    this.operations = {
      languageSwitch: {
        keys: new Set(['AltLeft', 'ShiftLeft']),
        fn: () => {
          this.language = this.language === 'en' ? 'ru' : 'en';
          this.currentKeySet = this.language === 'en' ? enKeys : ruKeys;
          console.log('Language switched to ', this.language);
        },
      },
    };

    this.specialButtons = this.generateSpecialButtons();
    this.el = this.render();
    this.el.addEventListener('mousedown', this.handleKeyboardKeyDown);
    document.addEventListener('mouseup', this.handleKeyboardKeyUp);

    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('keyup', this.handleKeyUp);
  }

  generateSpecialButtons() {
    return Object.keys(this.currentKeySet).reduce((acc, keyCode) => {
      const {
        key, caps, shift, capsAndShift,
      } = enKeys[keyCode];
      if (key === caps && key === shift && key === capsAndShift) {
        acc.add(keyCode);
      }
      return acc;
    }, new Set());
  }

  space() {
    this.textArea.addCh(' ');
  }

  backspace() {
    const { selection: { start, end }, value } = this.textArea;
    if (start === end && start !== 0) {
      this.textArea.value = value.slice(0, start - 1) + value.slice(end);
      this.textArea.setCursor(start - 1);
    } else {
      this.textArea.deleteSelection();
    }
  }

  delete() {
    const { selection: { start, end }, value } = this.textArea;
    if (start === end && end !== 0) {
      this.textArea.value = value.slice(0, start) + value.slice(end + 1);
      this.textArea.setCursor(start);
    } else {
      this.textArea.deleteSelection();
    }
  }

  handleSpecialBtnPress = (keyCode) => {
    console.log('SPECIAL BTN PRESSED: ', keyCode);
    const fnName = keyCode[0].toLowerCase() + keyCode.slice(1);
    if (this[fnName]) this[fnName]();
  };

  handleKeyDown = (e) => {
    if ((e.isTrusted && document.activeElement !== this.textArea.render())
        || !this.buttons[e.code]) {
      return;
    }

    const isSpecialBtnPressed = this.specialButtons.has(e.code);
    if ((e.isTrusted && !isSpecialBtnPressed) || e.key === 'Tab' || e.key === 'Alt') {
      e.preventDefault();
    }
    const currentKey = this.currentKeySet[e.code];
    this.buttons[e.code].classList.add('button_active');

    this.pressedKeys.add(e.code);

    const ch = e.getModifierState('Shift') ? currentKey.shift : currentKey.key;

    if (isSpecialBtnPressed && !e.isTrusted) {
      this.handleSpecialBtnPress(e.code);
    } else if (!isSpecialBtnPressed) {
      this.textArea.addCh(ch);
    }

    Object.keys(this.operations).forEach((key) => {
      const op = this.operations[key];
      if (areSetsEqual(this.pressedKeys, op.keys)) {
        op.fn();
      }
    });
  };

  handleKeyUp = (e) => {
    if (!this.buttons[e.code]) {
      return;
    }
    this.buttons[e.code].classList.remove('button_active');
    this.pressedKeys.delete(e.code);
  };

  handleKeyboardKeyDown = (e) => {
    e.preventDefault();
    const btn = e.target.closest('.button');
    if (btn) {
      const { code } = btn.dataset;
      this.pressedKeyCode = code;
      document.dispatchEvent(new KeyboardEvent('keydown', { code }));
    }
  };

  handleKeyboardKeyUp = (e) => {
    e.preventDefault();
    const btn = e.target.closest('.button');

    const code = (btn && (this.pressedKeyCode !== btn.dataset.code)) || !btn
      ? this.pressedKeyCode
      : btn.dataset.code;

    document.dispatchEvent(new KeyboardEvent('keyup', { code }));
    this.pressedKeyCode = '';
  };

  render() {
    if (this.el) return this.el;
    const className = 'keyboard';
    const keyboard = createElement('div', className);

    keyboardLayout.forEach((layoutRow) => {
      const row = createElement('div', `${className}__row`);
      layoutRow.forEach((keyCode) => {
        const button = createElement('div', 'button');
        if (this.specialButtons.has(keyCode)) {
          button.classList.add(`button_${keyCode.toLowerCase()}`);
        }
        button.setAttribute('data-code', keyCode);
        button.textContent = this.currentKeySet[keyCode].key;
        this.buttons[keyCode] = button;
        row.append(button);
      });
      keyboard.append(row);
    });
    return keyboard;
  }
}

export default Keyboard;
