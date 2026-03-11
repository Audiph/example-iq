interface Contact {
  phone: string;
  firstName: string;
  lastName: string;
  email: string;
}

const contacts: Map<string, Contact> = new Map([
  [
    "+16175551234",
    {
      phone: "+16175551234",
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah@example.com",
    },
  ],
  [
    "+12125559876",
    {
      phone: "+12125559876",
      firstName: "Michael",
      lastName: "Chen",
      email: "michael@example.com",
    },
  ],
]);

export function lookupPhone(phone: string): Contact | null {
  return contacts.get(phone) ?? null;
}

export function saveContact(contact: Contact): void {
  contacts.set(contact.phone, contact);
}
