import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { Chat, GoogleGenAI } from '@google/genai';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Category } from './models/Category';
import { Vendor } from './models/Vendor';
import { lastValueFrom, map, tap, withLatestFrom } from 'rxjs';
import { Property2, LeaseAgreementClause } from '../login/models';
import { LoginService } from '../login/login.service';
import { MatIcon } from '@angular/material/icon';
import { MatRipple } from '@angular/material/core';
import { BubbleMessage, Message } from './models/Message';
import { NgOptimizedImage } from '@angular/common';
import { TypingDotsComponent } from '../shared/components/typing-dots/typing-dots.component';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Example } from './models/Example';
import { MatToolbar } from '@angular/material/toolbar';
import { ChatGptService } from './chat-gpt.service';
import { ChatOrchestrator } from './ChatOrchestrator';
import { GptMessage } from './models/GptMessage';
import { ChatResponse } from './models/response';
import { IssueResponse } from './models/IssueResponse';

@Component({
  selector: 'app-gpt',
  imports: [
    MatIcon,
    MatPaginator,
    MatRipple,
    MatToolbar,
    NgOptimizedImage,
    ReactiveFormsModule,
    TypingDotsComponent,
    RouterLink
  ],
  templateUrl: './gpt.component.html',
  styleUrl: './gpt.component.css'
})
export default class GptComponent implements OnInit {

  private activatedRoute = inject(ActivatedRoute);
  private chatGptService: ChatGptService = inject(ChatGptService);
  private destroyedRef$: DestroyRef = inject(DestroyRef);
  private loginService: LoginService = inject(LoginService);
  examples: Example[] = [];
  categoryNameSelected: string = '';
  selectedVendorName = '';
  selectedVendor!: Vendor;
  vendors: Vendor[] = [];
  private threadId = '';
  ticketClosed = false;
  propertySelected: Property2 = { id: 0, address: '', tenant: { name: '', telephone: '' }, landlord: '', leaseAgreementClauses: [] };
  private selectedUserId: number = 0;

  issueMessageControl: FormControl = new FormControl<string>('');
  tenantMessageControl: FormControl = new FormControl<string>('');
  vendorMessageControl: FormControl = new FormControl<string>('');

  tenantMessages = signal<BubbleMessage[]>([]);
  vendorMessages = signal<BubbleMessage[]>([]);
  aimeeMessages = signal<Array<ChatResponse|Message|IssueResponse|GptMessage>>([]);

  typingAimee = signal<boolean>(false);
  typingVendor = signal<boolean>(false);
  typingTenant = signal<boolean>(false);
  blockButton = signal<boolean>(false);
  private sleepTime = 2000;


  ///------------
  private chatOrchestrator: ChatOrchestrator;
  constructor() {
    this.chatOrchestrator = new ChatOrchestrator();
  }

  ngOnInit(): void {
    this.selectedUserId = Number.parseInt(this.activatedRoute.snapshot.params['id'] || '1');
    this.loadAllProperties();
    this.loadExampleIssues();
    this.loadAllVendors()
  }

  handlePageEvent(event$: PageEvent): void {
    const index = event$.pageIndex;
    this.issueMessageControl.setValue(this.examples[index].issue);
  }

