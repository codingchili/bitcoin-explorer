import {html, render} from '/node_modules/lit-html/lit-html.js';
import './bunny-box.js'

class BunnyTooltip extends HTMLElement {

    static get is() {
        return 'bunny-tooltip';
    }

    constructor() {
        super();
        this.location = this.getAttribute('location') || 'bottom';
        this.for = this.getAttribute("for");
        this.text = this.getAttribute('text');
        this.attachShadow({mode: 'open'})
    }

    position(tooltip, target) {
        let pos = target.getBoundingClientRect();
        let space = 10;
        let middle = target.clientWidth / 2;

        switch (this.location) {
            case 'bottom':
                return {
                    x: pos.left + middle - (tooltip.clientWidth / 2),
                    y: pos.bottom + space
                };
            case 'top':
                return {
                    x: pos.left + middle - (tooltip.clientWidth / 2),
                    y: pos.top - (space + tooltip.clientHeight)
                };
            case 'right':
                return {
                    x: pos.right + space,
                    y: pos.top + (target.clientHeight / 2) - (tooltip.clientHeight / 2)
                };
            case 'left':
                return {
                    x: pos.left - (tooltip.clientWidth + space),
                    y: pos.top + (target.clientHeight / 2) - (tooltip.clientHeight / 2)
                };
        }
    }

    get template() {
        return html`
            <style>
                :host {
                    z-index: 600;
                    transition: opacity 0.3s;
                    display: none;
                    opacity: 0;
                    overflow: hidden;
                    position: absolute;
                    top: -6400px;
                    left: -6400px;
                }

                #clone {
                    padding: 2px;
                    overflow: hidden;
                }
            </style>
            <bunny-box id="clone" border solid>
                <slot style="display: block;
                        padding: 8px;
                        font-size: 14px;
                        /*font-family: 'Open Sans', sans-serif;*/
                        user-select: none;
                        color:#fff;">${this.text}</slot>
            </bunny-box>
        `;
    }

    reposition(initial) {
        this.style.display = 'block';

        let update = () => {
            let offsetElement = this.target.parentNode;
            // calculate offset from targets first positioned parent
            while (offsetElement.parentNode) {
                let style = getComputedStyle(offsetElement)['position']
                if (style) {
                    break;
                } else {
                    offsetElement = offsetElement.parentNode
                }
            }
            let position = this.position(this, this.target);
            if (!initial) {
                this.style.top = `${position.y - offsetElement.getBoundingClientRect().top}px`;
                this.style.left = `${position.x - offsetElement.getBoundingClientRect().left}px`;
                this.style.opacity = '1';
            }
        };
        update();
    }

    connectedCallback() {
        render(this.template, this.shadowRoot);

        let slot = this.shadowRoot.querySelector('slot')
        let last = 0;

        slot.addEventListener('slotchange', () => {
            this.target = this.parentNode.querySelector(`#${this.for}`)
                || this.shadowRoot.host.previousElementSibling;

            this.reposition(true);

            this.target.addEventListener('mouseenter', (e) => {
                clearTimeout(last);
                this.reposition();
            });

            this.target.addEventListener('mouseleave', () => {
                this.style.opacity = '0';

                clearTimeout(last);

                last = setTimeout((id) => {
                    this.style.display = 'none';
                }, 300);
            });
        });
    }
}

customElements.define(BunnyTooltip.is, BunnyTooltip);