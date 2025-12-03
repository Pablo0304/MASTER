
class Bussines_Logic_Proxy {
    constructor(base_url) {
        this.base_url = base_url;
    }

    async add(inc) {
        const res = await fetch(`${this.base_url}/add/${inc}`, { method: "POST" });
        return await res.json();
    }

    async get_value() {
        const res = await fetch(`${this.base_url}/value`);
        return await res.json();
    }
}

