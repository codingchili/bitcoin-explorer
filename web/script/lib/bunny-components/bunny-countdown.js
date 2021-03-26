import {html, render} from '/node_modules/lit-html/lit-html.js';

const second = 1000;
const minute = second * 60;
const hour = minute * 60;
const day = hour * 24;

class BunnyCountdown extends HTMLElement {

    static get is() {
        return 'bunny-countdown';
    }

    constructor() {
        super();

        if (this.hasAttribute("target")) {
            this._target = Date.parse(this.getAttribute("target"));
        } else {
            this._target = new Date().getTime() + (365 * 24 * 60 * 60 * 1000);
        }
    }

    connectedCallback() {
        this.attachShadow({mode: 'open'});
        this.render();

        this.timer = setInterval(() => {
            this.render();
        }, 1000);
    }

    disconnectedCallback() {
        clearInterval(this.timer);
    }

    get template() {
        let now = new Date().getTime();
        let target = this._target;
        let delta = Math.max(target - now, 0);
        let days, hours, minutes, seconds;

        [delta]
            .map((delta) => {
                days = Math.trunc(delta / day);
                return delta - (days * day);
            }).map(delta => {
                hours = Math.trunc(delta / hour);
                return delta - (hours * hour);
            }).map(delta => {
                minutes = Math.trunc(delta / minute);
                return delta - (minutes * minute);
            }).map(delta => seconds = Math.trunc(delta / second));

        return html`
            <style>
                :host {
                    display: flex;
                    cursor: var(--bunny-cursor, auto);
                    justify-content: center;
                }

                .elevation {
                    box-shadow: 0 6px 10px 0 rgba(0, 0, 0, 0.14),
                    0 1px 18px 0 rgba(0, 0, 0, 0.12),
                    0 3px 5px -1px rgba(0, 0, 0, 0.4);
                }

                .border {
                    border: 1px solid var(--bunny-box-border-color, #687f7d80);
                    border-radius: 6px;
                }

                .container {
                    background-color: rgba(22, 22, 22, 0.22);
                    display: inline-block;
                    height: 100%;
                    margin: 0 4px 0 4px;
                }

                .value {
                    font-size: 4em;
                    padding: 4px 4px 4px 4px;
                    text-align: center;
                }

                @media (max-width: 400px) {
                    .value {
                        font-size: 2.4em;
                    }
                }

                .label {
                    padding-right: 8px;
                    padding-bottom: 4px;
                    text-align: center;
                }

                .solid {
                    background-color: rgba(22, 22, 22, 0.76);
                    border-radius: 2px;
                }
            </style>

            <div class="container solid elevation">
                <span class="value">${days}</span>
                <span class="label">Days</span>
            </div>

            <div class="container solid elevation">
                <span class="value">${hours}</span>
                <span class="label">Hours</span>
            </div>

            <div class="container solid elevation">
                <span class="value">${minutes}</span>
                <span class="label">Minutes</span>
            </div>

            <div class="container solid elevation">
                <span class="value">${seconds}</span>
                <span class="label">Seconds</span>
            </div>
        `;
    }

    render() {
        render(this.template, this.shadowRoot);
        this.bind();
    }

    query(selector) {
        return this.shadowRoot.querySelector(selector);
    }

    bind() {
    }
}

customElements.define(BunnyCountdown.is, BunnyCountdown);