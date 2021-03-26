import {html, render} from '/node_modules/lit-html/lit-html.js';
import '/node_modules/ink-ripple/ink-ripple.js'

class BunnySwitch extends HTMLElement {

    constructor() {
        super();
        let update = () => {
            this._active = this.hasAttribute('active');
            this._disabled = this.hasAttribute('disabled');
        };

        new MutationObserver(() => {
            update();
            this.render();
        }).observe(this, {attributes: true});

        update();
    }

    static get is() {
        return 'bunny-switch';
    }

    connectedCallback() {
        this.attachShadow({mode: 'open'});
        this.render();
    }

    set active(value) {
        this._active = value;
        this.render();
    }

    get active() {
        return this._active;
    }

    set disabled(value) {
        this._disabled = value;
    }

    get disabled() {
        return this._disabled;
    }

    render() {
        render(this.template, this.shadowRoot);
    }

    toggle() {
        if (!this.disabled) {
            this.active = !this.active;
            this.render();
        }
        this.dispatchEvent(new CustomEvent('change', {
            detail: {
                active: this.active
            }
        }));
    }

    get template() {
        return html`
            <style>
                :host {
                    contain: content;
                    display: inline-block;
                    user-select: none;
                    margin-left: 11px;
                    margin-right: 11px;
                }

                #container {
                    position: relative;
                    cursor: ${this._disabled ? 'unset' : 'var(--bunny-cursor-pointer, pointer)'};
                    height: 22px;
                    width: 44px;
                }

                #bar {
                    background-color: #484848;
                    border-radius: 4px;
                    position: absolute;
                    top: 6px;
                    width: 44px;
                    height: 10px;
                }

                #switch {
                    position: absolute;
                    top: 0px;
                    width: 22px;
                    height: 22px;
                    border-radius: 11px;
                    transition: left 0.1s ease-in, background-color 0.2s ease-in;

                    box-shadow: 0 6px 10px 0 rgba(0, 0, 0, 0.14),
                    0 1px 18px 0 rgba(0, 0, 0, 0.12),
                    0 3px 5px -1px rgba(0, 0, 0, 0.4);
                }

                .active {
                    left: 21px;
                    background-color: var(--bunny-switch-on, #00cc00);
                }

                .inactive {
                    left: 0px;
                    background-color: var(--bunny-switch-off, #ff0000);
                }

                .disabled {
                    background-color: #646464 !important;
                    cursor: not-allowed !important;
                }

            </style>

            <div id="container" @mousedown="${this.toggle.bind(this)}">
                <div id="bar"></div>
                <div id="switch" class="
                        ${this.active ? 'active' : 'inactive'}
                        ${this._disabled ? 'disabled' : ''}
                    ">
                    <ink-ripple></ink-ripple>
                </div>
            </div>
        `;
    }
}

customElements.define(BunnySwitch.is, BunnySwitch);