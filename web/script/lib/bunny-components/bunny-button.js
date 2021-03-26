import {html, render} from '/node_modules/lit-html/lit-html.js';
import '/node_modules/ink-ripple/ink-ripple.js'

class BunnyButton extends HTMLElement {

    constructor() {
        super();
        this.text = this.getAttribute("text");
        this.listener = () => {};

        if (this.hasAttribute('primary')) {
            // this.ripple = 'black';
            this.type = 'primary';
        } else if (this.hasAttribute('wire')) {
            this.type = 'wire';
        } else {
            this.ripple = 'white';
            this.type = 'secondary';
        }
    }

    onclicked() {
        this.listener();
        // reset the ripple - when show/hide is used the ripple can get stuck.
        // the timeout allows the ripple effect to reset - if the button stays visible.
        let element = this.shadowRoot.querySelector('ink-ripple');
        setTimeout(() => element._reset(), 625);
    }

    set clicked(callback) {
        this.listener = callback;
    }

    static get is() {
        return 'bunny-button';
    }

    connectedCallback() {
        this.attachShadow({mode: 'open'});
        render(this.template, this.shadowRoot);
    }

    get template() {
        return html`
            <style>
                :host {
                    contain: content;
                    display: block;
                }

                ink-ripple {
                    --ink-ripple-opacity: 0.6;
                    --ink-ripple-duration: 0.3s;
                    --ink-ripple-accent-color: #969696;
                }

                .button {
                    min-width: 5.14em;
                    height: 2.4em;
                    text-transform: uppercase;
                    /*position: relative;*/

                    color: #fff;

                    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14),
                    0 1px 5px 0 rgba(0, 0, 0, 0.12),
                    0 3px 1px -2px rgba(0, 0, 0, 0.2);

                    outline-width: 0;
                    border-radius: 3px;

                    user-select: none;
                    cursor: var(--bunny-cursor-pointer, pointer);

                    display: flex;
                    justify-content: center;
                    align-items: center;
                }

                .button-text {
                    display: block;
                    margin: auto;
                    font-family: Roboto, Noto, sans-serif;
                    font-size: 16px;
                    font-stretch: 100%;
                    font-style: normal;
                    font-variant-caps: normal;
                    font-variant-east-asian: normal;
                    font-variant-ligatures: normal;
                    font-variant-numeric: normal;
                    font-weight: 500;
                    -webkit-font-smoothing: antialiased;
                    opacity: 0.92;
                }

                .primary {
                    background-color: var(--bunny-button-color, rgb(0, 176, 255));
                    color: var(--bunny-button-text-color:#ffffff);
                }

                .secondary {
                    background-color: #00000000;
                }

                .wire {
                    background-color: #21212144;
                    border: 1px solid var(--game-theme-opaque);
                }

            </style>

            <div class="button ${this.type}" @click="${this.onclicked.bind(this)}">
            <span class="button-text">
                <slot></slot>            
            </span>
                <ink-ripple></ink-ripple>
            </div>
        `;
    }
}

customElements.define(BunnyButton.is, BunnyButton);