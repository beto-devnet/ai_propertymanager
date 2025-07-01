import {
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  OnInit,
  signal,
  ViewChild,
  WritableSignal
} from '@angular/core';
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
  IssueMessage, NodeMessageLog,
  OutputMessage,
  RenderMessage, SimpleMessage, WaitingMessageLog
} from './Flow/LogCoordinator';
import { NodeBubbleComponent } from '../shared/components/node-bubble/node-bubble.component';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginService } from '../login/login.service';
import { tap } from 'rxjs';
import { Property2, PropertyBrief } from '../login/models';

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
    EvetLogBubbleComponent,
    NodeBubbleComponent
  ],
  templateUrl: './demo.component.html',
  styleUrl: './demo.component.css'
})
export default class DemoComponent implements OnInit {

  private service: UpdateService = inject(UpdateService);
  private loginService: LoginService = inject(LoginService);
  private destroyedRef$: DestroyRef = inject(DestroyRef);
  private activatedRoute = inject(ActivatedRoute);
  @ViewChild('buttonElementLog') private buttonElementLog!: ElementRef;
  examples: Example[] = [];
  categories: Category[] = [];
  vendors: Vendor[] = [];
  private tenantIssue: string = '';
  private selectedUserId: number = 0;
  selectedVendor: Vendor = { id: 0, category: '', preferedVendor: false, companyName: '', descriptionOfServices: '', contacts: [] };
  selectedCategory: Category = { name: '', description: '' };
  issueControl: FormControl = new FormControl<string>('');
  tenantMessageControl: FormControl = new FormControl<string>('');
  vendorMessageControl: FormControl = new FormControl<string>('');
  properties: Property2[] = [];
  propertySelected: Property2 = { id: 0, address: '', tenant: { name: '', telephone: '' }, landlord: '', leaseAgreementClauses: [] };
  private sleepTimeForMessages = 1500;

  typingLog = signal<boolean>(false);
  typingVendor = signal<boolean>(false);
  typingTenant = signal<boolean>(false);
  blockButtons = signal<boolean>(false);


  eventMessagesLog: WritableSignal<Array<IssueMessage | EventMessageLog | WaitingMessageLog | NodeMessageLog >> =signal<Array<IssueMessage | EventMessageLog | WaitingMessageLog | NodeMessageLog >>([]);
  vendorMessagesLog: WritableSignal<Array<SimpleMessage>> =signal<Array<SimpleMessage>>([]);
  tenantMessagesLog: WritableSignal<Array<SimpleMessage>> =signal<Array<SimpleMessage>>([]);

  private coordinator: Coordinator;

  constructor() {
    this.coordinator = new Coordinator();
  }

