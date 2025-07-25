import { Component, DestroyRef, ElementRef, inject, OnInit, AfterViewChecked, signal, ViewChild } from '@angular/core';
import { Chat, GoogleGenAI } from '@google/genai';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ChatService } from './chat.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Category } from './models/Category';
import { Vendor } from './models/Vendor';
import { Composable } from './composable';
import { map, Observable, tap, withLatestFrom } from 'rxjs';
import { Property2, LeaseAgreementClause } from '../login/models';
import { LoginService } from '../login/login.service';
import { MatIcon } from '@angular/material/icon';
import { MatRipple } from '@angular/material/core';
import { NgClass, NgOptimizedImage } from '@angular/common';
import { TypingDotsComponent } from '../shared/components/typing-dots/typing-dots.component';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Example } from './models/Example';
import { MatToolbar } from '@angular/material/toolbar';
import { AimeConsoleComponent } from '../shared/components/aime-console/aime-console.component';
import {
  IMessage,
  ISimpleMessage,
  MessageEngine
} from '../shared/Engine/MessageEngine';
import { MessageBuilder } from '../shared/Engine/MessageBuider';


@Component({
  selector: 'app-chat',
  imports: [
    ReactiveFormsModule,
    MatIcon,
    MatRipple,
    NgOptimizedImage,
    TypingDotsComponent,
    MatPaginator,
    MatToolbar,
    RouterLink,
    AimeConsoleComponent,
    NgClass
  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export default class ChatComponent implements OnInit, AfterViewChecked {

  private activatedRoute = inject(ActivatedRoute);
  private service: ChatService = inject(ChatService);
  private destroyedRef$: DestroyRef = inject(DestroyRef);
  private loginService: LoginService = inject(LoginService);
  private ai!: GoogleGenAI;
  private model = 'gemini-2.5-flash';
  private chat!: Chat;
  examples: Example[] = [];
  categoryNameSelected: string = '';
  selectedVendorName = '';
  vendors: Vendor[] = [];
  propertySelected: Property2 = { id: 0, address: '', tenant: { name: '', telephone: '' }, landlord: '', leaseAgreementClauses: [] };
  private selectedUserId: number = 0;
  private composable = Composable();
  private prompt = '';
  issueMessageControl: FormControl = new FormControl<string>('');
  tenantMessageControl: FormControl = new FormControl<string>('');
  vendorMessageControl: FormControl = new FormControl<string>('');

  tenantMessages = signal<ISimpleMessage[]>([]);
  vendorMessages = signal<ISimpleMessage[]>([]);
  agentMessage = signal<IMessage[]>([]);

  typingVendor = signal<boolean>(false);
  typingTenant = signal<boolean>(false);
  blockButton = signal<boolean>(false);
  tokensUsed = signal(0);

  @ViewChild('scrollToTenant') private scrollTenant!: ElementRef;
  @ViewChild('scrollToVendor') private scrollVendor!: ElementRef;

  private readonly messageEngine: MessageEngine;

  constructor() {
    this.messageEngine = new MessageEngine();
  }

  ngAfterViewChecked() {
      try {
        this.scrollVendor.nativeElement.scrollIntoView({ behavior: 'smooth' });
        this.scrollTenant.nativeElement.scrollIntoView({ behavior: 'smooth' });
      } catch (err) { }
  }

  async ngOnInit(): Promise<void> {
    this.selectedUserId = Number.parseInt(this.activatedRoute.snapshot.params['id'] || '1');
    this.loadExampleIssues();
    this.loadAllVendors();
    this.loadAllProperties();
    this.service
      .getPrompt(this.selectedUserId)
      .pipe(
        takeUntilDestroyed(this.destroyedRef$),
        tap(result => this.prompt = result)
      )
      .subscribe();
  }

  handlePageEvent(event$: PageEvent): void {
    const index = event$.pageIndex;
    this.issueMessageControl.setValue(this.examples[index].issue);
  }

  private creteAIChat(prompt: string){
    try {
      this.ai = new GoogleGenAI({ apiKey: 'AIzaSyDvUWGoGCR-fMLnG2-eEUVqimt8x1DLrs4' });
      this.chat = this.ai.chats.create({
        model: this.model,
        config: {
          thinkingConfig: {
            thinkingBudget: 0
          },
          responseMimeType: 'application/json',
          responseSchema: {
            "type": "object",
            "properties": {
              "stepNumber": {
                "type": "number"
              },
              "stepName": {
                "type": "string"
              },
              "isCompleted": {
                "type": "boolean"
              },
              "MessageToVendor": {
                "type": "string"
              },
              "MessageToTenant": {
                "type": "string"
              },
              "reasonForStopFlow": {
                "type": "string"
              },
              "Category": {
                "type": "string"
              },
              "resolutionResponsibility": {
                "type": "string"
              }
            },
            "required": [
              "stepNumber",
              "isCompleted",
              "stepName"
            ]
          },
          systemInstruction: prompt
        },
        history: []
      });
    } catch (e) {
      console.error('Error creating AI chat:', e);
    }
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

    this.creteAIChat(this.prompt);
    if(!this.messageEngine.isEmpty()) {
      this.messagesLogUI().resetAll();
      this.messageEngine.reset();
    }

    this.blockButton.set(true);
    this.typingTenant.set(true);

    const message = `Hi I am ${this.propertySelected.tenant.name}.\nAddress ${this.propertySelected.address}. \nIssue:\n ${issue.trim()}`;

    const response = await this.chat.sendMessage({ message });
    console.log('total token used', response.usageMetadata?.totalTokenCount || 0);

    const chatResponse = this.composable.convertToChatResponse(response);
    if(chatResponse == null) {
      return;
    }

    const { MessageToVendor, MessageToTenant, Category } = chatResponse;
    const { name, telephone } = this.propertySelected.tenant;
    const { address } = this.propertySelected;
    this.categoryNameSelected = Category || '';

    const issueMessage = new MessageBuilder()
      .createNewLogMessage()
      .withTitle('Issue Request')
      .withContent('Category', Category!)
      .withContent('Resident', name)
      .withContent('Address', address)
      .withContent('Phone', telephone)
      .withContent('Issue', issue)
      .withContent('Reply to Tenant', MessageToTenant)
      .getMessage() as IMessage;
    this.messageEngine.addMessage(issueMessage);

    this.messagesLogUI().addToAgent(this.messageEngine.lastMessage);

    await this.showMessageToTenant(MessageToTenant);
    await this.showMessageToVendor(MessageToVendor);

    if(chatResponse.stepNumber === 1 && chatResponse.isCompleted && chatResponse.resolutionResponsibility !== 'Tenant') {
      const category = chatResponse.Category ?? 'general';
      await this.selectVendor(category);
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

    const registerMessage: ISimpleMessage = new MessageBuilder().createNewSimpleMessage(message).asSentMessage().getMessage() as ISimpleMessage;
    this.messagesLogUI().addToTenant(registerMessage);

    this.typingTenant.set(true);
    const response = await this.chat.sendMessage({
      message: `tenant: ${message.trim()}`,
    });
    console.log('total token used', response.usageMetadata?.totalTokenCount || 0);
    this.typingTenant.set(false);

    const chatResponse = this.composable.convertToChatResponse(response);
    if(chatResponse == null) {
      return;
    }

    const { MessageToTenant, MessageToVendor } = chatResponse;
    const logMessageBuilder = new MessageBuilder()
      .createNewLogMessage()
      .withTitle('Message from Tenant')
      .withContent('Message', message)
      .withContent('Reply', MessageToTenant);

    if (MessageToVendor) {
      logMessageBuilder.withContent('Message to Vendor', MessageToVendor);
    }

    const logMessage = logMessageBuilder.getMessage() as IMessage;
    this.messagesLogUI().addToAgent(logMessage);
    this.messageEngine.addMessage(logMessage);

    await this.showMessageToVendor(MessageToVendor)
    await this.showMessageToTenant(MessageToTenant);

    if(chatResponse.stepNumber === 1 && chatResponse.isCompleted) {
      const category = chatResponse.Category ?? 'general';
      await this.selectVendor(category);
    } else if(chatResponse.stepNumber === 6 && chatResponse.isCompleted) {
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

    const response = await this.chat.sendMessage({
      message: `vendor: ${message.trim()}`,
    });
    console.log('total token used', response.usageMetadata?.totalTokenCount || 0);

    this.typingVendor.set(true);
    const chatResponse = this.composable.convertToChatResponse(response);
    this.typingVendor.set(false);
    if(chatResponse == null) {
      return;
    }

    const { MessageToVendor, MessageToTenant, stepNumber, isCompleted } = chatResponse;
    const logChatBuilder = new MessageBuilder()
      .createNewLogMessage()
      .withTitle('Message from Vendor')
      .withContent('Message', message)
      .withContent('Reply', MessageToVendor);

    if (MessageToTenant) {
      logChatBuilder.withContent('Message to Tenant', MessageToTenant);
    }
    const logChat = logChatBuilder.getMessage() as IMessage;
    this.messageEngine.addMessage(logChat);
    this.messagesLogUI().addToAgent(logChat);

    await this.showMessageToVendor(MessageToVendor)
    await this.showMessageToTenant(MessageToTenant);

    if(stepNumber === 3 && !isCompleted) {
      await this.selectVendor(this.categoryNameSelected);
    }
  }

  private async selectVendor(category: string): Promise<void> {
    let vendor: Vendor;
    const filteredVendors = this.vendors.filter(vendor => vendor.category.name.trim().toLowerCase() === category.trim().toLowerCase());
    if(filteredVendors.length > 1) {
      const randomIndex = Math.floor(Math.random() * filteredVendors.length);
      vendor = filteredVendors[randomIndex];
    } else {
      vendor = filteredVendors[0];
    }

    if(vendor == null) {
      return;
    }

    this.selectedVendorName = vendor.contacts[0].name;

    const message = `Message From Aimee: Vendor Name is ${vendor.contacts[0].name} from company ${vendor.companyName}`;
    const messageFromAimee = await this.chat.sendMessage({ message });
    console.log('total token used', messageFromAimee.usageMetadata?.totalTokenCount || 0);

    const aimeResponse = this.composable.convertToChatResponse(messageFromAimee);
    if(aimeResponse === null) {
      return;
    }

    const { MessageToVendor, MessageToTenant } = aimeResponse;
    const updateMessage = new MessageBuilder()
      .createNewLogMessage()
      .withTitle('Vendor selected')
      .withDescription(`Vendor selected is ${vendor.contacts[0].name} from company ${vendor.companyName}`)
      .withContent('Message to Vendor', MessageToVendor)
      .getMessage() as IMessage;

    this.messagesLogUI().addToAgent(updateMessage);

    if(MessageToTenant !== '') {
      this.typingTenant.set(true);
      await this.sleepBetweenSteps(1500);
      const message = new MessageBuilder().createNewSimpleMessage(MessageToTenant).asReceiveMessage().getMessage() as ISimpleMessage;
      this.messagesLogUI().addToTenant(message);
      this.typingTenant.set(false);
    }

    if(MessageToVendor !== '') {
      this.typingVendor.set(true);
      await this.sleepBetweenSteps(1500);
      const message = new MessageBuilder().createNewSimpleMessage(MessageToVendor).asReceiveMessage().getMessage() as ISimpleMessage;
      this.messagesLogUI().addToVendor(message);
      this.typingVendor.set(false);
    }

  }

  async sleepBetweenSteps(ms: number = 3000): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, ms);
    });
  }

  private async showMessageToTenant(message: string) {
    if (message) {
      this.typingTenant.set(true);
      await this.sleepBetweenSteps(1500);
      const simpleMessage: ISimpleMessage = new MessageBuilder().createNewSimpleMessage(message).asReceiveMessage().getMessage() as ISimpleMessage;
      this.messagesLogUI().addToTenant(simpleMessage);
      this.typingTenant.set(false);
    }
  }

  private async showMessageToVendor(message: string) {
    if (message) {
      this.typingTenant.set(true);
      await this.sleepBetweenSteps(1500);
      const simpleMessage: ISimpleMessage = new MessageBuilder().createNewSimpleMessage(message).asReceiveMessage().getMessage() as ISimpleMessage;
      this.messagesLogUI().addToVendor(simpleMessage);
      this.typingTenant.set(false);
    }
  }

  private loadAllProperties(): void {
    this.service
      .allProperties()
      .pipe(
        takeUntilDestroyed(this.destroyedRef$),
        map((result: Property2[]) => result.find(x => x.id === this.selectedUserId) || result[0]),
        tap((propertyResult: Property2) => this.propertySelected = propertyResult)
      )
      .subscribe();
  }

  private loadAllCategoriesSub(): Observable<string> {
    return this.service
      .getCategories()
      .pipe(
        takeUntilDestroyed(this.destroyedRef$),
        map((categories: Category[]) => categories.map((category: Category) => category.name).join(', '))
      );
  }

  private loadAllClausesSub(): Observable<string> {
    return this.loginService
      .allProperties()
      .pipe(
        takeUntilDestroyed(this.destroyedRef$),
        map((result: Property2[]) => result.find(x => x.id === this.selectedUserId) || result[0]),
        tap((propertyResult: Property2) => this.propertySelected = propertyResult),
        map(property => property.leaseAgreementClauses),
        map((clauses: LeaseAgreementClause[]) => {
          let clausesSting = 'Clauses: \n';
          clauses.forEach((clause: LeaseAgreementClause, index) => {
            clausesSting += `\n\t${index+1}. ${clause.category} \n\t- ${clause.clause}`
          });

          if(clauses.length == 0) {
            clausesSting += 'No clauses.';
          }
          return clausesSting;
        })
      );
  }

  private loadExampleIssues(): void {
    this.service.getIssues()
      .pipe(
        takeUntilDestroyed(this.destroyedRef$)
      ).subscribe((examples: Example[]) => {
      this.examples = examples;
      this.issueMessageControl.setValue(examples[0].issue);
    });
  }

  private loadAllVendors(): void {
    this.service
      .getVendors()
      .pipe(
        takeUntilDestroyed(this.destroyedRef$)
      ).subscribe((vendors: Vendor[]) => this.vendors = vendors);
  }
}
