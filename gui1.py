import tkinter as tk
from tkinter import ttk, filedialog, messagebox
import threading
import serial
import serial.tools.list_ports
import time

class FirmwareUpdater:
    def __init__(self, root):
        self.root = root
        self.root.title("Firmware Updater")
        self.root.geometry("1024x860")

        # Left frame for controls
        self.left_frame = tk.Frame(root)
        self.left_frame.pack(side=tk.LEFT, fill=tk.Y, padx=10, pady=10)

        # File selection
        self.file_label = tk.Label(self.left_frame, text="No file selected")
        self.file_label.pack(pady=5)

        self.browse_button = tk.Button(self.left_frame, text="Browse Firmware", command=self.browse_file)
        self.browse_button.pack(pady=5)

        # USB connection
        self.port_label_frame = tk.Frame(self.left_frame)
        self.port_label_frame.pack(pady=5)

        self.port_label = tk.Label(self.port_label_frame, text="Select USB Port:")
        self.port_label.pack(side=tk.LEFT, padx=5)

        self.port_combobox = ttk.Combobox(self.port_label_frame, values=self.get_serial_ports(), state="readonly")
        self.port_combobox.pack(side=tk.LEFT, padx=5)

        self.baudrate_frame = tk.Frame(self.left_frame)
        self.baudrate_frame.pack(pady=5)

        self.baudrate_label = tk.Label(self.baudrate_frame, text="Baud Rate:")
        self.baudrate_label.pack(side=tk.LEFT, padx=5)

        self.baudrate_combobox = ttk.Combobox(self.baudrate_frame, values=[1200, 2400, 4800, 9600, 14400, 19200, 38400, 57600, 115200, 230400, 460800, 921600], state="readonly")
        self.baudrate_combobox.set(115200)
        self.baudrate_combobox.pack(side=tk.LEFT, padx=5)

        self.connect_button = tk.Button(self.left_frame, text="Connect to USB", command=self.connect_device)
        self.connect_button.pack(pady=5)

        self.disconnect_button = tk.Button(self.left_frame, text="Disconnect", command=self.disconnect_device, state=tk.DISABLED)
        self.disconnect_button.pack(pady=5)

        self.connection_status = tk.Label(self.left_frame, text="Not connected", fg="red")
        self.connection_status.pack(pady=5)

        # Upload button
        self.upload_button = tk.Button(self.left_frame, text="Upload Firmware", command=self.upload_firmware, state=tk.DISABLED)
        self.upload_button.pack(pady=10)

        # Progress bar
        self.progress_bar = ttk.Progressbar(self.left_frame, orient="horizontal", length=300, mode="determinate")
        self.progress_bar.pack(pady=5)

        # Cancel button
        self.cancel_button = tk.Button(self.left_frame, text="Cancel", command=self.cancel_upload, state=tk.DISABLED)
        self.cancel_button.pack(pady=5)

        # Status
        self.status_label = tk.Label(self.left_frame, text="Idle", fg="blue")
        self.status_label.pack(pady=5)

        # PCR temperature settings
        self.pcr_frame = tk.LabelFrame(self.left_frame, text="PCR Temperature Settings", padx=10, pady=10)
        self.pcr_frame.pack(pady=10, padx=10, fill="both", expand=True)

        # Intro Denaturing label
        self.intro_denaturing_label = tk.Label(self.pcr_frame, text="Intro Denaturing Temperature (\u00b0C):")
        self.intro_denaturing_label.grid(row=0, column=0, padx=5, pady=5, sticky="w")
        self.intro_denaturing_temp = tk.Entry(self.pcr_frame)
        self.intro_denaturing_temp.grid(row=0, column=1, padx=5, pady=5)

        # Cycles label and entry
        self.cycles_label = tk.Label(self.pcr_frame, text="Cycles:")
        self.cycles_label.grid(row=1, column=0, padx=5, pady=5, sticky="w")
        self.cycles_entry = tk.Entry(self.pcr_frame)
        self.cycles_entry.grid(row=1, column=1, padx=5, pady=5)

        # Denaturing Temperature
        self.denaturing_label = tk.Label(self.pcr_frame, text="Denaturing Temperature (\u00b0C):")
        self.denaturing_label.grid(row=2, column=0, padx=5, pady=5, sticky="w")
        self.denaturing_temp = tk.Entry(self.pcr_frame)
        self.denaturing_temp.grid(row=2, column=1, padx=5, pady=5)

        # Annealing Temperature
        self.annealing_label = tk.Label(self.pcr_frame, text="Annealing Temperature (\u00b0C):")
        self.annealing_label.grid(row=3, column=0, padx=5, pady=5, sticky="w")
        self.annealing_temp = tk.Entry(self.pcr_frame)
        self.annealing_temp.grid(row=3, column=1, padx=5, pady=5)

        # Extension Temperature
        self.extension_label = tk.Label(self.pcr_frame, text="Extension Temperature (\u00b0C):")
        self.extension_label.grid(row=4, column=0, padx=5, pady=5, sticky="w")
        self.extension_temp = tk.Entry(self.pcr_frame)
        self.extension_temp.grid(row=4, column=1, padx=5, pady=5)

        # Final Extension Temperature
        self.final_extension_label = tk.Label(self.pcr_frame, text="Final Extension Temperature (\u00b0C):")
        self.final_extension_label.grid(row=5, column=0, padx=5, pady=5, sticky="w")
        self.final_extension_temp = tk.Entry(self.pcr_frame)
        self.final_extension_temp.grid(row=5, column=1, padx=5, pady=5)

        # Seconds label and entry
        self.seconds_label = tk.Label(self.pcr_frame, text="Seconds per Stage:")
        self.seconds_label.grid(row=6, column=0, padx=5, pady=5, sticky="w")
        self.seconds_entry = tk.Entry(self.pcr_frame)
        self.seconds_entry.grid(row=6, column=1, padx=5, pady=5)

        # Bottom frame for logs (moved below PCR frame)
        self.bottom_frame = tk.Frame(root)
        self.bottom_frame.pack(side=tk.BOTTOM, fill=tk.X, padx=10, pady=10)

        self.log_text = tk.Text(self.bottom_frame, height=8, state="disabled")
        self.log_text.pack(fill=tk.BOTH, expand=True)

        self.serial_connection = None
        self.firmware_file = None
        self.uploading = False

    def log_message(self, message):
        self.log_text.config(state="normal")
        self.log_text.insert(tk.END, f"{message}\n")
        self.log_text.config(state="disabled")
        self.log_text.see(tk.END)

    def browse_file(self):
        self.firmware_file = filedialog.askopenfilename(filetypes=[("Firmware Files", "*.bin;*.hex")])
        if self.firmware_file:
            self.file_label.config(text=f"Selected: {self.firmware_file}")
            self.log_message(f"Firmware file selected: {self.firmware_file}")
            if self.serial_connection:
                self.upload_button.config(state=tk.NORMAL)

    def get_serial_ports(self):
        return [port.device for port in serial.tools.list_ports.comports()]

    def connect_device(self):
        selected_port = self.port_combobox.get()
        selected_baudrate = self.baudrate_combobox.get()
        if not selected_port:
            messagebox.showwarning("Warning", "Please select a COM port.")
            return

        try:
            self.serial_connection = serial.Serial(selected_port, int(selected_baudrate), timeout=1)
            self.connection_status.config(text="Connected", fg="green")
            self.upload_button.config(state=tk.NORMAL if self.firmware_file else tk.DISABLED)
            self.disconnect_button.config(state=tk.NORMAL)
            self.connect_button.config(state=tk.DISABLED)
            self.log_message(f"Connected to {selected_port} at {selected_baudrate} baud")
        except serial.SerialException as e:
            messagebox.showerror("Connection Error", f"Failed to connect to USB device: {e}")
            self.log_message(f"Connection error: {e}")

    def disconnect_device(self):
        if self.serial_connection:
            self.serial_connection.close
