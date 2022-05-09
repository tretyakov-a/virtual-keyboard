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

  isFocused() {
    return document.activeElement === this.el;
  }

  setCursor(pos) {
    this.el.selectionStart = pos;
    this.el.selectionEnd = pos;
  }

  addText(text) {
    const { selection: { start, end } } = this;
    this.el.setRangeText(text, start, end, 'end');
  }

  selectAll() {
    this.el.select();
  }

  arrowLeft() {
    // this.addText('◀');
    const { selection: { start } } = this;
    this.setCursor(start === 0 ? start : start - 1);
  }

  arrowRight() {
    // this.addText('▶');
    this.setCursor(this.selection.start + 1);
  }

  arrowUp() {
    this.addText('▲');
  }

  arrowDown() {
    this.addText('▼');
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
    const { selection: { start, end } } = this;
    if (start === end && start !== 0) {
      this.el.setRangeText('', start - 1, end, 'end');
    } else {
      this.deleteSelection();
    }
  }

  delete() {
    const { selection: { start, end } } = this;
    if (start === end) {
      this.el.setRangeText('', start, end + 1, 'end');
    } else {
      this.deleteSelection();
    }
  }

  deleteSelection() {
    const { selection: { start, end } } = this;
    this.el.setRangeText('', start, end, 'end');
  }

  render() {
    if (this.el) return this.el;

    const el = createElement('textarea');
    el.setAttribute('cols', '78');
    el.setAttribute('rows', '10');
    return el;
  }
}

export default TextArea;
