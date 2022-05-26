class LanguageController {
  constructor() {
    if (!this._load()) {
      this.language = LanguageController.LANGUAGE.DEFAULT;
    }
  }

  get language() {
    return this._language;
  }

  set language(newValue) {
    if (this._language !== newValue) {
      this._language = newValue;
      this._save();
    }
  }

  toggle() {
    const { EN, RU } = LanguageController.LANGUAGE;
    const newLanguage = this.language === EN ? RU : EN;
    this.language = newLanguage;
  }

  _save() {
    localStorage.setItem(LanguageController.STORAGE, this.language);
  }

  _load() {
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
