import '../styles/index.scss';
import { createElement } from './utils';
import TextArea from './text-area';
import Keyboard from './keyboard';
import footer from './templates/footer';
import header from './templates/header';
import LanguageController from './languageController';
import ruKeys from './data/keys-ru.json';
import enKeys from './data/keys-en.json';

document.addEventListener('DOMContentLoaded', () => {
  const { EN, RU } = LanguageController.LANGUAGE;
  const languageController = new LanguageController({
    [EN]: enKeys,
    [RU]: ruKeys,
  });
  const container = createElement('div', 'container');

  const textArea = new TextArea();
  const form = createElement('form');
  form.append(textArea.render());
  const keyboard = new Keyboard(textArea, languageController);
  container.insertAdjacentHTML('afterbegin', header);
  container.append(form);
  container.append(keyboard.render());
  container.insertAdjacentHTML('beforeend', footer);
  document.body.append(container);
});
