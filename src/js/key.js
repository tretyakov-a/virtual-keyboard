import { createElement } from './utils';

class Key {
  constructor(options) {
    this._parseOptions(options);
    this.mods = {
      active: 'button_active',
      on: 'button_on',
    };
    this.el = this.render();
  }

  _parseOptions(options) {
    Object.keys(options).forEach((key) => {
      this[key] = options[key];
    });
  }

  setState(state, isOn) {
    const method = isOn ? 'add' : 'remove';
    this.el.classList[method](this.mods[state]);
  }

  getValue() {
    return this.value;
  }

  setValue({ state, language }) {
    const prop = this.isSpecial ? 'innerHTML' : 'textContent';
    this.value = this.isSpecial ? this[language].value : this[language][state];
    this.el[prop] = this.value;
    return this;
  }

  render() {
    if (this.el) return this.el;
    const { code, isSpecial } = this;

    const key = createElement('div', 'button');
    key.setAttribute('data-code', code);
    if (isSpecial) {
      key.classList.add(`button_${code.toLowerCase()}`);
    }
    return key;
  }
}

Key.STATE = {
  ACTIVE: 'active',
  ON: 'on',
};

export default Key;
