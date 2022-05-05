import { createElement } from './utils';

class TextArea {
  constructor() {
    this.el = this.render();
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

  addText(text) {
    const { selection: { start, end }, value } = this;
    this.value = value.slice(0, start) + text + value.slice(end);
    this.setCursor(start + text.length);
  }

  arrowLeft() {
    const { selection: { start } } = this;
    this.setCursor(start - 1);
  }

  arrowRight() {
    const { selection: { start } } = this;
    this.setCursor(start + 1);
  }

  arrowUp() {
    const { selection: { start, end }, value } = this;
    console.log(start, end, value);
  }

  arrowDown() {
    const { selection: { start, end }, value } = this;
    console.log(start, end, value);
  }

  enter() {
    this.addText('\n');
  }

  tab() {
    this.addText('    ');
  }

  space() {
    this.addText(' ');
  }

  backspace() {
    const { selection: { start, end }, value } = this;
    if (start === end && start !== 0) {
      this.value = value.slice(0, start - 1) + value.slice(end);
      this.setCursor(start - 1);
    } else {
      this.deleteSelection();
    }
  }

  delete() {
    const { selection: { start, end }, value } = this;
    if (start === end && end !== 0) {
      this.value = value.slice(0, start) + value.slice(end + 1);
      this.setCursor(start);
    } else {
      this.deleteSelection();
    }
  }

  deleteSelection() {
    const { selection: { start, end }, value } = this;
    this.value = value.slice(0, start) + value.slice(end);
    this.setCursor(start);
  }

  render() {
    if (this.el) return this.el;

    const el = createElement('textarea');
    return el;
  }
}

export default TextArea;
