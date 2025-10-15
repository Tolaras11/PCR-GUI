import type { PCRProtocol } from '../types';

class StorageService {
  isFileSystemAccessSupported(): boolean {
    return 'showSaveFilePicker' in window;
  }

  async saveProtocol(protocol: PCRProtocol): Promise<void> {
    const csvContent = this.protocolToCSV(protocol);
    const fileName = `${protocol.protocolName || 'protocol'}.txt`;

    if (this.isFileSystemAccessSupported()) {
      await this.saveWithFileSystemAccess(csvContent, fileName);
    } else {
      this.downloadFile(csvContent, fileName);
    }
  }

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

  private downloadFile(content: string, fileName: string): void {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();

    URL.revokeObjectURL(url);
  }

  getAvailableDrives(): string[] {
    return ['Download'];
  }
}

export const storageService = new StorageService();
