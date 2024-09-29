import 'dotenv/config';

export const LOGIN_URL = 'https://registoequipamento.escoladigital.min-educ.pt/';
export const LOGIN_USERNAME = process.env.LOGIN_USERNAME || '';
export const LOGIN_PASSWORD = process.env.LOGIN_PASSWORD || '';
export const LOGIN_SELECTOR_FORM = 'form#IndexChave';
export const LOGIN_SELECTOR_PROFILE = 'select[name="txtPerfil"]';
export const LOGIN_SELECTOR_USERNAME = 'input[type="text"][name="txtUser"]';
export const LOGIN_SELECTOR_PASSWORD = 'input[type="password"][name="txtPass"]';
export const LOGIN_SELECTOR_TERMS = 'input[type="checkbox"][name="agreement"]';
export const LOGIN_SELECTOR_SUBMIT = 'button[type="submit"][name="btnEntrar"]';
