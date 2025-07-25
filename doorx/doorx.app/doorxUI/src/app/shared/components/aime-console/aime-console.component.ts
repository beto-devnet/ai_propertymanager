import { Component, effect, ElementRef, input, OnInit, AfterViewChecked, signal, ViewChild } from '@angular/core';
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
export class AimeConsoleComponent implements OnInit, AfterViewChecked {
  messages = input<IMessage[]>([]);
  typing = signal<boolean>(false);
  @ViewChild('scrollTo') private scrollContainer!: ElementRef;

  constructor() {
    effect(async () => {
      const length = this.messages().length;
      if (length > 0) {
        this.typing.set(true);
        await this.sleepProcess(2000);
        this.typing.set(false);
      }
    });
  }

  ngOnInit(): void {
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollIntoView({ behavior: 'smooth' });
    } catch (err) { }
  }

  private async sleepProcess(ms: number = 3000): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, ms);
    });
  }
}
