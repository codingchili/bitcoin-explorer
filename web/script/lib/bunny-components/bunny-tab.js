import {html, render} from '/node_modules/lit-html/lit-html.js';
import '/node_modules/ink-ripple/ink-ripple.js'

class BunnyTab extends HTMLElement {

    constructor() {
        super();
        this.listener = () => {};
    }

    onclicked() {
        this.listener();
        // reset the ripple - when show/hide is used the ripple can get stuck.
        // the timeout allows the ripple effect to reset - if the button stays visible.
        //let element = this.shadowRoot.querySelector('ink-ripple');
        //setTimeout(() => element._reset(), 250);
    }

    set clicked(callback) {
        this.listener = callback;
    }

    static get is() {
        return 'bunny-tab';
    }

    connectedCallback() {
        this.attachShadow({mode: 'open'});
        render(this.template, this.shadowRoot);

        this.tab = this.shadowRoot.querySelector('.tab');
    }

    activate() {
        this.setAttribute('active', 'active');
        this.tab.classList.add('active');
    }

    inactivate() {
        this.removeAttribute('active');
        this.tab.classList.remove('active');
    }

    get template() {
        return html`
        <style>
            :host {
                contain: content;
                display:block;
                width:100%;
            }
        
            .tab {
                min-width: 5.14em;
                min-height: 2.8em;
                width: 100%;
                /*position: relative;*/
                background-color: var(--bunny-tab-background, #424242);
                outline-width: 0;
                user-select: none;
                cursor: var(--bunny-cursor-pointer, pointer);
                display: flex;
                justify-content: center;
                align-items: center;
            }
            
            .active {
                border-bottom: 2px solid var(--bunny-tab-active, rgb(0, 176, 255));
                background-color: var(--bunny-tab-background-active, #424242);
            }
            
            .tab-text {
                display: block;
                margin: auto;
                font-family: Roboto, Noto, sans-serif;
                font-size: 16px;
                font-stretch: 100%;
                font-style: normal;
                font-weight: 500;
                opacity: 0.72;
                padding-bottom: 8px;
                padding-top: 12px;
                -webkit-font-smoothing: antialiased;
            }
            
            ink-ripple {
                --ink-ripple-opacity: 0.15;
                --ink-ripple-duration: 0.15s;
                --ink-ripple-accent-color: var(--bunny-tab-ripple, #00b0ff);
              }
        </style>
        
        <div class="tab" onmousedown="this.getRootNode().host.onclicked()">
            <div class="tab">
                <slot></slot>            
            </div>
            <ink-ripple></ink-ripple>
        </div>
        `;
    }
}
customElements.define(BunnyTab.is, BunnyTab);