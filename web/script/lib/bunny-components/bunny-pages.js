import {html, render} from '/node_modules/lit-html/lit-html.js';

class BunnyPages extends HTMLElement {

    constructor() {
        super();
        this.tabs = [];
        this.listener = () => {
        };
    }

    onclicked() {
        this.listener();
    }

    set clicked(callback) {
        this.listener = callback;
    }

    static get is() {
        return 'bunny-pages';
    }

    connectedCallback() {
        this.attachShadow({mode: 'open'});
        this.render();
    }

    render() {
        render(this.template, this.shadowRoot);
        this.bind();
    }

    query(selector) {
        let hits = this.shadowRoot.querySelector(selector);
        let assigned = hits.assignedNodes();
        if (hits && assigned.length > 0) {
            return Array.from(assigned[0].children)
        } else {
            return [];
        }
    }

    bind() {
        customElements.whenDefined('bunny-tab').then(() => {
            let selected = false;
            this.pages = this.query('slot[name="pages"]');
            this.tabs = this.query('slot[name="tabs"]');

            for (let [i, tab] of this.tabs.entries()) {
                tab.parentElement.style.cssText = `
                    display: flex;
                    flex-direction: row;
                `;

                tab.clicked = () => this.index(i);

                if (tab.hasAttribute('active')) {
                    this.index(i);
                    selected = true;
                }
            }
            if (!this.hasAttribute('unselected') && !selected) {
                this.index(0);
            }
        });
    }

    show(page) {
        this.index(parseInt(page.getAttribute("index")));
    }

    index(index) {
        index = parseInt(index);
        for (let [i, page] of this.pages.entries()) {
            this._active = page;
            page.setAttribute('index', i);
            page.style.display = (i === index) ? 'block' : 'none';

            if (i === index) {
                page.dispatchEvent(new CustomEvent('page-activate'));
            }

            if (i < this.tabs.length) {
                let tab = this.tabs[i];
                (i === index) ? tab.activate() : tab.inactivate();
            }
        }
    }

    get active() {
        return this._active;
    }

    get template() {
        return html`
            <style>
                :host {
                    display: block;
                    width: 100%;
                    height: 100%;
                }

                .tabhost {
                    display: flex;
                    flex-flow: row nowrap;
                    justify-content: space-around;
                    align-items: stretch;
                    flex-direction: column;
                }
            </style>

            <div id="container">
                <!-- map tabs to pages in here. -->
                <slot name="tabs"></slot>
                <slot name="pages"></slot>
            </div>
        `;
    }
}

customElements.define(BunnyPages.is, BunnyPages);