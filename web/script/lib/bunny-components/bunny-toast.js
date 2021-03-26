import {html, render} from '/node_modules/lit-html/lit-html.js';
import './bunny-bar.js';

class BunnyToast extends HTMLElement {

    static get is() {
        return 'bunny-toast';
    }

    constructor() {
        super();
        this.duration = 1850;
    }

    connectedCallback() {
        this.attachShadow({mode: 'open'});
        render(this.template, this.shadowRoot);
    }

    open(text) {
        this.text = text;
        let template = this.shadowRoot.querySelector('template');
        template.content.querySelector('.toast-text').textContent = text;

        let tooltip = template.content.cloneNode(true);
        let bar = tooltip.querySelector('bunny-bar');
        this.bar = bar;

        document.documentElement.appendChild(tooltip);

        setTimeout(() => this.bar.style.height = '36px', 0);
        setTimeout(() => this.close(bar), this.duration);
    }

    close(bar) {
        bar = bar || this.bar;
        bar.style.height = '0';
        setTimeout(() => {
            try {
                this._remove(bar)
            } catch (e) {
                // already removed - ignore.
            }
        }, 1000);
    }

    _remove(bar) {
        document.documentElement.removeChild(bar)
    }

    get template() {
        return html`
            <template>
                <bunny-bar location="bottom" class="hidden" solid style="
                    transition: height 1s cubic-bezier(0.16, 1, 0.3, 1); /* ease out expo */
                    z-index: 500;
                    height: 0;
                    position: absolute;
                    overflow-y: hidden;">
                    <span class="toast-text" style="
                        font-family: 'RoboX';
                        position: absolute;
                        top: 12px;
                        left: 0;
                        right: 0;                    
                    "
                    >${this.text}</span>
                </bunny-bar>
            </template>
        `;
    }
}

customElements.define(BunnyToast.is, BunnyToast);