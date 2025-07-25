import { Component, CUSTOM_ELEMENTS_SCHEMA, input } from '@angular/core';
import "iconify-icon";

@Component({
  selector: 'icon',
  imports: [],
  template: `<iconify-icon icon="{{name()}}" width="{{size()}}" height="{{size()}}" [style.color]="rgbColor()"></iconify-icon>`,
  styles: `
    iconify-icon {
      display: inline-block;
      width: 1em;
      height: 1em;
    }
  `,
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class Icon {
  name = input<string>('eva:people-outline');
  size= input<string>('24');
  rgbColor = input<string>('#000000');
}
