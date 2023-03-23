import domtoimage from 'dom-to-image';

/***
 * The top class level for saving file. Store method to save file on the user device.
 * The class use link HTMLElement (a tag) to download the file.
 */
export class FileSaver {
	/**
	 * {Document} document The dom element where tag will be append and remove.
	 */
	document: Document;

	/**
	 * Create a FileSaver object
	 * @param {Document} doc The dom element where tag will be append and remove.
	 */
	constructor(doc: Document) {
		this.document = doc;
	}

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
		// Create a "a / link" tag element into the document.
		const a_tag = this.document.createElement('a');
		// Asign download to the filename, ensure that when we click on element, it will download it.
		a_tag.download = filename;
		// Use the wrapper to set the href / source of our element
		a_tag.href = wrapper();
		// Ensure the element will open in new windows.
		a_tag.target = '_blank';
		// We click on the tag to trigger the download
		a_tag.click();
		// We remove the tag which is now useless in our dom.
		a_tag.remove();
	}
}

/***
 * DomFileSaver is the class use to save a particular dom elements (and it's child) to a file.
 * It extends the FileSaver class to save the dom element into file.
 */
export class DomFileSaver extends FileSaver {
	/**
	 * {HTMLElement} The container / dom element to save as a file
	 */
  	container: HTMLElement;

	/**
	 * Construct the DomFileSaver object with a reference to a container to save.
	 * @param {HTMLElement} container The container / dom element to save as a file
	 * @param {Document} document The HTML dom document where to put a tag element into it.
	 */
	constructor(container: HTMLElement, document: Document) {
		super(document);
		this.container = container;
	}

	/**
	 * Save the container into a SVG file (named file_name).
	 * This method used the .toSvg method of the domtoimage library.
	 * The SVG can be quite big, but it exports all the property of the container and his sub-child within it.
	 * @param {string} file_name The filename of the file to be export. Default is 'export.svg'
	 * @returns {void}
	 */
	save_as_file_inline_svg(file_name : string = 'export.svg') {
		// If we don't have container (or not a valid value), we will not export file since the behaviour of domtoimage can be unprevisible with Null container.
		if (!this.container) return;
		// We export the container as SVG
		domtoimage.toSvg(this.container).then((svg_str: string) => {
			// We remove the first element of svg (which is mainly used to display in img tag)
			const newsvg = svg_str.replace('data:image/svg+xml;charset=utf-8,', '');
			// And export the content into a file.
			this.save_file(newsvg, 'image/svg+xml', file_name);
		});
	}

	/**
	 * Save the container into a PNG file (named file_name).
	 * This method used the .toBlob method of the domtoimage library and save this blob into the file.
	 * @param {string} file_name The filename of the file to be export. Default is 'export.png'
	 * @returns {void}
	 */
	save_as_file_png(file_name: string = 'export.png') {
		// If we don't have container (or not a valid value), we will not export file since the behaviour of domtoimage can be unprevisible with Null container.
		if (!this.container) return;
		// We export the container as PNG
		domtoimage.toBlob(this.container).then((blob: Blob) => {
			// We save the blob create to a PNG file
			this.save_file_from_blob(blob, file_name);
		});
	}
}

/***
 * An helper function who export an HTMLElement to a PNG file.
 * @param {HTMLElement} container The HTMLElement to export in the PNG file generate.
 * @param {string} filename The name of the PNG file export.
 */
export const file_saver_png_helper = (container: HTMLElement, document: Document, filename: string) => {
  // Check if the container is not null, to avoid exporting nothing.
	if (!container) return;
  // Create a dom file saver object with the given container.
	const dfs = new DomFileSaver(container, document);
  // Save the container as a png
	dfs.save_as_file_png(filename);
};

/***
 * An helper function who export an HTMLElement to a SVG file.
 * @param {HTMLElement} container The HTMLElement to export in the SVG file generate.
 * @param {string} filename The name of the SVG file export.
 */
export const file_saver_svg_helper = (container: HTMLElement, document: Document, filename: string) => {
  // Check if the container is not null, to avoid exporting nothing.
	if (!container) return;
  // Create a dom file saver object with the given container.
	const dfs = new DomFileSaver(container, document);
  // Save the container as a SVG
	dfs.save_as_file_inline_svg(filename);
};
