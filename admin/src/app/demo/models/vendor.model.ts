 export interface Vendor {
   id: number,
   category: string,
   preferedVendor: boolean,
   companyName: string,
   descriptionOfServices: string,
   contacts: Contact[]
}

 export interface Contact {
   name: string,
   email: string,
   phone: string,
   preferredMethodOfContact: string
}
