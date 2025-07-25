import { Component, DestroyRef, inject, OnInit, AfterViewChecked, signal, ViewChild, ElementRef } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Vendor } from './models/Vendor';
import { lastValueFrom, map, tap } from 'rxjs';
import { Property2 } from '../login/models';
import { LoginService } from '../login/login.service';
import { MatIcon } from '@angular/material/icon';
import { MatRipple } from '@angular/material/core';
import { NgClass, NgOptimizedImage } from '@angular/common';
import { TypingDotsComponent } from '../shared/components/typing-dots/typing-dots.component';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Example } from './models/Example';
import { MatToolbar } from '@angular/material/toolbar';
import { ChatGptService } from './chat-gpt.service';
import { AimeConsoleComponent } from '../shared/components/aime-console/aime-console.component';
import { IMessage, ISimpleMessage, MessageEngine } from '../shared/Engine/MessageEngine';
import { MessageBuilder } from '../shared/Engine/MessageBuider';

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
    RouterLink,
    AimeConsoleComponent,
    NgClass
  ],
  templateUrl: './gpt.component.html',
  styleUrl: './gpt.component.css'
})
export default class GptComponent implements OnInit, AfterViewChecked {

  private activatedRoute = inject(ActivatedRoute);
  private chatGptService: ChatGptService = inject(ChatGptService);
  private destroyedRef$: DestroyRef = inject(DestroyRef);
  examples: Example[] = [];
  categoryNameSelected: string = '';
  selectedVendorName = '';
  // selectedVendor!: Vendor;
  vendors: Vendor[] = [];
  private threadId = '';
  // ticketClosed = false;
  propertySelected: Property2 = { id: 0, address: '', tenant: { name: '', telephone: '' }, landlord: '', leaseAgreementClauses: [] };
  private selectedUserId: number = 0;

  issueMessageControl: FormControl = new FormControl<string>('');
  tenantMessageControl: FormControl = new FormControl<string>('');
  vendorMessageControl: FormControl = new FormControl<string>('');

  tenantMessages = signal<ISimpleMessage[]>([]);
  vendorMessages = signal<ISimpleMessage[]>([]);
  agentMessage = signal<IMessage[]>([]);

  typingVendor = signal<boolean>(false);
  typingTenant = signal<boolean>(false);
  blockButton = signal<boolean>(false);
  @ViewChild('scrollToTenant') private scrollTenant!: ElementRef;
  @ViewChild('scrollToVendor') private scrollVendor!: ElementRef;


  private readonly messageEngine: MessageEngine;


  constructor() {
    this.messageEngine = new MessageEngine();
  }

  ngOnInit(): void {
    this.selectedUserId = Number.parseInt(this.activatedRoute.snapshot.params['id'] || '1');
    this.loadAllProperties();
    this.loadExampleIssues();
    this.loadAllVendors()
  }

  ngAfterViewChecked() {
    try {
      this.scrollVendor.nativeElement.scrollIntoView({ behavior: 'smooth' });
      this.scrollTenant.nativeElement.scrollIntoView({ behavior: 'smooth' });
    } catch (err) { }
  }

  handlePageEvent(event$: PageEvent): void {
    const index = event$.pageIndex;
    this.issueMessageControl.setValue(this.examples[index].issue);
  }

  private messagesLogUI = () => {
    const addToAgent = (message: IMessage): void=> {
      this.agentMessage.update(messages =>  [...messages, message]);
    }

    const addToTenant = (message: ISimpleMessage): void=> {
      this.tenantMessages.update(messages =>  [...messages, message]);
    }

    const addToVendor = (message: ISimpleMessage): void=> {
      this.vendorMessages.update(messages =>  [...messages, message]);
    }

    const resetAll = () => {
      this.agentMessage.set([]);
      this.vendorMessages.set([]);
      this.tenantMessages.set([]);
    }

    return {
      addToAgent,
      addToTenant,
      addToVendor,
      resetAll
    }
  }

  async processIssue(): Promise<void> {
    const issue = this.issueMessageControl.value;
    if(issue.length == 0) {
      return;
    }

    try {
      const threadResponse = await lastValueFrom(this.chatGptService.startThread());
      this.threadId = threadResponse.threadId;
    } catch (e) {
      console.error('Error processing issue:', e);
      return;
    }

    const { tenant } = this.propertySelected;


    if(!this.messageEngine.isEmpty()) {
      this.messagesLogUI().resetAll();
      this.messageEngine.reset();
    }

    this.blockButton.set(true);
    this.typingTenant.set(true);

    const issueMessageResponse = await lastValueFrom(this.chatGptService.processTenantIssue({ tenantName: tenant.name, issueDescription: issue, threadId: this.threadId }));

    const { category, recommendedSolution, nextStep } = issueMessageResponse;
    const { name , telephone } = this.propertySelected.tenant;
    const { address } = this.propertySelected;
    this.categoryNameSelected = category != 'Unclassified' ? category : 'general';

    const issueMessage = new MessageBuilder()
      .createNewLogMessage()
      .withTitle('Issue Request')
      .withContent('Category', category)
      .withContent('Resident', name)
      .withContent('Address', address)
      .withContent('Phone', telephone)
      .withContent('Issue', issue)
      .withContent('Reply to Tenant', recommendedSolution)
      .withContent('Next Step', nextStep.context)
      .getMessage() as IMessage;
    this.messageEngine.addMessage(issueMessage);
    this.messagesLogUI().addToAgent(this.messageEngine.lastMessage);

    if (recommendedSolution) {
      await this.replyToActor('tenant', issueMessageResponse.recommendedSolution);
    }

    if (!issueMessageResponse.nextStep.insufficientInformation && (issueMessageResponse.nextStep.instruction === 'SendSMS' || issueMessageResponse.nextStep.instruction === 'replyToTicket')) {
      await this.selectVendor(this.categoryNameSelected, issue);
    }

    this.blockButton.set(false);
  }

