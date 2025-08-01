﻿namespace doorx.domain;

public class ContactVendor
{
    public string Name { get; private set; }
    public string Email { get; private set; }
    public string Phone { get; private set; }
    public ContactVendor(string name, string email, string phone)
    {
        Name = name;
        Email = email;
        Phone = phone;
    }
}