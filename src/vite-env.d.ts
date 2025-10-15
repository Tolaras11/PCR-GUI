/// <reference types="vite/client" />

// Web Serial API type definitions
interface SerialPort {
  readonly readable: ReadableStream<Uint8Array> | null;
  readonly writable: WritableStream<Uint8Array> | null;
  open(options: SerialOptions): Promise<void>;
  close(): Promise<void>;
  getInfo(): SerialPortInfo;
}

interface SerialPortInfo {
  usbVendorId?: number;
  usbProductId?: number;
}

interface SerialOptions {
  baudRate: number;
  dataBits?: 7 | 8;
  stopBits?: 1 | 2;
  parity?: 'none' | 'even' | 'odd';
  bufferSize?: number;
  flowControl?: 'none' | 'hardware';
}

interface SerialPortRequestOptions {
  filters?: SerialPortFilter[];
}

interface SerialPortFilter {
  usbVendorId?: number;
  usbProductId?: number;
}

interface Serial extends EventTarget {
  getPorts(): Promise<SerialPort[]>;
  requestPort(options?: SerialPortRequestOptions): Promise<SerialPort>;
  addEventListener(
    type: 'connect' | 'disconnect',
    listener: (this: this, ev: Event) => void
  ): void;
  removeEventListener(
    type: 'connect' | 'disconnect',
    listener: (this: this, ev: Event) => void
  ): void;
}

interface Navigator {
  readonly serial: Serial;
}

// File System Access API type definitions
interface FilePickerOptions {
  types?: FilePickerAcceptType[];
  excludeAcceptAllOption?: boolean;
  suggestedName?: string;
}

interface FilePickerAcceptType {
  description?: string;
  accept: Record<string, string[]>;
}

interface FileSystemWritableFileStream extends WritableStream {
  write(data: BufferSource | Blob | string): Promise<void>;
  seek(position: number): Promise<void>;
  truncate(size: number): Promise<void>;
}

interface FileSystemFileHandle {
  createWritable(): Promise<FileSystemWritableFileStream>;
}

interface Window {
  showSaveFilePicker(options?: FilePickerOptions): Promise<FileSystemFileHandle>;
  showOpenFilePicker(options?: FilePickerOptions): Promise<FileSystemFileHandle[]>;
}
