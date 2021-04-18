import {html, render} from '/node_modules/lit-html/lit-html.js'

import './lib/bunny-components/bunny-button.js'
import './lib/bunny-components/bunny-switch.js'
import './lib/bunny-components/bunny-input.js'

import {AddressBook} from './addressbook.js';

class DialogAddress extends HTMLElement {

    static get is() {
        return 'dialog-address';
    }

    constructor() {
        super();
        this.names = [
            "Jenny's Pizza",
            "Candy's Plaza",
            "Elliot's Vegan Hamburger Bar",
            "That place on the corner",
            "Starbucks"
        ]
    }

    connectedCallback() {
        this.attachShadow({mode: 'open'});
        this.close();
    }

    open() {
        this.style.display = 'block';
        this.publicAddress = true;
        this.wif = null;
        this.private = null;
        this.public = null;
        this.suggestion = this.names[Math.round(Math.random() * (this.names.length - 1))];
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
                    width: 592px;
                    height: 262px;
                    margin: auto;
                    transform: translateY(-50%);
                }

                #dialog-content {
                    padding: 24px;
                }

                bunny-button {
                    margin-top: 24px;
                    position: absolute;
                    bottom: 0px;
                    left: 0;
                    right: 0;
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
            </style>

            <div id="overlay" @click="${this.close.bind(this)}">
                <span id="close" @mousedown="${() => this.close()}">Click anywhere to close</span>
            </div>
            <bunny-box id="dialog" border solid>
                <div id="dialog-content">
                    <div style="display: flex; justify-content: space-between">
                        <div>${this.publicAddress ? 'Public address' : 'Private address'}</div>
                        <bunny-switch @change="${e => this._addressTypeChange(e)}" ?active="${this.publicAddress}"></bunny-switch>
                    </div>
                    ${this.publicAddress ? this.publicAddressTemplate : this.privateAddressTemplate}
                    <bunny-input id="name" label="name" placeholder="${this.suggestion}"></bunny-input>
                    <bunny-button @click="${this.submit.bind(this)}">Save</bunny-button>
                </div>
            </bunny-box>
        `;
    }

    get publicAddressTemplate() {
        return html`
            <bunny-input id="compressed" label="compressed" placeholder="bc1qefysc0jm3xckaetkugvpcztrq7rqpw7tjad4ax">${this.public}</bunny-input>
        `;
    }

    get privateAddressTemplate() {
        return html`
            <bunny-input id="wif" label="wif" text="${this.wif}"></bunny-input>
            <bunny-input id="compressed" label="compressed" text="${this.private}"></bunny-input>
        `;
    }

    submit() {
        let address = {
            address: this.addressInput.value,
            name: this.nameInput.value ?? this.nameInput.placeholder,
            type: this.publicAddress ? 'public' : 'private',
            wif: this.publicAddress ? null : this.wifInput.value
        };
        AddressBook.add(address);
        this.close();
    }

    _addressTypeChange(e) {
        this.publicAddress = e.detail.active;
        if (this.publicAddress) {
            this.render();
        } else {
            // server call to generate
            fetch('/api/address')
                .then(response => response.json())
                .then(address => {
                    this.wif = address.wif;
                    this.private = address.compressed;
                    this.render();
                })
        }
    }

    render() {
        render(this.template, this.shadowRoot);
        this.bind();
    }

    bind() {
        this.wifInput = this.shadowRoot.querySelector("#wif");
        this.addressInput = this.shadowRoot.querySelector("#compressed");
        this.nameInput = this.shadowRoot.querySelector("#name");
    }
}

customElements.define(DialogAddress.is, DialogAddress);