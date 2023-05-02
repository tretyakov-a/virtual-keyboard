class LanguageController {
  constructor() {
    if (!this.load()) {
      this.language = LanguageController.LANGUAGE.DEFAULT;
    }
  }

  get language() {
    return this.privateLanguage;
  }

  set language(newValue) {
    if (this.privateLanguage !== newValue) {
      this.privateLanguage = newValue;
      this.save();
    }
  }

  toggle() {
    const { EN, RU } = LanguageController.LANGUAGE;
    const newLanguage = this.language === EN ? RU : EN;
    this.language = newLanguage;
  }

  save() {
    localStorage.setItem(LanguageController.STORAGE, this.language);
  }

  load() {
    this.language = localStorage.getItem(LanguageController.STORAGE);
    return this.language !== null;
  }
}

LanguageController.STORAGE = 'language';

LanguageController.LANGUAGE = {
  EN: 'en',
  RU: 'ru',
  DEFAULT: 'en',
};

export default LanguageController;
