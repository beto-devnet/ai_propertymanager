import { Component, DestroyRef, ElementRef, inject, OnInit, signal, ViewChild, WritableSignal } from '@angular/core';
import { AppDataService } from '../app-data.service';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatRipple } from '@angular/material/core';
import { Example } from './models/example.model';
import { Category } from './models/category.example';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgClass, NgOptimizedImage } from '@angular/common';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { ChatBubbleComponent } from '../shared/components/chat-bubble/chat-bubble.component';
import { EventMessageLog, MessageLog } from './models/messageLog';
import { IssueResponse } from './models/issueResponse';
import { TypingDotsComponent } from '../shared/components/typing-dots/typing-dots.component';
import { MessageComposer } from './MessageComposer';
import { FlowEngine } from './Engine/FlowEngine';
import { ProcessIssueRequest, ProcessIssueResponse } from './Engine/models/ProcessIssue';
import { FlowCoordinator, Step } from './models/step';
import { UpdateService } from './Engine/update.service';
import { LogService } from './Engine/LogService';
import { SendMessageRequest } from './Engine/models/SendMessageRequest';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Vendor } from './models/vendor.model';
import { firstValueFrom } from 'rxjs';
import { AskForAvailability } from './Engine/models/AskForAvailability';
import { ReceiveMessageRequest } from './Engine/models/ReceiveMessageRequest';
import { InformTenantContactFromVendor } from './Engine/models/InformTenantContactFromVendor';
import { format } from 'date-fns';
import { Tenant } from './models/Tenant';
import { EvetLogBubbleComponent } from '../shared/components/evet-log-bubble/evet-log-bubble.component';

type LogType = 'event' | 'vendor' | 'tenant';
@Component({
  selector: 'app-demo',
  imports: [
    MatIconModule,
    MatPaginator,
    MatRipple,
    ReactiveFormsModule,
    NgOptimizedImage,
    MatProgressSpinner,
    ChatBubbleComponent,
    NgClass,
    TypingDotsComponent,
    EvetLogBubbleComponent
  ],
  providers: [MessageComposer],
  templateUrl: './demo.component.html',
  styleUrl: './demo.component.css'
})
export default class DemoComponent implements OnInit {

  private appDataService: AppDataService = inject(AppDataService);
  private service: UpdateService = inject(UpdateService);
  messageComposer: MessageComposer = inject(MessageComposer);
  private destroyedRef$: DestroyRef = inject(DestroyRef);
  @ViewChild('buttonElementLog') private buttonElementLog!: ElementRef;
  examples: Example[] = [];
  categories: Category[] = [];
  vendors: Vendor[] = [];
  selectedVendor: Vendor = { id: 0, category: '', preferedVendor: false, companyName: '', descriptionOfServices: '', contacts: [] };
  selectedCategory: Category = { name: '', description: '' };
  issueControl: FormControl = new FormControl<string>('');
  tenantMessageControl: FormControl = new FormControl<string>('');
  vendorMessageControl: FormControl = new FormControl<string>('');
  messageToLog!: EventMessageLog;
  tenant: Tenant =  {
    id: 1,
    name: 'Diane Harris',
    phone: '123-456-789',
    address: 'some street 123'
  };

  typingLog = signal<boolean>(false);
  typingVendor = signal<boolean>(false);
  typingTenant = signal<boolean>(false);
  blockButtons = signal<boolean>(false);
  issueProcessError = signal<boolean>(false);

  tenantMessagesLog: WritableSignal<MessageLog[]> =signal<MessageLog[]>([]);
  eventMessagesLog: WritableSignal<EventMessageLog []> =signal<EventMessageLog[]>([]);
  vendorMessagesLog: WritableSignal<MessageLog []> =signal<MessageLog[]>([]);
  issueResponse: WritableSignal<IssueResponse|null> = signal<IssueResponse|null>(null);


  // new variables
  // private steps: Steps;
  // private coordinator: Coordinator;

  constructor() {
    // this.coordinator = new Coordinator();
  }

  async ngOnInit(): Promise<void> {
    this.service.getCategories().pipe(takeUntilDestroyed(this.destroyedRef$)).subscribe((categories: Category[]) => this.categories = categories);
    this.service.getVendors().pipe(takeUntilDestroyed(this.destroyedRef$)).subscribe((vendors: Vendor[]) => this.vendors = vendors);
    this.service.getIssues().pipe(takeUntilDestroyed(this.destroyedRef$)).subscribe((examples: Example[]) => {
      this.examples = examples;
      this.issueControl.setValue(examples[0].issue);
    });
    this.service.getRandomTenant().pipe(takeUntilDestroyed(this.destroyedRef$)).subscribe((tenant: Tenant) => this.tenant = tenant);

  }

