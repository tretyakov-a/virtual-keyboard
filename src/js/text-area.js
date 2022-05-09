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

  selectLeft() {
    const { selection: { start, end } } = this;
    if (start === end) {
      this.selectMode = 'left';
    }
    if (this.selectMode === 'left') {
      this.el.setSelectionRange(start !== 0 ? start - 1 : 0, end);
    } else {
      this.el.setSelectionRange(start, end - 1);
    }
  }

  selectRight() {
    const { selection: { start, end } } = this;
    if (start === end) {
      this.selectMode = 'right';
    }
    if (this.selectMode === 'right') {
      this.el.setSelectionRange(start, end + 1);
    } else {
      this.el.setSelectionRange(start + 1, end);
    }
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
    el.textContent = 'Hello world';
    return el;
  }
}

export default TextArea;
