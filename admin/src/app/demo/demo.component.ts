import { Component, DestroyRef, ElementRef, inject, OnInit, signal, ViewChild, WritableSignal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatRipple } from '@angular/material/core';
import { Example } from './models/example.model';
import { Category } from './models/category.example';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgClass, NgOptimizedImage } from '@angular/common';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { ChatBubbleComponent } from '../shared/components/chat-bubble/chat-bubble.component';
import { MessageLog } from './models/messageLog';
import { TypingDotsComponent } from '../shared/components/typing-dots/typing-dots.component';
import { ProcessIssueRequest, ProcessIssueResponse } from './Engine/models/ProcessIssue';
import { UpdateService } from './Engine/update.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Vendor } from './models/vendor.model';
import { Tenant } from './models/Tenant';
import { EvetLogBubbleComponent } from '../shared/components/evet-log-bubble/evet-log-bubble.component';

import { Coordinator } from './Flow/Coordinator';
import { StepNodeResponse, StepMark, StepNodeType } from './Flow/Step';
import {
  EventMessageLog,
  InputMessage,
  IssueMessage,
  OutputMessage,
  RenderMessage, SimpleMessage, WaitingMessageLog
} from './Flow/LogCoordinator';

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
  templateUrl: './demo.component.html',
  styleUrl: './demo.component.css'
})
export default class DemoComponent implements OnInit {

  private service: UpdateService = inject(UpdateService);
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

  tenantMessagesLog: WritableSignal<MessageLog[]> =signal<MessageLog[]>([]);

  eventMessagesLog2: WritableSignal<Array<IssueMessage | EventMessageLog | WaitingMessageLog>> =signal<Array<IssueMessage | EventMessageLog | WaitingMessageLog>>([]);
  vendorMessagesLog2: WritableSignal<Array<SimpleMessage>> =signal<Array<SimpleMessage>>([]);
  tenantMessagesLog2: WritableSignal<Array<SimpleMessage>> =signal<Array<SimpleMessage>>([]);

  private coordinator: Coordinator;

  constructor() {
    this.coordinator = new Coordinator();
  }

  async ngOnInit(): Promise<void> {
    this.service.getCategories().pipe(takeUntilDestroyed(this.destroyedRef$)).subscribe((categories: Category[]) => this.categories = categories);
    this.service.getVendors().pipe(takeUntilDestroyed(this.destroyedRef$)).subscribe((vendors: Vendor[]) => this.vendors = vendors);
    this.service.getIssues().pipe(takeUntilDestroyed(this.destroyedRef$)).subscribe((examples: Example[]) => {
      this.examples = examples;
      this.issueControl.setValue(examples[0].issue);
    });
    this.service.getRandomTenant().pipe(takeUntilDestroyed(this.destroyedRef$)).subscribe((tenant: Tenant) => {
      this.tenant = tenant;
      this.coordinator.Tenant = tenant;
    });

  }

  handlePageEvent(event$: PageEvent): void {
    const index = event$.pageIndex;
    this.issueControl.setValue(this.examples[index].issue);
  }

  async processIssue(): Promise<void> {
    if(this.issueControl.value.length === 0) {
      return;
    }

    // issue request flow
    this.blockButtons.set(true);
    const issue = this.issueControl.value;
    this.typingLog();
    const issueReq: ProcessIssueRequest = { UserId: this.tenant.id, IssueDescription: issue };
    const createIssueStep = await this.coordinator.createIssue(issueReq);
    this.displayMessages(createIssueStep);
    this.blockButtons.set(false);

    // select a vendor based on the category
    this.selectedCategory = this.categories
        .find(category => category.name.trim().toLowerCase() === createIssueStep.output.category.trim().toLowerCase())
        || this.categories[0];

    await this.sleepBetweenSteps();

    const selectedVendorStep = await this.coordinator.selectVendorBasedOnCategory(this.selectedCategory.name);
    this.displayMessages(selectedVendorStep);

    this.selectedVendor = selectedVendorStep.output;

    await this.sleepBetweenSteps();

    // ask vendor for availability
    const availabilityStep =await this.coordinator.AskForAvailability(this.selectedCategory.name, this.selectedVendor.id, issue);
    this.displayMessages(availabilityStep);

    await this.sleepBetweenSteps();

    // waiting for vendor to reply
    const waiting = this.coordinator.waitForVendorAvailabilityReply();
    this.displayMessages(waiting);
  }

