import type { BaudRate } from '../types';

/**
 * Web Serial API Service
 * Handles serial port communication for PCR device
 */
class SerialService {
  private port: SerialPort | null = null;
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  private writer: WritableStreamDefaultWriter<Uint8Array> | null = null;
  private readCallback: ((data: string) => void) | null = null;
  private isReading = false;

  /**
   * Check if Web Serial API is supported
   */
  isSupported(): boolean {
    return 'serial' in navigator;
  }

  /**
   * Request user to select a serial port
   */
  async requestPort(): Promise<SerialPort> {
    if (!this.isSupported()) {
      throw new Error('Web Serial API is not supported in this browser');
    }

    try {
      const port = await navigator.serial.requestPort();
      return port;
    } catch (error) {
      throw new Error(`Failed to request port: ${error}`);
    }
  }

  /**
   * Get list of available serial ports (previously granted)
   */
  async getAvailablePorts(): Promise<SerialPort[]> {
    if (!this.isSupported()) {
      return [];
    }

    try {
      const ports = await navigator.serial.getPorts();
      return ports;
    } catch (error) {
      console.error('Failed to get ports:', error);
      return [];
    }
  }

  /**
   * Connect to a serial port
   */
  async connect(port: SerialPort, baudRate: BaudRate): Promise<void> {
    try {
      await port.open({
        baudRate,
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
      });

      this.port = port;

      // Set up reader and writer
      if (port.readable) {
        this.reader = port.readable.getReader();
      }

      if (port.writable) {
        this.writer = port.writable.getWriter();
      }

      // Start reading loop
      this.startReading();
    } catch (error) {
      throw new Error(`Failed to connect: ${error}`);
    }
  }

  /**
   * Disconnect from the serial port
   */
  async disconnect(): Promise<void> {
    this.isReading = false;

    try {
      // Release reader
      if (this.reader) {
        await this.reader.cancel();
        this.reader.releaseLock();
        this.reader = null;
      }

      // Release writer
      if (this.writer) {
        await this.writer.close();
        this.writer = null;
      }

      // Close port
      if (this.port) {
        await this.port.close();
        this.port = null;
      }
    } catch (error) {
      console.error('Error during disconnect:', error);
      throw error;
    }
  }

  /**
   * Check if currently connected
   */
  isConnected(): boolean {
    return this.port !== null && this.reader !== null;
  }

  /**
   * Set callback for incoming data
   */
  onData(callback: (data: string) => void): void {
    this.readCallback = callback;
  }

  /**
   * Write data to serial port
   */
  async write(data: string | Uint8Array): Promise<void> {
    if (!this.writer) {
      throw new Error('Not connected to a serial port');
    }

    try {
      const buffer = typeof data === 'string'
        ? new TextEncoder().encode(data)
        : data;

      await this.writer.write(buffer);
    } catch (error) {
      throw new Error(`Failed to write: ${error}`);
    }
  }

  /**
   * Write raw bytes to serial port (for YMODEM)
   */
  async writeBytes(data: Uint8Array): Promise<void> {
    return this.write(data);
  }

  /**
   * Read raw bytes from serial port (for YMODEM)
   */
  async readBytes(size: number, timeout: number = 1000): Promise<Uint8Array> {
    if (!this.reader) {
      throw new Error('Not connected to a serial port');
    }

    const timeoutPromise = new Promise<Uint8Array>((_, reject) => {
      setTimeout(() => reject(new Error('Read timeout')), timeout);
    });

    const readPromise = (async () => {
      const buffer: number[] = [];

      while (buffer.length < size) {
        const { value, done } = await this.reader!.read();

        if (done) {
          break;
        }

        if (value) {
          buffer.push(...Array.from(value));
        }
      }

      return new Uint8Array(buffer.slice(0, size));
    })();

    try {
      return await Promise.race([readPromise, timeoutPromise]);
    } catch (error) {
      return new Uint8Array(0); // Return empty array on timeout
    }
  }

  /**
   * Start continuous reading loop
   */
  private async startReading(): Promise<void> {
    if (!this.reader || this.isReading) {
      return;
    }

    this.isReading = true;
    const decoder = new TextDecoder();

    try {
      while (this.isReading && this.reader) {
        const { value, done } = await this.reader.read();

        if (done) {
          break;
        }

        if (value && this.readCallback) {
          const text = decoder.decode(value, { stream: true });
          this.readCallback(text);
        }
      }
    } catch (error) {
      if (this.isReading) {
        console.error('Error reading from serial port:', error);
      }
    }
  }

  /**
   * Get port info
   */
  getPortInfo(): SerialPortInfo | null {
    if (!this.port) {
      return null;
    }

    const info = this.port.getInfo();
    return {
      usbVendorId: info.usbVendorId,
      usbProductId: info.usbProductId,
    };
  }
}

export const serialService = new SerialService();
