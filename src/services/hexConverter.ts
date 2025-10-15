import type { IntelHexRecord } from '../types';

/**
 * Intel HEX File Parser and Converter
 * Converts Intel HEX format to binary data
 */
class HexConverter {
  /**
   * Parse Intel HEX file content and convert to binary
   */
  hexToBinary(hexContent: string): Uint8Array {
    const lines = hexContent.split('\n').map(line => line.trim()).filter(line => line);
    const records = lines.map(line => this.parseRecord(line));

    // Find address range
    let minAddr = Infinity;
    let maxAddr = -Infinity;
    let baseAddr = 0;

    for (const record of records) {
      if (record.type === 0x00) { // Data record
        const addr = baseAddr + record.address;
        minAddr = Math.min(minAddr, addr);
        maxAddr = Math.max(maxAddr, addr + record.data.length);
      } else if (record.type === 0x04) { // Extended linear address
        baseAddr = (record.data[0] << 24) | (record.data[1] << 16);
      } else if (record.type === 0x02) { // Extended segment address
        baseAddr = ((record.data[0] << 8) | record.data[1]) << 4;
      }
    }

    if (minAddr === Infinity) {
      throw new Error('No data records found in HEX file');
    }

    // Create binary buffer
    const size = maxAddr - minAddr;
    const binary = new Uint8Array(size);
    binary.fill(0xFF); // Fill with 0xFF (common for flash memory)

    // Write data
    baseAddr = 0;
    for (const record of records) {
      if (record.type === 0x00) { // Data record
        const addr = baseAddr + record.address - minAddr;
        binary.set(record.data, addr);
      } else if (record.type === 0x04) { // Extended linear address
        baseAddr = (record.data[0] << 24) | (record.data[1] << 16);
      } else if (record.type === 0x02) { // Extended segment address
        baseAddr = ((record.data[0] << 8) | record.data[1]) << 4;
      }
    }

    return binary;
  }

  /**
   * Parse a single Intel HEX record line
   */
  private parseRecord(line: string): IntelHexRecord {
    if (!line.startsWith(':')) {
      throw new Error('Invalid HEX record: must start with ":"');
    }

    const data = line.substring(1);
    if (data.length < 10) {
      throw new Error('Invalid HEX record: too short');
    }

    const byteCount = parseInt(data.substring(0, 2), 16);
    const address = parseInt(data.substring(2, 6), 16);
    const recordType = parseInt(data.substring(6, 8), 16);

    const dataBytes = new Uint8Array(byteCount);
    for (let i = 0; i < byteCount; i++) {
      dataBytes[i] = parseInt(data.substring(8 + i * 2, 10 + i * 2), 16);
    }

    const checksum = parseInt(data.substring(8 + byteCount * 2, 10 + byteCount * 2), 16);

    // Verify checksum
    let sum = byteCount + (address >> 8) + (address & 0xFF) + recordType;
    for (let i = 0; i < byteCount; i++) {
      sum += dataBytes[i];
    }
    const calculatedChecksum = ((~sum) + 1) & 0xFF;

    if (calculatedChecksum !== checksum) {
      throw new Error('Invalid HEX record: checksum mismatch');
    }

    return {
      address,
      type: recordType,
      data: dataBytes,
    };
  }

  /**
   * Convert hex file to binary and create a Blob
   */
  async convertHexFile(file: File): Promise<Blob> {
    const content = await file.text();
    const binary = this.hexToBinary(content);
    return new Blob([binary as BlobPart], { type: 'application/octet-stream' });
  }

  /**
   * Validate if file is Intel HEX format
   */
  isValidHexFile(content: string): boolean {
    try {
      const lines = content.split('\n').map(line => line.trim()).filter(line => line);
      if (lines.length === 0) return false;

      // Check first line
      if (!lines[0].startsWith(':')) return false;

      // Try to parse first record
      this.parseRecord(lines[0]);
      return true;
    } catch {
      return false;
    }
  }
}

export const hexConverter = new HexConverter();
