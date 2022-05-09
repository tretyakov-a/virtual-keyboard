import { createElement } from './utils';

class TextArea {
  constructor() {
    this.class = 'textarea';
    this.el = this.render();
    this.setCursor(this.value.length);
    this.el.addEventListener('click', this.handleClick);
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

  handleClick = () => {
    this.isDecrease = false;
  };

  setCursor(pos) {
    this.el.selectionStart = pos;
    this.el.selectionEnd = pos;
  }

  addText(text) {
    const { selection: { start, end } } = this;
    this.el.setRangeText(text, start, end, 'end');
  }

  selectAll() {
    this.selectMode = TextArea.SELECT_MODE.RIGHT;
    this.el.select();
  }

  selectLeft() {
    const { selection: { start, end } } = this;
    if (start === end) {
      this.selectMode = TextArea.SELECT_MODE.LEFT;
    }
    if (this.selectMode === TextArea.SELECT_MODE.LEFT) {
      this.el.setSelectionRange(start !== 0 ? start - 1 : 0, end);
    } else {
      this.el.setSelectionRange(start, end - 1);
    }
  }

  selectRight() {
    const { selection: { start, end } } = this;
    if (start === end) {
      this.selectMode = TextArea.SELECT_MODE.RIGHT;
    }
    if (this.selectMode === TextArea.SELECT_MODE.RIGHT) {
      this.el.setSelectionRange(start, end + 1);
    } else {
      this.el.setSelectionRange(start + 1, end);
    }
  }

  arrowLeft() {
    // '◀';
    const { selection: { start } } = this;
    this.setCursor(start === 0 ? start : start - 1);
    this.isDecrease = false;
  }

  arrowRight() {
    // '▶';
    this.setCursor(this.selection.start + 1);
    this.isDecrease = false;
  }

  _getEolsPositions() {
    let sum = 0;
    return this.el.value
      .split('\n')
      .map((row) => row.length)
      .map((len, i) => {
        const pos = len + i + sum;
        sum += len;
        return pos;
      })
      .slice(0, -1);
  }

  _getRowsPositions(rows) {
    const eolsPositions = this._getEolsPositions();
    let lastPosition = 0;
    return rows.map((row, i) => {
      const start = lastPosition;
      let end = lastPosition + row.length - (i === (rows.length - 1) ? 0 : 1);
      if (eolsPositions.find((v) => v === end + 1)) {
        end += 1;
        lastPosition += 1;
      }
      lastPosition += row.length;
      return { start, end };
    });
  }

  _findRowIndex() {
    const { selection: { start: cursorPos } } = this;
    const rows = new FormData(this.el.parentElement).get('text').split('\n');
    const rowsPositions = this._getRowsPositions(rows);
    const index = rowsPositions.findIndex(({ start, end }) => (
      cursorPos >= start && cursorPos <= end
    ));
    return { index, rowsPositions, cursorPos };
  }

  _moveVertically(direction) {
    const { index, rowsPositions, cursorPos } = this._findRowIndex();
    if (!rowsPositions[index + direction]) {
      return false;
    }
    const { start, end } = rowsPositions[index + direction];

    let rowOffset = cursorPos - rowsPositions[index].start;
    if (this.isDecrease && rowOffset < this.prevOffset) {
      rowOffset = this.prevOffset;
    }
    this.isDecrease = rowOffset > end - start;
    if (this.isDecrease) this.prevOffset = rowOffset;

    this.setCursor(this.isDecrease ? end : start + rowOffset);
    return true;
  }

  arrowUp() {
    // canvas textmeasure
    // this.addText('▲');

    if (!this._moveVertically(TextArea.MOVE_DIRECTION.UP)) {
      this.setCursor(0);
    }
  }

  arrowDown() {
    // this.addText('▼');

    if (!this._moveVertically(TextArea.MOVE_DIRECTION.DOWN)) {
      this.setCursor(this.el.value.length);
    }
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

    const el = createElement('textarea', this.class);
    el.setAttribute('cols', '78');
    el.setAttribute('rows', '10');
    el.setAttribute('wrap', 'hard');
    el.setAttribute('name', 'text');
    el.textContent = 'Focus me';
    return el;
  }
}

TextArea.MOVE_DIRECTION = {
  UP: -1,
  DOWN: 1,
};

TextArea.SELECT_MODE = {
  RIGHT: 'right',
  LEFT: 'left',
};

export default TextArea;
