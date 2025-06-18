  export interface IWorkflowResult<T> {
    isSuccess: boolean;
    message: string;
    data?: T;
  }

  export class WorkflowResult {
    static success<T>(message: string = "step completed successfully", data?: T): IWorkflowResult<T> {
      return { isSuccess: true, message, data };
    }

    static fail<T>(message: string = "Step failure"): IWorkflowResult<T> {
      return { isSuccess: false, message };
    }
  }

  export class WorkflowContext<Type> {
    private data: Type;

    constructor(data: Type) {
      this.data = data;
    }

    get GetContext(): Type {
      return this.data
    }
  }

  export interface IWorkflowStep<TOutput> {
    execute(): Promise<IWorkflowResult<TOutput>>;
  }

  export interface IWorkflowStep2<TOutput> {
    execute(fn: any): Promise<IWorkflowResult<TOutput>>;
  }
