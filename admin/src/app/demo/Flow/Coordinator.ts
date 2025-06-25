import { InitiatorType, IStepNode, Steps } from './Step';
import { ProcessIssueRequest } from '../Engine/models/ProcessIssue';
import { format } from 'date-fns';
import { Tenant } from '../models/Tenant';
import { inject } from '@angular/core';
import { UpdateService } from '../Engine/update.service';
import { firstValueFrom } from 'rxjs';
import { IssueMessage, LogCoordinator } from './LogCoordinator';

export class Coordinator {
  private steps: Steps;
  private logs: LogCoordinator =  new LogCoordinator();
  private tenant: Tenant;
  private service: UpdateService = inject(UpdateService);

  constructor(tenant: Tenant) {
    this.steps = new Steps();
    this.tenant = tenant;
  }

  async createIssue(issue: ProcessIssueRequest): Promise<void> {
    const stepData: IStepNode<ProcessIssueRequest> = { title: 'Tenant Request', content: '', data: issue };
    this.steps.addStep<ProcessIssueRequest>('Vendor', stepData);

    const result = await firstValueFrom(this.service.processIssue(issue));
    if(result.isError) {
      this.logs.LogError({ time: this.formatDate(), errorMessage: result.error?.message!, title: 'Error processing Issue' })
    }
    else {
      const issueMessage: IssueMessage = {
        time: format(new Date(), 'MM-dd HH:mm'),
        tenantName: this.tenant.name,
        tenantAddress: this.tenant.address,
        tenantPhone: this.tenant.phone,
        issueDescription: issue.IssueDescription,
        category: result.data?.category!
      };
      this.logs.LogIssueRequest(issueMessage);

      this.logs.LogHistoryMessage({ time: this.formatDate(), from: 'Aimee', response: result.data?.response! });
    }
  }

  private formatDate() {
    return format(new Date(), 'MM-dd HH:mm');
  }
}

