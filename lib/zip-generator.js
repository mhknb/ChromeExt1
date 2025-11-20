/**
 * Lightweight ZIP generator for DOCX files
 * No external dependencies, pure JavaScript implementation
 */

class ZipGenerator {
  constructor() {
    this.files = [];
  }

  /**
   * Add a file to the ZIP
   */
  addFile(path, content) {
    this.files.push({
      path: path,
      content: content,
      data: this.stringToBytes(content)
    });
  }

  /**
   * Generate ZIP file as Blob
   */
  generate() {
    const centralDirectory = [];
    const fileData = [];
    let offset = 0;

    // Process each file
    for (const file of this.files) {
      const localHeader = this.createLocalFileHeader(file);
      const fileBytes = file.data;

      // Store file data
      fileData.push(localHeader);
      fileData.push(fileBytes);

      // Create central directory entry
      const centralDirEntry = this.createCentralDirectoryEntry(file, offset);
      centralDirectory.push(centralDirEntry);

      offset += localHeader.length + fileBytes.length;
    }

    // Concatenate all file data
    const filesBlob = this.concatenateArrays(fileData);

    // Concatenate central directory
    const centralDirBlob = this.concatenateArrays(centralDirectory);

    // Create end of central directory
    const endOfCentralDir = this.createEndOfCentralDirectory(
      this.files.length,
      centralDirBlob.length,
      offset
    );

    // Combine everything
    const zipData = this.concatenateArrays([
      filesBlob,
      centralDirBlob,
      endOfCentralDir
    ]);

    return new Blob([zipData], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });
  }

  /**
   * Create local file header
   */
  createLocalFileHeader(file) {
    const fileName = this.stringToBytes(file.path);
    const header = new Uint8Array(30 + fileName.length);
    const view = new DataView(header.buffer);

    // Local file header signature
    view.setUint32(0, 0x04034b50, true);

    // Version needed to extract (2.0)
    view.setUint16(4, 20, true);

    // General purpose bit flag
    view.setUint16(6, 0, true);

    // Compression method (0 = no compression)
    view.setUint16(8, 0, true);

    // Last mod file time
    view.setUint16(10, 0, true);

    // Last mod file date
    view.setUint16(12, 0, true);

    // CRC-32
    const crc = this.crc32(file.data);
    view.setUint32(14, crc, true);

    // Compressed size
    view.setUint32(18, file.data.length, true);

    // Uncompressed size
    view.setUint32(22, file.data.length, true);

    // File name length
    view.setUint16(26, fileName.length, true);

    // Extra field length
    view.setUint16(28, 0, true);

    // File name
    header.set(fileName, 30);

    return header;
  }

  /**
   * Create central directory entry
   */
  createCentralDirectoryEntry(file, offset) {
    const fileName = this.stringToBytes(file.path);
    const entry = new Uint8Array(46 + fileName.length);
    const view = new DataView(entry.buffer);

    // Central directory file header signature
    view.setUint32(0, 0x02014b50, true);

    // Version made by
    view.setUint16(4, 20, true);

    // Version needed to extract
    view.setUint16(6, 20, true);

    // General purpose bit flag
    view.setUint16(8, 0, true);

    // Compression method
    view.setUint16(10, 0, true);

    // Last mod file time
    view.setUint16(12, 0, true);

    // Last mod file date
    view.setUint16(14, 0, true);

    // CRC-32
    const crc = this.crc32(file.data);
    view.setUint32(16, crc, true);

    // Compressed size
    view.setUint32(20, file.data.length, true);

    // Uncompressed size
    view.setUint32(24, file.data.length, true);

    // File name length
    view.setUint16(28, fileName.length, true);

    // Extra field length
    view.setUint16(30, 0, true);

    // File comment length
    view.setUint16(32, 0, true);

    // Disk number start
    view.setUint16(34, 0, true);

    // Internal file attributes
    view.setUint16(36, 0, true);

    // External file attributes
    view.setUint32(38, 0, true);

    // Relative offset of local header
    view.setUint32(42, offset, true);

    // File name
    entry.set(fileName, 46);

    return entry;
  }

  /**
   * Create end of central directory record
   */
  createEndOfCentralDirectory(numFiles, centralDirSize, centralDirOffset) {
    const record = new Uint8Array(22);
    const view = new DataView(record.buffer);

    // End of central dir signature
    view.setUint32(0, 0x06054b50, true);

    // Number of this disk
    view.setUint16(4, 0, true);

    // Disk where central directory starts
    view.setUint16(6, 0, true);

    // Number of central directory records on this disk
    view.setUint16(8, numFiles, true);

    // Total number of central directory records
    view.setUint16(10, numFiles, true);

    // Size of central directory
    view.setUint32(12, centralDirSize, true);

    // Offset of start of central directory
    view.setUint32(16, centralDirOffset, true);

    // Comment length
    view.setUint16(20, 0, true);

    return record;
  }

  /**
   * Calculate CRC32 checksum
   */
  crc32(data) {
    let crc = 0 ^ (-1);

    for (let i = 0; i < data.length; i++) {
      crc = (crc >>> 8) ^ this.crc32Table[(crc ^ data[i]) & 0xFF];
    }

    return (crc ^ (-1)) >>> 0;
  }

  /**
   * CRC32 lookup table
   */
  get crc32Table() {
    if (!this._crc32Table) {
      this._crc32Table = new Uint32Array(256);
      for (let i = 0; i < 256; i++) {
        let c = i;
        for (let j = 0; j < 8; j++) {
          c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
        }
        this._crc32Table[i] = c;
      }
    }
    return this._crc32Table;
  }

  /**
   * Convert string to UTF-8 bytes
   */
  stringToBytes(str) {
    const encoder = new TextEncoder();
    return encoder.encode(str);
  }

  /**
   * Concatenate multiple Uint8Arrays
   */
  concatenateArrays(arrays) {
    const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;

    for (const arr of arrays) {
      result.set(arr, offset);
      offset += arr.length;
    }

    return result;
  }
}

// Export
window.ZipGenerator = ZipGenerator;
