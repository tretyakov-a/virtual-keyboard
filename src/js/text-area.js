import { createElement } from './utils';

class TextArea {
  constructor() {
    this.class = 'textarea';
    this.name = 'text';
    this.el = this.render();

    this.el.addEventListener('click', this.handleClick);
    this.el.addEventListener('input', this.handleChange);
    new ResizeObserver(this.handleChange).observe(this.el);

    requestAnimationFrame(() => setTimeout(() => {
      const { lineHeight, paddingTop } = window.getComputedStyle(this.el);
      this.lineHeight = Number.parseFloat(lineHeight);
      this.paddingTop = Number.parseFloat(paddingTop);
      this.handleChange();
      this.setCursor(this.value.length);
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
    const { lineHeight, paddingTop, el: { scrollTop } } = this;
    if (offsetX > paddingTop + lineHeight) {
      this.lineIndex = Math.trunc((offsetY + scrollTop - paddingTop) / lineHeight);
      this.isMouseClick = true;
    }
  };

  setCursor(pos) {
    this.el.selectionStart = pos;
    this.el.selectionEnd = pos;
    this._moveScroll();
  }

  handleChange = () => {
    this.rowsPositions = this._getRowsPositions();
    this._moveScroll();
  };

  _moveScroll() {
    const { lineHeight, paddingTop, el: { offsetHeight } } = this;
    const index = this._findRowIndex();
    const rowBottom = paddingTop + lineHeight * (index + 1) - this.el.scrollTop;
    const rowTop = rowBottom - lineHeight;

    if (rowBottom > offsetHeight) {
      this.el.scrollTop += (rowBottom - offsetHeight);
    } else if (rowTop < 0) {
      this.el.scrollTop += rowTop;
    }
  }

  addText(text) {
    const { selection: { start, end } } = this;
    this.el.setRangeText(text, start, end, 'end');
    this._resetMoveState();
    this.handleChange();
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

  _getRowsPositions() {
    const rows = new FormData(this.el.parentElement).get(this.name).split('\n');
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
    let isWrongIndex = false;
    let index = this.rowsPositions.findIndex(({ start, end }, i) => {
      isWrongIndex = cursorPos === start && this.isMouseClick && this.lineIndex === (i - 1);
      return cursorPos >= start && cursorPos <= end;
    });
    this.isMouseClick = false;
    index -= isWrongIndex;
    return index;
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
    const { selection: { start: cursorPos }, rowsPositions } = this;
    const index = this._findRowIndex();
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

  _deleteSymbol(direction, condition = true) {
    let { selection: { start, end } } = this;
    const { LEFT, RIGHT } = TextArea.MOVE_DIRECTION;
    if (start === end && condition) {
      if (direction === LEFT) {
        start += LEFT;
      } else {
        end += RIGHT;
      }
      this.el.setRangeText('', start, end, 'end');
    } else {
      this.deleteSelection();
    }
    this.handleChange();
  }

  backspace() {
    const { selection: { start } } = this;
    this._deleteSymbol(TextArea.MOVE_DIRECTION.LEFT, start !== 0);
  }

  delete() {
    this._deleteSymbol(TextArea.MOVE_DIRECTION.RIGHT);
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
    el.setAttribute('name', this.name);
    el.textContent = 'Focus me';
    return el;
  }
}

TextArea.MOVE_DIRECTION = {
  UP: -1,
  DOWN: 1,
  LEFT: -1,
  RIGHT: 1,
};

TextArea.SELECT_MODE = {
  RIGHT: 'right',
  LEFT: 'left',
};

export default TextArea;
