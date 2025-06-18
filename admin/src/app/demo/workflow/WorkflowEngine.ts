import { IWorkflowResult, IWorkflowStep } from './WorkflowContext';

export class WorkflowEngine {

  private readonly steps: any[];

  constructor(steps: any[]) {
    this.steps = steps;
  }

  async executeWorkflow<TOutput>(step: IWorkflowStep<TOutput>):
    Promise<IWorkflowResult<TOutput>> {
    return await step.execute();
  }
}
