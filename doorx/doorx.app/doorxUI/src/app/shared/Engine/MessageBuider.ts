import { IMessage, ISimpleMessage } from './MessageEngine';

type MessageType = 'simpleMessage' | 'logMessage';

export class MessageBuilder {
  private message: IMessage = this.initializeLogMessage();
  private simpleMessage: ISimpleMessage = this.initializeSimpleMessage();
  private messageType: MessageType = 'logMessage';

  createNewLogMessage() {
    this.message = this.initializeLogMessage();
    this.messageType = "logMessage";
    return this;
  }

  createNewSimpleMessage(content: string) {
    this.simpleMessage = this.initializeSimpleMessage();
    this.messageType = "simpleMessage";
    this.simpleMessage.text = content;
    return this;
  }

  asSentMessage() {
    if (this.messageType === 'simpleMessage') {
      this.simpleMessage.type = 'Sent';
    }

    return this;
  }

  asReceiveMessage() {
    if (this.messageType === 'simpleMessage') {
      this.simpleMessage.type = 'Receive';
    }

    return this;
  }

  withTitle(title: string) {
    if(this.messageType == 'logMessage') {
      this.message.title = title;
    }
    return this;
  }

  withDescription(description: string) {
    if (this.messageType === 'logMessage') {
      this.message.description = description;
    }
    return this
  }

  withContent(name: string, text: string) {
    this.message.messageContent.push({
      name,
      text
    });

    return this;
  }

  getMessage(): IMessage | ISimpleMessage {
    if(this.messageType == 'logMessage') {
      this.message.date = new Date();
      return this.message;
    } else {
      this.simpleMessage.date = new Date();
      return this.simpleMessage;
    }
  }



  private initializeLogMessage(): IMessage {
    return  {
      title: '',
      description: '',
      date: new Date(),
      messageContent: []
    };
  }

  private initializeSimpleMessage(): ISimpleMessage {
    return {
      text: '',
      date: new Date(),
      type: "Sent"
    }
  }
}

// export class MessageBuilder {
//
//   issueRequest(category: string,
//                       issueDescription: string,
//                       tenantName: string,
//                       address: string,
//                       phone: string,
//                       nextStep: string): IMessage {
//
//     const categoryItem: IMessageItem = { name: 'Category', text: category };
//     const issueItem: IMessageItem = { name: 'Issue', text: issueDescription };
//     const tenantItem: IMessageItem = { name: 'Resident', text: tenantName };
//     const addressItem: IMessageItem = { name: 'Address', text: address };
//     const phoneItem: IMessageItem = { name: 'Phone', text: phone };
//     const nextStepItem: IMessageItem = { name: 'Next Step', text: nextStep };
//
//     return {
//       title: 'Issue Request',
//       date: new Date(),
//       messageContent: [categoryItem, issueItem, tenantItem, addressItem, phoneItem, nextStepItem]
//     };
//   }
//
//   generateMessageItem(name: string, text: string): IMessageItem {
//     return {
//       name,
//       text
//     }
//   }
//
//   message(title: string, messageToTenant: string, messageToVendor: string, stopFlowReason: string): IMessage {
//     const messageContent: IMessageItem[] = [];
//     if (messageToTenant) {
//       messageContent.push({ name: 'Message to Tenant', text: messageToTenant });
//     }
//
//     if (messageToVendor) {
//       messageContent.push({ name: 'Message to Vendor', text: messageToVendor });
//     }
//
//     if (stopFlowReason) {
//       messageContent.push({ name: 'Reason to stop flow', text: stopFlowReason });
//     }
//
//     return {
//       title: title,
//       date: new Date(),
//       messageContent
//     }
//   }
//
//   messageReceived(message: string): ISimpleMessage {
//     return {
//       date: new Date(),
//       text: message,
//       type: 'Receive'
//     }
//   }
//
//   messageSent(message: string): ISimpleMessage {
//     return {
//       date: new Date(),
//       text: message,
//       type: 'Sent'
//     }
//   }
//
//   messageAgentUpdate(message: string): IMessageAgentInformation {
//     return {
//       date: new Date(),
//       content: message,
//     }
//   }
// }