  async processMessageFromTenant($event: any): Promise<void> {
    if ($event.keyCode === 13) {
      $event.preventDefault();
    }

    const message = this.tenantMessageControl.value
    if (!message) {
      return;
    }

    this.tenantMessageControl.reset();

    const chatMessage = new MessageBuilder()
      .createNewSimpleMessage(message)
      .asSentMessage()
      .getMessage() as ISimpleMessage;
    this.messagesLogUI().addToTenant(chatMessage);

    this.typingTenant.set(true);
    const messageResult = await lastValueFrom(this.chatGptService.processTenantMessage({ message: message,  threadId: this.threadId }));
    this.typingTenant.set(false);

    const { actor, context, responseToActor, instruction } = messageResult.nextStep;
    const messageResultBuilder = new MessageBuilder()
      .createNewLogMessage()
      .withTitle('Message from tenant')
      .withContent('Message', message)
      .withContent(`Reply to ${actor.toLowerCase()}`, responseToActor)
      .withContent('Next step', context)
      .getMessage() as IMessage;
    this.messageEngine.addMessage(messageResultBuilder);
    this.messagesLogUI().addToAgent(messageResultBuilder);

    await this.replyToActor(actor, responseToActor);

    if (messageResult.nextStep.instruction === 'CloseTicket') {
      const finishedMessage = new MessageBuilder()
        .createNewLogMessage()
        .withTitle('Ticket Completed')
        .withDescription('The ticket has been completed successfully')
        .getMessage() as IMessage;

      this.messagesLogUI().addToAgent(finishedMessage);
      this.messageEngine.addMessage(finishedMessage);
    }
  }

  async processMessageFromVendor($event: any): Promise<void> {
    if ($event.keyCode === 13) {
      $event.preventDefault();
    }

    const message = this.vendorMessageControl.value
    if (!message) {
      return;
    }

    this.vendorMessageControl.reset();

    const vendorMessage = new MessageBuilder().createNewSimpleMessage(message).asSentMessage().getMessage() as ISimpleMessage;
    this.messagesLogUI().addToVendor(vendorMessage);

    this.typingVendor.set(true);
    const messageResult = await lastValueFrom(this.chatGptService.processVendorMessage({ message: message, threadId: this.threadId }));
    this.typingVendor.set(false);

    const { recommendedSolution } = messageResult;
    const { actor, responseToActor, context, insufficientInformation } = messageResult.nextStep;
    const logChatBuilder = new MessageBuilder()
      .createNewLogMessage()
      .withTitle('Message from Vendor')
      .withContent('Message', message)
      .withContent(`Reply to ${actor.toLowerCase()}`, responseToActor)

    if (recommendedSolution) {
      logChatBuilder.withContent('Reply To tenant', recommendedSolution);
    }
    logChatBuilder.withContent('Next step', context);

    const logChat = logChatBuilder.getMessage() as IMessage;
    this.messageEngine.addMessage(logChat);
    this.messagesLogUI().addToAgent(logChat);
    await this.replyToActor(actor, responseToActor);
    await this.replyToActor('tenant', recommendedSolution);
  }

  private async replyToActor(actor: string, message: string) {
    if(!message) {
      return;
    }

    const messageReplyToActor = new MessageBuilder()
      .createNewSimpleMessage(message)
      .asReceiveMessage()
      .getMessage() as ISimpleMessage;

    if(actor.trim().toLowerCase() === 'tenant') {
      this.typingTenant.set(true);
      await this.sleepBetweenSteps(1500);
      this.messagesLogUI().addToTenant(messageReplyToActor);
      this.typingTenant.set(false);
    } else if (actor.trim().toLowerCase() === 'vendor') {
      this.typingVendor.set(true);
      await this.sleepBetweenSteps(1500);
      this.messagesLogUI().addToVendor(messageReplyToActor);
      this.typingVendor.set(false);
    }
  }

  private async selectVendor(category: string, issue: string): Promise<void> {
    let vendor: Vendor;
    const filteredVendors = this.vendors.filter(vendor => vendor.category.name.trim().toLowerCase() === category.trim().toLowerCase());
    if(filteredVendors.length > 1) {
      const randomIndex = Math.floor(Math.random() * filteredVendors.length);
      vendor = filteredVendors[randomIndex];
    } else {
      vendor = filteredVendors[0];
    }

    this.selectedVendorName = vendor.contacts[0].name;

    const messageToVendor = `Hi ${this.selectedVendorName}, this is Aimee from Milla Realty. We have an ${this.categoryNameSelected} issue at ${this.propertySelected.address}
      (tenant: ${this.propertySelected.tenant.name} - ${this.propertySelected.tenant.telephone}).

      The issue description is: ${issue}.

      Can you take this job and contact the tenant directly to schedule a time that works for both of you? Please reply to confirm you are available.`;

    const findVendorMessage = new MessageBuilder()
      .createNewLogMessage()
      .withTitle('Message For Selected Vendor')
      .withDescription(`Vendor selected is ${vendor.contacts[0].name} from company ${vendor.companyName}`)
      .withContent('Message', messageToVendor)
      .getMessage() as IMessage;
    this.messagesLogUI().addToAgent(findVendorMessage);
    await this.replyToActor('vendor', messageToVendor);
  }

  async sleepBetweenSteps(ms: number = 3000): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, ms);
    });
  }

  private loadAllProperties(): void {
    this.chatGptService
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
}