  async processIssue(): Promise<void> {
    const issue = this.issueMessageControl.value;
    if(issue.length == 0) {
      return;
    }

    const threadResponse = await lastValueFrom(this.chatGptService.startThread());
    this.threadId = threadResponse.threadId;

    const { tenant } = this.propertySelected;


    if(!this.chatOrchestrator.IsEmpty) {
      this.tenantMessages.set([]);
      this.vendorMessages.set([]);
      this.aimeeMessages.set([]);
    }

    this.blockButton.set(true);
    this.typingTenant.set(true);

    const issueMessageResponse = await lastValueFrom(this.chatGptService.processTenantIssue({ tenantName: tenant.name, issueDescription: issue, threadId: this.threadId }));

    this.categoryNameSelected = issueMessageResponse.category != 'Unclassified' ? issueMessageResponse.category : 'general';
    this.chatOrchestrator.registerMessage({ text: issue, response: issueMessageResponse });

    const issueMessage: IssueResponse = {
      message: issue,
      tenant: this.propertySelected.tenant.name,
      address: this.propertySelected.address,
      phone: this.propertySelected.tenant.telephone,
      category: this.categoryNameSelected,
    };
    await this.registerAimeeLog(issueMessage);

    if (issueMessageResponse.recommendedSolution !== '' || undefined) {
      await this.sendMessageToTenant(issueMessageResponse.recommendedSolution);
    }

    const findVendorMessage: Message = { from: 'Aimee', message: issueMessageResponse.nextStep.context };
    await this.registerAimeeLog(findVendorMessage);

    if (!issueMessageResponse.nextStep.insufficientInformation && (issueMessageResponse.nextStep.instruction === 'SendSMS' || issueMessageResponse.nextStep.instruction === 'replyToTicket')) {
      this.selectedVendor = this.selectVendor(this.categoryNameSelected);
      this.selectedVendorName = this.selectedVendor.contacts[0].name;
      const messageToVendor = `Hi ${this.selectedVendorName}, this is Aimee from Milla Realty. We have an ${this.categoryNameSelected} issue at ${this.propertySelected.address}
      (tenant: ${this.propertySelected.tenant.name} - ${this.propertySelected.tenant.telephone}).

      The issue description is: ${issue}.

      Can you take this job and contact the tenant directly to schedule a time that works for both of you? Please reply to confirm you are available.`;
      await this.sendMessageToVendor(messageToVendor);
    }

    this.blockButton.set(false);
  }

  async processMessageFromTenant(): Promise<void> {
    const message = this.tenantMessageControl.value
    if (!message) {
      return;
    }

    this.tenantMessageControl.reset();

    const msg: BubbleMessage = { isFromAimee: false, message: message };
    this.tenantMessages.update(messages => [...messages, msg]);
    this.scrollTenantLog();

    this.typingAimee.set(true);

    const messageResult = await lastValueFrom(this.chatGptService.processTenantMessage({ message: message,  threadId: this.threadId }));
    this.chatOrchestrator.registerMessage({ text: message, response: messageResult });
    await this.registerAimeeLog(this.chatOrchestrator.GetLastMessage);

    if(messageResult.nextStep.responseToActor) {
      if (messageResult.nextStep.actor.toLowerCase() === 'vendor') {
        await this.sendMessageToVendor(messageResult.nextStep.responseToActor);
      } else if (messageResult.nextStep.actor.toLowerCase() === 'tenant') {
        await this.sendMessageToTenant(messageResult.nextStep.responseToActor);
      }
    }

    if (messageResult.nextStep.instruction === 'CloseTicket') {
      const aimeeMessage = 'Before closing a ticket ask for feedback and a star rating of 1 through 5';
      const feedBackMessage: BubbleMessage = { isFromAimee: false, message: aimeeMessage };
      this.tenantMessages.update(messages => [...messages, feedBackMessage]);
      this.scrollTenantLog();
      this.ticketClosed = true;
    }


    // if (messageResult.nextStep.instruction === 'replyToVendor') {
    //   await this.sendMessageToVendor(messageResult.recommendedSolution);
    // } else if (messageResult.nextStep.instruction === 'replyToTenant' || messageResult.nextStep.instruction === 'replyToTicket') {
    //   await this.sendMessageToTenant(messageResult.recommendedSolution);
    // } else if (messageResult.nextStep.instruction === 'CloseTicket') {
    //   await this.sendMessageToTenant(messageResult.recommendedSolution);
    //
    //   if(!this.ticketClosed) {
    //     const aimeeMessage = 'Before closing a ticket ask for feedback and a star rating of 1 through 5';
    //     const feedBackMessage: BubbleMessage = { isFromAimee: false, message: aimeeMessage };
    //     this.tenantMessages.update(messages => [...messages, feedBackMessage]);
    //     this.scrollTenantLog();
    //     this.ticketClosed = true;
    //   }
    // }
  }

