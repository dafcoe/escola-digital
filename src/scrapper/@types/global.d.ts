import { Page } from 'puppeteer';

export {};

declare global {
  // eslint-disable no-var
  var page: Page;
  var prevLogIndentationLevel: number;
  var currLogIndentationLevel: number;
}
