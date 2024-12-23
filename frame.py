import tkinter as tk
from tkinter import ttk, filedialog
import serial.tools.list_ports
import matplotlib.pyplot as plt
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg

# Functions for Serial Communication
def refresh_ports():
    ports = serial.tools.list_ports.comports()
    com_ports = [port.device for port in ports]
    port_menu['values'] = com_ports

def connect():
    selected_port = port_var.get()
    baud_rate = baud_var.get()
    if selected_port and baud_rate:
        try:
            global ser
            ser = serial.Serial(selected_port, baud_rate)
            status_message = f"Connected to {selected_port} at {baud_rate} baud"
            status_label.config(text=status_message, foreground="green")
            log_text.insert(tk.END, f"{status_message}\n")
        except Exception as e:
            error_message = f"Error: {e}"
            status_label.config(text=error_message, foreground="red")
            log_text.insert(tk.END, f"{error_message}\n")
    else:
        error_message = "Please select a port and baud rate"
        status_label.config(text=error_message, foreground="red")
        log_text.insert(tk.END, f"{error_message}\n")

def disconnect():
    try:
        if ser.is_open:
            ser.close()
            status_message = "Disconnected"
            status_label.config(text=status_message, foreground="red")
            log_text.insert(tk.END, f"{status_message}\n")
    except NameError:
        error_message = "No connection to close"
        status_label.config(text=error_message, foreground="red")
        log_text.insert(tk.END, f"{error_message}\n")

# Functions for Firmware Upgrade
def browse_file():
    file_path = filedialog.askopenfilename(title="Select Firmware File", filetypes=(("Binary files", "*.bin"), ("All files", "*.*")))
    if file_path:
        file_path_var.set(file_path)
        log_text.insert(tk.END, f"Firmware file selected: {file_path}\n")

def start_firmware_upgrade():
    if file_path_var.get():
        progress_bar["value"] = 0
        root.update_idletasks()
        log_text.insert(tk.END, "Firmware upgrade started...\n")
        for i in range(1, 101):
            progress_bar["value"] = i
            root.update_idletasks()
            root.after(30)  # Simulate transfer time
        success_message = "Firmware transfer completed successfully!"
        progress_label.config(text=success_message, foreground="green")
        log_text.insert(tk.END, f"{success_message}\n")
    else:
        error_message = "Please select a firmware file."
        progress_label.config(text=error_message, foreground="red")
        log_text.insert(tk.END, f"{error_message}\n")

# Function to Save PCR Settings
def save_pcr_settings():
    settings = {
        "Intro Denaturing": (intro_temp_var.get(), intro_cycles_var.get(), intro_sec_var.get()),
        "Denaturing": (denature_temp_var.get(), denature_cycles_var.get(), denature_sec_var.get()),
        "Annealing": (anneal_temp_var.get(), anneal_cycles_var.get(), anneal_sec_var.get()),
        "Extension": (extension_temp_var.get(), extension_cycles_var.get(), extension_sec_var.get()),
        "Final Extension": (final_temp_var.get(), final_cycles_var.get(), final_sec_var.get()),
    }
    log_text.insert(tk.END, f"PCR Settings Saved: {settings}\n")

# Function to clear the log text widget
def clear_log():
    log_text.delete(1.0, tk.END)

# GUI Setup
root = tk.Tk()
root.title("EasyPCR")
root.geometry("1024x768")  # Set window size to 1024x768

# Variables
port_var = tk.StringVar()
baud_var = tk.StringVar()
file_path_var = tk.StringVar()

# PCR Variables
intro_temp_var = tk.StringVar()
intro_cycles_var = tk.StringVar()
intro_sec_var = tk.StringVar()

denature_temp_var = tk.StringVar()
denature_cycles_var = tk.StringVar()
denature_sec_var = tk.StringVar()

anneal_temp_var = tk.StringVar()
anneal_cycles_var = tk.StringVar()
anneal_sec_var = tk.StringVar()

extension_temp_var = tk.StringVar()
extension_cycles_var = tk.StringVar()
extension_sec_var = tk.StringVar()

final_temp_var = tk.StringVar()
final_cycles_var = tk.StringVar()
final_sec_var = tk.StringVar()

# Serial Communication Frame
serial_frame = ttk.LabelFrame(root, text="Serial Communication Settings", padding=(10, 10))
serial_frame.place(x=10, y=10, width=400, height=220)

ttk.Label(serial_frame, text="COM Port:").grid(row=0, column=0, padx=5, pady=5, sticky="w")
port_menu = ttk.Combobox(serial_frame, textvariable=port_var, state="readonly")
port_menu.grid(row=0, column=1, padx=5, pady=5)
refresh_ports()

refresh_btn = ttk.Button(serial_frame, text="Refresh Ports", command=refresh_ports)
refresh_btn.grid(row=0, column=2, padx=5, pady=5)

