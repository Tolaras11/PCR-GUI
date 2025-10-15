import React, { useEffect } from 'react';
import {
  Box,
  Button,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import { usePCRStore } from '../stores/pcrStore';
import { useLogStore } from '../stores/logStore';
import { storageService } from '../services/storageService';
import type { PCRFormData } from '../types';

const PCR_STAGES = [
  { name: 'Intro Denaturing', tempKey: 'introTemp', cyclesKey: 'introCycles', secKey: 'introSec' },
  { name: 'Denaturing', tempKey: 'denatureTemp', cyclesKey: 'denatureCycles', secKey: 'denatureSec' },
  { name: 'Annealing', tempKey: 'annealTemp', cyclesKey: 'annealCycles', secKey: 'annealSec' },
  { name: 'Extension', tempKey: 'extensionTemp', cyclesKey: 'extensionCycles', secKey: 'extensionSec' },
  { name: 'Final Extension', tempKey: 'finalTemp', cyclesKey: 'finalCycles', secKey: 'finalSec' },
] as const;

export const PCRSettings: React.FC = () => {
  const {
    formData,
    selectedDrive,
    availableDrives,
    updateField,
    setSelectedDrive,
    setAvailableDrives,
    getProtocol,
    reset,
  } = usePCRStore();

  const addLog = useLogStore((state) => state.addLog);

  useEffect(() => {
    const drives = storageService.getAvailableDrives();
    setAvailableDrives(drives);
    if (drives.length > 0) {
      setSelectedDrive(drives[0]);
    }
  }, [setAvailableDrives, setSelectedDrive]);

  const handleSave = async () => {
    if (!formData.protocolName.trim()) {
      addLog('Error: Protocol name cannot be empty', 'error');
      return;
    }

    const hasData = PCR_STAGES.some(
      (stage) =>
        formData[stage.tempKey as keyof PCRFormData] ||
        formData[stage.cyclesKey as keyof PCRFormData] ||
        formData[stage.secKey as keyof PCRFormData]
    );

    if (!hasData) {
      addLog('Error: Please enter PCR settings', 'error');
      return;
    }

    try {
      const protocol = getProtocol();
      await storageService.saveProtocol(protocol);
      addLog(`PCR settings saved to ${formData.protocolName}.txt`, 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      addLog(`Error saving to file: ${message}`, 'error');
    }
  };

  const handleClear = () => {
    reset();
    addLog('PCR settings cleared', 'info');
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          fullWidth
          size="small"
          label="Protocol Name"
          value={formData.protocolName}
          onChange={(e) => updateField('protocolName', e.target.value)}
          placeholder="Enter protocol name"
        />

        <Box sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Stage</TableCell>
                <TableCell align="center">Temperature (°C)</TableCell>
                <TableCell align="center">Cycles</TableCell>
                <TableCell align="center">Seconds</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {PCR_STAGES.map((stage) => (
                <TableRow key={stage.name}>
                  <TableCell component="th" scope="row">
                    {stage.name}
                  </TableCell>
                  <TableCell align="center">
                    <TextField
                      size="small"
                      type="number"
                      value={formData[stage.tempKey as keyof PCRFormData]}
                      onChange={(e) =>
                        updateField(stage.tempKey as keyof PCRFormData, e.target.value)
                      }
                      inputProps={{ min: 0, max: 120, step: 0.1 }}
                      sx={{ width: 80 }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <TextField
                      size="small"
                      type="number"
                      value={formData[stage.cyclesKey as keyof PCRFormData]}
                      onChange={(e) =>
                        updateField(stage.cyclesKey as keyof PCRFormData, e.target.value)
                      }
                      inputProps={{ min: 0, max: 100 }}
                      sx={{ width: 80 }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <TextField
                      size="small"
                      type="number"
                      value={formData[stage.secKey as keyof PCRFormData]}
                      onChange={(e) =>
                        updateField(stage.secKey as keyof PCRFormData, e.target.value)
                      }
                      inputProps={{ min: 0, max: 600 }}
                      sx={{ width: 80 }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>

        <Divider />

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Select Drive</InputLabel>
            <Select
              value={selectedDrive}
              label="Select Drive"
              onChange={(e) => setSelectedDrive(e.target.value)}
            >
              {availableDrives.map((drive) => (
                <MenuItem key={drive} value={drive}>
                  {drive}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            startIcon={<SaveIcon />}
            sx={{ flex: 1 }}
          >
            Save to File
          </Button>

          <Button
            variant="outlined"
            color="secondary"
            onClick={handleClear}
            startIcon={<DeleteIcon />}
          >
            Clear
          </Button>
        </Box>
      </Box>
    </Box>
  );
};
