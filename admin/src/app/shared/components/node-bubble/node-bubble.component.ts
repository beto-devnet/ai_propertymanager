import { Component, Input, input, InputSignal } from '@angular/core';
import { NodeLog } from '../../../demo/Flow/LogCoordinator';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'event-node-bubble',
  imports: [
    MatIcon
  ],
  template: `
    <div class="message"  [class.expanded]="isExpanded">
      <div class="message-content regular" (click)="toggleExpand()">
        <div>
          <div class="flex flex-row justify-between items-center mb-2">
            <p class="font-semibold">{{ title() }}</p>
            <mat-icon class="text-blue-600">chat_bubble</mat-icon>
            <mat-icon class="text-blue-600  transform transition-transform" [class.rotate-180]="isExpanded">keyboard_arrow_down</mat-icon>
          </div>
          <div>
            {{ message() }}
          </div>

        </div>
        <div class="collapsible-content">
          @for (step of steps; track $index) {
            <div class="mt-3">
              <header class="font-black">{{ step.title }}</header>
              <p>
                {{ step.message }}
              </p>
            </div>
          }
        </div>
        <div class="time">{{ time() }}</div>
      </div>
    </div>`,
  styles: `
    .message {
      padding: 12px 0;
      border-radius: 18px;
      font-size: 14px;
      line-height: 1.4;
      position: relative;
      word-wrap: break-word;
      cursor: pointer;
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

    .collapsible-content {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s ease-out;
    }

    .message.expanded .collapsible-content {
      max-height: 500px; /* Adjust based on your content */
      transition: max-height 0.5s ease-in;
    }

    .message-content.waiting {
      background: #0c03f517;
    }

    .message-content.regular {
      background: white;
    }

    .time {
      font-size: 11px;
      color: #999;
      margin-top: 4px;
      text-align: end;
    }

    .transform {
      transition: transform 0.3s ease;
    }

    .rotate-180 {
      transform: rotate(180deg);
    }
  `
})
export class NodeBubbleComponent {
  time: InputSignal<string> = input("00:00:00");
  title: InputSignal<string> = input('');
  message: InputSignal<string> = input('');
  @Input() steps!: NodeLog[];
  isExpanded = false;

  toggleExpand() {
    this.isExpanded = !this.isExpanded;
  }
}
