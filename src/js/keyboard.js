import { createElement, areSetsEqual } from './utils';
import ruKeys from './data/keys-ru.json';
import enKeys from './data/keys-en.json';
import commonKeys from './data/keys-common.json';
import keyboardLayout from './data/keyboard-layout.json';
import hotKeys from './data/hotkeys.json';

class Keyboard {
  constructor(textArea) {
    this.buttons = {};
    this.language = 'en';
    this.currentKeySet = enKeys;
    this.pressedKeys = new Set();
    this.pressedKeyCode = '';
    this.textArea = textArea;
    this.hotKeys = Object.keys(hotKeys).reduce((acc, key) => {
      acc[key] = new Set(hotKeys[key]);
      return acc;
    }, {});

    this.state = Keyboard.STATE.KEY;
    this.isCapslock = false;
    this.isShift = false;
    this.specialButtons = new Set(Object.keys(commonKeys));
    this.changeableButtons = Object.keys(enKeys);
    this.el = this.render();

    this.el.addEventListener('mousedown', this.handleMouseDown);
    document.addEventListener('mouseup', this.handleMouseUp);
    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('keyup', this.handleKeyUp);
  }

  set isShift(newValue) {
    this._isShift = newValue;
    this.toggleButtonOn(['ShiftLeft', 'ShiftRight'], newValue);
  }

  get isShift() {
    return this._isShift;
  }

  set isCapslock(newValue) {
    this._isCapslock = newValue;
    this.toggleButtonOn(['CapsLock'], newValue);
  }

  get isCapslock() {
    return this._isCapslock;
  }

  changeState() {
    const {
      KEY, SHIFT, CAPSLOCK, CAPSANDSHIFT,
    } = Keyboard.STATE;
    this.state = (
      ((this.isCapslock && this.isShift) && CAPSANDSHIFT)
      || (this.isShift && SHIFT)
      || (this.isCapslock && CAPSLOCK)
      || KEY
    );
  }

  toggleButtonOn(btnKeys, isOn) {
    const method = isOn ? 'add' : 'remove';
    btnKeys.forEach((key) => {
      if (this.buttons[key]) {
        this.buttons[key].classList[method]('button_on');
      }
    });
    this.changeState();
    this.updateButtons();
  }

  shiftLeft() {
    this.isShift = !this.isShift;
  }

  shiftRight() {
    this.shiftLeft();
  }

  capsLock() { this.isCapslock = !this.isCapslock; }

  handleSpecialBtnPress = (keyCode) => {
    console.log('SPECIAL BTN PRESSED: ', keyCode);
    const fnName = keyCode[0].toLowerCase() + keyCode.slice(1);
    if (this.textArea[fnName]) this.textArea[fnName]();
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
    this.buttons[e.code].classList.add('button_active');

    this.pressedKeys.add(e.code);

    if (this.handleHotkey()) {
      return;
    }

    if (isSpecialBtnPressed && !e.isTrusted) {
      this.handleSpecialBtnPress(e.code);
    } else if (!isSpecialBtnPressed) {
      const ch = this.currentKeySet[e.code][this.state];
      this.textArea.addText(ch);
    }
  };

  updateButtons() {
    if (!this.changeableButtons) {
      return;
    }
    this.changeableButtons.forEach((btnKey) => {
      this.buttons[btnKey].textContent = this.currentKeySet[btnKey][this.state];
    });
  }

  languageSwitch() {
    this.language = this.language === 'en' ? 'ru' : 'en';
    this.currentKeySet = this.language === 'en' ? enKeys : ruKeys;
    this.updateButtons();
  }

  handleHotkey() {
    return Object.keys(this.hotKeys).some((opName) => {
      const keys = this.hotKeys[opName];
      const isEqual = areSetsEqual(this.pressedKeys, keys);
      if (isEqual && this[opName] !== undefined) this[opName]();
      return isEqual;
    });
  }

  handleKeyUp = (e) => {
    const btn = this.buttons[e.code];
    if (!btn) {
      return;
    }
    btn.classList.remove('button_active');
    this.pressedKeys.delete(e.code);
  };

  handleMouseDown = (e) => {
    e.preventDefault();
    const btn = e.target.closest('.button');
    if (btn) {
      const { code } = btn.dataset;
      this.pressedKeyCode = code;
      document.dispatchEvent(new KeyboardEvent('keydown', { code }));
    }
  };

  handleMouseUp = (e) => {
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
        const isSpecialBtn = this.specialButtons.has(keyCode);
        const value = isSpecialBtn
          ? commonKeys[keyCode].special
          : this.currentKeySet[keyCode].key;
        const button = createElement('div', 'button');
        button.setAttribute('data-code', keyCode);
        if (isSpecialBtn) {
          button.classList.add(`button_${keyCode.toLowerCase()}`);
          button.innerHTML = value;
        } else {
          button.textContent = value;
        }
        this.buttons[keyCode] = button;
        row.append(button);
      });
      keyboard.append(row);
    });
    return keyboard;
  }
}

Keyboard.STATE = {
  KEY: 'key',
  SHIFT: 'shift',
  CAPSLOCK: 'caps',
  CAPSANDSHIFT: 'capsAndShift',
};

export default Keyboard;
