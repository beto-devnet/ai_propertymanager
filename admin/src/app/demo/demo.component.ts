import { Component, DestroyRef, inject, OnInit, signal, WritableSignal } from '@angular/core';
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
  ContactToVendorStep, ReceiveMessage,
  SendMessage,
  TenantRequest,
  VendorAvailabilityResponseStep
} from './workflow/steps/WorkflowSteps';
import { IssueRequest } from './models/issueRequest';
import { IWorkflowResult, WorkflowContext } from './workflow/WorkflowContext';
import {
  InformTenantVendorContact, InformTenantVendorContactResponse,
  ServiceAvailabilityMessageRequest,
  ServiceAvailabilityMessageResponse,
  VendorAvailabilityResponse, VendorMessageToAgent
} from './models/tenant.models';
import { delay, from, of, tap, timer } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
  messageComposer: MessageComposer = inject(MessageComposer);
  private destroyedRef$: DestroyRef = inject(DestroyRef);
  examples: Example[] = [];
  categories: Category[] = [];
  issueControl: FormControl = new FormControl<string>('');
  private workflow: WorkflowEngine;
  messageToLog!: EventMessageLog;

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
    this.categories = await this.messageComposer.getCategories();
    this.examples = await this.messageComposer.getExampleIssues()
    this.issueControl.setValue(this.examples[0].issue);
  }

  handlePageEvent(event$: PageEvent): void {
    const index = event$.pageIndex;
    this.issueControl.setValue(this.examples[index].issue);
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
    await this.addToLog('tenant', messageTenantIssueResponse, true);
    this.blockButtons.set(false);

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

    this.messageToLog = this.messageComposer.toEventMessageLog('Select and contact Vendor', messageRequestResult.data?.message!,  messageRequestResult.data?.time!);
    await this.addToLog('event', this.messageToLog);
    // this.typingLog.set(falsse);
    await this.addToLog('vendor', this.messageToLog, true)


    // get vendor availability response
    // this.typingVendor.set(true);
    const vendorAvailabilityContext: WorkflowContext<any> = new WorkflowContext(null);
    const vendorAvailabilityResponseStep = new VendorAvailabilityResponseStep(vendorAvailabilityContext, this.messageComposer);
    const availabilityResult = await this.workflow.executeWorkflow<VendorAvailabilityResponse>(vendorAvailabilityResponseStep);
    if(!availabilityResult.isSuccess) {
      this.blockButtons.set(false);
      return;
    }
    this.messageToLog = this.messageComposer.toEventMessageLog('Get Vendor availability response', availabilityResult.data?.message!,  availabilityResult.data?.time!);
    await this.addToLog('vendor', this.messageToLog);
    // this.typingVendor.set(true);
    await this.addToLog('event', this.messageToLog);
    // this.typingVendor.set(false);


    // response positively from vendor
    const availabilityVendor: VendorAvailabilityResponse = availabilityResult.data!;
    if(availabilityVendor.isAvailable) {
      const updateContext: WorkflowContext<InformTenantVendorContact> = new WorkflowContext({ user: user, tenant: '' });
      const updateTenantTicket = new SendMessage<InformTenantVendorContact, InformTenantVendorContactResponse>(updateContext);
      const updateTenantTicketResult: IWorkflowResult<InformTenantVendorContactResponse> = await updateTenantTicket.execute(this.messageComposer.updateTenantTicket);

      if(!updateTenantTicketResult.isSuccess){
        this.blockButtons.set(false);
        return;
      }

      this.messageToLog = this.messageComposer.toEventMessageLog('Update Tenant Ticket with Tenant response', updateTenantTicketResult.data?.message!,  updateTenantTicketResult.data?.time!);
      this.addToLog('event', this.messageToLog);
      this.addToLog('tenant', this.messageToLog, true);
    }

    // simulate Vendor let us know visit confirmation
    const confirmationVisitTimeContext = new WorkflowContext<any>(null);
    const confirmationVisitTimeStep = new ReceiveMessage<any, VendorMessageToAgent>(confirmationVisitTimeContext)
    const confirmationVisitTimeResult = await confirmationVisitTimeStep.execute(this.messageComposer.vendorIncomingMessageConfirmationVisit);

    if(!confirmationVisitTimeResult.isSuccess){
      this.blockButtons.set(false);
      return;
    }

    this.messageToLog = this.messageComposer.toEventMessageLog('Vendor Confirm Visit time', confirmationVisitTimeResult.data?.message!,  confirmationVisitTimeResult.data?.time!);
    this.addToLog('event', this.messageToLog);
    this.addToLog('vendor', this.messageToLog, true);

    this.blockButtons.set(false);
    // this.typingTenant.set(false);
  }

  private async addToLog(log: LogType, event: EventMessageLog, isIncoming: boolean = false) {
    if(log === 'event') {
      this.typingLog.set(true);
      await this.sleep(3000);
      this.typingLog.set(false);
      this.eventMessagesLog.update(messages => [...messages, event]);
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

}