  async tenantToAimee(): Promise<void> {
    const message = this.tenantMessageControl.value;
    if(!message) {
      return;
    }

    this.tenantMessageControl.reset();

    const mark = this.coordinator.LastMark;
    if(mark === StepMark.WaitingTenantConfirmIssueFixed) {
      const confirmationStep = await this.coordinator.confirmWithTenantIssueFixed(message);
      this.displayMessages(confirmationStep);
    }

  }

  async vendorToAimee(): Promise<void> {
    const message = this.vendorMessageControl.value;
    if(!message) {
      return;
    }

    this.vendorMessageControl.reset();

    const mark = this.coordinator.LastMark;

    if(mark === StepMark.WaitingVendorAvailabilityReply) {
      const availabilityStep = await this.coordinator.vendorReplyAvailability(this.selectedVendor.id, message);
      this.displayMessages(availabilityStep);

      if(!availabilityStep.output.isAvailable) {} //FIND OTHER VENDOR

      const informStep = await this.coordinator.InformTenantAboutContactWithVendor(this.selectedVendor.id);
      this.displayMessages(informStep);

      await this.sleepBetweenSteps(2000);
      const waitingStep = this.coordinator.waitForVendorConfirmVisit();
      this.displayMessages(waitingStep);
    }
    else if(mark === StepMark.WaitingVendorScheduleVisit) {
      const visitStep = await this.coordinator.vendorConfirmScheduledVisit(this.selectedVendor.id, this.selectedVendor.contacts[0].name, this.selectedVendor.companyName, message);
      this.displayMessages(visitStep);

      await this.sleepBetweenSteps(2000);
      const waiting = this.coordinator.waitForVendorConfirmIssueFix();
      this.displayMessages(waiting);
    }
    else if(mark === StepMark.WaitingVendorConfirmIssueFixed) {
      const conformationStep = await this.coordinator.vendorConfirmIssueFixed(this.selectedVendor.id, message);
      this.displayMessages(conformationStep);

      const confirmationStep = this.coordinator.waitForTenantConfirmIssueFix(this.selectedVendor.contacts[0].name, this.selectedVendor.companyName);
      this.displayMessages(confirmationStep);
    }
  }

  private displayMessages(step: StepNodeResponse<any, any>) {
    if(step.type === StepNodeType.Issue) {
      const data: ProcessIssueResponse = step.output as ProcessIssueResponse;
      const message = RenderMessage.renderIssueMessage(data);
      this.eventMessagesLog2.update(messages => [...messages, message]);
    } else if(step.type === StepNodeType.Information) {
      const { title, message } = step;
      const messageToLog = RenderMessage.renderEventMessage(title, message);
      this.eventMessagesLog2.update(messages => [...messages, messageToLog]);
    } else if(step.type === StepNodeType.Waiting) {
      const { title } = step;
      const messageToLog = RenderMessage.renderWaitingMessage(title);
      this.eventMessagesLog2.update(messages => [...messages, messageToLog]);
    }

    if(step.logs.length) {
      step.logs.forEach(log => {
        if(log.isInput) {
          const { from, message, time } = log as InputMessage;
          const logMessage = RenderMessage.renderInputMessageLog(message, time);
          if(from === 'Vendor' ) {
            this.vendorMessagesLog2.update(messages => [...messages, logMessage]);
          } else if(from === 'Tenant' ) {
            this.tenantMessagesLog2.update(messages => [...messages, logMessage]);
          }
        } else if(!log.isInput) {
          const { to, message, time } = log as OutputMessage;
          const logMessage = RenderMessage.renderInputMessageLog(message, time);
          if(to === 'Vendor' ) {
            this.vendorMessagesLog2.update(messages => [...messages, logMessage]);
          } else if(to === 'Tenant' ) {
            this.tenantMessagesLog2.update(messages => [...messages, logMessage]);
          }
        }
      });
    }
  }

  async sleepBetweenSteps(ms: number = 3000): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, ms);
    });
  }

  protected readonly StepNodeType = StepNodeType;
}