  async ngOnInit(): Promise<void> {
    this.selectedUserId = Number.parseInt(this.activatedRoute.snapshot.params['id'] || '1');

    this.service.getCategories().pipe(takeUntilDestroyed(this.destroyedRef$)).subscribe((categories: Category[]) => this.categories = categories);
    this.service.getVendors().pipe(takeUntilDestroyed(this.destroyedRef$)).subscribe((vendors: Vendor[]) => this.vendors = vendors);
    this.service.getIssues().pipe(takeUntilDestroyed(this.destroyedRef$)).subscribe((examples: Example[]) => {
      this.examples = examples;
      this.issueControl.setValue(examples[0].issue);
    });
    this.loginService.allProperties().pipe(takeUntilDestroyed(this.destroyedRef$), tap((result: Property2[]) => {
      this.properties = result;
      this.propertySelected = result.find(x => x.id === this.selectedUserId) || result[0];
      this.coordinator.Property = this.propertySelected;
    })).subscribe();
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
    this.tenantIssue = this.issueControl.value;
    const issueReq: ProcessIssueRequest = { UserId: this.propertySelected.id, IssueDescription: issue };
    const createIssueStep = await this.coordinator.createIssue(issueReq);
    this.typingLog.set(true);
    await this.sleepBetweenSteps(this.sleepTimeForMessages);
    await this.displayMessages(createIssueStep);
    this.blockButtons.set(false);

    if(createIssueStep.output.resolutionResponsibility.toLowerCase() == 'tenant') {
      console.log('resolution responsibility tenant');
      return;
    }

    // select a vendor based on the category
    this.selectedCategory = this.categories
        .find(category => category.name.trim().toLowerCase() === createIssueStep.output.category.trim().toLowerCase())
      || this.categories[0];

    await this.findVendor(this.selectedCategory.name);

    await this.askVendorForAvailability(this.tenantIssue);
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
      this.typingLog.set(true);
      // await this.sleepBetweenSteps(this.sleepTimeForMessages);
      await this.displayMessages(confirmationStep, false);

      const finalStep = this.coordinator.closeIssue();
      this.typingLog.set(true);
      await this.sleepBetweenSteps(this.sleepTimeForMessages);
      await this.displayMessages(finalStep);
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
      await this.displayMessages(availabilityStep, false);

      if(!availabilityStep.output.isAvailable) {
        // await this.sleepBetweenSteps(2000);
        this.typingLog.set(true);
        await this.findVendor(this.selectedCategory.name);

        await this.askVendorForAvailability(this.tenantIssue);
        return;
      }

      const informStep = await this.coordinator.InformTenantAboutContactWithVendor(this.selectedVendor.id);
      this.typingLog.set(true);
      await this.sleepBetweenSteps(this.sleepTimeForMessages);
      await this.displayMessages(informStep);

      const waitingStep = this.coordinator.waitForVendorConfirmVisit();
      this.typingLog.set(true);
      await this.sleepBetweenSteps(this.sleepTimeForMessages);
      await this.displayMessages(waitingStep);
    }
    else if(mark === StepMark.WaitingVendorScheduleVisit) {
      const visitStep = await this.coordinator.vendorConfirmScheduledVisit(this.selectedVendor.id, this.selectedVendor.contacts[0].name, this.selectedVendor.companyName, message);
      this.typingLog.set(true);
      await this.displayMessages(visitStep, false);

      if(!visitStep.output!.isScheduled) {
        // console.log('no se pudo agendar');
        return;
      }

      const waiting = this.coordinator.waitForVendorConfirmIssueFix();
      this.typingLog.set(true);
      await this.sleepBetweenSteps(this.sleepTimeForMessages);
      await this.displayMessages(waiting);
    }
    else if(mark === StepMark.WaitingVendorConfirmIssueFixed) {
      const conformationStep = await this.coordinator.vendorConfirmIssueFixed(this.selectedVendor.id, message);
      this.typingLog.set(true);
      await this.displayMessages(conformationStep, false);

      if(!conformationStep.output.issueFixed) {
        this.typingLog.set(true);
        await this.sleepBetweenSteps(this.sleepTimeForMessages);
        await this.findVendor(this.selectedCategory.name);

        this.typingLog.set(true);
        await this.sleepBetweenSteps(this.sleepTimeForMessages);
        await this.askVendorForAvailability(this.tenantIssue);
        return ;
      }

      const confirmationStep = this.coordinator.waitForTenantConfirmIssueFix(this.selectedVendor.contacts[0].name, this.selectedVendor.companyName);
      this.typingLog.set(true);
      await this.sleepBetweenSteps(this.sleepTimeForMessages);
      await this.displayMessages(confirmationStep);
    }
  }

  private async findVendor(categorySelected: string): Promise<void> {

    // await this.sleepBetweenSteps();

    const selectedVendorStep = await this.coordinator.selectVendorBasedOnCategory(categorySelected);
    this.typingLog.set(true);
    await this.sleepBetweenSteps(this.sleepTimeForMessages);
    await this.displayMessages(selectedVendorStep);

    this.selectedVendor = selectedVendorStep.output;
  }

  private async askVendorForAvailability(issue: string): Promise<void> {
    // ask vendor for availability
    const availabilityStep = await this.coordinator.AskForAvailability(this.selectedCategory.name, this.selectedVendor.id, issue);
    this.typingLog.set(true);
    await this.sleepBetweenSteps(this.sleepTimeForMessages);
    await this.displayMessages(availabilityStep);


    // waiting for vendor to reply
    const waiting = this.coordinator.waitForVendorAvailabilityReply();
    this.typingLog.set(true);
    await this.sleepBetweenSteps(this.sleepTimeForMessages);
    await this.displayMessages(waiting);
  }

  private async displayMessages(step: StepNodeResponse<any, any>, useWaiting: boolean = true) {
    this.typingLog.set(true);
    if(step.type === StepNodeType.Issue) {
      const data: ProcessIssueResponse = step.output as ProcessIssueResponse;
      const message = RenderMessage.renderIssueMessage(data);
      this.eventMessagesLog.update(messages => [...messages, message]);
      await this.sleepBetweenSteps(1200)
      this.typingLog.set(false);
    } else if(step.type === StepNodeType.Information) {
      const { title, message } = step;
      const messageToLog = RenderMessage.renderEventMessage(title, message);
      this.eventMessagesLog.update(messages => [...messages, messageToLog]);
      if(useWaiting) {
        await this.sleepBetweenSteps(1200)
      }
      this.typingLog.set(false);
    } else if(step.type === StepNodeType.Waiting) {
      const { title, message } = step;
      const messageToLog = RenderMessage.renderWaitingMessage(title, message);
      this.eventMessagesLog.update(messages => [...messages, messageToLog]);
      if(useWaiting) {
        await this.sleepBetweenSteps(1200)
      }
      this.typingLog.set(false);
    } else if(step.type === StepNodeType.Node) {
      const { title, message, steps } = step;
      const messageToLog = RenderMessage.renderNodeMessage(title, message, steps);
      this.eventMessagesLog.update(messages => [...messages, messageToLog]);
      if(useWaiting) {
        await this.sleepBetweenSteps(1200)
      }
      this.typingLog.set(false);
    }

    this.scroll();

    if(step.logs.length) {
      for (const log of step.logs) {
        if(log.isInput) {
          const { from, message, time } = log as InputMessage;
          const logMessage = RenderMessage.renderInputMessageLog(message, time);
          if(from === 'Vendor' ) {
            // this.typingVendor.set(true);
            // await this.sleepBetweenSteps(this.sleepTimeForMessages);
            this.vendorMessagesLog.update(messages => [...messages, logMessage]);
            // this.typingVendor.set(true);
          } else if(from === 'Tenant' ) {
            // this.typingTenant.set(true);
            // await this.sleepBetweenSteps(this.sleepTimeForMessages);
            this.tenantMessagesLog.update(messages => [...messages, logMessage]);
            // this.typingTenant.set(false);
          }
        } else if(!log.isInput) {
          const { to, message, time } = log as OutputMessage;
          const logMessage = RenderMessage.renderOutputMessageLog(message, time);
          if(to === 'Vendor' ) {
            this.typingVendor.set(true);
            await this.sleepBetweenSteps(this.sleepTimeForMessages);
            this.vendorMessagesLog.update(messages => [...messages, logMessage]);
            this.typingVendor.set(false);
          } else if(to === 'Tenant' ) {
            this.typingTenant.set(true);
            await this.sleepBetweenSteps(this.sleepTimeForMessages);
            this.tenantMessagesLog.update(messages => [...messages, logMessage]);
            this.typingTenant.set(false);
          }
        }
      }
    }
  }

  private scroll(): void {
    const el: HTMLElement | null = document.getElementById('targetLog');
    if(el !== null) {
      console.log('scroll');
      el.scrollIntoView({behavior: 'smooth'});
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
