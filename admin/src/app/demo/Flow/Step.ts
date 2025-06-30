import {
  NodeLog,
  InputMessage,
  LogsMessageType,
  OutputMessage
} from './LogCoordinator';
import { format } from 'date-fns';


export type RoleType = 'Vendor' | 'Aimee' | 'Tenant';
export enum StepMark {
  None,
  WaitingVendorAvailabilityReply,
  WaitingVendorScheduleVisit,
  WaitingVendorConfirmIssueFixed,
  WaitingTenantConfirmIssueFixed
}

export enum StepNodeType {
  Issue,
  Information,
  Waiting,
  Node,
  Error,
}

export interface INode {
  title: string;
  message: string;
  steps: NodeLog[];
}

export class Node implements INode {
  title: string;
  message: string;
  steps: NodeLog[] = [];

  constructor(title: string, message: string) {
    this.title = title;
    this.message = message;
  }
}

export class StepNode<TInput, TOutput> extends Node {

  type: StepNodeType = StepNodeType.Information;
  input: TInput;
  output: TOutput;
  next?: StepNode<TInput, TOutput> | null;
  logs: LogsMessageType = [];
  mark: StepMark = StepMark.None;

  constructor(
    title: string,
    message: string,
    type: StepNodeType,
    input: TInput,
    output: TOutput,
    mark: StepMark = StepMark.None
  ) {
    super(title, message);

    this.type = type;
    this.input = input;
    this.output = output;
    this.mark = mark;
  }

  addLogStep(from: RoleType, message: string): void {
    const messageLog: NodeLog = {
      title:`Message from ${from}`,
      from: from,
      message: message,
      time: format(new Date(), 'MM-dd HH:mm'),
    };
    this.steps.push(messageLog);
  }


  sendMessageToTenant(message: string): void {
    const messageLog: OutputMessage = {
      message: message,
      time: format(new Date(), 'MM-dd HH:mm'),
      to: 'Tenant',
      isInput: false
    };
    this.logs.push(messageLog);
  }

  sendMessageToVendor(message: string): void {
    const messageLog: OutputMessage = {
      message: message,
      time: format(new Date(), 'MM-dd HH:mm'),
      to: 'Vendor',
      isInput: false
    };
    this.logs.push(messageLog);
  }

  receiveMessageFromVendor(message: string): void {
    const messageLog: InputMessage = {
      message: message,
      time: format(new Date(), 'MM-dd HH:mm'),
      from: 'Vendor',
      isInput: true
    };
    this.logs.push(messageLog);
  }

  receiveMessageFromTenant(message: string): void {
    const messageLog: InputMessage = {
      message: message,
      time: format(new Date(), 'MM-dd HH:mm'),
      from: 'Tenant',
      isInput: true
    };
    this.logs.push(messageLog);
  }
}

export type StepNodeResponse<TInput, TOutput> = Pick<StepNode<TInput, TOutput>, 'title' | 'message' | 'type' | 'logs' |'output' | 'steps' | 'input' | 'mark'>;

export interface Builder<TInput, TOutput> {
  WithTitle(title: string): this;
  WithMessage(message: string): this;
  WithInputData(data: TInput): this;
  WithOutputData(data: TOutput): this;
  OfType(type: StepNodeType, mark: StepMark): this;
}

export class StepBuilder<TInput, TOutput> implements Builder<TInput, TOutput> {

  private type!: StepNodeType;
  input!: TInput;
  output!: TOutput;
  title: string = '';
  message: string = '';
  mark: StepMark = StepMark.None;

  constructor() {
  }

  OfType(type: StepNodeType, mark: StepMark = StepMark.None): this {
    this.type = type;
    this.mark = mark;
    return this;
  }

  WithInputData(data: TInput): this {
    this.input = data;
    return this;
  }

  WithMessage(message: string): this {
    this.message = message;
    return this;
  }

  WithOutputData(data: TOutput): this {
    this.output = data;
    return this;
  }

  WithTitle(title: string): this {
    this.title = title;
    return this;
  }

  build(): StepNode<TInput, TOutput> {
    return new StepNode<TInput, TOutput>(
      this.title,
      this.message,
      this.type,
      this.input,
      this.output,
      this.mark
    );

  }
}

export class StepList {
  private head?: StepNode<any, any> | null;
  private tail?: StepNode<any, any> | null;

  addStep(step: StepNode<any, any>): void {

    if (!this.head) {
      this.head = step;
      this.tail = step;
    } else {
      this.tail!.next = step;
      this.tail = step;
    }
  }


  getLastStep<TInput, TOutput>(): StepNodeResponse<TInput, TOutput>{
    return this.tail ?? new StepNode<any, any>(
      'Error in Step',
      'An error occurred while processing the step',
      StepNodeType.Error,
      null,
      null,
      StepMark.None
    );
  }

  getWaitingStepByMark(mark: StepMark): StepNodeResponse<any, any> | null {
    let step:StepNode<any, any> | null = null;
    let current = this.head;
    if(!current) {
      return step;
    }

    while (current) {
      if(current.type === StepNodeType.Waiting && current.mark === mark) {
        step = current;
        break;
      }
      current = current.next;
    }

    return step;
  }

  getLastMark(): StepMark {
    return this.tail !== null ? this.tail?.mark! : StepMark.None;
  }

}

