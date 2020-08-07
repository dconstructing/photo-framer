import { LitElement, css, html } from 'lit-element';
import './photo-booth.js';

// Extend the LitElement base class
class PhotoFramerElement extends LitElement {

	static get properties() {
		return {
			fileDataURL: {
				attribute: false
			},
			shouldCapture: {
				attribute: false
			}
		}
	}

	static get styles() {
		return css`
			:host {
				display: flex;
				flex-direction: column;
				height: 100%;
			}
			header {
				display: flex;
				flex-direction: row;
				justify-content: space-between;
				align-items: center;
			}
			#picker {
				display: none;
			}
		`;
	}

	constructor() {
		super();
		this.fileDataURL = null;
		this.shouldCapture = false;
	}

	render() {
		return html`
			<header>
				<h1>Photo Framer</h1>
				${this.shouldCapture ?
					html`<button type="button" @click="${this.handleResetClicked}">Reset</button>`:
					html`
						<div>
							<input id="picker" type="file" accept=".png" @change="${this.handleImageSelection}"></input>
							<button type="button" @click="${this.handleNewClicked}">New</button>
							<button type="button" @click="${this.handleLoadClicked}">Load</button>
						</div>
					`
				}
			</header>
			${this.shouldCapture ?
				html`<photo-booth file-data-url="${this.fileDataURL}"></photo-booth>`:
				html`<p>Select a file or select New</p>`
			}
		`;
	}	

	handleNewClicked() {
		this.shouldCapture = true;
	}

	handleLoadClicked() {
		this.shadowRoot.getElementById('picker').click();
	}

	handleImageSelection(changeEvent) {
		console.log('handled', changeEvent.currentTarget.files);
		if (changeEvent.currentTarget.files.length > 0) {
			const self = this;
			const file = changeEvent.currentTarget.files[0]
			console.log('new file', file);
			// self.filename = file.name; // remember the filename so we can use it when we save
			const reader = new FileReader();
			reader.onloadend = function(loadEndEvent) {
				console.log('loaded', loadEndEvent, loadEndEvent.target.result);
				self.fileDataURL = loadEndEvent.target.result;
				self.shouldCapture = true;
			};
			reader.readAsDataURL(file);
		} else {
			console.log('skipping because no files')
		}
	}

	handleResetClicked() {
		this.shouldCapture = false;
		this.fileDataURL = null;
	}
}

customElements.define('photo-framer', PhotoFramerElement);
