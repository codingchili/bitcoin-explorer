import {html, render} from '/node_modules/lit-html/lit-html.js'

import './lib/bunny-components/bunny-box.js'
import './lib/bunny-components/bunny-input.js'
import './lib/bunny-components/bunny-button.js'
import './lib/bunny-components/bunny-tooltip.js'
import './bitcoin.js'

import './dialog-address.js'
import './dialog-transaction.js'
import './bitcoin-miner.js'

class BitcoinExplorer extends HTMLElement {

    connectedCallback() {
        this.render();
        this.button.addEventListener('click', () => this._submit());
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this._submit();
            }
        })
        this._update();
        setInterval(this._update.bind(this), 5000);
    }

    _update() {
        let then = performance.now();
        bitcoin.info().then(chain => {
            for (let [key, value] of Object.entries(chain)) {
                let stat = this.stats.querySelector(`#${key}`)
                switch (key) {
                    case "difficulty":
                        value = value.toFixed(3);
                        break;
                    case "size_on_disk":
                        value = (value / 1024 / 1024).toFixed(2) + "MB";
                        break;
                    case "blocks":
                        value = value.toLocaleString();
                }
                if (stat) {
                    stat.textContent = value;
                }
            }
            this.footer.textContent = `Last updated ${new Date().toLocaleTimeString()} in ${(performance.now() - then).toFixed(1)}ms`
        });
    }

    _setStatus(response) {
        if (response.error) {
            this.hits.classList.add('error');
        } else {
            this.hits.classList.remove('error');
        }
        clearInterval(this.loading);
    }

    _submit() {
        let index = /^[0-9]*$/.test(this.input.value);
        let transaction = this.input.value.length === 64; // hex encoded 256-bit hash.

        this.loading = setTimeout(() => {
            let placeholder = document.createElement('span');
            this.hits.innerHTML = "";
            placeholder.id = "hits-placeholder";
            placeholder.innerHTML = "&#x1F680;";
            placeholder.style.display = "block";
            placeholder.style["padding-top"] = "96px";
            placeholder.style["padding-left"] = "48px";
            this.placeholder = placeholder;
            this.hits.appendChild(placeholder);
        }, 175);

        if (index) {
            this._index(parseInt(this.input.value));
        } else if (transaction) {
            this._txinfo(this.input.value);
        } else {
            this._outputs(this.input.value);
        }
    }

    _index(index) {
        bitcoin.blockhash(index).then(hash => bitcoin.block(hash)).then(block => {
            this._setStatus(block);
            this.hits.textContent = JSON.stringify(block, null, 4);
        })
    }

    _txinfo(hash) {
        this.input.value = hash;
        bitcoin.txinfo(hash).then(transaction => {
            this._setStatus(transaction);
            hits.textContent = JSON.stringify(transaction, null, 4);
        });
    }

    _outputs(address) {
        bitcoin.outputs(address).then(outputs => {
            this._setStatus(outputs);
            hits.textContent = JSON.stringify(outputs, null, 4);
        });
    }

    get template() {
        return html`

            <style>
                #stats-container {
                    display: flex;
                    justify-content: space-between;
                }

                #stats-container > span {
                    display: block;
                    text-align: center;
                }

                .statistics-value {
                    padding: 16px;
                    display: block;
                }

                .statistics {
                    text-align: center;
                    padding: 12px;
                    font-size: 24px;
                    width: 232px;
                    height: fit-content;
                    margin: auto;
                }

                #chain {
                    font-size: 4em;
                }

                .subtitle {
                    font-size: 14px;
                    opacity: 0.76;
                    display: block;
                    margin-bottom: 4px;
                }

                .misc {
                    display: flex;
                    justify-content: center;
                }

                #chain-id {
                    margin: unset;
                }

                @media screen and (max-width: 1228px) {
                    .misc {
                        display: none;
                    }
                }
            </style>
            <div id="stats-container" class="element">
                <div class="statistics" id="chain-id">
                    <span id="chain"></span>&nbsp;chain
                </div>
                <div class="misc">
                    <bunny-box class="statistics">
                        <span id="blocks" class="statistics-value"></span>
                        <span class="subtitle">
                Blocks
            </span>
                    </bunny-box>
                    <bunny-box class="statistics">
                        <span id="difficulty" class="statistics-value"></span>
                        <span class="subtitle">
                Difficulty
            </span>
                    </bunny-box>
                    <bunny-box class="statistics">
                        <span id="mediantime" class="statistics-value"></span>
                        <span class="subtitle">
                Median Time
            </span>
                    </bunny-box>
                    <bunny-box class="statistics">
                        <span id="size_on_disk" class="statistics-value"></span>
                        <span class="subtitle">
                Size on disk
            </span>
                    </bunny-box>
                </div>
            </div>


            <style>
                #interface {
                    width: 80%;
                    max-width: 924px;
                    margin: 32px auto auto auto;
                }

                bunny-input {
                    padding: 16px;
                }

                #hits {
                    white-space: pre;
                    overflow-y: scroll;
                    margin: 32px 32px 16px;
                    min-height: 55vh;
                    max-height: 55vh;
                }

                #hits-placeholder {
                    font-size: 4em;
                    animation: rocket-x 1.5s ease infinite, rocket-y 1s linear infinite;
                    display: inline-block;
                    text-align: center;
                }

                @keyframes rocket-y {
                    0% {
                        margin-top: 0;
                    }
                    25% {
                        margin-top: 32px;
                    }
                    100% {
                        margin-top: 0;
                    }
                }

                @keyframes rocket-x {
                    0% {
                        margin-left: -48px;
                    }
                    25% {
                        margin-left: -96px;
                    }
                    50% {
                        margin-left: -128px;
                    }
                    75% {
                        margin-left: -96px;
                    }
                    100% {
                        margin-left: -48px;
                    }
                }

                bunny-button {
                    width: 50%;
                    margin: auto;
                }

                .error {
                    color: red;
                }
            </style>
            <bunny-box class="element" id="interface">
                <bunny-input autofocus placeholder="Tx hash, block index or btc address.. "></bunny-input>
                <bunny-button primary>Search</bunny-button>
                <div id="hits">
                    <span id="hits-placeholder">
                        &#x1F680;
                    </span>
                </div>
            </bunny-box>

            <div id="actions">
                <style>
                    #actions {
                        position: absolute;
                        right: 32px;
                        bottom: 52px;
                    }

                    .floating {
                        margin-top: 8px;
                        width: 42px;
                        border-radius: 32px;
                    }
                </style>
                <div style="position: relative;">
                    <bunny-button class="floating" primary
                                  @mousedown="${this._mine.bind(this)}">???
                    </bunny-button>
                    <bunny-tooltip location="left">Mine block</bunny-tooltip>
                    
                    <bunny-button class="floating" primary
                                  @mousedown="${this._showTransactionDialog.bind(this)}">????
                    </bunny-button>
                    <bunny-tooltip location="left">Send transaction</bunny-tooltip>
                    
                    <bunny-button class="floating" primary
                                  @mousedown="${this._showAddressDialog.bind(this)}">????
                    </bunny-button>
                    <bunny-tooltip location="left">Add address</bunny-tooltip>
                </div>
            </div>

            <style>
                #footer {
                    position: fixed;
                    bottom: 12px;
                    text-align: center;
                    width: 100%;
                }

                #footer-text {
                    display: block;
                    margin: auto;
                    min-width: 256px;
                }
            </style>
            <div id="footer">
                <span id="footer-text"></span>
            </div>

            <bitcoin-miner></bitcoin-miner>
            <dialog-address></dialog-address>
            <dialog-transaction @tx-created="${(e => this._txinfo(e.detail.txid))}"></dialog-transaction>
        `
    }

    _mine() {
        this.querySelector('bitcoin-miner').start();
    }

    _showAddressDialog() {
        this.querySelector("dialog-address").open();
    }

    _showTransactionDialog() {
        this.querySelector('dialog-transaction').open();
    }

    render() {
        render(this.template, this);
        this.bind();
    }

    bind() {
        this.input = this.querySelector('bunny-input');
        this.hits = this.querySelector('#hits');
        this.stats = this.querySelector('#stats-container');
        this.footer = this.querySelector('#footer-text');
        this.button = this.querySelector('bunny-button');
        this.placeholder = this.querySelector('#hits-placeholder');
        this.input.focus();
    }
}

customElements.define('bitcoin-explorer', BitcoinExplorer);