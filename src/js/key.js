import { createElement } from './utils';

class Key {
  constructor(options) {
    this.parseOptions(options);
    this.mods = {
      active: 'button_active',
      on: 'button_on',
    };
    this.el = this.render();
  }

  parseOptions(options) {
    Object.keys(options).forEach((key) => {
      this[key] = options[key];
    });
    this.isSpecial = this.special !== undefined;
    this.isRepeatable = !this.isSpecial || this.special.repeatable;
    this.isCommand = this.isSpecial && this.special.command;
  }

  setState(state, isOn) {
    const method = isOn ? 'add' : 'remove';
    this.el.classList[method](this.mods[state]);
  }

  get isArrow() {
    return ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(
      this.code,
    );
  }

  get value() {
    return this.privateValue;
  }

  set value(newValue) {
    this.privateValue = newValue;
  }

  setValue(state, language) {
    const prop = this.isSpecial ? 'innerHTML' : 'textContent';
    this.value = this.isSpecial ? this.special.value : this[language][state];
    this.el[prop] = this.value;
    return this;
  }

  setLabel(value) {
    this.el.innerHTML = value;
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
