import {html, render} from '/node_modules/lit-html/lit-html.js';

/* this is teh mega loader */
class BunnySpinner extends HTMLElement {

    static get is() {
        return 'bunny-spinner';
    }

    constructor() {
        super();
        this.enabled = this.hasAttribute('enabled') || false;
        this.message = this.getAttribute('text');
        this.spinner = this.hasAttribute('spinner');

        this.observer = new MutationObserver((events) => {
            for (let mutation of events) {
                this.message = this.getAttribute("text");
                this.spinner = this.hasAttribute('spinner');

                setTimeout(() => {
                    if (this.hasAttribute('enabled')) {
                        this.enable();
                    } else {
                        this.disable();
                    }
                }, 0);
            }
        });
        this.observer.observe(this, {attributes: true});
    }

    enable() {
        this.enabled = true;
        this.render();
    }

    disable() {
        this.enabled = false;
        this.render();
    }

    text(message) {
        this.message = message;
        this.render();
    }

    connectedCallback() {
        this.attachShadow({mode: 'open'})
        this.render();
    }

    render() {
        render(this.template, this.shadowRoot);
    }

    get template() {
        return html`
        <style>
            :host {
                display: block;
            }

            .loading-text {
                text-align: center;
                font-size: smaller;
                width: 100%;
                margin-bottom: -88px;
                user-select: none;
            }

            .spinner {
                width: 164px;
                height: 164px;
                margin: auto;
                display: block;
            }

            .loading-box {
                height: 174px;
                margin-left: auto;
                margin-right: auto;
                width: 364px;
                display: block;
            }

            /* spinner-code from loading.io */
            @media (max-width: 728px){
                .loading-box {
                    width: unset;
                }
            }.lds-dual-ring {
              display: block;
              width: 100px;
              height: 80px;
              margin: auto;
              padding-bottom: 32px;
            }
            .lds-dual-ring:after {
              content: " ";
              display: block;
              width: 64px;
              height: 64px;
              margin: 8px;
              border-radius: 50%;
              border: 6px solid var(--bunny-spinner-color, rgb(0, 176, 255));
              border-color: var(--bunny-spinner-color, rgb(0, 176, 255)) transparent var(--bunny-spinner-color, rgb(0, 176, 255)) transparent;
              animation: lds-dual-ring 0.92s linear infinite;
            }
            @keyframes lds-dual-ring {
              0% {
                transform: rotate(0deg);
              }
              100% {
                transform: rotate(360deg);
              }
            }
            
            /* spinner code from loading.io */
            .lds-facebook {
              display: block;
              margin: auto;
              position: relative;
              width: 80px;
              height: 80px;
            }
            .lds-facebook div {
              display: inline-block;
              position: absolute;
              left: 8px;
              width: 16px;
              background: var(--bunny-spinner-color, #fff);
              animation: lds-facebook 1.2s cubic-bezier(0, 0.5, 0.5, 1) infinite;
            }
            .lds-facebook div:nth-child(1) {
              left: 8px;
              animation-delay: -0.24s;
            }
            .lds-facebook div:nth-child(2) {
              left: 32px;
              animation-delay: -0.12s;
            }
            .lds-facebook div:nth-child(3) {
              left: 56px;
              animation-delay: 0;
            }
            @keyframes lds-facebook {
              0% {
                top: 8px;
                height: 64px;
              }
              50%, 100% {
                top: 24px;
                height: 32px;
              }
            }  
            
            .container {
                padding-top: 32px;
            }
        </style>

        <div ?hidden="${!this.enabled}">
            <div class="loading-box">
                <div class="container">
                    ${this.spinner ? 
                        html`<div class="lds-dual-ring"></div>` : 
                        html`<div class="lds-facebook">
                            <div></div>
                            <div></div>
                            <div></div>
                        </div>`
                    }
                    <div class="loading-text">${this.message}</div>
                </div>
            </div>
        </div>
        `;
    }
}

customElements.define(BunnySpinner.is, BunnySpinner);