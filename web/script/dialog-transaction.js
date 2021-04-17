import {html, render} from '/node_modules/lit-html/lit-html.js'

import './lib/bunny-components/bunny-button.js'
import './lib/bunny-components/bunny-input.js'
import './lib/bunny-components/bunny-tab.js'

import {AddressBook} from './addressbook.js';

class DialogTransaction extends HTMLElement {

    static get is() {
        return 'dialog-transaction';
    }

    connectedCallback() {
        this.attachShadow({mode: 'open'});
        this.close();
    }

    open() {
        this.style.display = 'block';
        this.render();
    }

    close() {
        this.style.display = 'none';
    }

    get template() {
        return html`
            <style>
                :host {
                    z-index: 200;
                    --bunny-switch-off: #a80086;
                    --bunny-tab-background: #212121;
                    --bunny-tab-background-active: rgba(0, 110, 123, 0.51);
                }

                #overlay {
                    position: absolute;
                    top: 0;
                    right: 0;
                    left: 0;
                    bottom: 0;
                    opacity: 0.42;
                    background-color: #212121;
                }

                #dialog {
                    z-index: 200;
                    position: absolute;
                    top: 0;
                    right: 0;
                    left: 0;
                    bottom: 0;
                    width: 592px;
                    height: fit-content;
                    margin: auto;
                    /*transform: translateY(-50%);*/
                }

                #dialog-content {
                    padding: 24px;
                }

                bunny-button {
                    margin-top: 32px;
                    position: absolute;
                    bottom: 0px;
                    left: 0;
                    right: 0;
                }

                .error {
                    color: #ff0000;
                    display: block;
                    text-align: center;
                }

                hr {
                    margin: 24px;
                    opacity: 0.32;
                }

                .label {
                    margin-top: 8px;
                    margin-bottom: 8px;
                }

                .address {
                    font-size: smaller;
                    opacity: 0.64;
                }

                .name, .address {
                    text-align: center;
                }

                #amount {
                    padding-bottom: 16px;
                }
            </style>

            <div id="overlay" @click="${this.close.bind(this)}"></div>
            <bunny-box id="dialog" border solid>
                <div id="dialog-content">
                    <div class="label">From</div>
                    <div id="senders">
                        ${AddressBook.senders().length === 0 ?
                                html`<span class="error">Need at least one private key entry.</span>`
                                : AddressBook.senders().map(sender => html`
                                    <bunny-tab class="sender" @click="${e => this._sender(sender, e)}" no-underline>
                                        <div>
                                            <div class="name">
                                                ${sender.name}
                                            </div>
                                            <div class="address">
                                                ${sender.address}
                                            </div>
                                        </div>
                                    </bunny-tab>
                                `)
                        }
                    </div>
                    <div class="label">To</div>
                    <div id="receivers">
                        ${AddressBook.all().length < 2 ?
                                html`<span class="error">Need at least two address entries.</span>`
                                : AddressBook.all().map(receiver => html`
                                    <bunny-tab class="receiver" @click="${e => this._receiver(receiver, e)}"
                                               no-underline>
                                        <div>
                                            <div class="name">
                                                ${receiver.name}
                                            </div>
                                            <div class="address">
                                                ${receiver.address}
                                            </div>
                                        </div>
                                    </bunny-tab>
                                `)}
                    </div>
                    <div style="margin-top: 16px;"></div>
                    <bunny-input id="transaction" label="Transaction id"></bunny-input>
                    <bunny-input id="index" label="Input #"></bunny-input>
                    <bunny-input id="amount" label="BTC"></bunny-input>
                    <bunny-button @click="${this.sendTransaction.bind(this)}">Send</bunny-button>
                </div>
            </bunny-box>
        `;
    }

    _receiver(receiver, e) {
        this.receiver = receiver;
        this.shadowRoot.querySelectorAll("bunny-tab.receiver").forEach(tab => tab.inactivate());
        e.target.activate();
    }

    _sender(sender, e) {
        this.sender = sender;
        this.shadowRoot.querySelectorAll("bunny-tab.sender").forEach(tab => tab.inactivate());
        e.target.activate();
    }

    sendTransaction() {
        let payload = {
            wif_from: this.sender.wif,
            compressed_to: this.receiver.address,
            amount: this.amountInput.value,
            transaction: this.transactionInput.value,
            output: this.indexInput.value,
        };
        console.log(payload);
        /*fetch('/api/transact', {
            method: 'post',
            body: JSON.stringify()
        }).then(response => response.json())
            .then(() => {
                this.close();
            });*/
    }

    render() {
        render(this.template, this.shadowRoot);
        this.bind();
    }

    bind() {
        this.transactionInput = this.shadowRoot.querySelector('#transaction');
        this.indexInput = this.shadowRoot.querySelector('#index');
        this.amountInput = this.shadowRoot.querySelector('#amount');
    }
}

customElements.define(DialogTransaction.is, DialogTransaction);