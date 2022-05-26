import { createElement, areSetsEqual } from './utils';
import commonKeys from './data/keys-common.json';
import keyboardLayout from './data/keyboard-layout.json';
import hotKeys from './data/hotkeys.json';
import Key from './key';

class Keyboard {
  constructor(languageController, textArea, keySets) {
    this.keys = {};
    this.class = 'keyboard';
    this.languageController = languageController;
    this.pressedCommandKeys = new Set();
    this.pressedKeyCode = '';
    this.textArea = textArea;
    this.hotKeys = Object.keys(hotKeys).reduce((acc, key) => {
      acc[key] = new Set(hotKeys[key]);
      return acc;
    }, {});
    this.commandKeys = Object.keys(commonKeys).filter((key) => commonKeys[key].command);
    this.languageDependentKeys = Object.keys(keySets[languageController.language]);
    this.state = Keyboard.STATE.KEY;
    this.isCapslock = false;
    this.isShift = false;
    this.repeatTimer = null;

    this.el = this.render(keySets);
    this.mediaQuery = window.matchMedia('(max-width: 768px)');
    this.handleMaxWidthChange(this.mediaQuery);

    this.mediaQuery.addEventListener('change', this.handleMaxWidthChange);
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
      this.toggleCommandBtn(code, false);
      this.pressedCommandKeys.delete(commandKey);
      if (this[fnName]) this[fnName](false);
    }
  }

  clearCommandKeys({ isTrusted = false } = {}) {
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
      const isHotKey = this.handleHotkey(e);
      if (!isHotKey && (!cmdsNumber || (cmdsNumber === 1 && this.isShift))) {
        if (key.isSpecial) {
          this.handleSpecialBtnDown(e);
        } else {
          this.textArea.addCharacter(key);
        }
      }
      if (!isHotKey || (isHotKey && !key.isArrow)) {
        this.clearCommandKeys(e);
      }
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
    const { keys } = this;
    if (!Object.keys(keys).length) {
      return;
    }
    const {
      languageDependentKeys,
      state,
      languageController: { language },
    } = this;
    languageDependentKeys.forEach((keyCode) => {
      keys[keyCode].setValue(state, language);
    });
  }

  languageSwitch() {
    this.languageController.toggle();
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

  getKeyValues(code, keySets) {
    return Object.keys(keySets).reduce((acc, key) => {
      acc[key] = keySets[key][code];
      return acc;
    }, {});
  }

  render(keySets) {
    if (this.el) return this.el;
    const { state, languageController: { language } } = this;
    const keyboard = createElement('div', this.class);
    keyboardLayout.forEach((layoutRow) => {
      const row = createElement('div', `${this.class}__row`);
      layoutRow.forEach((code) => {
        const special = commonKeys[code];
        const key = new Key({
          code,
          special,
          ...(!special && this.getKeyValues(code, keySets)),
        }).setValue(state, language);
        this.keys[code] = key;
        row.append(key.render());
      });
      keyboard.append(row);
    });
    return keyboard;
  }

  handleWindowBlur = () => {
    this.pressedKeyCode = '';
    this.clearCommandKeys();
    this.isShift = false;
    Object.keys(this.keys).forEach((key) => {
      this.keys[key].setState(Key.STATE.ACTIVE, false);
    });
  };

  handleMaxWidthChange = ({ matches }) => {
    Object.keys(commonKeys).forEach((code) => {
      if (this.keys[code]) {
        const { value } = this.keys[code];
        const match = value.match(/.*<br>(.*)/);
        if (match) {
          const newValue = matches ? match[1] : value;
          this.keys[code].setLabel(newValue);
        }
      }
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
