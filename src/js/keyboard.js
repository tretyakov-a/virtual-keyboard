import { createElement, areSetsEqual } from './utils';
import ruKeys from './data/keys-ru.json';
import enKeys from './data/keys-en.json';
import commonKeys from './data/keys-common.json';
import keyboardLayout from './data/keyboard-layout.json';
import hotKeys from './data/hotkeys.json';
import Key from './key';

class Keyboard {
  constructor(textArea) {
    this.keys = {};
    this.class = 'keyboard';
    this.language = 'en';
    this.currentKeySet = enKeys;
    this.pressedCommandKeys = new Set();
    this.pressedKeyCode = '';
    this.textArea = textArea;
    this.hotKeys = Object.keys(hotKeys).reduce((acc, key) => {
      acc[key] = new Set(hotKeys[key]);
      return acc;
    }, {});
    this.commandKeys = Object.keys(commonKeys).filter((key) => commonKeys[key].command);
    this.state = Keyboard.STATE.KEY;
    this.isCapslock = false;
    this.isShift = false;
    this.repeatTimer = null;

    this.el = this.render();

    this.el.addEventListener('mousedown', this.handleMouseDown);
    document.addEventListener('mouseup', this.handleMouseUp);
    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('blur', this.handleWindowBlur);
  }

  set isShift(newValue) {
    this._isShift = newValue;
    this.changeState();
  }

  get isShift() {
    return this._isShift;
  }

  set isCapslock(newValue) {
    this._isCapslock = newValue;
    this.toggleButtonOn(['CapsLock'], newValue);
    this.changeState();
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
    this.updateButtons();
  }

  toggleButtonOn(btnKeys, isOn) {
    btnKeys.forEach((key) => {
      if (this.keys[key]) {
        this.keys[key].setState(Key.STATE.ON, isOn);
      }
    });
  }

  shiftLeft(value) {
    this.isShift = value;
  }

  shiftRight(value) {
    this.shiftLeft(value);
  }

  capsLock() {
    this.isCapslock = !this.isCapslock;
  }

  toggleCommandBtn(code, value) {
    const { commandKey } = commonKeys[code];
    const keys = Object.keys(commonKeys).filter((c) => commonKeys[c].commandKey === commandKey);
    const prop = `is${code}`;
    this[prop] = value === undefined ? !this[prop] : value;
    keys.forEach((key) => this.keys[key].setState(Key.STATE.ACTIVE, this[prop]));
    return this[prop];
  }

  handleSpecialBtnDown({ code }) {
    const fnName = code[0].toLowerCase() + code.slice(1);
    if (this.textArea[fnName]) this.textArea[fnName]();
    if (this[fnName]) this[fnName]();
  }

  handleCommandBtnDown({ code, isTrusted }) {
    const { commandKey } = commonKeys[code];
    const fnName = code[0].toLowerCase() + code.slice(1);
    if (this[fnName]) this[fnName](true);
    if (isTrusted) {
      this.pressedCommandKeys.add(commandKey);
    } else if (!this.toggleCommandBtn(code)) {
      this.pressedCommandKeys.delete(commandKey);
      if (this[fnName]) this[fnName](false);
    } else {
      this.pressedCommandKeys.add(commandKey);
    }
  }

  handleCommandBtnUp({ code, isTrusted }) {
    const { commandKey } = commonKeys[code];
    const fnName = code[0].toLowerCase() + code.slice(1);
    if (isTrusted) {
      this.pressedCommandKeys.delete(commandKey);
      if (this[fnName]) this[fnName](false);
    }
  }

  clearCommandKeys({ isTrusted }) {
    if (!isTrusted) {
      this.pressedCommandKeys.clear();
      this.commandKeys.forEach((code) => {
        const fnName = code[0].toLowerCase() + code.slice(1);
        if (this[fnName]) this[fnName](false);
        this.toggleCommandBtn(code, false);
      });
    }
  }

  handleKeyDown = (e) => {
    if (e.isTrusted && !this.textArea.isFocused()) {
      return;
    }
    e.preventDefault();
    const key = this.keys[e.code];
    if (!key || (e.repeat && key.isSpecial && !key.isRepeatable)) {
      return;
    }

    key.setState(Key.STATE.ACTIVE, true);

    if (key.isCommand) {
      this.handleCommandBtnDown(e);

      if (this.handleHotkey(e)) {
        this.clearCommandKeys(e);
      }
    } else {
      const cmdsNumber = this.pressedCommandKeys.size;
      if (!this.handleHotkey(e) && (!cmdsNumber || (cmdsNumber === 1 && this.isShift))) {
        if (key.isSpecial) {
          this.handleSpecialBtnDown(e);
        } else {
          this.textArea.addText(key.getValue());
        }
      }
      this.clearCommandKeys(e);
    }
  };

