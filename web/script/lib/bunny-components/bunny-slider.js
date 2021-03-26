import {html, render} from '/node_modules/lit-html/lit-html.js';
import '/node_modules/ink-ripple/ink-ripple.js'

class BunnySlider extends HTMLElement {

    constructor() {
        super();
        this.tracker = this._tracker.bind(this);
        this.untracker = this._untracker.bind(this);
        let update = () => {
            this._start = parseFloat(this.getAttribute('start')) || 0;
            this._end = parseFloat(this.getAttribute('end')) || 100;

            // find the median.
            if (this.hasAttribute('current')) {
                this._current = parseFloat(this.getAttribute('current'));
            } else {
                this._current = (this._end - this._start) / 2 + this._start;
            }
            this._disabled = this.hasAttribute('disabled');
        };

        new MutationObserver(() => {
            update();
            this.render();
        }).observe(this, {attributes: true});

        update();
    }

    disconnectedCallback() {
        document.removeEventListener('mouseup', this.untracker);
    }

    static get is() {
        return 'bunny-slider';
    }

    get disabled() {
        return this._disabled;
    }

    get current() {
        return this._current;
    }

    connectedCallback() {
        this.attachShadow({mode: 'open'});
        document.addEventListener('mouseup', this.untracker);
        this.render();
    }

    render() {
        render(this.template, this.shadowRoot);
        this.bind();
    }

    bind() {
        this.bar = this.shadowRoot.querySelector('#bar');
        this.pin = this.shadowRoot.querySelector('#pin');
    }

    _position() {
        return (this._current - this._start) / (this._end - this._start) * 100;
    }

    _track() {
        if (!this._disabled) {
            document.removeEventListener('mousemove', this.tracker);
            document.addEventListener('mousemove', this.tracker);
            this._tracking = true;
            this.render();
        }
    }

    _untracker() {
        document.removeEventListener('mousemove', this.tracker);
        this._tracking = false;
        this.render();
    }

    _zoom(e) {
        if (!this._disabled) {
            this._moveTo(e.clientX);
        }
    }

    _tracker(e) {
        this._moveTo(e.clientX);
    }

    _moveTo(clientX) {
        let position = clientX - this.bar.getBoundingClientRect().left;
        let width = this.bar.getBoundingClientRect().width;

        position = Math.min(position, width);
        position = Math.max(position, 0);

        this._current = (position / width) * (this._end - this._start) + this._start;
        this.dispatchEvent(new CustomEvent('change', {
            detail: {
                value: this._current,
                end: this._end,
                start: this._start
            }
        }))

        this.pin.style.left = `${position}px`;
        this.render();
    }

    get template() {
        return html`
            <style>
                :host {
                    contain: content;
                    display: inline-block;
                    user-select: none;
                    width: 100%;
                    padding-left: 11px;
                    padding-right: 11px;
                }

                #container {
                    position: relative;
                    cursor: ${this._disabled ? 'unset' : 'var(--bunny-cursor-pointer, pointer)'};
                    height: 22px;
                    width: 100%;
                }

                #bar {
                    background-color: #484848;
                    border-radius: 4px;
                    position: absolute;
                    top: 6px;
                    height: 10px;
                    width: 100%;
                }

                #pin {
                    position: absolute;
                    left: ${this._position()}%;
                    transform: translateX(-11px);
                    top: 0px;
                    width: 22px;
                    height: 22px;
                    border-radius: 11px;
                    background-color: var(--bunny-slider-pin, #00b0ff);

                    box-shadow: 0 6px 10px 0 rgba(0, 0, 0, 0.14),
                    0 1px 18px 0 rgba(0, 0, 0, 0.12),
                    0 3px 5px -1px rgba(0, 0, 0, 0.4)
                }

                #value {
                    font-size: smaller;
                    position: absolute;
                    top: 4px;
                    right: 4px;
                    visibility: ${this._tracking || this._disabled ? 'visible' : 'hidden'}
                }

                .disabled {
                    background-color: #646464 !important;
                    cursor: not-allowed !important;
                }
            </style>

            <div id="container">
                <div id="bar" @mousedown="${this._zoom.bind(this)}"></div>
                <div id="pin" class="${this.disabled ? 'disabled' : ''}"
                     @mousedown="${this._track.bind(this, true)}">
                    <ink-ripple></ink-ripple>
                </div>
                <span id="value">${this._format(this, this._current)}</span>
            </div>
        `;
    }

    _format() {
        let fractions = (this._end > 20) ? 0 :
            (this._end > 10) ? 1 : 2;
        return this._current.toFixed(fractions);
    }
}

customElements.define(BunnySlider.is, BunnySlider);