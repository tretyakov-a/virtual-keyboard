import { createElement } from './utils';
import Key from './key';

class TextArea {
  constructor(textMeasureTool) {
    this.class = 'textarea';
    this.name = 'text';
    this.textMeasureTool = textMeasureTool;
    this.autoEols = [];
    this.el = this.render();

    this.el.addEventListener('click', this.handleClick);
    this.el.addEventListener('input', this.handleChange);
    new ResizeObserver(this.handleChange).observe(this.el);

    this._resetMoveState();

    requestAnimationFrame(() => setTimeout(() => {
      const { lineHeight, paddingTop } = window.getComputedStyle(this.el);
      this.lineHeight = Number.parseFloat(lineHeight);
      this.paddingTop = Number.parseFloat(paddingTop);
      this.el.dispatchEvent(new Event('input'));
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
    const { offsetY, offsetX } = e;
    const { lineHeight, paddingTop, el: { scrollTop } } = this;
    if (offsetX > paddingTop + lineHeight) {
      this.lineIndex = Math.trunc((offsetY + scrollTop - paddingTop) / lineHeight);
      this.isMouseClick = true;
    }
    this._resetMoveState();
  };

  setCursor(pos) {
    this.el.selectionStart = pos;
    this.el.selectionEnd = pos;
    this._moveScroll();
  }

  handleChange = (e) => {
    if (e && e.type === 'input') {
      this.textMeasureTool.getStringWidth(this.el.value);
    }
    this.rowsPositions = this._getRowsPositions();
    this.autoEols.pop();
    this._moveScroll();
    this._resetMoveState();
  };

  _moveScroll() {
    const { lineHeight, paddingTop, el: { offsetHeight } } = this;
    const { rowIndex } = this._findRowIndex();
    const rowBottom = paddingTop + lineHeight * (rowIndex + 1) - this.el.scrollTop;
    const rowTop = rowBottom - lineHeight;

    if (rowBottom > offsetHeight) {
      this.el.scrollTop += (rowBottom - offsetHeight);
    } else if (rowTop < 0) {
      this.el.scrollTop += rowTop;
    }
  }

  addCharacter(key) {
    const { selection: { start, end } } = this;
    const isKeyInstance = key instanceof Key;
    const char = isKeyInstance ? key.value : key;
    this.el.setRangeText(char, start, end, 'end');
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
    if (this.isDecrease !== undefined) {
      this._setCurrentCursor();
    }
    this.isDecrease = false;
    this.isBoundaryMove = false;
    this.isMouseClick = false;
  }

  _setCurrentCursor() {
    const {
      rowsPositions,
      textMeasureTool: { getStringWidth },
    } = this;

    const { rowIndex, cursorPosition } = this._findRowIndex();
    const { start, value } = rowsPositions[rowIndex];
    const rowOffset = cursorPosition - start;
    const rowOffsetWidth = getStringWidth(value.slice(0, rowOffset));
    this.cursor = {
      position: cursorPosition,
      rowIndex,
      rowOffset,
      rowOffsetWidth,
    };
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
    this.autoEols.length = 0;
    let lastPosition = 0;
    return rows.map((row, i) => {
      const start = lastPosition;
      if (i === 0 && row.length === 0) {
        lastPosition += 1;
        return { start, end: 1, value: row };
      }
      let end = lastPosition + row.length - (i === (rows.length - 1) ? 0 : 1);
      if (eolsPositions.find((v) => v === end + 1)) {
        end += 1;
        lastPosition += 1;
      } else {
        this.autoEols.push(end + 1);
      }
      lastPosition += row.length;
      return { start, end, value: row };
    });
  }

  _findRowIndex() {
    let { selection: { start: cursorPosition } } = this;
    let isWrongIndex = false;
    let rowIndex = this.rowsPositions.findIndex(({ start, end }, i) => {
      isWrongIndex = cursorPosition === start && this.isMouseClick && this.lineIndex === (i - 1);
      return cursorPosition >= start && cursorPosition <= end;
    });
    rowIndex -= isWrongIndex;
    cursorPosition -= isWrongIndex;
    return { rowIndex, cursorPosition };
  }

  _makeBoundaryMove(direction, currRow) {
    const { selection: { start: cursorPosition }, textMeasureTool: { getStringWidth } } = this;
    const isDirectionUp = direction === TextArea.MOVE_DIRECTION.UP;
    if (!this.isBoundaryMove && !this.isDecrease) {
      this.prevOffset = cursorPosition - currRow.start;
      this.cursor.rowOffsetWidth = getStringWidth(currRow.value.slice(0, this.prevOffset));
    }
    this.isBoundaryMove = true;
    this.setCursor(isDirectionUp ? 0 : this.el.value.length);
  }

  _getNewCursorPosition({ start, value }) {
    const { textMeasureTool: { getCharWidth }, cursor: { rowOffsetWidth } } = this;
    const { length } = value;
    let partWidth = 0;
    let prevCharWidth = 0;
    for (let i = 0; i < length; i += 1) {
      const charWidth = getCharWidth(value[i]);
      if (partWidth === rowOffsetWidth) {
        return i;
      }
      if (partWidth > rowOffsetWidth) {
        const rightPart = partWidth - rowOffsetWidth;
        const leftPart = prevCharWidth - rightPart;
        return (rightPart >= leftPart) ? i - 1 : i;
      }
      if (i === length - 1 && this.autoEols.includes(start + length)) {
        return length - 1;
      }
      partWidth += charWidth;
      prevCharWidth = charWidth;
    }
    return length;
  }

  _moveVertically(direction) {
    const {
      rowsPositions,
      textMeasureTool: { getStringWidth },
      cursor: { rowIndex },
    } = this;
    if (!rowsPositions[rowIndex + direction]) {
      this._makeBoundaryMove(direction, rowsPositions[rowIndex]);
      return;
    }
    const next = rowsPositions[rowIndex + direction];
    const nextRowWidth = getStringWidth(next.value);
    this.isDecrease = this.cursor.rowOffsetWidth > nextRowWidth;
    const newCursorPosition = this.isDecrease
      ? next.end
      : next.start + this._getNewCursorPosition(next);
    this.cursor.rowIndex += direction;
    this.setCursor(newCursorPosition);
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
    this.addCharacter(TextArea.SYMBOL.EOL);
  }

  tab() {
    for (let i = 0; i < TextArea.TAB_SIZE; i += 1) {
      this.addCharacter(TextArea.SYMBOL.SPACE);
    }
  }

  space() {
    this.addCharacter(TextArea.SYMBOL.SPACE);
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
    el.style.font = this.textMeasureTool.font;
    el.setAttribute('cols', '78');
    el.setAttribute('rows', '10');
    el.setAttribute('wrap', 'hard');
    el.setAttribute('name', this.name);
    // el.textContent = 'Focus me';
    el.textContent = 'There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don\'t look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn\'t anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic words etc.';
    return el;
  }
}
TextArea.SYMBOL = {
  SPACE: ' ',
  EOL: '\n',
};
TextArea.TAB_SIZE = 4;
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
