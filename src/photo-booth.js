import { LitElement, css, html } from 'lit-element';

// Extend the LitElement base class
class PhotoBoothElement extends LitElement {

	static get properties() {
		return {
			fileDataURL: {
				attribute: 'file-data-url',
				converter: (value, type) => {
					if (value === "null") return null;
					return value;
				},
				reflect: false
			},
			imageCapture: {
				attribute: false
			},
			viewfiender: {
				attribute: false
			},
			snapshot: {
				attribute: false
			},
			disableSave: {
				attribute: false
			},
			savableBlob: {
				attribute: false
			}
		}
	}

	static get styles() {
		return css`
			#hidden {
				display: none;
			}
		`;
	}

	constructor() {
		super();
		this.fileDataURL = null;
		this.imageCapture = null;
		this.viewfinder = null;
		this.snapshot = null;
		this.disableSave = true;
		this.savableBlob = null;
	}

	firstUpdated(changedProperties) {
		// super.firstUpdated();
		console.log('changed properties', changedProperties);
		const self = this;

		let previousImage = null;
		if (self.fileDataURL) {
			previousImage = new Image;
			previousImage.src = self.fileDataURL;
		}

		const videoElement = document.createElement("video");
		const videoDiv = document.createElement('div');
		self.shadowRoot.appendChild(videoDiv);
		videoDiv.appendChild(videoElement);
		videoDiv.setAttribute("style", "display:none;");

		self.viewfinder = self.shadowRoot.getElementById('viewfinder');
		self.snapshot = self.shadowRoot.getElementById('snapshot');

		videoElement.addEventListener('play', () => {
			self.viewfinder.height = videoElement.videoHeight;
			self.viewfinder.width = videoElement.videoWidth;
			self.snapshot.height = videoElement.videoHeight;
			self.snapshot.width = videoElement.videoWidth;
			const viewfinderContext = self.viewfinder.getContext('2d');
			function step() {
				if (previousImage) {
					viewfinderContext.globalAlpha = 0.5;
					viewfinderContext.drawImage(previousImage, 0, 0, self.viewfinder.width, self.viewfinder.height);
				}
				viewfinderContext.drawImage(videoElement, 0, 0, self.viewfinder.width, self.viewfinder.height);
				requestAnimationFrame(step);
			}
			requestAnimationFrame(step);
		});

		videoElement.addEventListener('canplaythrough', () => {
			videoElement.play();
		});

		navigator.mediaDevices.getUserMedia({
			video: true
		}).then((stream) => {
			videoElement.srcObject = stream;

			const track = stream.getVideoTracks()[0];
			self.imageCapture = new ImageCapture(track);
		});
	}

	render() {
		return html`
			<div>
				<button type="button" @click="${this.handleCaptureClicked}">Capture</button>
				<button type="button" @click="${this.handleSaveClicked}" ?disabled="${this.disableSave}">Save</button>
			</div>
			<div>
				<canvas id="viewfinder"></canvas>
				<canvas id="snapshot"></canvas>
			</div>
		`;
	}

	handleCaptureClicked() {
		const self = this;
		self.imageCapture.takePhoto()
			.then(blob => {
				self.saveableBlob = blob;
				self.disableSave = false;
				return createImageBitmap(blob);
			})
			.then(imageBitmap => {
				const snapshotContext = self.snapshot.getContext('2d');
				snapshotContext.drawImage(imageBitmap, 0, 0, self.snapshot.width, self.snapshot.height);
			})
			.catch(error => console.log(error));
	}

	handleSaveClicked() {
		const now = Date.now();
		const dateTimeFormat = new Intl.DateTimeFormat('en', { year: 'numeric', month: '2-digit', day: '2-digit' });
		const [{ value: month },,{ value: day },,{ value: year }] = dateTimeFormat.formatToParts(now);
		const filename = `picture-${year}-${month}-${day}.png`;

		const anchor = document.createElement('a');
		anchor.download = filename;
		anchor.href = window.URL.createObjectURL(this.saveableBlob);
		anchor.dataset.downloadurl = ['image/png', anchor.download, anchor.href].join(':');
		anchor.click();
	}
}

customElements.define('photo-booth', PhotoBoothElement);
