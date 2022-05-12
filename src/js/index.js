import '../styles/index.scss';
import { createElement } from './utils';
import TextMeasureTool from './text-measure-tool';
import LanguageController from './language-controller';
import TextArea from './text-area';
import Keyboard from './keyboard';
import footer from './templates/footer';
import header from './templates/header';
import ruKeys from './data/keys-ru.json';
import enKeys from './data/keys-en.json';

document.addEventListener('DOMContentLoaded', () => {
  const { EN, RU } = LanguageController.LANGUAGE;
  const font = 'normal 16px/1.4 "Roboto", sans-serif';
  // const font = 'normal 16px/1.4 monospace';
  const textMeasureTool = new TextMeasureTool(font);
  textMeasureTool.addKeySetMetrics(enKeys);
  textMeasureTool.addKeySetMetrics(ruKeys);

  const container = createElement('div', 'container');
  const textArea = new TextArea(textMeasureTool);
  const form = createElement('form');
  form.append(textArea.render());
  const keyboard = new Keyboard(
    new LanguageController(),
    textArea,
    { [EN]: enKeys, [RU]: ruKeys },
  );
  container.insertAdjacentHTML('afterbegin', header);
  container.append(form);
  container.append(keyboard.render());
  container.insertAdjacentHTML('beforeend', footer);
  document.body.append(container);
});
