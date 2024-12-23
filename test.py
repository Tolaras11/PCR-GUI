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

        # Left frame for connection settings and actions
        self.left_frame = tk.Frame(root)
        self.left_frame.pack(side=tk.LEFT, fill=tk.Y, padx=10, pady=10)

        # Connection settings frame
        self.connection_frame = tk.LabelFrame(self.left_frame, text="Connection Settings", padx=10, pady=10,  height=50, width=50)
        self.connection_frame.pack_propagate(False)
        self.connection_frame.pack(pady=10, padx=10, fill="both", expand=True)

        # File selection
        self.file_label = tk.Label(self.connection_frame, text="No file selected")
        self.file_label.grid(row=0, column=0, padx=5, pady=5, sticky="w")

        self.browse_button = tk.Button(self.connection_frame, text="Browse Firmware", command=self.browse_file)
        self.browse_button.grid(row=0, column=1, padx=5, pady=5, sticky="w")

        # USB connection settings
        self.port_label = tk.Label(self.connection_frame, text="Select USB Port:")
        self.port_label.grid(row=1, column=0, padx=5, pady=5, sticky="w")

        self.port_combobox = ttk.Combobox(self.connection_frame, values=self.get_serial_ports(), state="readonly")
        self.port_combobox.grid(row=1, column=1, padx=5, pady=5, sticky="w")

        self.baudrate_label = tk.Label(self.connection_frame, text="Baud Rate:")
        self.baudrate_label.grid(row=2, column=0, padx=5, pady=5, sticky="w")

        self.baudrate_combobox = ttk.Combobox(
            self.connection_frame, 
            values=[1200, 2400, 4800, 9600, 14400, 19200, 38400, 57600, 115200, 230400, 460800, 921600],
            state="readonly"
        )
        self.baudrate_combobox.set(115200)
        self.baudrate_combobox.grid(row=2, column=1, padx=5, pady=5, sticky="w")

        # Connect and Disconnect buttons
        self.connect_button = tk.Button(self.connection_frame, text="Connect to USB", command=self.connect_device)
        self.connect_button.grid(row=3, column=0, padx=5, pady=5, sticky="w")

        self.disconnect_button = tk.Button(self.connection_frame, text="Disconnect", command=self.disconnect_device, state=tk.ACTIVE)
        self.disconnect_button.grid(row=3, column=1, padx=5, pady=5, sticky="w")

        # Connection status
        self.connection_status = tk.Label(self.connection_frame, text="Not connected", fg="red")
        self.connection_status.grid(row=4, column=0, columnspan=2, padx=5, pady=5, sticky="w")

        # Progress bar and status
        self.progress_bar = ttk.Progressbar(self.left_frame, orient="horizontal", length=150, mode="determinate")
        self.progress_bar.pack(pady=5)

        self.cancel_button = tk.Button(self.left_frame, text="Cancel", command=self.cancel_upload, state=tk.DISABLED)
        self.cancel_button.pack(pady=5)

        self.status_label = tk.Label(self.left_frame, text="Idle", fg="blue")
        self.status_label.pack(pady=5)

        # PCR Settings frame
        self.pcr_frame = tk.LabelFrame(root, text="PCR Settings", padx=10, pady=10, height=150, width=150)
        self.pcr_frame.pack(side=tk.TOP, fill=tk.X, padx=10, pady=10)

        # PCR settings content
        self.setup_pcr_settings()

        # Log frame
 #      self.log_frame = tk.Frame(root)
 #       self.log_frame.pack(side=tk.BOTTOM, fill=tk.BOTH, padx=5, pady=5, expand=True)

 #       self.log_text = tk.Text(self.log_frame, width=10, height=10, state="disabled")
 #       self.log_text.pack(fill=tk.BOTH, expand=True)

        self.serial_connection = None
        self.firmware_file = None
        self.uploading = False

    def setup_pcr_settings(self):
        settings = [
            ("Intro Denaturing (°C):", 1),
            ("Denaturing (°C):", 2),
            ("Annealing (°C):", 3),
            ("Extension (°C):", 4),
            ("Final Extension (°C):", 5)
        ]

        for text, row in settings:
            label = tk.Label(self.pcr_frame, text=text)
            label.grid(row=row, column=0, padx=5, pady=5, sticky="w")
            entry = tk.Entry(self.pcr_frame, width=10)
            entry.grid(row=row, column=1, padx=5, pady=5, sticky="w")

        # Cycles and seconds per stage
        self.cycles_label = tk.Label(self.pcr_frame, text="Cycles:")
        self.cycles_label.grid(row=0, column=2, padx=10, pady=5, sticky="w")
        self.cycles_entry = tk.Entry(self.pcr_frame, width=10)
        self.cycles_entry.grid(row=1, column=2, padx=5, pady=5, sticky="w")

        self.seconds_label = tk.Label(self.pcr_frame, text="Seconds:")
        self.seconds_label.grid(row=0, column=3, padx=10, pady=5, sticky="w")
        self.seconds_entry = tk.Entry(self.pcr_frame, width=10)
        self.seconds_entry.grid(row=1, column=3, padx=5, pady=5, sticky="w")
        self.cycles_entry = tk.Entry(self.pcr_frame, width=10)
        self.cycles_entry.grid(row=2, column=2, padx=5, pady=5, sticky="w")

        self.cycles_entry = tk.Entry(self.pcr_frame, width=10)
        self.cycles_entry.grid(row=3, column=2, padx=5, pady=5, sticky="w")

        self.cycles_entry = tk.Entry(self.pcr_frame, width=10)
        self.cycles_entry.grid(row=4, column=2, padx=5, pady=5, sticky="w")

        self.cycles_entry = tk.Entry(self.pcr_frame, width=10)
        self.cycles_entry.grid(row=5, column=2, padx=5, pady=5, sticky="w")

        # Row 1 (new column): Seconds per Stage
        self.seconds_label = tk.Label(self.pcr_frame, text="Seconds:")
        self.seconds_label.grid(row=0, column=3, padx=10, pady=5, sticky="w")
        self.seconds_entry = tk.Entry(self.pcr_frame, width=10)
        self.seconds_entry.grid(row=1, column=3, padx=5, pady=5, sticky="w")

        self.seconds_entry = tk.Entry(self.pcr_frame, width=10)
        self.seconds_entry.grid(row=2, column=3, padx=5, pady=5, sticky="w")

        self.seconds_entry = tk.Entry(self.pcr_frame, width=10)
        self.seconds_entry.grid(row=3, column=3, padx=5, pady=5, sticky="w")

        self.seconds_entry = tk.Entry(self.pcr_frame, width=10)
        self.seconds_entry.grid(row=4, column=3, padx=5, pady=5, sticky="w")

        self.seconds_entry = tk.Entry(self.pcr_frame, width=10)
        self.seconds_entry.grid(row=5, column=3, padx=5, pady=5, sticky="w")

        # Bottom frame for logs (moved below PCR frame)
        self.bottom_frame = tk.Frame(root)
        self.bottom_frame.pack(side=tk.BOTTOM, fill=tk.X, padx=5, pady=5)

        self.log_text = tk.Text(self.bottom_frame, height=5, width= 2, state="disabled")
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
            self.serial_connection.close()
            self.serial_connection = None
            self.connection_status.config(text="Not connected", fg="red")
            self.upload_button.config(state=tk.DISABLED)
            self.disconnect_button.config(state=tk.DISABLED)
            self.connect_button.config(state=tk.NORMAL)
            self.log_message("Disconnected from device.")

    def upload_firmware(self):
        if not self.firmware_file or not self.serial_connection:
            messagebox.showwarning("Warning", "Please select a file and connect to a device first.")
            return

        self.uploading = True
        self.cancel_button.config(state=tk.NORMAL)
        self.upload_button.config(state=tk.DISABLED)
        self.log_message("Starting firmware upload...")
        threading.Thread(target=self.perform_upload, daemon=True).start()

    def perform_upload(self):
        self.status_label.config(text="Uploading...", fg="blue")
        self.progress_bar["value"] = 0

        try:
            with open(self.firmware_file, 'rb') as f:
                data = f.read()
                total_size = len(data)
                chunk_size = 256

                for i in range(0, total_size, chunk_size):
                    if not self.uploading:
                        self.status_label.config(text="Upload Cancelled", fg="red")
                        self.log_message("Upload cancelled by user.")
                        return

                    chunk = data[i:i+chunk_size]
                    self.serial_connection.write(chunk)
                    time.sleep(0.1)  # Simulate time delay for chunk transmission

                    progress = ((i + len(chunk)) / total_size) * 100
                    self.root.after(0, self.progress_bar.set, progress)

                self.status_label.config(text="Upload Successful", fg="green")
                self.log_message("Firmware upload completed successfully.")
        except Exception as e:
            self.status_label.config(text=f"Error: {e}", fg="red")
            self.log_message(f"Upload error: {e}")
        finally:
            self.uploading = False
            self.cancel_button.config(state=tk.DISABLED)
            self.upload_button.config(state=tk.NORMAL)

    def cancel_upload(self):
        self.uploading = False
        self.cancel_button.config(state=tk.DISABLED)

if __name__ == "__main__":
    root = tk.Tk()
    app = FirmwareUpdater(root)
    root.mainloop()
