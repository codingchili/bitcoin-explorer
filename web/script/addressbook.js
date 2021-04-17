const ADDRESS_KEY = "address-book";

export class AddressBook {

    static load() {
        let list = localStorage.getItem(ADDRESS_KEY);
        if (list) {
            AddressBook.list = JSON.parse(list).items;
        } else {
            AddressBook.list = [];
        }
    }

    static all() {
        return AddressBook.list;
    }

    static receivers() {
        return AddressBook.list.filter(item => item.type === "public");
    }

    static senders() {
        return AddressBook.list.filter(item => item.type === "private");
    }

    static add(address) {
        AddressBook.remove(address);
        AddressBook.list.push(address);
        AddressBook.save();
    }

    static remove(address) {
        AddressBook.list = AddressBook.list.filter(item => item.address !== address.address)
        AddressBook.save();
    }

    static save() {
        localStorage.setItem(ADDRESS_KEY, JSON.stringify({
            items: AddressBook.list
        }));
    }
}

AddressBook.load();