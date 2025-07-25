import { Component } from '@angular/core';

@Component({
  selector: 'typing-dots',
  imports: [],
  template: `
    <div class="typing-indicator">
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    </div>`,
  styles: `
    .typing-indicator {
      display: flex;
      gap: 4px;
      padding: 15px 20px;
      background: #f0f0f0;
      border-radius: 20px;
      width: fit-content;
      margin-bottom: 15px;
    }

    .typing-dot {
      width: 8px;
      height: 8px;
      background: #999;
      border-radius: 50%;
      animation: typingDots 1.4s infinite ease-in-out;
    }

    .typing-dot:nth-child(1) { animation-delay: -0.32s; }
    .typing-dot:nth-child(2) { animation-delay: -0.16s; }

    @keyframes typingDots {
      0%, 80%, 100% {
        opacity: 0.3;
        transform: scale(0.8);
      }
      40% {
        opacity: 1;
        transform: scale(1);
      }
    }
  `
})
export class TypingDotsComponent {

}