  handlePageEvent(event$: PageEvent): void {
    const index = event$.pageIndex;
    this.issueControl.setValue(this.examples[index].issue);
  }

  processIssue(): void {
    // if(this.issueControl.value.length === 0) {
    //   return;
    // }
    //
    // this.blockButtons.set(true);
    //
    // const issue = this.issueControl.value;
    //
    // // this.typingLog();
    // const issueReq: ProcessIssueRequest = { User: this.tenant.name, IssueDescription: issue };
    // await this.coordinator.createIssue(issueReq);

  }

  async tenantToAimee() {
    const message = this.tenantMessageControl.value;
    if(!message) {
      return;
    }

    this.tenantMessageControl.reset();

    const deliveryTime = format(new Date(), 'MM-dd HH:mm');
    const messageLog: MessageLog = { response: message, deliveryTime, isIncoming: false, nextStep: Step.Next };
    this.tenantMessagesLog.update(messages => [...messages, messageLog]);

    const flowMessageToAimee =  new FlowEngine(this.service);

    // get the last step from aimee to tenant
    const eventLogs = [...this.eventMessagesLog()];
    const event = eventLogs.reverse().find(ev => ev.step.sender == 'Aimee' && ev.step.receiver == 'Tenant' ) || null;

    if(event === null) {
      return;
    }

    if(event.step.step === Step.TenantConfirmIssueFixed) {
      this.typingLog();
      const request: ReceiveMessageRequest = { fromVendorId: this.selectedVendor.id, step: 'Tenant confirmed Issue was fixed', aimeeMessage: event.response, messageToAime: message };
      const { data, error, isError } = await flowMessageToAimee.confirmTenantIssueWasFixed(request)
      if(isError) { return } //log the error
      if(!data?.issueFixed) { return } //STOP THE FLOW... find another vendor

      this.messageToLog = LogService.toEventMessageLog(data?.message!, data?.time!, FlowCoordinator.ResponseToTenant);
      await this.addToLog('event', this.messageToLog);
      await this.addToLog('tenant', this.messageToLog);
    }
  }

