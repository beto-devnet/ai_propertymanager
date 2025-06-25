export interface IStepNode<Type> {
  title: string;
  content: string;
  data: Type | null;
}

export type InitiatorType = 'Vendor' | 'Aimee' | 'Tenant';

export class StepNode<Type> {

  next?: StepNode<Type> | null;
  initiator: InitiatorType;
  private readonly data?: IStepNode<Type> | null;

  constructor(initiator: InitiatorType = 'Aimee', data: IStepNode<Type> | null) {
    this.initiator = initiator;
    this.data = data;
    this.next = null;
  }

  getData(): IStepNode<Type> | null {
    return this.data || null;
  }

  hasData(): boolean {
    return this.data === null;
  }
}

export class Steps {
  private head?: StepNode<any> | null;
  private tail?: StepNode<any> | null;

  addStep<Type>(initiator: InitiatorType, stepData: IStepNode<Type> | null) {
    const newStep = new StepNode<Type>(initiator, stepData);
    if (!this.head) {
      this.head = newStep;
      this.tail = newStep;
    } else {
      this.tail!.next = newStep;
      this.tail = newStep;
    }
  }

  getSteps(): StepNode<any>[] {
    const steps:StepNode<any>[] = [];
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

