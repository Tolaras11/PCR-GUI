// Serial Port Types
export interface SerialPortInfo {
  device: string;
  manufacturer?: string;
  product?: string;
}

export interface SerialConnectionState {
  port: SerialPort | null;
  isConnected: boolean;
  selectedPort: string;
  baudRate: number;
  status: string;
  statusColor: 'success' | 'error';
}

// PCR Protocol Types
export interface PCRStage {
  name: string;
  temperature: number;
  cycles: number;
  seconds: number;
}

export interface PCRProtocol {
  protocolName: string;
  introDenaturing: PCRStage;
  denaturing: PCRStage;
  annealing: PCRStage;
  extension: PCRStage;
  finalExtension: PCRStage;
}

export interface PCRFormData {
  protocolName: string;
  introTemp: string;
  introCycles: string;
  introSec: string;
  denatureTemp: string;
  denatureCycles: string;
  denatureSec: string;
  annealTemp: string;
  annealCycles: string;
  annealSec: string;
  extensionTemp: string;
  extensionCycles: string;
  extensionSec: string;
  finalTemp: string;
  finalCycles: string;
  finalSec: string;
}

// Firmware Types
export interface FirmwareUploadState {
  filePath: string;
  fileName: string;
  progress: number;
  status: string;
  isUploading: boolean;
}

export type FirmwareFileType = 'hex' | 'bin';

// Temperature Data Types
export interface TemperatureData {
  time: number;
  peltier: number;
  lid: number;
}

export interface TemperatureState {
  data: TemperatureData[];
  isParsing: boolean;
}

// Log Types
export interface LogMessage {
  id: string;
  timestamp: Date;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
}

// YMODEM Protocol Types
export interface YModemProgressCallback {
  (index: number, name: string, total: number, done: number): void;
}

export interface YModemResult {
  success: boolean;
  error?: string;
}

// Intel HEX Types
export interface IntelHexRecord {
  address: number;
  type: number;
  data: Uint8Array;
}

// Storage/SD Card Types
export interface StorageOptions {
  drive?: string;
  folderPath: string;
  fileName: string;
}

// Baud Rate Options
export const BAUD_RATES = [9600, 19200, 38400, 57600, 115200] as const;
export type BaudRate = typeof BAUD_RATES[number];

// PCR Stage Names
export const PCR_STAGE_NAMES = [
  'Intro Denaturing',
  'Denaturing',
  'Annealing',
  'Extension',
  'Final Extension'
] as const;
export type PCRStageName = typeof PCR_STAGE_NAMES[number];
