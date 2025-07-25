export interface Vendor {
  id: number,
  category: Category,
  preferredVendor: boolean,
  companyName: string,
  descriptionOfServices: string,
  contacts: Contact[]
}

export interface Category {
  id: number,
  name: string,
  description: string
}

export interface Contact {
  name: string,
  email: string,
  phone: string,
  preferredMethodOfContact: string
}
