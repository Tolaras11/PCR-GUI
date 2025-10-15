import type { PCRProtocol, StorageOptions } from '../types';

/**
 * Storage Service for saving PCR protocols
 * Uses File System Access API or fallback to download
 */
class StorageService {
  /**
   * Check if File System Access API is supported
   */
  isFileSystemAccessSupported(): boolean {
    return 'showSaveFilePicker' in window;
  }

  /**
   * Save PCR protocol to file
   */
  async saveProtocol(protocol: PCRProtocol, options?: StorageOptions): Promise<void> {
    const csvContent = this.protocolToCSV(protocol);
    const fileName = `${protocol.protocolName || 'protocol'}.txt`;

    if (this.isFileSystemAccessSupported()) {
      await this.saveWithFileSystemAccess(csvContent, fileName);
    } else {
      this.downloadFile(csvContent, fileName);
    }
  }

  /**
   * Convert PCR protocol to CSV format
   */
  private protocolToCSV(protocol: PCRProtocol): string {
    const lines = ['Stage,Temperature,TimeSec,Cycles'];

    const stages = [
      protocol.introDenaturing,
      protocol.denaturing,
      protocol.annealing,
      protocol.extension,
      protocol.finalExtension,
    ];

    for (const stage of stages) {
      lines.push(
        `${stage.name},${stage.temperature},${stage.seconds},${stage.cycles}`
      );
    }

    return lines.join('\n');
  }

  /**
   * Save file using File System Access API
   */
  private async saveWithFileSystemAccess(
    content: string,
    fileName: string
  ): Promise<void> {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: fileName,
        types: [
          {
            description: 'Text Files',
            accept: { 'text/plain': ['.txt'] },
          },
        ],
      });

      const writable = await handle.createWritable();
      await writable.write(content);
      await writable.close();
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        throw new Error('Save cancelled by user');
      }
      throw error;
    }
  }

  /**
   * Download file (fallback method)
   */
  private downloadFile(content: string, fileName: string): void {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();

    URL.revokeObjectURL(url);
  }

  /**
   * Get available drives (simulated for web)
   */
  getAvailableDrives(): string[] {
    // In browser, we can't enumerate actual drives
    // This is a placeholder for the UI
    return ['Download'];
  }
}

export const storageService = new StorageService();