  handleKeyUp = (e) => {
    if (e.isTrusted && !this.textArea.isFocused()) {
      return;
    }
    e.preventDefault();
    const key = this.keys[e.code];
    if (!key || (e.repeat && key.isSpecial && !key.isRepeatable)) {
      return;
    }

    if (e.isTrusted || !key.isCommand) {
      key.setState(Key.STATE.ACTIVE, false);
    }

    if (key.isCommand) {
      this.handleCommandBtnUp(e);
    }
  };

  updateButtons() {
    if (!Object.keys(this.keys).length) {
      return;
    }
    Object.keys(this.currentKeySet).forEach((keyCode) => {
      this.keys[keyCode].setValue(this);
    });
  }

  languageSwitch() {
    this.language = this.language === 'en' ? 'ru' : 'en';
    this.currentKeySet = this.language === 'en' ? enKeys : ruKeys;
    this.updateButtons();
  }

  handleHotkey({ code }) {
    const lastKey = this.keys[code];
    const keysForCompare = new Set(this.pressedCommandKeys);
    if (!lastKey.isCommand) {
      keysForCompare.add(code);
    }
    return Object.keys(this.hotKeys).some((fnName) => {
      const keys = this.hotKeys[fnName];
      if (lastKey.isCommand && !keys.has(commonKeys[code].commandKey)) {
        return false;
      }
      const isEqual = areSetsEqual(keysForCompare, keys);
      if (isEqual) {
        if (this.textArea[fnName]) this.textArea[fnName]();
        if (this[fnName]) this[fnName]();
      }
      return isEqual;
    });
  }

  repeatBtn(code, delay) {
    this.repeatTimer = setTimeout(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { code, repeat: true }));
      this.repeatBtn(code, Keyboard.REPEAT.PERIOD);
    }, delay);
  }

  handleMouseDown = (e) => {
    e.preventDefault();
    this.textArea.el.focus();
    const btn = e.target.closest('.button');
    if (btn) {
      const { code } = btn.dataset;
      this.pressedKeyCode = code;
      document.dispatchEvent(new KeyboardEvent('keydown', { code }));
      if (this.keys[code].isRepeatable) {
        this.repeatBtn(code, Keyboard.REPEAT.DELAY);
      }
    }
  };

  handleMouseUp = (e) => {
    clearTimeout(this.repeatTimer);
    const btn = e.target.closest('.button');
    if (!btn) {
      const pressedKey = this.keys[this.pressedKeyCode];
      if (pressedKey && !pressedKey.isCommand) {
        pressedKey.setState(Key.STATE.ACTIVE, false);
      }
      return;
    }
    const code = this.pressedKeyCode !== btn.dataset.code
      ? this.pressedKeyCode
      : btn.dataset.code;

    document.dispatchEvent(new KeyboardEvent('keyup', { code }));
    this.pressedKeyCode = '';
  };

  render() {
    if (this.el) return this.el;
    const keyboard = createElement('div', this.class);
    keyboardLayout.forEach((layoutRow) => {
      const row = createElement('div', `${this.class}__row`);
      layoutRow.forEach((keyCode) => {
        const isSpecial = commonKeys[keyCode] !== undefined;
        const key = new Key({
          code: keyCode,
          isSpecial,
          isRepeatable: !isSpecial || commonKeys[keyCode].repeatable,
          isCommand: isSpecial && commonKeys[keyCode].command,
          ru: isSpecial ? commonKeys[keyCode] : ruKeys[keyCode],
          en: isSpecial ? commonKeys[keyCode] : enKeys[keyCode],
        }).setValue(this);
        this.keys[keyCode] = key;
        row.append(key.render());
      });
      keyboard.append(row);
    });
    return keyboard;
  }

  handleWindowBlur = () => {
    this.pressedKeyCode = '';
    this.pressedCommandKeys.clear();
    this.commandKeys.forEach((code) => {
      const fnName = code[0].toLowerCase() + code.slice(1);
      if (this[fnName]) this[fnName](false);
      this.toggleCommandBtn(code, false);
    });
    this.isShift = false;
    Object.keys(this.keys).forEach((key) => {
      this.keys[key].setState(Key.STATE.ACTIVE, false);
    });
  };
}

Keyboard.STATE = {
  KEY: 'key',
  SHIFT: 'shift',
  CAPSLOCK: 'caps',
  CAPSANDSHIFT: 'capsAndShift',
};

Keyboard.REPEAT = {
  DELAY: 200,
  PERIOD: 40,
};

export default Keyboard;