  async processMessageFromVendor(): Promise<void> {
    const message = this.vendorMessageControl.value
    if (!message) {
      return;
    }

    this.vendorMessageControl.reset();

    const msg: BubbleMessage = { isFromAimee: false, message: message };
    this.vendorMessages.update(messages => [...messages, msg]);
    this.scrollVendorLog();

    const messageResult = await lastValueFrom(this.chatGptService.processVendorMessage({ message: message, threadId: this.threadId }));

    this.chatOrchestrator.registerMessage({ text: message, response: messageResult });
    await this.registerAimeeLog(this.chatOrchestrator.GetLastMessage);

    if(messageResult.nextStep.responseToActor) {
      if (messageResult.nextStep.actor.toLowerCase() === 'vendor') {
        await this.sendMessageToVendor(messageResult.nextStep.responseToActor);
      } else if (messageResult.nextStep.actor.toLowerCase() === 'tenant') {
        await this.sendMessageToTenant(messageResult.nextStep.responseToActor);
      }
    }

    // if (messageResult.nextStep.instruction === 'replyToTenant' || messageResult.nextStep.instruction === 'Wait' || messageResult.nextStep.instruction === 'replyToTicket') {
    //   await this.sendMessageToTenant(messageResult.recommendedSolution);
    // } else if (messageResult.nextStep.instruction === 'replyToVendor') {
    //   await this.sendMessageToVendor(messageResult.recommendedSolution);
    // } else if (messageResult.nextStep.instruction === 'CloseTicket') {
    //   await this.sendMessageToTenant(messageResult.recommendedSolution);
    // }
  }

  private async registerAimeeLog(message: ChatResponse | Message | IssueResponse | GptMessage) {
    this.typingAimee.set(true);
    await this.sleepBetweenSteps(this.sleepTime);
    this.aimeeMessages.update(messages => [...messages, message]);
    this.typingAimee.set(false);
    this.scrollAimeeLog();
  }

  private async sendMessageToTenant(message: string) {
    this.typingTenant.set(true);
    await this.sleepBetweenSteps(1500);
    const msg: BubbleMessage = { isFromAimee: true, message: message };
    this.tenantMessages.update(messages => [...messages, msg])
    this.typingTenant.set(false);
  }

  private async sendMessageToVendor(message: string) {
    this.typingVendor.set(true);
    await this.sleepBetweenSteps(1500);
    const msg: BubbleMessage = { isFromAimee: true, message: message };
    this.vendorMessages.update(messages => [...messages, msg]);
    this.typingVendor.set(false);
  }

  private selectVendor(category: string): Vendor {
    const filteredVendors = this.vendors.filter(vendor => vendor.category.trim().toLowerCase() === category.trim().toLowerCase());
    if(filteredVendors.length > 1) {
      const randomIndex = Math.floor(Math.random() * filteredVendors.length);
      return filteredVendors[randomIndex];
    } else {
      return filteredVendors[0];
    }
  }

  async sleepBetweenSteps(ms: number = 3000): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, ms);
    });
  }

  private scrollAimeeLog(): void {
    const el: HTMLElement | null = document.getElementById('targetAime');
    if(el !== null) {
      el.scrollIntoView({behavior: 'smooth'});
    }
  }

  private scrollVendorLog(): void {
    const el: HTMLElement | null = document.getElementById('targetVendor');
    if(el !== null) {
      el.scrollIntoView({behavior: 'smooth'});
    }
  }

  private scrollTenantLog(): void {
    const el: HTMLElement | null = document.getElementById('targetTenant');
    if(el !== null) {
      el.scrollIntoView({behavior: 'smooth'});
    }
  }

  private loadAllProperties(): void {
    this.loginService
      .allProperties()
      .pipe(
        takeUntilDestroyed(this.destroyedRef$),
        map((result: Property2[]) => result.find(x => x.id === this.selectedUserId) || result[0]),
        tap((propertyResult: Property2) => this.propertySelected = propertyResult)
      )
      .subscribe();
  }

  private loadExampleIssues(): void {
    this.chatGptService.getIssues()
      .pipe(
        takeUntilDestroyed(this.destroyedRef$)
      ).subscribe((examples: Example[]) => {
        this.examples = examples;
        this.issueMessageControl.setValue(examples[0].issue);
      });
  }

  private loadAllVendors(): void {
    this.chatGptService
      .getVendors()
      .pipe(
        takeUntilDestroyed(this.destroyedRef$)
      ).subscribe((vendors: Vendor[]) => this.vendors = vendors);
  }

  isMessage(item: Message | ChatResponse | IssueResponse | GptMessage): item is Message {
    return 'from' in item && 'message' in item;
  }

  isChatResponse(item: Message | ChatResponse | IssueResponse | GptMessage): item is ChatResponse {
    return 'stepNumber' in item && 'isCompleted' in item;
  }

  isIssueResponse(item: Message | ChatResponse | IssueResponse | GptMessage): item is IssueResponse {
    return 'category' in item && 'tenant' in item;
  }

  isGptMessage(item: Message | ChatResponse | IssueResponse | GptMessage): item is GptMessage {
    return 'text' in item && 'response' in item;
  }
}
