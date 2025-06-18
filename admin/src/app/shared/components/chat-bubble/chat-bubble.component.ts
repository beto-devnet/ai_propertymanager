import { ChangeDetectionStrategy, Component, input, InputSignal, ViewEncapsulation } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'chat-bubble',
  imports: [
    NgClass
  ],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [ngClass]="isIncoming() ? 'sent' : 'received'" class="message">
      <div class="message-bubble width-90">
        <ng-content></ng-content>
      </div>
    </div>
    <div class="message-time">{{ time() }}</div>
  `,
  styleUrl: './chat-bubble.component.css'
})
export class ChatBubbleComponent {
  isIncoming: InputSignal<boolean> = input(false);
  time: InputSignal<string> = input("00:00:00");
}
