
export class BunnyStyles {

    static get hr_wide() {
        return `hr {
            border-color: var(--accent-color);
        }`;
    }

    static get hr() {
        return `
            hr {
                border-color: var(--game-theme-opaque);
                margin-left: 24px;
                margin-right: 24px;
            }
        `;
    }

    static get selection() {
        return `
            ::selection {
                color: rgb(0, 176, 255);
            }
        `
    }

    static get icons() {
        return `
            .icon {
                display: block;
                fill: var(--icon-color);
                width: 24px;
                height: 24px;
                margin-top: 0px;
            }
        
            .icon:hover {
                fill: var(--accent-color);
                cursor: var(--bunny-cursor-pointer, pointer);
            }`;
    }

    static get ripple() {
        return `
            ink-ripple {
                --ink-ripple-opacity: 0.6;
                --ink-ripple-duration: 0.3s;
                --ink-ripple-accent-color: #969696;
              }
        `;
    }

    static get variables() {
        return `        
            * {
                --backdrop-color: #00000070;
                --accent-color: rgb(0, 176, 255);     
                --game-theme-opaque: #687f7d80;   
                --icon-color: #ddd;
            }    
        `;
    }

    static get elevation() {
        return `
        .elevation {
              box-shadow: 0 6px 10px 0 rgba(0, 0, 0, 0.14),
              0 1px 18px 0 rgba(0, 0, 0, 0.12),
              0 3px 5px -1px rgba(0, 0, 0, 0.4);
           }
        `;
    }

    static get noselect() {
        return `
        .noselect {
            user-select: none;
        }`
    }

    static get headings() {
        return `
            h1, h2, h3, h4, h5, h6 {
            overflow: visible;
            padding: 0 1em;
            text-align: center;
            font-weight: 400;
            margin: 0px;    
            padding: 0px;
            line-height: 1em;
            user-select: none;
        }
        `;
    }

    static get links() {
        return `
        a, a:active, a:visited, a:focus {
            color: #ffffff;
            text-decoration: none;
        }

        a:hover {
            color: #ffffff;
            text-decoration: underline;
            cursor: var(--bunny-cursor-pointer, pointer);
        }
        `;
    }

    static get scrollbars() {
        return `
            ::-webkit-scrollbar {
            width: 6px;
            height: 6px;
            background: transparent;
        }

        ::-webkit-scrollbar-thumb {
            /*background: var(--accent-color);*/    
            background-color: #646464;
            opacity: 0.76;
        }

        ::-webkit-scrollbar-track {
            -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
        }
        
        body::-webkit-scrollbar {
            width: 0.4em;
        }

        body::-webkit-scrollbar-track {
            background-color: #00000000;
        }

        body::-webkit-scrollbar-thumb {
            background-color: #646464;
        }
        `;
    }

    static get dialogs() {
        return `
        .dialog-center {
            pointer-events: auto;
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            z-index: 700;
            /* super important property that fixes a 1px jump on hover. */
            backface-visibility: hidden;
        }
        
        .dialog-overlay {
            position: absolute;
            top: 0px;
            bottom: -3px;
            overflow: auto;
            right: 0px;
            z-index: 800;
            left: 0px;
            z-index: 700;
            background-color: black;
            opacity: 0.64;
            animation: overlay-fadein 0.62s ease 1;
            pointer-events: none;
        }
        
        @keyframes overlay-fadein {
            from {
                opacity: 0;
            }
            to {
                opacity: 0.64;
            }
        }
        
        .dialog-entity {
            margin-top: 8px;
            padding-left: 16px;
            display: block;
            color: var(--paper-grey-300);
        
            /* avoid half-pixel positioning caused by using the default em padding, causes blurred text. */
            padding-bottom: 3px;
            padding-top: 3px;
        }
        
        #dialog-close {
            position: absolute;
            right: 8px;
            top: 8px;
            z-index: 1001;
        }
        `
    }
}