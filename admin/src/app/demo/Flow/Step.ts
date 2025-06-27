import { LogsMessageType } from './LogCoordinator';

export interface DataNode<Type> {
  title: string;
  content: string;
  data: Type | null;
}

export type RoleType = 'Vendor' | 'Aimee' | 'Tenant';
export enum StepMark {
  None,
  WaitingVendorAvailabilityReply,
  WaitingVendorScheduleVisit,
  WaitingVendorConfirmIssueFixed,
  WaitingTenantConfirmIssueFixed
}

export class StepNode<TInput, TOutput = null> {

  next?: StepNode<TInput, TOutput> | null;
  initiator: RoleType;
  readonly inputData?: DataNode<TInput> | null;
  readonly outputData?: TOutput | null;
  logs: LogsMessageType = [];
  mark: StepMark = StepMark.None;

  constructor(initiator: RoleType = 'Aimee',
              input: DataNode<TInput> | null,
              output: TOutput | null = null,
              logs: LogsMessageType,
              mark: StepMark = StepMark.None) {
    this.initiator = initiator;
    this.inputData = input;
    this.outputData = output;
    this.logs = logs;
    this.mark = mark;
    this.next = null;
  }

  getData(): TOutput | null {
    return this.outputData || null;
  }

  hasData(): boolean {
    return this.inputData === null;
  }
}

export type StepNodeResult<TInput, TOutput> = Pick<StepNode<TInput, TOutput>, 'inputData' |  'outputData' | 'logs' | 'mark'>;

export class StepList {
  private head?: StepNode<any, any> | null;
  private tail?: StepNode<any, any> | null;

  addStep<TInput, TOutput>(initiator: RoleType,
                stepData: DataNode<TInput> | null,
                outputData: TOutput,
                logs: LogsMessageType,
                mark: StepMark = StepMark.None): void {

    const newStep = new StepNode<TInput, TOutput>(initiator, stepData, outputData, logs, mark);

    if (!this.head) {
      this.head = newStep;
      this.tail = newStep;
    } else {
      this.tail!.next = newStep;
      this.tail = newStep;
    }
  }


  getLastStep<TInput, TOutput>(): StepNode<TInput, TOutput> {
    return this.tail ?? new StepNode<TInput, TOutput>('Aimee', null, null, []);
  }

  getSteps(): StepNode<any, any>[] {
    const steps:StepNode<any, any>[] = [];
    let current = this.head;
    if(!current) {
      return [];
    }

    while (current) {
      steps.push(current);
      current = current.next;
    }

    return steps;
  }
}

