import { createElement } from './utils';

class TextMeasureTool {
  constructor(font = '16px monospace') {
    this.font = font;
    this.el = createElement('canvas');
    this.ctx = this.el.getContext('2d');
    this.ctx.font = this.font;
    this.metrics = {};
  }

  getCharWidth = (char) => {
    if (char.length !== 1) {
      throw new Error('Expected a single char');
    }
    if (!this.metrics[char]) {
      const { width } = this.ctx.measureText(char);
      this.metrics[char] = width;
    }
    return this.metrics[char];
  };

  getStringWidth = (value) => {
    const { length } = value;
    let stringWidth = 0;
    for (let i = 0; i < length; i += 1) {
      stringWidth += this.getCharWidth(value[i]);
    }
    return stringWidth;
  };

  addKeySetMetrics(keySet) {
    Object.keys(keySet).forEach((key) => {
      const values = keySet[key];
      Object.keys(values).forEach((valueKey) => this.getCharWidth(values[valueKey]));
    });
  }
}

export default TextMeasureTool;
