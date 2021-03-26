export default class Bitcoin {

    call(method, data) {
        return fetch(`http://localhost:8080/api/${method}`, {
            headers: {"Content-Type": "application/json"},
            method: "post",
            body: JSON.stringify(data ?? {})
        }).then(response => response.json())
            .then(response => {
                if (response.error) {
                    return {error: response.error};
                } else {
                    return response.result;
                }
            }).catch((e) => {
                return {error: e.message}
            })
    }

    info() {
        return this.call("info");
    }

    blockhash(blockIndex) {
        return this.call("blockhash", {index: blockIndex});
    }

    block(blockHash) {
        return this.call("block", {hash: blockHash});
    }

    txinfo(txid) {
        return this.call("txinfo", {txid: txid});
    }

    outputs(address) {
        return this.call("outputs", {address: address});
    }
}

window.bitcoin = new Bitcoin();