ttk.Label(serial_frame, text="Baud Rate:").grid(row=1, column=0, padx=5, pady=5, sticky="w")
baud_menu = ttk.Combobox(serial_frame, textvariable=baud_var, values=["9600", "19200", "38400", "57600", "115200"], state="readonly")
baud_menu.grid(row=1, column=1, padx=5, pady=5)
baud_menu.set("9600")  # Default baud rate

connect_btn = ttk.Button(serial_frame, text="Connect", command=connect)
connect_btn.grid(row=2, column=0, padx=5, pady=10, sticky="w")

disconnect_btn = ttk.Button(serial_frame, text="Disconnect", command=disconnect)
disconnect_btn.grid(row=2, column=1, padx=5, pady=10, sticky="e")

status_label = ttk.Label(serial_frame, text="Status: Disconnected", foreground="red")
status_label.grid(row=3, column=0, columnspan=3, padx=5, pady=10)

# Firmware Upgrade Frame
firmware_frame = ttk.LabelFrame(root, text="Firmware Upgrade", padding=(10, 10))
firmware_frame.place(x=10, y=240, width=400, height=200)

ttk.Label(firmware_frame, text="File Selected:").grid(row=0, column=0, padx=5, pady=5, sticky="w")
file_entry = ttk.Entry(firmware_frame, textvariable=file_path_var, state="readonly", width=30)
file_entry.grid(row=0, column=1, padx=5, pady=5)

browse_btn = ttk.Button(firmware_frame, text="Browse", command=browse_file)
browse_btn.grid(row=0, column=2, padx=5, pady=5)

progress_bar = ttk.Progressbar(firmware_frame, orient="horizontal", length=300, mode="determinate")
progress_bar.grid(row=1, column=0, columnspan=3, padx=5, pady=10)

upgrade_btn = ttk.Button(firmware_frame, text="Start Upgrade", command=start_firmware_upgrade)
upgrade_btn.grid(row=2, column=0, padx=5, pady=10, sticky="w")

progress_label = ttk.Label(firmware_frame, text="No transfer in progress.", foreground="blue")
progress_label.grid(row=2, column=1, columnspan=2, padx=5, pady=10)

# PCR Settings Frame
pcr_frame = ttk.LabelFrame(root, text="PCR Settings", padding=(10, 10))
pcr_frame.place(x=10, y=460, width=400, height=280)

# PCR Input Table
ttk.Label(pcr_frame, text="Stage").grid(row=0, column=0, padx=5, pady=5, sticky="w")
ttk.Label(pcr_frame, text="Temperature ('C)").grid(row=0, column=1, padx=5, pady=5)
ttk.Label(pcr_frame, text="Cycles").grid(row=0, column=2, padx=5, pady=5)
ttk.Label(pcr_frame, text="Seconds").grid(row=0, column=3, padx=5, pady=5)

steps = [
    ("Intro Denaturing", intro_temp_var, intro_cycles_var, intro_sec_var),
    ("Denaturing", denature_temp_var, denature_cycles_var, denature_sec_var),
    ("Annealing", anneal_temp_var, anneal_cycles_var, anneal_sec_var),
    ("Extension", extension_temp_var, extension_cycles_var, extension_sec_var),
    ("Final Extension", final_temp_var, final_cycles_var, final_sec_var),
]

for i, (step, temp_var, cycles_var, sec_var) in enumerate(steps, start=1):
    ttk.Label(pcr_frame, text=step).grid(row=i, column=0, padx=5, pady=5, sticky="w")
    ttk.Entry(pcr_frame, textvariable=temp_var, width=10).grid(row=i, column=1, padx=5, pady=5)
    ttk.Entry(pcr_frame, textvariable=cycles_var, width=10).grid(row=i, column=2, padx=5, pady=5)
    ttk.Entry(pcr_frame, textvariable=sec_var, width=10).grid(row=i, column=3, padx=5, pady=5)

save_btn = ttk.Button(pcr_frame, text="Save", command=save_pcr_settings)
save_btn.grid(row=6, column=0, columnspan=4, pady=10)

clear_btn = ttk.Button(pcr_frame, text="Clear Log", command=clear_log)
clear_btn.grid(row=6, column=2, columnspan=4, pady=10)

# Matplotlib Plot Frame (larger plot frame at the top-right)
plot_frame = ttk.LabelFrame(root, text="PCR Temperature Plot", padding=(10, 10))
plot_frame.place(x=420, y=10, width=790, height=550)  # Enlarged plot frame

# Create the plot
fig, ax = plt.subplots(figsize=(6, 4))
canvas = FigureCanvasTkAgg(fig, master=plot_frame)
canvas.get_tk_widget().pack(fill=tk.BOTH, expand=True)

# Layout for Log Text Frame (below the plot frame)
log_frame = ttk.LabelFrame(root, text="Log Output", padding=(10, 10))
log_frame.place(x=420, y=570, width=790, height=180)

# Log Text Widget
log_text = tk.Text(log_frame, width=70, height=15, wrap=tk.WORD)
log_text.pack(padx=5, pady=5)

# Start the Tkinter main loop
root.mainloop()
