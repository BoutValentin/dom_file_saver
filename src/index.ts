import domtoimage from 'dom-to-image';

/***
 * The top class level for saving file. Store method to save file on the user device.
 * The class use link HTMLElement (a tag) to download the file.
 */
export class FileSaver {
  /***
   * Save a content given in parameters to a file.
   * @param {string} content The content to save. Should be given in string format.
   * @param {string } type The MIME type of the file.
   * @param {string} filename The name of the file to save.
   */
	save_file(content: string, type: string, filename: string) {
    // We create a blob within the content in it and the MIME type given.
		const blob = new Blob([content], { type });
    // We use another helper function in that class to save the blob.
		this.save_file_from_blob(blob, filename);
	}

  /***
   * Save a Blob object to a file.
   * @param {Blob} blob The Blob object content to save.
   * @param {string} filename The name of the file to save.
   */
	save_file_from_blob(blob: Blob, filename: string) {
    // We use another helper function in that class to save the blob object. 
    // We give a callback function who export our blob into an URL Object. 
		this._save_file_from_wrapper(filename, () => window.URL.createObjectURL(blob));
	}

  /***
   * Save a Text / String to a file.
   * @param {string} content The string content to save.
   * @param {string} filename The name of the file to save.
   */
	save_file_from_text_as_data(content: string, filename: string) {
    // We use another helper function in that class to save the blob object. 
    // We give a callback function who only return the content as it is. 
		this._save_file_from_wrapper(filename, () => content);
	}

  /***
   * A private method who create an HTMLElement link tag ('a' tag) into our dom to save the file.
   * The link element is destroy after the creation to not pollute the dom document.
   * @param {string} filename The name of the file to save.
   * @param {Function} wrapper A function who return a string which will be the content to download.
   */
	private _save_file_from_wrapper(filename: string, wrapper: () => string) {
		const a_tag = document.createElement('a');
		a_tag.download = filename;
		a_tag.href = wrapper();
		a_tag.target = '_blank';
		a_tag.click();
		a_tag.remove();
	}
}

export class DomFileSaver extends FileSaver {
  container: HTMLElement;

	constructor(container: HTMLElement) {
		super();
		this.container = container;
	}

	save_as_file_inline_svg(file_name : string = 'qr-code.svg') {
		if (!this.container) return;
		domtoimage.toSvg(this.container).then((svg_str: string) => {
			const newsvg = svg_str.replace('data:image/svg+xml;charset=utf-8,', '');
			this.save_file(newsvg, 'image/svg+xml', file_name);
		});
	}

	save_as_file_png(file_name: string = 'qr-code.png') {
		if (!this.container) return;
		domtoimage.toBlob(this.container).then((blob: Blob) => {
			this.save_file_from_blob(blob, file_name);
		});
	}
}

/***
 * An helper function who export an HTMLElement to a PNG file.
 * @param {HTMLElement} container The HTMLElement to export in the PNG file generate.
 * @param {string} filename The name of the PNG file export.
 */
export const file_saver_png_helper = (container: HTMLElement, filename: string) => {
  // Check if the container is not null, to avoid exporting nothing.
	if (!container) return;
  // Create a dom file saver object with the given container.
	const dfs = new DomFileSaver(container);
  // Save the container as a png
	dfs.save_as_file_png(filename);
};

/***
 * An helper function who export an HTMLElement to a SVG file.
 * @param {HTMLElement} container The HTMLElement to export in the SVG file generate.
 * @param {string} filename The name of the SVG file export.
 */
export const file_saver_svg_helper = (container: HTMLElement, filename: string) => {
  // Check if the container is not null, to avoid exporting nothing.
	if (!container) return;
  // Create a dom file saver object with the given container.
	const dfs = new DomFileSaver(container);
  // Save the container as a SVG
	dfs.save_as_file_inline_svg(filename);
};
