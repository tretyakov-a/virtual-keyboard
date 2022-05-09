import '../styles/index.scss';
import { createElement } from './utils';
import TextArea from './text-area';
import Keyboard from './keyboard';
import footer from './templates/footer';
import header from './templates/header';

document.addEventListener('DOMContentLoaded', () => {
  const container = createElement('div', 'container');
  const textArea = new TextArea();
  const keyboard = new Keyboard(textArea);
  container.insertAdjacentHTML('afterbegin', header);
  container.append(textArea.render());
  container.append(keyboard.render());
  container.insertAdjacentHTML('beforeend', footer);
  document.body.append(container);
});
