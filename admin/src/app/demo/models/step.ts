export enum Step {
  Next,
  LogIssue,
  GetVendor
}


export class FlowCoordinator {
  private step: Step;

  constructor() {
    this.step = Step.LogIssue;
  }



}
