import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { Chat, GoogleGenAI } from '@google/genai';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ChatResponse } from './models/response';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ChatService } from './chat.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Category } from './models/Category';
import { Vendor } from './models/Vendor';
import { Composable } from './composable';
import { map, tap, withLatestFrom } from 'rxjs';
import { Property2, LeaseAgreementClause } from '../login/models';
import { LoginService } from '../login/login.service';
import { MatIcon } from '@angular/material/icon';
import { MatRipple } from '@angular/material/core';
import { FlowEngine } from './FlowEngine';
import { BubbleMessage, Message } from './models/Message';
import { NgOptimizedImage } from '@angular/common';
import { IssueResponse } from './models/IssueResponse';
import { TypingDotsComponent } from '../shared/components/typing-dots/typing-dots.component';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Example } from './models/Example';
import { MatToolbar } from '@angular/material/toolbar';


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
    RouterLink
  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export default class ChatComponent implements OnInit {

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
If the issue is clear, then execute step 2 and mark step 1 as completed.
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
You have to contact to the vendor and ask if it is available to take the job and contact the tenant directy in order to schedule a visit.
Return the parameters:
\tstepNumber: 2,
\tstepName: 'Contact to vendor',
\tisCompleted: true.
\tMessageToVendor: The message to vendor asking about the availability.
\tMessageToTenant: Nothing.\t

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

If there is no corresponding step, set the current step to 0, then, return a generic message as response.`

  issueMessageControl: FormControl = new FormControl<string>('');
  tenantMessageControl: FormControl = new FormControl<string>('');
  vendorMessageControl: FormControl = new FormControl<string>('');

  tenantMessages = signal<BubbleMessage[]>([]);
  vendorMessages = signal<BubbleMessage[]>([]);
  aimeeMessages = signal<Array<ChatResponse|Message|IssueResponse>>([]);

  typingAimee = signal<boolean>(false);
  typingVendor = signal<boolean>(false);
  typingTenant = signal<boolean>(false);

  blockButton = signal<boolean>(false);

  private flowEngine: FlowEngine = new FlowEngine();
  private sleepTime = 2000;

  constructor() {
    // // register issue
    // const issueMessage = "Hi I am Anuar Bajos. Address 106 Bluejay dr. Orlando FL 32189. Issue:I have a problem with the AC. It is not working";
    // this.flowEngine.registerMessageFromVendor(issueMessage);
    //
    // this.flowEngine.registerIssue({ tenant: 'Anuar Bajos', message: 'I have a problem with the AC. It is not working', category: 'HVAC', address: '106 Bluejay dr. Orlando FL 32189' })
    // this.registerAimeeLog();
    //
    // // response from aimee
    // this.flowEngine.registerResponse({
    //   isCompleted:true,
    //   stepNumber:1,
    //   Category:"HVAC",
    //   MessageToTenant:"Hi Anuar, thanks for reaching out! I'm Aimee, a member of your Customer Success Team. I understand your AC isn't cooling, and I'm here to help get this resolved for you quickly. I've categorized this as an HVAC issue.",
    //   MessageToVendor:"",
    //   reasonForStopFlow: '',
    //   resolutionResponsibility: 'Lanlord'
    // });
    // this.registerAimeeLog().then();
    //
    // this.typingTenant.set(true);
    // this.sleepBetweenSteps(1500).then(() => {});
    // const msg: BubbleMessage = { isFromAimee: true, message: 'Hi Anuar, thanks for reaching out! I\'m Aimee, a member of your Customer Success Team. I understand your AC isn\'t cooling, and I\'m here to help get this resolved for you quickly. I\'ve categorized this as an HVAC issue.' };
    // this.tenantMessages.update(messages => [...messages, msg]);
    // this.typingTenant.set(false);
    //
    // //message selected vendor
    // const chat2: ChatResponse = {
    //   isCompleted: true,
    //   stepNumber: 2,
    //   MessageToTenant: "",
    //   MessageToVendor: "Hi Mary Joe from Total Air Conditioning, we have a maintenance request at 106 Bluejay dr. Orlando FL 32189. The AC is not cooling. Could you please confirm your availability to take this job and contact the tenant, Anuar Bajos, directly to schedule a visit?",
    //   reasonForStopFlow: ""
    // }
    // this.vendorMessages.update(messages => [...messages, { isFromAimee: true, message: chat2.MessageToVendor }]);
    // this.flowEngine.registerResponse(chat2);
    // this.registerAimeeLog();
    //
    // // vendor available response
    // const vendorResponse1 = 'Yes I am available to contact the tenant and take the job';
    // const chat3: ChatResponse = {
    //   isCompleted:true,
    //   stepNumber:3,
    //   MessageToTenant:"That's great news, Anuar! Mary Joe from Total Air Conditioning has confirmed her availability and will be reaching out to you directly to schedule a visit to fix your AC. Please expect to hear from her soon.",
    //   MessageToVendor:"Great, thanks Mary Joe! Please keep me updated once you've scheduled a visit with Anuar.",
    //   reasonForStopFlow: '',
    // }
    // this.vendorMessages.update(messages => [...messages, { isFromAimee: false, message: vendorResponse1 }]);
    // this.flowEngine.registerResponse(chat3);
    // this.registerAimeeLog();
    //
    // this.vendorMessages.update(messages => [...messages, { isFromAimee: true, message: chat3.MessageToVendor }]);
    // this.tenantMessages.update(messages => [...messages, { isFromAimee: true, message: chat3.MessageToTenant }]);
  }

  ngOnInit(): void {
    this.selectedUserId = Number.parseInt(this.activatedRoute.snapshot.params['id'] || '1');

    this.service.getIssues().pipe(takeUntilDestroyed(this.destroyedRef$)).subscribe((examples: Example[]) => {
      this.examples = examples;
      this.issueMessageControl.setValue(examples[0].issue);
    });

    const categories = this.service
      .getCategories()
      .pipe(
        takeUntilDestroyed(this.destroyedRef$),
        map((categories: Category[]) => categories.map((category: Category) => category.name).join(', '))
      );

    const clauses = this.loginService
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

    this.service.getVendors().pipe(takeUntilDestroyed(this.destroyedRef$)).subscribe((vendors: Vendor[]) => this.vendors = vendors);
  }

  handlePageEvent(event$: PageEvent): void {
    const index = event$.pageIndex;
    this.issueMessageControl.setValue(this.examples[index].issue);
  }

  private creteAIChat(prompt: string){
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

  async processIssue(): Promise<void> {
    const issue = this.issueMessageControl.value;
    if(issue.length == 0) {
      return;
    }

    if(!this.flowEngine.IsEmpty) {
      this.tenantMessages.set([]);
      this.vendorMessages.set([]);
      this.aimeeMessages.set([]);
      this.flowEngine.reset();
      this.creteAIChat(this.prompt);
    }

    this.blockButton.set(true);
    this.typingTenant.set(true);

    const message = `Hi I am ${this.propertySelected.tenant.name}.\nAddress ${this.propertySelected.address}. \nIssue:\n ${issue.trim()}`;

    this.flowEngine.registerMessageFromTenant(message);
    const response = await this.chat.sendMessage({ message });

    const chatResponse = this.composable.convertToChatResponse(response);
    if(chatResponse == null) {
      return;
    }

    this.flowEngine.registerResponse(chatResponse);

    const { MessageToVendor, MessageToTenant, Category } = chatResponse;
    this.categoryNameSelected = Category || '';
    const issueMessage: IssueResponse = {
      message: issue,
      tenant: this.propertySelected.tenant.name,
      address: this.propertySelected.address,
      category: this.categoryNameSelected
    };
    this.flowEngine.registerIssue(issueMessage);
    await this.registerAimeeLog()

    if(MessageToTenant !== '') {
      this.typingTenant.set(true);
      await this.sleepBetweenSteps(1500);
      const msg: BubbleMessage = { isFromAimee: true, message: MessageToTenant };
      this.tenantMessages.update(messages => [...messages, msg])
      this.typingTenant.set(false);
    }

    if(MessageToVendor !== '') {
      this.typingVendor.set(true);
      await this.sleepBetweenSteps(1500);
      const msg: BubbleMessage = { isFromAimee: true, message: MessageToVendor };
      this.vendorMessages.update(messages => [...messages, msg]);
      this.typingVendor.set(false);
    }

    if(chatResponse.stepNumber === 1 && chatResponse.isCompleted && chatResponse.resolutionResponsibility !== 'Tenant') {
      const category = chatResponse.Category ?? 'general';
      await this.selectVendor(category);
    }

    this.blockButton.set(false);
  }

  async sendMessageFromTenant(): Promise<void> {
    const message = this.tenantMessageControl.value
    if (!message) {
      return;
    }

    this.tenantMessageControl.reset();

    const msg: BubbleMessage = { isFromAimee: false, message: message };
    this.tenantMessages.update(messages => [...messages, msg]);
    this.scrollTenantLog();

    this.flowEngine.registerMessageFromTenant(message);
    await this.registerAimeeLog();

    const response = await this.chat.sendMessage({
      message: `Message from Tenant: ${message.trim()}`,
    });

    const chatResponse = this.composable.convertToChatResponse(response);
    if(chatResponse == null) {
      return;
    }

    await this.logResponses(chatResponse);

    if(chatResponse.stepNumber === 1 && chatResponse.isCompleted) {
      const category = chatResponse.Category ?? 'general';
      await this.selectVendor(category);
    } else if(chatResponse.stepNumber === 6 && chatResponse.isCompleted) {

    }
  }

  async sendMessageFromVendor(): Promise<void> {
    const message = this.vendorMessageControl.value
    if (!message) {
      return;
    }

    this.vendorMessageControl.reset();

    const msg: BubbleMessage = { isFromAimee: false, message: message };
    this.vendorMessages.update(messages => [...messages, msg]);
    this.scrollVendorLog();

    this.flowEngine.registerMessageFromVendor(message);
    await this.registerAimeeLog();

    const response = await this.chat.sendMessage({
      message: `Message from Vendor: ${message.trim()}`,
    });

    const chatResponse = this.composable.convertToChatResponse(response);
    if(chatResponse == null) {
      return;
    }
    await this.logResponses(chatResponse);

    const {stepNumber, isCompleted} = chatResponse;
    if(stepNumber === 3 && !isCompleted) {
      await this.selectVendor(this.categoryNameSelected);
    }

  }

  private async logResponses(chat: ChatResponse): Promise<void> {
    this.flowEngine.registerResponse(chat);
    await this.registerAimeeLog();

    const { MessageToVendor, MessageToTenant, stepNumber, isCompleted } = chat;

    if(MessageToTenant !== '') {
      const msg: BubbleMessage = { isFromAimee: true, message: MessageToTenant };
      this.tenantMessages.update(messages => [...messages, msg]);
      this.scrollTenantLog();
    }

    if(MessageToVendor !== '') {
      const msg: BubbleMessage = { isFromAimee: true, message: MessageToVendor };
      this.vendorMessages.update(messages => [...messages, msg]);
      this.scrollVendorLog();
    }

    if(stepNumber === 3 && isCompleted) {
      this.flowEngine.registerMessageFromAimee('Waiting for vendor to confirm visit with Tenant');
      await this.registerAimeeLog();
    } else if(stepNumber === 4 && isCompleted) {
      this.flowEngine.registerMessageFromAimee('Waiting for vendor to confirm that the issue was fixed');
      await this.registerAimeeLog();
    } else if(stepNumber === 5 && isCompleted) {
      this.flowEngine.registerMessageFromAimee('Waiting for tenant to confirm that the vendor fixed the issue');
      await this.registerAimeeLog();
    } else if(stepNumber === 6 && isCompleted) {
      this.flowEngine.registerMessageFromAimee('Ticket completed');
      await this.registerAimeeLog();
    }
  }

  private async registerAimeeLog() {
    this.typingAimee.set(true);
    await this.sleepBetweenSteps(this.sleepTime);
    this.aimeeMessages.update(messages => [...messages, this.flowEngine.LastRegister])
    this.typingAimee.set(false);
    this.scrollAimeeLog();
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
    // const vendor = this.vendors.find(vendor => vendor.category.trim().toLowerCase() === category.trim().toLowerCase())
    if(vendor == null) {
      return;
    }

    this.selectedVendorName = vendor.contacts[0].name;

    this.flowEngine.registerMessageFromAimee(`Selected vendor is ${vendor.contacts[0].name} from company ${vendor.companyName}`);
    await this.registerAimeeLog();

    const messageFromAimee = await this.chat.sendMessage({
      message: `Message From Aimee: Vendor Name is ${vendor.contacts[0].name} from company ${vendor.companyName}`,
    });

    const aimeResponse = this.composable.convertToChatResponse(messageFromAimee);
    if(aimeResponse === null) {
      return;
    }

    this.flowEngine.registerResponse(aimeResponse);
    await this.registerAimeeLog();

    const { MessageToVendor, MessageToTenant } = aimeResponse;
    if(MessageToTenant !== '') {
      const msg: BubbleMessage = { isFromAimee: true, message: MessageToTenant };
      this.typingTenant.set(true);
      await this.sleepBetweenSteps(1500);
      this.tenantMessages.update(messages => [...messages, msg])
      this.typingTenant.set(false);
      this.scrollAimeeLog();
    }

    if(MessageToVendor !== '') {
      this.typingVendor.set(true);
      await this.sleepBetweenSteps(1500);
      const msg: BubbleMessage = { isFromAimee: true, message: MessageToVendor };
      this.vendorMessages.update(messages => [...messages, msg])
      this.typingVendor.set(false);
      this.scrollAimeeLog();
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

  isMessage(item: Message | ChatResponse | IssueResponse): item is Message {
    return 'from' in item && 'message' in item;
  }

  isChatResponse(item: Message | ChatResponse | IssueResponse): item is ChatResponse {
    return 'stepNumber' in item && 'isCompleted' in item;
  }

  isIssueResponse(item: Message | ChatResponse | IssueResponse): item is IssueResponse {
    return 'category' in item && 'tenant' in item;
  }
}
