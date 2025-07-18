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
  private ai = new GoogleGenAI({ apiKey: 'AIzaSyDvUWGoGCR-fMLnG2-eEUVqimt8x1DLrs4' });
  private model = 'gemini-2.5-flash';
  private chat!: Chat;
  examples: Example[] = [];
  categoryNameSelected: string = '';
  selectedVendorName = '';
  vendors: Vendor[] = [];
  propertySelected: Property2 = { id: 0, address: '', tenant: { name: '', telephone: '' }, landlord: '', leaseAgreementClauses: [] };
  private selectedUserId: number = 0;
  private composable = Composable();
  private prompt = `You are a friendly Customer Success Team member named Aimee at a real estate property management company, acting on behalf of the landlord. In your role as a support agent, you serve as the main point of contact for tenants reporting maintenance issues.
You are responsible for receiving, processing, responding to, following up on, and ensuring the resolution and completion of maintenance request messages ('tickets') submitted by tenants using the next flow:

List of categories: $categories$

$clauses$

Step 1. Tenant Issue request.
In this step, you have to be able to categorize the issue and provide a kindle and warm response to the tenant.
Also, Identify the resolution responsibility from the Clauses list leasing Response with 'Tenant', 'Landlord', or 'Unknown'.
If the issue is not clear, then, ask the tenant for more details and does not mark this step as completed.
If the issue is clear, then mark step 1 as completed.
Return the parameters:
\tstepNumber: 1,
\tstepName: Name of the step,
\tresolutionResponsibility: Tenant or Landlord or Unknown,
\tisCompleted:a boolean value that indicates that the step was completed successfully.
\tMessageToVendor: empty.
\tMessageToTenant: A warm reponse to Tenant.
\tCategory: The category of the issue.

Step 2. Contact the vendor and request for availability to take or not the job.
This step waits a message from Aimee that indicates the name of the selected vendor and the name of the vendor company.
The result of this step is to write a message to the vendor vendor asking if is available to take the job and contact the tenant directy in order to schedule a visit.
Return the parameters:
\tstepNumber: 2,
\tstepName: 'Contact to vendor',
\tisCompleted: true.
\tMessageToVendor: The message to vendor asking about the availability.
\tMessageToTenant: Nothing.

step 3. Validate vendor abailability.
In this step you expected a message from the vendor. You have to validate if the vendor is available to take the job or not.
If is not available, mark this step as not completed, move to step 2 and start the flow from step 2.
If the information is not clear, ask for more details and does not mark this step as completed.
If everything is clear, mark this step as completed and wait for a vendor message in step 4.
Return the parameters:
\tstepNumber: 3,
\tstepName: 'Vendor Availability',
\tisCompleted:a boolean value that indicates that the step was completed successfully.
\tMessageToVendor: A kind response to the vendor for the availability and waiting for the reply about scheduled visit in case of vendor is available.
\tMessageToTenant: In case of availability, this is the message to inform the tenant about the contact from vendor.

step 4. Validate if the vendor scheduled a a visit with the tenant.
This step is waiting a vendor message. You have to obtain the date and time for the visit. If the vendor was not able to sheduled the visit, identify the reason or ask to the vendor the reason.
Once you get the reason, stop the flow.
If the date or time is not clear, ask for more details and not complete this step.
Otherwise, if the date and time are clear, mark this step as completed and wait for a vendor message in step 5.
Return the parameters:
\tstepNumber: 4,
\tstepName: 'Visit Scheduled',
\tisCompleted:a boolean value that indicates that the step was completed successfully.
\tMessageToVendor: A kind response to the vendor.
\tMessageToTenant: Inform the tenant about the scheduled visit that they previously agreed upon or the reason about why the vendor was not able to scheduled a visit.
\treasonForStopFlow: the reason of the vendor.

step 5. Identify if the vendor finished to fixing the issue.
In this step you have to validate if the vendor fixed the issue.
If the issue was fixed, mark this step as completed and move to step 6.
In case of the isse was not fixed, do not write any message to the tenant.
In case of the issue was not fixed, ask the vendor for the details if the details are not clear, then, stop the flow.
Return the parameters:
\tstepNumber: 5.
\tstepName: 'Issue Resolution',
\tisCompleted:a boolean value that indicates that the step was completed successfully.
\tMessageToVendor: The message to vendor.
\tMessageToTenant: Message to tenant.
\treasonForStopFlow: the reason of the vendor.
\t
step 6. Validate with the tenant that the issue was fixed.
Ask the tenant if can validate that the issue was fixed.
This step waits for tenant message.
if the tenant confirm that the issue was fixed, then, mark this step as completed and the ticket closed.
If the tenant confirm that the issue was not fixed, then mark as incompleted and ask for details in case of the tenant did not especify the details.
Return the parameters:
\tstepNumber: 6,
\tstepName: 'Confirmation of the Issue Resolution',
\tisCompleted:a boolean value that indicates that the step was completed successfully.
\tMessageToVendor: Nothing.
\tMessageToTenant: Inform the tenant.
\treasonForStopFlow: the reason of the tenant.
\t
If a step is not completed, then, cannot move to the next step.

It is important to greet the tenant warmly and include any commentary or explanation that helps them understand you are here to assist and ensure a timely resolution of their request.

For each incomming message from vendor or tenant, determinate the corresponding step number.
You expected to receiving messages from tenant in the format tenant: <message>, expected receiving messages from vendor in format: vendor: <message>. expected receiving messages from Aimee in format: Aimee: <message>.

If messages from vendor are not realted with availability to take job or schedule confirmation or issue resolution, or is asking about more information, then return formulate a message to the vendor and return with the following parameters:
\tstepNumber: 0,
\tstepName: 'Reply to Vendor',
\tisCompleted: true
\tMessageToVendor: Message to vendor.
\tMessageToTenant: Nothing.
\treasonForStopFlow: the reason of the tenant.


if messages from tenant are not related with validation of issue ws fixed, or if is asking for more information, then, then return formulate a message to the tenant and return with the following parameters:
stepNumber: 0,
\tstepName: 'Reply to Tenant',
\tisCompleted: true
\tMessageToVendor: Nothing.
\tMessageToTenant: Message to Tenant.
\treasonForStopFlow: nothing.`

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
    const categories = this.loadAllCategoriesSub();
    const clauses = this.loadAllClausesSub();

    categories.pipe(
      withLatestFrom(clauses),
      map(([categories, clauses]: [string, string]) => {
        let generalPrompt = this.prompt;
        generalPrompt = generalPrompt.replace('$categories$', categories);
        generalPrompt = generalPrompt.replace('$clauses$', clauses);

        return generalPrompt;
      })
    ).subscribe((prompt: string) => {
      this.prompt = prompt;
      this.creteAIChat(prompt);
    });

  }

  handlePageEvent(event$: PageEvent): void {
    const index = event$.pageIndex;
    this.issueMessageControl.setValue(this.examples[index].issue);
  }

  private creteAIChat(prompt: string){
    if(!this.chat) {
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

    if(!this.messageEngine.isEmpty()) {
      this.messagesLogUI().resetAll();
      this.messageEngine.reset();
      this.creteAIChat(this.prompt);
    }

    this.blockButton.set(true);
    this.typingTenant.set(true);

    const message = `Hi I am ${this.propertySelected.tenant.name}.\nAddress ${this.propertySelected.address}. \nIssue:\n ${issue.trim()}`;

    const response = await this.chat.sendMessage({ message });

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

    const response = await this.chat.sendMessage({
      message: `tenant: ${message.trim()}`,
    });

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

    const chatResponse = this.composable.convertToChatResponse(response);
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
    const filteredVendors = this.vendors.filter(vendor => vendor.category.trim().toLowerCase() === category.trim().toLowerCase());
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
    this.loginService
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