  async vendorToAimee(): Promise<void> {
    const message = this.vendorMessageControl.value;
    if(!message) {
      return;
    }

    this.vendorMessageControl.reset();

    const flowMessageToAimee =  new FlowEngine(this.service);

    // get the last step from aimee to vendor
    const eventLogs = [...this.eventMessagesLog()];
    const event = eventLogs.reverse().find(ev => ev.step.sender == 'Aimee' && ev.step.receiver == 'Vendor' ) || null;

    if(event === null) {
      return;
    }

    const time = format(new Date(), 'MM-dd HH:mm');
    const log: MessageLog = { response: message, nextStep: Step.Next, deliveryTime: time, isIncoming: false };
    this.vendorMessagesLog.update(message => [...message, log]);

    if(event.step.step == Step.SelectAndContactVendor) {
      this.typingLog();
      const vendorMessage: EventMessageLog = { task: 'Vendor Availability Response', response: message, deliveryTime: format(new Date(), 'MM-dd HH:mm'), step: FlowCoordinator.VendorResponseToAimee, nextStep: Step.Next };
      await this.addToLog('event', vendorMessage);

      const request: ReceiveMessageRequest = { fromVendorId: this.selectedVendor.id, step: 'availability response', aimeeMessage: event.response, messageToAime: message };
      const { data, error, isError } = await flowMessageToAimee.vendorMessageConfirmAvailability(request)
      if(isError) { return } //log the error
      if(!data?.isAvailable) {
        this.messageToLog = LogService.toEventMessageLog(data?.message!, data?.time!, FlowCoordinator.VendorNotAvailable);
        await this.addToLog('event', this.messageToLog);

        await this.selectVendorBasedOnCategory();
        await this.contactVendor(flowMessageToAimee, this.issueControl.value, this.selectedCategory.name);
        return;
      }

      this.messageToLog = LogService.toEventMessageLog(data?.message!, data?.time!, FlowCoordinator.VendorAvailabilityResponse);
      await this.addToLog('event', this.messageToLog);


      // flow - aimee to tenant. vendor will reach out
      this.typingLog();
      const informTenant: InformTenantContactFromVendor = { tenantId: this.tenant.id, vendorId: this.selectedVendor.id };
      const stepResult = await flowMessageToAimee.InformTenantThatVendorReachOut({ toTenantId: this.tenant.id, step: FlowCoordinator.ResponseToTenant.task, request: informTenant })
      if(stepResult.isError) { return } // show the error and stop the flow
      this.messageToLog = LogService.toEventMessageLog(stepResult.data?.message!, stepResult.data?.time!, FlowCoordinator.ResponseToTenant);
      await this.addToLog('event', this.messageToLog);
      await this.addToLog('tenant', this.messageToLog, true);

      const mark = FlowCoordinator.WaitingVendor;
      const time =  format(new Date(), 'MM-dd HH:mm');
      const waitingEvent: EventMessageLog = { task: mark.task, response: 'Waiting for Vendor to confirm visit time', step: mark, deliveryTime: time, nextStep: Step.Waiting };
      await this.addToLog('event', waitingEvent);
    }
    else if(event.step.step === Step.WaitingVendorScheduleVisit) {
      this.typingLog();
      const vendorMessage: EventMessageLog = { task: 'Vendor Visit Response', response: message, deliveryTime: format(new Date(), 'MM-dd HH:mm'), step: FlowCoordinator.VendorResponseToAimee, nextStep: Step.Next };
      await this.addToLog('event', vendorMessage);

      const request: ReceiveMessageRequest = { fromVendorId: this.selectedVendor.id, step: 'Vendor Confirm Visit to Tenant', aimeeMessage: event.response, messageToAime: message };
      const response = await flowMessageToAimee.getDateAndTimeForVisit(request);

      if(response.isError) { return } // show the error and stop the flow

      // if(!response.data?.isScheduled) {
      //
      // }

      const time = `${response.data?.scheduleDate} ${response.data?.scheduleTime}`
      const hour = format(new Date(), 'MM-dd HH:mm');
      this.messageToLog = LogService.toEventMessageLog(`Vendor confirmed visit with tenant at ${time}`, hour, FlowCoordinator.VendorConfirmVisit);
      await this.addToLog('event', this.messageToLog);
      const messageToVendor = `Hi ${this.tenant.name}. ${this.selectedVendor.contacts[0].name} from ${this.selectedVendor.companyName} mentioned he spoke with you and plans to be there ${time}`;
      const log: MessageLog = { response:  messageToVendor, isIncoming: true, deliveryTime: response.data?.time!, nextStep: Step.Next};
      this.tenantMessagesLog.update(message => [...message, log]);


      const mark = FlowCoordinator.WaitingVendorConfirmIssueFixed;
      const waitingEvent: EventMessageLog = { task: mark.task, response: 'Waiting for Vendor to confirm issue was fixed', step: mark, deliveryTime: hour, nextStep: Step.Waiting };
      await this.addToLog('event', waitingEvent);
    }
    else if (event.step.step === Step.WaitingVendorConfirmIssueFixed) {
      const request: ReceiveMessageRequest = { fromVendorId: this.selectedVendor.id, step: 'Vendor Confirm Issue was fixed', aimeeMessage: event.response, messageToAime: message };
      const response = await flowMessageToAimee.confirmVendorIssueWasFixed(request);
      if(response.isError) { return } // show the error and stop the flow

      this.messageToLog = LogService.toEventMessageLog(message, response.data?.time!, FlowCoordinator.VendorResponseToAimee, Step.Next);
      await this.addToLog('event', this.messageToLog);

      this.messageToLog = LogService.toEventMessageLog(response.data?.message!, response.data?.time!, FlowCoordinator.VendorConfirmIssueFixed, Step.Next);
      await this.addToLog('event', this.messageToLog);
      await this.addToLog('vendor', this.messageToLog, true);

      await this.sleepBetweenSteps();

      const msg = `Hi, ${this.tenant.name}. Looks like ${this.selectedVendor.contacts[0].name} from ${this.selectedVendor.companyName} has fixed the issue. Can you confirm that we can close the ticket?`;
      const messageToTenant: MessageLog = { response: msg, deliveryTime: response.data?.time!, isIncoming: true, nextStep: Step.Next };
      this.tenantMessagesLog.update(message => [...message, messageToTenant]);

      const mark = FlowCoordinator.WaitingTenantToConfirmIssueFixed;
      const waitingEvent: EventMessageLog = { task: mark.task, response: 'Waiting for Tenant to confirm issue was fixed', step: mark, deliveryTime: time, nextStep: Step.Waiting };
      await this.addToLog('event', waitingEvent);
    }
  }

