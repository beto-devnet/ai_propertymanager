import { Component, input, InputSignal } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'event-log-bubble',
  imports: [
    NgClass
  ],
  template: `
    <div class="message">
      <div class="message-content" [ngClass]="isWaiting() ? 'waiting' : 'regular'">
        <ng-content></ng-content>
        <div class="time">{{ time() }}</div>
      </div>
    </div>
  `,
  styles: `
    .message {
      padding: 12px 0;
      border-radius: 18px;
      font-size: 14px;
      line-height: 1.4;
      position: relative;
      word-wrap: break-word;

      div.time {
        font-size: 11px;
        color: #999;
        margin-top: 4px;
        text-align: end;
      }
    }

    .message-content {
      padding: 12px 16px;
      border-radius: 10px;
      font-size: 14px;
      line-height: 1.4;
      position: relative;
      word-wrap: break-word;
      width: 100%;
      color: #333;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .message-content.waiting {
      background: #0c03f517;
    }

    .message-content.regular {
      background: white;
    }
  `
})
export class EvetLogBubbleComponent {
  time: InputSignal<string> = input("00:00:00");
  isWaiting: InputSignal<boolean> = input(false);
}
