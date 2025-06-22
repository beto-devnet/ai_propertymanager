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
import { WorkflowEngine } from './workflow/WorkflowEngine';
import {
  ContactToVendorStep,
  ReceiveMessage,
  SendMessage,
  TenantRequest,
  VendorAvailabilityResponseStep
} from './workflow/steps/WorkflowSteps';
import { IssueRequest } from './models/issueRequest';
import { IWorkflowResult, WorkflowContext } from './workflow/WorkflowContext';
import {
  AimeeMessageToTenantRequest,
  AimeeMessageToTenantResponse,
  InformTenantVendorContact,
  InformTenantVendorContactResponse,
  MessageToTenantCloseTicketRequest,
  MessageToTenantCloseTicketResponse,
  ReplyToVendorIssueFixedRequest,
  ReplyToVendorIssueFixedResponse,
  ServiceAvailabilityMessageRequest,
  ServiceAvailabilityMessageResponse,
  TenantResponseToCloseTicketRequest,
  TenantResponseToCloseTicketResponse,
  VendorAvailabilityResponse,
  VendorMessageToAgent
} from './models/tenant.models';
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
  issueControl: FormControl = new FormControl<string>('');
  vendorMessageControl: FormControl = new FormControl<string>('');
  private workflow: WorkflowEngine;
  private selectedVendorId: number = 0;
  messageToLog!: EventMessageLog;
  private tenant =  {
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

  constructor() {
    this.workflow = new WorkflowEngine([]);
  }

  async ngOnInit(): Promise<void> {
    this.service.getCategories().pipe(takeUntilDestroyed(this.destroyedRef$)).subscribe((categories: Category[]) => this.categories = categories);
    this.service.getVendors().pipe(takeUntilDestroyed(this.destroyedRef$)).subscribe((vendors: Vendor[]) => this.vendors = vendors);
    this.service.getIssues().pipe(takeUntilDestroyed(this.destroyedRef$)).subscribe((examples: Example[]) => {
      this.examples = examples;
      this.issueControl.setValue(examples[0].issue);
    });

  }

  handlePageEvent(event$: PageEvent): void {
    const index = event$.pageIndex;
    this.issueControl.setValue(this.examples[index].issue);
  }

  async tenantToAimee(): Promise<void> {
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

    const time = format(new Date(), 'MM-dd hh:mm');
    const log: MessageLog = { response: message, nextStep: Step.Next, deliveryTime: time, isIncoming: false };
    this.vendorMessagesLog.update(message => [...message, log]);

    if(event.step.step == Step.SelectAndContactVendor) {
      this.typingLog();
      const request: ReceiveMessageRequest = { fromVendorId: this.selectedVendor.id, step: 'availability response', aimeeMessage: event.response, messageToAime: message };
      const { data, error, isError } = await flowMessageToAimee.vendorMessageConfirmAvailability(request)
      if(isError) { return } //log the error
      if(!data?.isAvailable) { return } //STOP THE FLOW... find another vendor

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
      const time =  format(new Date(), 'MM-dd hh:mm');
      const waitingEvent: EventMessageLog = { task: mark.task, response: 'Waiting for Vendor to confirm visit time', step: mark, deliveryTime: time, nextStep: Step.Next };
      await this.addToLog('event', waitingEvent);
    } else if(event.step.step === Step.WaitingVendorScheduleVisit) {
      this.typingLog();
      const request: ReceiveMessageRequest = { fromVendorId: this.selectedVendor.id, step: 'Vendor Confirm Visit to Tenant', aimeeMessage: event.response, messageToAime: message };
      const response = await flowMessageToAimee.getDateAndTimeForVisit(request);

      if(response.isError) { return } // show the error and stop the flow
      const time = `${response.data?.scheduleDate} at ${response.data?.scheduleTime}`
      this.messageToLog = LogService.toEventMessageLog(`Vendor confirmed visit with tenant at ${time}`, response.data?.time!, FlowCoordinator.VendorConfirmVisit);
      await this.addToLog('event', this.messageToLog);
      const messageToVendor = `Hi ${this.tenant.name}. ${this.selectedVendor.contacts[0].name} from ${this.selectedVendor.companyName} mentioned he spoke with you and plans to be there ${time}`;
      const log: MessageLog = { response:  messageToVendor, isIncoming: true, deliveryTime: response.data?.time!, nextStep: Step.Next};
      this.tenantMessagesLog.update(message => [...message, log]);
      const mark = FlowCoordinator.WaitingVendorConfirmIssueFixed;
      const waitingEvent: EventMessageLog = { task: mark.task, response: 'Waiting for Vendor to confirm issue was fixed', step: mark, deliveryTime: time, nextStep: Step.Next };
      await this.addToLog('event', waitingEvent);
    } else if (event.step.step === Step.WaitingVendorConfirmIssueFixed) {
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
    }
  }

  async processIssueRefactor(): Promise<void> {
    if(this.issueControl.value.length === 0) {
      return;
    }

    this.blockButtons.set(true);

    const issue = this.issueControl.value;
    const user = 'Diane Harris';


    const flowIssue = new FlowEngine(this.service);

    //flow - issue
    this.typingLog();
    const issueReq: ProcessIssueRequest = { User: this.tenant.name, IssueDescription: issue };
    const issueResult = await flowIssue.processStep<ProcessIssueResponse>(issueReq);
    const log = LogService.issueToEventMessageLog(issueResult.data!)
    this.issueResponse.set(issueResult.data!);
    await this.addToLog('event',  log);
    this.blockButtons.set(false);
    await this.addToLog('tenant', log, true);

    // select a vendor based on category
    const categorySelected = this.categories.find(category => category.name === issueResult.data!.category || 'General')!;
    this.selectedVendor = await firstValueFrom(this.service.getVendor(categorySelected.name));

    // flow - contact vendor
    this.typingLog();
    const req: AskForAvailability = { UserId: this.tenant.id, VendorId: this.selectedVendor.id, Issue: issue, Category: categorySelected.name };
    const message: SendMessageRequest<AskForAvailability> = { toVendorId: req.VendorId, request: req, step: 'ask for availability' };
    const { data, error, isError } = await flowIssue.askForAvailability(message);
    if(isError) {} // log the error
    this.messageToLog = LogService.toEventMessageLog(data?.message!, data?.time!, FlowCoordinator.GetVendor);
    await this.addToLog('event', this.messageToLog);
    await this.addToLog('vendor', this.messageToLog, true);

  }

  async processIssue(): Promise<void> {

    if(this.issueControl.value.length === 0) {
      return;
    }

    this.blockButtons.set(true);

    const issue = this.issueControl.value;
    const user = 'Diane Harris';

    // Tenant Request - step
    const context: WorkflowContext<IssueRequest> = new WorkflowContext({ IssueDescription: issue, User: user });
    const tenantRequestStep: TenantRequest = new TenantRequest(context, this.messageComposer);
    const tenantIssueStep = await this.workflow.executeWorkflow<IssueResponse>(tenantRequestStep);
    if(!tenantIssueStep.isSuccess){
      this.issueProcessError.set(true);
      this.blockButtons.set(false);
      return;
    }

    const messageTenantIssueResponse: EventMessageLog = this.messageComposer.issueToEventMessageLog(tenantIssueStep.data!);
    this.issueResponse.set(tenantIssueStep.data!);
    this.blockButtons.set(false);
    await this.addToLog('tenant', messageTenantIssueResponse, true);

    await this.sleepBetweenSteps();
    // contact to a vendor - step
    this.typingLog.set(true);
    const category = tenantIssueStep.data?.category || 'General';
    const messageRequest: ServiceAvailabilityMessageRequest = { user: user, phone: '123-456-7890', category:  category, issue: issue }
    const messageAvailabilityRequestContext: WorkflowContext<ServiceAvailabilityMessageRequest> = new WorkflowContext(messageRequest);
    const contactToVendorStep = new ContactToVendorStep(messageAvailabilityRequestContext, this.messageComposer);
    const messageRequestResult = await this.workflow.executeWorkflow<ServiceAvailabilityMessageResponse>(contactToVendorStep);

    if(!messageRequestResult.isSuccess) {
      console.error(messageRequestResult.message);
      this.blockButtons.set(false);
      this.typingLog.set(false);
      return;
    }

    this.selectedVendorId = messageRequestResult.data!.vendorId;
    this.messageToLog = this.messageComposer.toEventMessageLog('Select and contact Vendor', messageRequestResult.data?.message!,  messageRequestResult.data?.time!);
    await this.addToLog('event', this.messageToLog);
    await this.addToLog('vendor', this.messageToLog, true)


    // get vendor availability response
    await this.sleepBetweenSteps();
    this.typingVendor.set(true);
    const vendorAvailabilityContext: WorkflowContext<any> = new WorkflowContext(null);
    const vendorAvailabilityResponseStep = new VendorAvailabilityResponseStep(vendorAvailabilityContext, this.messageComposer);
    const availabilityResult = await this.workflow.executeWorkflow<VendorAvailabilityResponse>(vendorAvailabilityResponseStep);
    if(!availabilityResult.isSuccess) {
      this.blockButtons.set(false);
      return;
    }
    this.messageToLog = this.messageComposer.toEventMessageLog('Get Vendor availability response', availabilityResult.data?.message!,  availabilityResult.data?.time!);
    await this.addToLog('vendor', this.messageToLog);
    await this.addToLog('event', this.messageToLog);


    // response positively from vendor
    await this.sleepBetweenSteps();
    this.typingLog.set(true);
    const availabilityVendor: VendorAvailabilityResponse = availabilityResult.data!;
    if(availabilityVendor.isAvailable) {
      const updateContext: WorkflowContext<InformTenantVendorContact> = new WorkflowContext({ user: user, tenant: '', vendorId: this.selectedVendorId });
      const updateTenantTicket = new SendMessage<InformTenantVendorContact, InformTenantVendorContactResponse>(updateContext);
      const updateTenantTicketResult: IWorkflowResult<InformTenantVendorContactResponse> = await updateTenantTicket.execute(this.messageComposer.updateTenantTicket);

      if(!updateTenantTicketResult.isSuccess){
        this.blockButtons.set(false);
        return;
      }

      this.messageToLog = this.messageComposer.toEventMessageLog('Update Tenant Ticket with Vendor response', updateTenantTicketResult.data?.message!,  updateTenantTicketResult.data?.time!);
      await this.addToLog('event', this.messageToLog);
      await this.addToLog('tenant', this.messageToLog, true);
    }

    // simulate Vendor let us know visit confirmation
    await this.sleepBetweenSteps();
    this.typingVendor.set(true);
    const confirmationVisitTimeContext = new WorkflowContext<any>(null);
    const confirmationVisitTimeStep = new ReceiveMessage<any, VendorMessageToAgent>(confirmationVisitTimeContext)
    const confirmationVisitTimeResult = await confirmationVisitTimeStep.execute(this.messageComposer.vendorIncomingMessageConfirmationVisit);

    if(!confirmationVisitTimeResult.isSuccess){
      this.blockButtons.set(false);
      return;
    }

    this.messageToLog = this.messageComposer.toEventMessageLog('Vendor Confirm Visit time', confirmationVisitTimeResult.data?.message!,  confirmationVisitTimeResult.data?.time!);
    await this.addToLog('vendor', this.messageToLog, true);
    await this.addToLog('event', this.messageToLog);


    //inform Tenant about visit time
    await this.sleepBetweenSteps();
    this.typingLog.set(true);
    const visitTimeContext: WorkflowContext<AimeeMessageToTenantRequest> = new WorkflowContext({ user: user, vendorId: this.selectedVendorId, scheduleTime: '4pm' });
    const visitTimeStep = new SendMessage<AimeeMessageToTenantRequest, AimeeMessageToTenantResponse>(visitTimeContext);
    const visitTimeResult = await visitTimeStep.execute(this.messageComposer.aimeeMessageToTenantAboutVisitTime);

    if(!visitTimeResult.isSuccess){
      return;
    }

    this.messageToLog = this.messageComposer.toEventMessageLog('Ticket Status Update', visitTimeResult.data?.message!,  visitTimeResult.data?.time!);
    await this.addToLog('event', this.messageToLog, true);
    await this.addToLog('tenant', this.messageToLog);


    //Aimee to vendor - response issue fixed
    await this.sleepBetweenSteps();
    this.typingLog.set(true);
    const aimeeResponseVendorContext: WorkflowContext<ReplyToVendorIssueFixedRequest> = new WorkflowContext({ vendorId: this.selectedVendorId });
    const aimeeResponseVendorStep = new SendMessage<ReplyToVendorIssueFixedRequest, ReplyToVendorIssueFixedResponse>(aimeeResponseVendorContext);
    const aimeeResponseVendorResult = await aimeeResponseVendorStep.execute(this.messageComposer.IssueFixedResponse);

    if(!aimeeResponseVendorResult.isSuccess){
      return;
    }

    this.messageToLog = this.messageComposer.toEventMessageLog('Reply to vendor', aimeeResponseVendorResult.data?.message!,  aimeeResponseVendorResult.data?.time!);
    await this.addToLog('event', this.messageToLog);
    await this.addToLog('vendor', this.messageToLog, true);

    //Aimee to tenant - ask close ticket
    await this.sleepBetweenSteps();
    this.typingLog.set(true);
    const aimeeResponseTenantCloseTicketContext: WorkflowContext<MessageToTenantCloseTicketRequest> = new WorkflowContext({ vendorId: this.selectedVendorId, user: user });
    const aimeeResponseTenantCloseTicketStep = new SendMessage<MessageToTenantCloseTicketRequest, MessageToTenantCloseTicketResponse>(aimeeResponseTenantCloseTicketContext);
    const aimeeResponseTenantCloseTicketResult = await aimeeResponseTenantCloseTicketStep.execute(this.messageComposer.MessageToCloseTicket);

    if(!aimeeResponseTenantCloseTicketResult.isSuccess){
      return;
    }

    this.messageToLog = this.messageComposer.toEventMessageLog('Reply to vendor', aimeeResponseTenantCloseTicketResult.data?.message!,  aimeeResponseTenantCloseTicketResult.data?.time!);
    await this.addToLog('event', this.messageToLog);
    await this.addToLog('tenant', this.messageToLog, true);


    //Tenant to Aimee - close ticket
    await this.sleepBetweenSteps();
    this.typingTenant.set(true);
    const tenantCloseTicketContext: WorkflowContext<TenantResponseToCloseTicketRequest> = new WorkflowContext({ canClose: true, message: 'Hi Aimee. Yes I confirm the AC is running again. You can close the ticket', user: user });
    const tenantCloseTicketStep = new SendMessage<TenantResponseToCloseTicketRequest, TenantResponseToCloseTicketResponse>(tenantCloseTicketContext);
    const tenantCloseTicketResult = await tenantCloseTicketStep.execute(this.messageComposer.TenantResponseCloseTicket);

    if(!tenantCloseTicketResult.isSuccess){
      return;
    }

    this.messageToLog = this.messageComposer.toEventMessageLog('Tenant Confirm close ticket', tenantCloseTicketResult.data?.message!,  tenantCloseTicketResult.data?.time!);
    await this.addToLog('tenant', this.messageToLog, true);
    await this.addToLog('event', this.messageToLog);
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
