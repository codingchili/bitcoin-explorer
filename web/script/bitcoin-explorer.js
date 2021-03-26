import {html, render} from '/node_modules/lit-html/lit-html.js'

import './lib/bunny-components/bunny-box.js'
import './lib/bunny-components/bunny-input.js'
import './lib/bunny-components/bunny-button.js'
import './bitcoin.js'

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
        setInterval(this._update.bind(this), 1000);
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

    setError(response) {
        if (response.error) {
            this.hits.classList.add('error');
        } else {
            this.hits.classList.remove('error');
        }
    }

    _submit() {
        let index = /^[0-9]*$/.test(this.input.value);
        let transaction = this.input.value.length === 64; // hex encoded 256-bit hash.

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
            this.setError(block);
            this.hits.textContent = JSON.stringify(block, null, 4);
        })
    }

    _txinfo(hash) {
        bitcoin.txinfo(hash).then(transaction => {
            this.setError(transaction);
            hits.textContent = JSON.stringify(transaction, null, 4);
        });
    }

    _outputs(address) {
        bitcoin.outputs(address).then(outputs => {
            this.setError(outputs);
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
                    min-height: 632px;
                    max-height: 632px;
                    overflow-y: scroll;
                    margin: 32px 32px 16px;
                }

                .hits-placeholder {
                    font-size: 4em;
                    animation: rocket-x 1.5s ease infinite, rocket-y 1s linear infinite;
                    display: block;
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
        <span class="hits-placeholder">
            &#x1F680;
        </span>
                </div>
            </bunny-box>

            <style>
                #footer {
                    position: fixed;
                    bottom: 12px;
                    text-align: center;
                    width: 100%;
                }
            </style>
            <div id="footer"></div>
        `
    }

    render() {
        render(this.template, this);
        this.bind();
    }

    bind() {
        this.input = this.querySelector('bunny-input');
        this.hits = this.querySelector('#hits');
        this.stats = this.querySelector('#stats-container');
        this.footer = this.querySelector('#footer');
        this.button = this.querySelector('#footer');
        this.input.focus();
    }
}

customElements.define('bitcoin-explorer', BitcoinExplorer);