import { serialService } from './serialService';
import type { YModemProgressCallback, YModemResult } from '../types';

const SOH = 0x01;
const EOT = 0x04;
const ACK = 0x06;
const CAN = 0x18;
const CRC = 0x43;

class YModemService {
  private blockSize = 128;
  private timeout = 3000;

  /**
   * Send a file using YMODEM protocol
   */
  async sendFile(
    fileData: Uint8Array,
    fileName: string,
    callback?: YModemProgressCallback
  ): Promise<YModemResult> {
    try {
      // Wait for receiver to send 'C' (CRC mode request)
      const initByte = await this.waitForByte(CRC, 10000);
      if (initByte !== CRC) {
        throw new Error('Receiver did not request CRC mode');
      }

      // Send block 0 (file header)
      await this.sendHeaderBlock(fileName, fileData.length);

      // Wait for ACK and 'C' for data blocks
      await this.waitForByte(ACK, this.timeout);
      await this.waitForByte(CRC, this.timeout);

      // Send data blocks
      const totalBlocks = Math.ceil(fileData.length / this.blockSize);

      for (let blockNum = 1; blockNum <= totalBlocks; blockNum++) {
        const start = (blockNum - 1) * this.blockSize;
        const end = Math.min(start + this.blockSize, fileData.length);
        const blockData = fileData.slice(start, end);

        // Pad last block if needed
        const paddedBlock = new Uint8Array(this.blockSize);
        paddedBlock.fill(0x1A); // EOF character
        paddedBlock.set(blockData);

        // Send block
        await this.sendDataBlock(blockNum & 0xFF, paddedBlock);

        // Wait for ACK
        const ack = await this.waitForByte(ACK, this.timeout);
        if (ack !== ACK) {
          throw new Error(`Block ${blockNum} not acknowledged`);
        }

        // Report progress
        if (callback) {
          callback(0, fileName, fileData.length, end);
        }
      }

      // Send EOT
      await serialService.writeBytes(new Uint8Array([EOT]));
      await this.waitForByte(ACK, this.timeout);

      // Send final block 0 (empty, signals end)
      await this.waitForByte(CRC, this.timeout);
      await this.sendHeaderBlock('', 0);
      await this.waitForByte(ACK, this.timeout);

      return { success: true };
    } catch (error) {
      console.error('YMODEM transfer error:', error);

      // Send cancel signal
      try {
        await serialService.writeBytes(new Uint8Array([CAN, CAN]));
      } catch {
        // Ignore cancel errors
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send header block (block 0)
   */
  private async sendHeaderBlock(fileName: string, fileSize: number): Promise<void> {
    const block = new Uint8Array(this.blockSize);
    block.fill(0);

    if (fileName) {
      // Encode filename
      const nameBytes = new TextEncoder().encode(fileName);
      block.set(nameBytes.slice(0, Math.min(nameBytes.length, 64)));

      // Add file size as string after null terminator
      const sizeStr = fileSize.toString();
      const sizeBytes = new TextEncoder().encode(sizeStr);
      block.set(sizeBytes, nameBytes.length + 1);
    }

    await this.sendDataBlock(0, block);
  }

  /**
   * Send a data block
   */
  private async sendDataBlock(blockNum: number, data: Uint8Array): Promise<void> {
    const packet = new Uint8Array(3 + data.length + 2);

    packet[0] = SOH; // Start of header (128-byte block)
    packet[1] = blockNum & 0xFF;
    packet[2] = (~blockNum) & 0xFF;

    // Copy data
    packet.set(data, 3);

    // Calculate CRC16
    const crc = this.calculateCRC16(data);
    packet[3 + data.length] = (crc >> 8) & 0xFF;
    packet[4 + data.length] = crc & 0xFF;

    await serialService.writeBytes(packet);
  }

  /**
   * Wait for a specific byte from receiver
   */
  private async waitForByte(expectedByte: number, timeout: number): Promise<number> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const data = await serialService.readBytes(1, 100);

      if (data.length > 0) {
        return data[0];
      }

      // Small delay to prevent tight loop
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    throw new Error(`Timeout waiting for byte: ${expectedByte.toString(16)}`);
  }

  /**
   * Calculate CRC-16 (XMODEM variant)
   */
  private calculateCRC16(data: Uint8Array): number {
    let crc = 0;

    for (let i = 0; i < data.length; i++) {
      crc ^= data[i] << 8;

      for (let j = 0; j < 8; j++) {
        if (crc & 0x8000) {
          crc = (crc << 1) ^ 0x1021;
        } else {
          crc = crc << 1;
        }
      }
    }

    return crc & 0xFFFF;
  }
}

export const ymodemService = new YModemService();
