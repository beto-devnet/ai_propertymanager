import { Component, effect, input, OnInit, signal } from '@angular/core';
import { DatePipe, NgOptimizedImage } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { IMessage } from '../../Engine/MessageEngine';
import { TypingDotsComponent } from '../typing-dots/typing-dots.component';

@Component({
  selector: 'aime-console',
  imports: [
    MatIcon,
    NgOptimizedImage,
    DatePipe,
    TypingDotsComponent
  ],
  templateUrl: './aime-console.component.html',
  styleUrl: './aime-console.component.css'
})
export class AimeConsoleComponent implements OnInit {
  messages = input<IMessage[]>([]);
  typing = signal<boolean>(false);

  constructor() {
    effect(async () => {
      this.typing.set(true);
      await this.sleepProcess(1500);
      this.typing.set(false);
    });
  }

  ngOnInit(): void {
  }

  private async sleepProcess(ms: number = 3000): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, ms);
    });
  }
}
