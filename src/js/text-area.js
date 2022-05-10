import { createElement } from './utils';

class TextArea {
  constructor() {
    this.class = 'textarea';
    this.el = this.render();
    this.setCursor(this.value.length);
    this.el.addEventListener('click', this.handleClick);

    requestAnimationFrame(() => setTimeout(() => {
      const { lineHeight, paddingTop } = window.getComputedStyle(this.el);
      this.lineHeight = Number.parseFloat(lineHeight);
      this.paddingTop = Number.parseFloat(paddingTop);
    }, 0));
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

  handleClick = (e) => {
    this._resetMoveState();
    const { offsetY, offsetX } = e;
    const { lineHeight, paddingTop } = this;
    if (offsetX > paddingTop + lineHeight) {
      this.lineIndex = Math.trunc((offsetY - paddingTop) / lineHeight);
      this.isMouseClick = true;
    }
  };

  setCursor(pos) {
    this.el.selectionStart = pos;
    this.el.selectionEnd = pos;
  }

  addText(text) {
    const { selection: { start, end } } = this;
    this.el.setRangeText(text, start, end, 'end');
    this._resetMoveState();
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

  _resetMoveState() {
    this.isDecrease = false;
    this.isBoundaryMove = false;
    this.isMouseClick = false;
  }

  arrowLeft() {
    // '◀';
    const { selection: { start } } = this;
    this.setCursor(start === 0 ? start : start - 1);
    this._resetMoveState();
  }

  arrowRight() {
    // '▶';
    this.setCursor(this.selection.start + 1);
    this._resetMoveState();
  }

  _getEolsPositions() {
    let sum = 0;
    return this.el.value
      .split('\n')
      .map(({ length }, i) => {
        const pos = length + i + sum;
        sum += length;
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
    let isWrongIndex = false;
    let index = rowsPositions.findIndex(({ start, end }, i) => {
      isWrongIndex = cursorPos === start && this.isMouseClick && this.lineIndex === (i - 1);
      return cursorPos >= start && cursorPos <= end;
    });
    this.isMouseClick = false;
    index -= isWrongIndex;
    return { index, rowsPositions };
  }

  _makeBoundaryMove(direction, rowStart) {
    const { selection: { start: cursorPos } } = this;
    const isDirectionUp = direction === TextArea.MOVE_DIRECTION.UP;
    if (!this.isBoundaryMove) {
      if (!this.isDecrease) {
        this.prevOffset = cursorPos - rowStart;
      }
    }
    this.isBoundaryMove = true;
    this.setCursor(isDirectionUp ? 0 : this.el.value.length);
  }

  _moveVertically(direction) {
    const { selection: { start: cursorPos } } = this;
    const { index, rowsPositions } = this._findRowIndex();
    if (!rowsPositions[index + direction]) {
      this._makeBoundaryMove(direction, rowsPositions[index].start);
      return;
    }
    const { start, end } = rowsPositions[index + direction];
    let rowOffset = cursorPos - rowsPositions[index].start;
    if ((this.isDecrease && rowOffset < this.prevOffset) || this.isBoundaryMove) {
      rowOffset = this.prevOffset;
    }
    this.isDecrease = rowOffset > end - start;
    this.prevOffset = rowOffset;
    this.setCursor(this.isDecrease ? end : start + rowOffset);
    this.isBoundaryMove = false;
  }

  arrowUp() {
    // '▲';
    this._moveVertically(TextArea.MOVE_DIRECTION.UP);
  }

  arrowDown() {
    // '▼';
    this._moveVertically(TextArea.MOVE_DIRECTION.DOWN);
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
