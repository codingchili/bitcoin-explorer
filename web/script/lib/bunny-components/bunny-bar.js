import {html, render} from '/node_modules/lit-html/lit-html.js';
import './bunny-box.js';

class BunnyBar extends HTMLElement {

    static get is() {
        return 'bunny-bar';
    }

    constructor() {
        super();
        this.solid = this.hasAttribute('solid');
    }

    connectedCallback() {
        this.attachShadow({mode: 'open'});
        render(this.template, this.shadowRoot);
    }

    get template() {
        return html`
            <style>
            :host {
                display: block;
                width: 100%;
                position: fixed;
                ${this.getAttribute('location')}: 0;
                left: 0;
                right: 0;
                height: 36px;
            }
            
            .noselect {
                user-select: none;
            }
            
            .text {
                font-size: 12px;
                opacity: 0.76;
                margin: auto;
                display: inline-block;
                color: #fff;
                padding-top: 6px;
                /*font-family: "Open Sans", sans-serif;*/
            }
            
            .center {
                text-align: center;
                width: 50%;
            }
            
            bunny-box {
                width: 100%;
                height: 100%;
                    
            }
            
            .left {
                display: inline-block;
                position: absolute;
                left: 32px;
            }
            
            .right {
                display: inline-block;
                position: absolute;
                right: 32px;
            }
            
            #container {
                display:flex;
                justify-content: space-between;
                width: 100%;
                height: 100%;
            }
        </style>

            <bunny-box ?solid="${this.solid}" sharp>
                <div id="container">
                    <div class="left text">
                        <slot name="left"></slot>
                    </div>
                    <div class="center text noselect">
                        <slot name="text"></slot>
                        <slot></slot>
                    </div>
                    <div class="right text">
                        <slot name="right"></slot>                
                    </div>
                </div>
            </bunny-box>
        `;
    }
}

customElements.define(BunnyBar.is, BunnyBar);