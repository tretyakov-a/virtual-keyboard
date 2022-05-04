import '../styles/index.scss';
import { createElement } from './utils';
import TextArea from './text-area';
import Keyboard from './keyboard';

document.addEventListener('DOMContentLoaded', () => {
  const container = createElement('div', 'container');
  const textArea = new TextArea();
  const keyboard = new Keyboard(textArea);
  container.append(textArea.render());
  container.append(keyboard.render());
  document.body.append(container);
});
