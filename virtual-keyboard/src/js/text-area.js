import { createElement } from './utils';

class TextArea {
  constructor() {
    this.el = createElement('textarea');
    this.el.addEventListener('blur', this.handleTextBlur);
  }

  get value() {
    return this.el.value;
  }

  set value(v) {
    this.el.value = v;
  }

  get selection() {
    const { selectionStart: start, selectionEnd: end } = this.el;
    return { start, end };
  }

  handleTextBlur = (e) => {
    console.log(e);
  };

  setCursor(position) {
    this.el.selectionStart = position;
    this.el.selectionEnd = position;
  }

  addCh(ch) {
    const { start, end } = this.selection;
    this.el.value = this.el.value.slice(0, start) + ch + this.el.value.slice(end);
    this.setCursor(start + 1);
  }

  deleteSelection() {
    const { start, end } = this.selection;
    this.el.value = this.el.value.slice(0, start) + this.el.value.slice(end);
    this.setCursor(start);
  }

  render() {
    return this.el;
  }
}

export default TextArea;
