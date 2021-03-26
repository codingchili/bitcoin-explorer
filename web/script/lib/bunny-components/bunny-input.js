import {html, render} from '/node_modules/lit-html/lit-html.js';

import './bunny-icon.js';
import {BunnyStyles} from './styles.js'

class BunnyInput extends HTMLElement {

    constructor() {
        super();
        let update = () => {
            this.disabled = this.hasAttribute('disabled');
            this.placeholder = this.getAttribute('placeholder') || '';
            this.text = this.getAttribute('text') || '';
            this.label = this.getAttribute('label') || '';
            this.type = this.getAttribute('type') || 'text';
            this.maxlength = this.getAttribute('maxlength') || 96;
            this._icon = this.getAttribute('icon');
        }

        new MutationObserver(() => {
            update();
            this.render();
        }).observe(this, {attributes: true});

        update();

        if (this.hasAttribute('autofocus')) {
            this.focus();
        }
    }

    clear() {
        this.input.value = '';
    }

    set value(value) {
        this.input.value = value;
        this.render();
    }

    get value() {
        return this.input.value;
    }

    static get is() {
        return 'bunny-input';
    }

    query(selector) {
        return this.shadowRoot.querySelector(selector);
    }

    connectedCallback() {
        this.attachShadow({mode: 'open'});
        this.render();

        this.input = this.query('#input');

        let underline = this.query('#underline');
        let label = this.query('#label');

        this.addEventListener('click', () => {
            this.input.focus();
        });

        this.input.addEventListener('blur', () => {
            underline.classList.remove('underline-focus');
            label.classList.remove('label-focus');
        });

        this.input.addEventListener('focus', () => {
            underline.classList.add('underline-focus');
            label.classList.add('label-focus');
        });
    }

    focus() {
        setTimeout(() => this.input.focus(), 0);
    }

    get template() {
        return html`
            <style>
                :host {
                    contain: content;
                    margin-left: 24px;
                    margin-right: 24px;
                    margin-top: 8px;
                    margin-bottom: 8px;
                    display: block;
                    cursor: var(--bunny-cursor-caret, text);
                }

                ${BunnyStyles.icons}
                .noselect {
                    user-select: none;
                }

                input:focus, textarea:focus, select:focus {
                    outline: none;
                }

                ::selection {
                    background: var(--bunny-input-selection, rgb(0, 176, 255));
                    color: white;
                }

                input {
                    border: none;
                    background-color: transparent;
                    color: var(--bunny-input-color, #888);
                    font-size: 1em;
                    padding-bottom: 2px;;
                    font-family: var(--bunny-input-font, ("Roboto", sans-serif));
                    font-weight: 400;
                    cursor: var(--bunny-cursor-caret, text);
                    width: 100%;
                }

                #container {
                    display: flex;
                    flex-direction: column;
                }

                #underline-default {
                    background-color: var(--bunny-input-color, #888);
                    height: 1px;
                    z-index: 0;
                }

                #underline {
                    transition: width 0.25s;
                    height: 2px;
                    background-color: var(--bunny-input-focus, #ddd);
                    z-index: 1;
                    width: 0;
                    margin: auto;
                    margin-top: -1px;
                }

                .underline {
                    margin-left: 2px;
                    margin-right: 2px;
                }

                #label {
                    cursor: var(--bunny-cursor-pointer, pointer);
                }

                .label {
                    color: var(--bunny-input-label, #888);
                    font-size: 12px;
                    font-family: 'Roboto', 'Noto', sans-serif;
                    margin-left: 2px;
                    margin-bottom: 4px;
                    transition: color 0.25s;
                }

                .label-focus {
                    color: var(--bunny-input-focus, #ddd);
                }

                .underline-focus {
                    width: 100% !important;
                }


                #container[disabled] {
                    cursor: not-allowed !important;
                }

                input[disabled] {
                    cursor: not-allowed !important;
                }

                .icon-container {
                    display: block;
                    position: absolute;
                    right: 0px;
                    top: 8px;
                }

                .icon {
                    width: 18px;
                    height: 18px;
                    margin-top: 4px;
                    margin-right: 4px;
                }
            </style>

            <div id="container" ?disabled="${this.disabled ? 'disabled' : ''}">
                <label id="label" class="label noselect">${this.label}</label>

                <div style="display: flex;">
                    <input part="input" spellcheck="false"
                           id="input"
                           ?disabled="${this.disabled}"
                           maxlength="${this.maxlength}"
                           type="${this.type}"
                           class="bunny-input noselect"
                           value="${this.text}"
                           placeholder="${this.placeholder}"
                    />
                    <slot class="icon-container"></slot>
                </div>

                <div class="underline">
                    <div id="underline-default"></div>
                    <div id="underline"></div>
                </div>
            </div>
        `;
    }

    render() {
        render(this.template, this.shadowRoot);
    }
}

customElements.define(BunnyInput.is, BunnyInput);