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
    this.repeatTimer = null;

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
    btnKeys.forEach((key) => {
      if (this.keys[key]) {
        this.keys[key].setState(Key.STATE.ON, isOn);
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

  capsLock() {
    this.isCapslock = !this.isCapslock;
  }

  handleSpecialBtnPress = (keyCode) => {
    const fnName = keyCode[0].toLowerCase() + keyCode.slice(1);
    if (this.textArea[fnName]) this.textArea[fnName]();
    if (this[fnName]) this[fnName]();
  };

  handleKeyDown = (e) => {
    const keyCode = e.code;
    const key = this.keys[keyCode];
    if ((e.isTrusted && !this.textArea.isFocused())
        || !key
        || (e.repeat && key.isSpecial && !key.isRepeatable)) {
      return;
    }
    e.preventDefault();

    key.setState(Key.STATE.ACTIVE, true);
    this.pressedKeys.add(keyCode);

    if (this.handleHotkey()) {
      return;
    }

    if (key.isSpecial) {
      this.handleSpecialBtnPress(keyCode);
    } else {
      this.textArea.addText(key.getValue());
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

  handleHotkey() {
    return Object.keys(this.hotKeys).some((opName) => {
      const keys = this.hotKeys[opName];
      const isEqual = areSetsEqual(this.pressedKeys, keys);
      if (isEqual && this[opName] !== undefined) this[opName]();
      return isEqual;
    });
  }

  handleKeyUp = (e) => {
    const btn = this.keys[e.code];
    if (!btn) {
      return;
    }
    btn.setState(Key.STATE.ACTIVE, false);
    this.pressedKeys.delete(e.code);
  };

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
    const isMouseUpOutside = this.pressedKeyCode !== btn.dataset.code;
    const code = (btn && isMouseUpOutside) || !btn
      ? this.pressedKeyCode
      : btn.dataset.code;

    document.dispatchEvent(new KeyboardEvent('keyup', { code }));
    this.pressedKeyCode = '';
  };

  render() {
    if (this.el) return this.el;
    const keyboard = createElement('div', this.class);
    const commonKeysSet = new Set(Object.keys(commonKeys));
    const repeatableKeysSet = new Set([
      ...Object.keys(commonKeys).filter((key) => commonKeys[key].repeatable),
      ...Object.keys(this.currentKeySet),
    ]);

    keyboardLayout.forEach((layoutRow) => {
      const row = createElement('div', `${this.class}__row`);
      layoutRow.forEach((keyCode) => {
        const isSpecial = commonKeysSet.has(keyCode);
        const key = new Key({
          code: keyCode,
          isSpecial,
          isRepeatable: repeatableKeysSet.has(keyCode),
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
