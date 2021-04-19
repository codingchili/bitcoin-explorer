import {html, render} from '/node_modules/lit-html/lit-html.js'

import './lib/bunny-components/bunny-button.js'
import './lib/bunny-components/bunny-input.js'
import './lib/bunny-components/bunny-tab.js'
import './lib/bunny-components/bunny-toast.js'

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

                bunny-toast.error {
                    --toast-text-color: #ff0000;
                }

                bunny-toast.success {
                    --toast-text-color: #00ff00;
                }

                #overlay {
                    position: absolute;
                    top: 0;
                    right: 0;
                    left: 0;
                    bottom: 0;
                    /*opacity: 0;*/
                    background-color: #212121;
                }

                #dialog {
                    z-index: 200;
                    position: absolute;
                    top: 0;
                    right: 0;
                    left: 0;
                    bottom: 0;
                    width: 662px;
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

                #close {
                    position: absolute;
                    bottom: 64px;
                    left: 0px;
                    right: 0px;
                    text-align: center;
                    margin: auto;
                    opacity: 0.64;
                }

                #receivers, #senders {
                    max-height: 180px;
                    overflow-y: scroll;
                }

                *::-webkit-scrollbar {
                    width: 0.4em;
                    height: 0.4em;
                }

                *::-webkit-scrollbar-track {
                    background-color: #00000000;
                }

                *::-webkit-scrollbar-thumb {
                    background-color: #646464;
                }

                ::selection {
                    color: rgb(0, 176, 255);
                }
            </style>

            <div id="overlay" @click="${this.close.bind(this)}">
                <span id="close" @mousedown="${() => this.close()}">Click anywhere to close</span>
            </div>
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
                    <bunny-input id="index" label="Output #"></bunny-input>
                    <bunny-input id="amount" label="BTC"></bunny-input>
                    <bunny-button @click="${this.sendTransaction.bind(this)}">Send</bunny-button>
                </div>
            </bunny-box>

            <bunny-toast class="error"></bunny-toast>
            <bunny-toast class="success"></bunny-toast>
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
            compressed_from: this.sender.address,
            compressed_to: this.receiver.address,
            amount: parseFloat(this.amountInput.value),
            transaction: this.transactionInput.value,
            output: parseInt(this.indexInput.value),
        };
        fetch('/api/transact', {
            method: 'post',
            body: JSON.stringify(payload)
        }).then(response => response.json())
            .then(response => {
                if (response.code < 0) {
                    this.shadowRoot.querySelector('bunny-toast.error')
                        .open(response.message, 4000)
                } else {
                    this.shadowRoot.querySelector('bunny-toast.success')
                        .open(`Created tx ${response.result}`, 6000)

                    this.dispatchEvent(new CustomEvent('tx-created', {
                            detail: {txid: response.result}
                        }
                    ));
                    this.transactionInput.clear();
                    this.indexInput.clear();
                    this.transactionInput.clear();
                    this.amountInput.clear();
                    this.close();
                }
            });
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