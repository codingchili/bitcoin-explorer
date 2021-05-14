import {html, render} from '/node_modules/lit-html/lit-html.js'

import './lib/bunny-components/bunny-button.js'
import './lib/bunny-components/bunny-progress.js'

class BitcoinMiner extends HTMLElement {

    static get is() {
        return 'bitcoin-miner';
    }

    connectedCallback() {
        this.attachShadow({mode: 'open'});
        this.render();
        this._hide();
    }

    get template() {
        return html`
            <style>
                :host {
                    z-index: 200;
                    position: absolute;
                    bottom: 4px;
                    left: 32px;
                    right: 32px;
                }

                bunny-progress {
                    width: 100%;
                    --bunny-progress-transition-duration: 10s;
                }
            </style>

            <bunny-toast></bunny-toast>
            <bunny-progress max="100"></bunny-progress>
        `;
    }

    _hide() {
        this.progress.value = 0;
        this.progress.style.display = 'none';
        this.locked = false;
    }

    _show() {
        let last = this.locked;
        this.locked = true;
        // make it appear behind the toaster, await animation.
        setTimeout(() => {
            this.progress.style.display = 'block';
            setTimeout(() => this.progress.value = 100, 100);
        }, 500);
        return (!last);
    }

    download(response) {
        let filename = `${response.valid ? 'valid' : 'invalid'}-block-${new Date().toLocaleTimeString()}.hex`;
        let link = document.createElement('a');
        link.style.display = 'none';
        link.href = URL.createObjectURL(new File([response.block], filename));
        link.download = filename;
        document.body.appendChild(link);
        link.click();

        setTimeout(() => {
            URL.revokeObjectURL(link.href);
            document.body.removeChild(link);
        }, 200);
    }

    request() {
        fetch('/api/minecraft', {
            method: 'POST'
        })
            .then(response => response.json())
            .then(json => {
                this.toast.open(`Downloading block ..`);
                this._hide();
                this.download(json)
            });
    }

    start() {
        if (this._show()) {
            this.toast.open(`Mining for ~10s ..`);
            this.request();
        }
    }

    render() {
        render(this.template, this.shadowRoot);
        this.bind();
    }

    bind() {
        this.toast = this.shadowRoot.querySelector('bunny-toast');
        this.progress = this.shadowRoot.querySelector('bunny-progress');
    }
}

customElements.define(BitcoinMiner.is, BitcoinMiner);