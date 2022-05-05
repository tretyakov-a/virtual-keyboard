import { createElement, areSetsEqual } from './utils';
import ruKeys from './data/keys-ru.json';
import enKeys from './data/keys-en.json';
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
    this.specialButtons = this.generateSpecialButtons();
    this.changeableButtons = this.generateChangeableButtons();
    this.el = this.render();
    this.el.addEventListener('mousedown', this.handleKeyboardKeyDown);
    document.addEventListener('mouseup', this.handleKeyboardKeyUp);

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
    const { KEY, SHIFT, CAPSLOCK, CAPSANDSHIFT } = Keyboard.STATE;
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

  generateChangeableButtons() {
    return Object.keys(this.currentKeySet).filter((keyCode) => !this.specialButtons.has(keyCode));
  }

  shiftLeft() { this.isShift = !this.isShift; }

  shiftRight() { this.shiftLeft(); }

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

    const ch = this.currentKeySet[e.code][this.state];

    if (isSpecialBtnPressed && !e.isTrusted) {
      this.handleSpecialBtnPress(e.code);
    } else if (!isSpecialBtnPressed) {
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

Keyboard.STATE = {
  KEY: 'key',
  SHIFT: 'shift',
  CAPSLOCK: 'caps',
  CAPSANDSHIFT: 'capsAndShift'
};

export default Keyboard;
