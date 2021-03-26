import {html, render} from '/node_modules/lit-html/lit-html.js';

class BunnyColor extends HTMLElement {

    constructor() {
        super();
        let update = () => this.color = this.getAttribute('hex') || '#323232';

        new MutationObserver(update.bind(this))
            .observe(this, {attributes: true});

        update();
    }

    set value(value) {
        this.input.value = value;
        this.render();
    }

    get value() {
        return this.input.value;
    }

    static get is() {
        return 'bunny-color';
    }

    query(selector) {
        return this.shadowRoot.querySelector(selector);
    }

    connectedCallback() {
        this.attachShadow({mode: 'open'});
        this.render();
    }

    focus() {
        setTimeout(() => this.input.focus(), 0);
    }

    get template() {
        return html`
            <style>
                :host {
                    contain: content;
                    display: block;
                }

                input[type="color"]::-webkit-color-swatch {
                    border: none;
                }

                input[type="color"]::-webkit-color-swatch-wrapper {
                    padding: 0;
                }

                input[type="color"] {
                    background-color: #00000000;
                    border: none;
                    box-shadow: 0px 0px 2px 1px rgba(50, 50, 50, 0.9);
                    width: 24px;
                    height: 24px;
                    display: block;
                    padding: 0px;
                    margin: 0px;
                    box-sizing: border-box;
                }

                input[type="color"]:focus {
                    outline: none;
                }

                input[type="color"]:hover {
                    cursor: var(--bunny-cursor-pointer, pointer);
                }
            </style>

            <div id="container">
                <input @mousedown="${this._show.bind(this)}" type="color" value="${this.color}"/>
            </div>
        `;
    }

    _show() {
        this.input.click();
    }

    render() {
        render(this.template, this.shadowRoot);
        this.bind();
    }

    bind() {
        this.input = this.shadowRoot.querySelector('input');
    }
}

customElements.define(BunnyColor.is, BunnyColor);