  async processIssueRefactor(): Promise<void> {
    if(this.issueControl.value.length === 0) {
      return;
    }

    this.blockButtons.set(true);

    const issue = this.issueControl.value;

    const flowIssue = new FlowEngine(this.service);
    const issueResult: ProcessIssueResponse = await this.categorizeIssue(flowIssue, issue);
    this.selectedCategory = this.categories.find(category => category.name.trim().toLowerCase() === issueResult.category.trim().toLowerCase()) || this.categories[0];

    await this.selectVendorBasedOnCategory()
    await this.contactVendor(flowIssue, issueResult.issue, issueResult.category);

  }

  private async categorizeIssue(flow: FlowEngine, issue: string): Promise<ProcessIssueResponse> {
    this.typingLog();
    const issueReq: ProcessIssueRequest = { UserId: this.tenant.id, IssueDescription: issue };
    const issueResult = await flow.processStep<ProcessIssueResponse>(issueReq);
    const log = LogService.issueToEventMessageLog(issueResult.data!)
    this.issueResponse.set(issueResult.data!);
    await this.addToLog('event',  log);
    this.blockButtons.set(false);
    await this.addToLog('tenant', log, true);

    return issueResult.data!;
  }

  private async selectVendorBasedOnCategory(): Promise<void> {
    const category = this.selectedCategory.name;
    this.selectedVendor = await firstValueFrom(this.service.getVendor(category));
    const vendorSelectedMessage: EventMessageLog = { task: 'Vendor Selected', step: FlowCoordinator.SelectingVendor, deliveryTime: format(new Date(), 'MM-dd HH:mm'), response: `Selected vendor is ${this.selectedVendor.contacts[0].name} from ${this.selectedVendor.companyName}`, nextStep: Step.Next };
    this.eventMessagesLog.update((events) => [...events, vendorSelectedMessage]);
  }

  private async contactVendor(flow: FlowEngine, issue: string, categoryName: string): Promise<void> {
    this.typingLog();
    const req: AskForAvailability = { UserId: this.tenant.id, VendorId: this.selectedVendor.id, Issue: issue, Category: categoryName };
    const message: SendMessageRequest<AskForAvailability> = { toVendorId: req.VendorId, request: req, step: 'ask for availability' };
    const { data, error, isError } = await flow.askForAvailability(message);
    if(isError) {} // log the error
    this.messageToLog = LogService.toEventMessageLog(data?.message!, data?.time!, FlowCoordinator.GetVendor);
    await this.addToLog('event', this.messageToLog);
    await this.addToLog('vendor', this.messageToLog, true);

    const mark = FlowCoordinator.WaitingVendorAvailability;
    const time =  format(new Date(), 'MM-dd HH:mm');
    const waitingEvent: EventMessageLog = { task: mark.task, response: 'Waiting for Vendor to confirm their availability to attend this job', step: mark, deliveryTime: time, nextStep: Step.Waiting };
    await this.addToLog('event', waitingEvent);
  }


  private async addToLog(log: LogType, event: EventMessageLog, isIncoming: boolean = false) {
    if(log === 'event') {
      this.typingLog.set(true);
      await this.sleep(2000);
      this.typingLog.set(false);
      this.eventMessagesLog.update(messages => [...messages, event]);
      this.buttonElementLog.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
      // await this.router.navigate([], { fragment: 'targetLog' })
    } else {
      const messageLog: MessageLog = this.messageComposer.toMessageLog(event, isIncoming);

      if(log === 'vendor') {
        this.typingVendor.set(true);
        await this.sleep(3000);
        this.typingVendor.set(false);
        this.vendorMessagesLog.update(messages => [...messages, messageLog]);
      } else  {
        this.typingTenant.set(true);
        await this.sleep(3000);
        this.typingTenant.set(false);
        this.tenantMessagesLog.update(messages => [...messages, messageLog]);
      }
    }
  }

  async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, ms);
    });
  }

  async sleepBetweenSteps(ms: number = 1500): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, ms);
    });
  }

  protected readonly Step = Step;
}
