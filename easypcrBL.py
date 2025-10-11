import tkinter as tk
from tkinter import ttk, filedialog, messagebox
import serial
import serial.tools.list_ports
import matplotlib.pyplot as plt
import matplotlib

matplotlib.use("TkAgg")
import re
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
from matplotlib.animation import FuncAnimation
import os
import tempfile
from intelhex import IntelHex
from ymodem.Socket import ModemSocket, ProtocolType

ser1 = None


def refresh_ports():
    ports = serial.tools.list_ports.comports()
    com_ports = [port.device for port in ports]
    port_menu["values"] = com_ports


def connect():
    global ser1
    selected_port = port_var.get()
    baud_rate = baud_var.get()
    if selected_port and baud_rate:
        try:
            ser1 = serial.Serial(selected_port, baud_rate, timeout=0.5)
            show_status(f"Connected to {selected_port} @ {baud_rate} Bd", ok=True)
        except Exception as e:
            show_status(f"Error: {e}", ok=False)
    else:
        show_status("Select port + baud rate", ok=False)


def disconnect():
    global ser1
    if ser1 and ser1.is_open:
        ser1.close()
        show_status("Disconnected", ok=False)


def show_status(msg: str, ok: bool = True):
    color = "green" if ok else "red"
    status_label.config(text=msg, foreground=color)
    log_text.insert(tk.END, msg + "\n")
    log_text.see(tk.END)


def browse_file():
    file_path = filedialog.askopenfilename(
        title="Select firmware file (.hex /.bin)",
        filetypes=(
            ("Intel HEX", "*.hex"),
            ("Binary", "*.bin"),
            ("All", "*.*"),
        ),
    )
    if file_path:
        file_path_var.set(file_path)
        log_text.insert(tk.END, f"Selected: {file_path}\n")
        log_text.see(tk.END)


def _read(size, timeout=1):
    data = ser1.read(size)
    return data if data else b""


def _write(data, timeout=1):
    ser1.write(data)


def start_firmware_upgrade():
    if ModemSocket is None:
        messagebox.showerror(
            "Missing dependency",
            "Package 'ymodem' version 1.5.1 is not installed\n\n"
            "Run: pip install ymodem==1.5.1",
        )
        return
    if not ser1 or not ser1.is_open:
        show_status("No serial port chosen", ok=False)
        return
    fw_path = file_path_var.get()
    if not fw_path:
        show_status("Select .hex or .bin", ok=False)
        return

    if fw_path.lower().endswith(".hex"):
        tmp_bin = tempfile.NamedTemporaryFile(delete=False, suffix=".bin")
        ih = IntelHex(fw_path)
        ih.tobinfile(tmp_bin.name, start=ih.minaddr(), end=ih.maxaddr())
        bin_path = tmp_bin.name
        log_text.insert(tk.END, f"HEX converted to BIN → {bin_path}\n")
    else:
        bin_path = fw_path

    def ycb(index, name, total, done):
        perc = int(done / total * 100) if total else 0
        progress_bar["value"] = perc
        progress_label.config(text=f"{perc}%")
        root.update_idletasks()

    progress_bar["value"] = 0
    progress_label.config(text="0%")
    root.update_idletasks()
    log_text.insert(tk.END, "YMODEM: start transfer...\n")

    modem = ModemSocket(_read, _write, protocol_type=ProtocolType.YMODEM)

    ok = modem.send([bin_path], callback=ycb)

    if ok:
        show_status("Firmware uploaded OK", ok=True)
    else:
        show_status("Firmware transfer failed", ok=False)


def get_available_drives():
    if os.name == "nt":
        return [
            f"{d}:\\" for d in "ABCDEFGHIJKLMNOPQRSTUVWXYZ" if os.path.exists(f"{d}:\\")
        ]
    else:
        return ["/"]


def save_pcr_settings():
    protocol_name = protocol_name_var.get().strip()
    if not protocol_name:
        log_text.insert(tk.END, "Error: Protocol name cannot be empty.\n")
        return

    settings = {
        "Intro Denaturing": (
            intro_temp_var.get(),
            intro_cycles_var.get(),
            intro_sec_var.get(),
        ),
        "Denaturing": (
            denature_temp_var.get(),
            denature_cycles_var.get(),
            denature_sec_var.get(),
        ),
        "Annealing": (
            anneal_temp_var.get(),
            anneal_cycles_var.get(),
            anneal_sec_var.get(),
        ),
        "Extension": (
            extension_temp_var.get(),
            extension_cycles_var.get(),
            extension_sec_var.get(),
        ),
        "Final Extension": (
            final_temp_var.get(),
            final_cycles_var.get(),
            final_sec_var.get(),
        ),
    }

    file_lines = ["Stage,Temperature,TimeSec,Cycles"]

    for stage, (temp, cycles, sec) in settings.items():
        file_lines.append(f"{stage},{temp},{sec},{cycles}")

    file_content = "\n".join(file_lines)

    try:
        selected_drive = drive_combobox.get()
        if not selected_drive:
            messagebox.showerror("Error", "Please select a drive.")
            return

        bio_folder_path = os.path.join(selected_drive, "bio")
        os.makedirs(bio_folder_path, exist_ok=True)

        file_path = os.path.join(bio_folder_path, f"{protocol_name}.txt")

        with open(file_path, "w") as file:
            file.write(file_content)

        success_message = f"PCR settings saved to {file_path}.\n"
        log_text.insert(tk.END, success_message)
    except Exception as e:
        error_message = f"Error saving to SD card: {e}\n"
        log_text.insert(tk.END, error_message)


def clear_log():
    log_text.delete(1.0, tk.END)


root = tk.Tk()
root.title("EasyPCR")
root.geometry("1152x864")
root.minsize(1152, 864)

port_var = tk.StringVar()
baud_var = tk.StringVar()
file_path_var = tk.StringVar()
protocol_name_var = tk.StringVar()

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

main_pane = ttk.PanedWindow(root, orient="horizontal")
main_pane.pack(fill="both", expand=True)

left_frame = ttk.Frame(main_pane, width=600)
left_frame.pack_propagate(False)
main_pane.add(left_frame, weight=1)

serial_frame = ttk.LabelFrame(
    left_frame, text="Serial Communication Settings", padding=(10, 10)
)
serial_frame.pack(fill="x", padx=5, pady=5)

ttk.Label(serial_frame, text="COM Port:").grid(
    row=0, column=0, padx=5, pady=5, sticky="w"
)
port_menu = ttk.Combobox(serial_frame, textvariable=port_var, state="readonly")
port_menu.grid(row=0, column=1, padx=5, pady=5)
refresh_ports()

refresh_btn = ttk.Button(serial_frame, text="Refresh Ports", command=refresh_ports)
refresh_btn.grid(row=0, column=2, padx=5, pady=5)

ttk.Label(serial_frame, text="Baud Rate:").grid(
    row=1, column=0, padx=5, pady=5, sticky="w"
)
baud_menu = ttk.Combobox(
    serial_frame,
    textvariable=baud_var,
    values=["9600", "19200", "38400", "57600", "115200"],
    state="readonly",
)
baud_menu.grid(row=1, column=1, padx=5, pady=5)
baud_menu.set("9600")

connect_btn = ttk.Button(serial_frame, text="Connect", command=connect)
connect_btn.grid(row=2, column=0, padx=5, pady=10, sticky="w")

disconnect_btn = ttk.Button(serial_frame, text="Disconnect", command=disconnect)
disconnect_btn.grid(row=2, column=1, padx=5, pady=10, sticky="e")

status_label = ttk.Label(serial_frame, text="Status: Disconnected", foreground="red")
status_label.grid(row=3, column=0, columnspan=3, padx=5, pady=10)

firmware_frame = ttk.LabelFrame(left_frame, text="Firmware Upgrade", padding=(10, 10))
firmware_frame.pack(fill="x", padx=5, pady=5)

ttk.Label(firmware_frame, text="File Selected:").grid(
    row=0, column=0, padx=5, pady=5, sticky="w"
)
file_entry = ttk.Entry(
    firmware_frame, textvariable=file_path_var, state="readonly", width=30
)
file_entry.grid(row=0, column=1, padx=5, pady=5)

browse_btn = ttk.Button(firmware_frame, text="Browse", command=browse_file)
browse_btn.grid(row=0, column=2, padx=5, pady=5)

progress_bar = ttk.Progressbar(
    firmware_frame, orient="horizontal", length=300, mode="determinate"
)
progress_bar.grid(row=1, column=0, columnspan=3, padx=5, pady=10)

upgrade_btn = ttk.Button(
    firmware_frame, text="Start Upgrade", command=start_firmware_upgrade
)
upgrade_btn.grid(row=2, column=0, padx=5, pady=10, sticky="w")

progress_label = ttk.Label(
    firmware_frame, text="No transfer in progress.", foreground="blue"
)
progress_label.grid(row=2, column=1, columnspan=2, padx=5, pady=10)

pcr_frame = ttk.LabelFrame(left_frame, text="PCR Settings", padding=(10, 10))
pcr_frame.pack(fill="x", padx=5, pady=5)

ttk.Label(pcr_frame, text="Protocol Name:").grid(
    row=0, column=0, padx=5, pady=5, sticky="w"
)
ttk.Entry(pcr_frame, textvariable=protocol_name_var, width=25).grid(
    row=0, column=1, padx=5, pady=5, sticky="w"
)

ttk.Label(pcr_frame, text="Stage").grid(row=1, column=0, padx=5, pady=5, sticky="w")
ttk.Label(pcr_frame, text="Temperature ('C)").grid(row=1, column=1, padx=5, pady=5)
ttk.Label(pcr_frame, text="Cycles").grid(row=1, column=2, padx=5, pady=5)
ttk.Label(pcr_frame, text="Seconds").grid(row=1, column=3, padx=5, pady=5)

steps = [
    ("Intro Denaturing", intro_temp_var, intro_cycles_var, intro_sec_var),
    ("Denaturing", denature_temp_var, denature_cycles_var, denature_sec_var),
    ("Annealing", anneal_temp_var, anneal_cycles_var, anneal_sec_var),
    ("Extension", extension_temp_var, extension_cycles_var, extension_sec_var),
    ("Final Extension", final_temp_var, final_cycles_var, final_sec_var),
]

for i, (step, temp_var, cycles_var, sec_var) in enumerate(steps, start=2):
    ttk.Label(pcr_frame, text=step).grid(row=i, column=0, padx=5, pady=5, sticky="w")
    ttk.Entry(pcr_frame, textvariable=temp_var, width=5).grid(
        row=i, column=1, padx=5, pady=5
    )
    ttk.Entry(pcr_frame, textvariable=cycles_var, width=5).grid(
        row=i, column=2, padx=5, pady=5
    )
    ttk.Entry(pcr_frame, textvariable=sec_var, width=5).grid(
        row=i, column=3, padx=5, pady=5
    )

separator = ttk.Separator(pcr_frame, orient="horizontal")
separator.grid(row=7, column=0, columnspan=4, sticky="ew", pady=10)

ttk.Label(pcr_frame, text="Select SD card:").grid(
    row=8, column=0, padx=5, pady=5, sticky="w"
)
drives = get_available_drives()
drive_combobox = ttk.Combobox(pcr_frame, values=drives, state="readonly", width=5)
drive_combobox.grid(row=8, column=1, padx=5, pady=5)
if drives:
    drive_combobox.set(drives[0])

save_btn = ttk.Button(pcr_frame, text="Save to SD Card", command=save_pcr_settings)
save_btn.grid(row=8, column=2, columnspan=2, padx=5, pady=5)

clear_log_frame = ttk.LabelFrame(left_frame, text="Clear log", padding=(10, 10))
clear_log_frame.pack(fill="x", padx=5, pady=5)
clear_log_btn = ttk.Button(clear_log_frame, text="Clear Log", command=clear_log)
clear_log_btn.grid(row=0, column=0, columnspan=2, padx=5, pady=10)

right_pane = ttk.PanedWindow(main_pane, orient="vertical")
main_pane.add(right_pane, weight=3)

fig_frame = ttk.Frame(right_pane)
right_pane.add(fig_frame, weight=4)

log_frame = ttk.LabelFrame(right_pane, text="Log", height=100)
log_frame.pack_propagate(False)
right_pane.add(log_frame, weight=1)

log_text = tk.Text(log_frame)
log_text.pack(fill="both", expand=True, padx=5, pady=5)

fig, ax = plt.subplots(figsize=(12, 8))

(line_peltier,) = ax.plot([], [], "b-", label="Peltier Temp")
(line_lid,) = ax.plot([], [], "r-", label="Lid Temp")

ax.set_title("Temperature Plot")
ax.set_xlabel("Time (s)")
ax.set_ylabel("Temperature (°C)")
ax.legend()

time_data = []
peltier_data = []
lid_data = []
time_step = 0

peltier_regex = re.compile(r"Peltier>\s*T:([+-]?\d+(?:\.\d+)?)\*C;")
lid_regex = re.compile(r"Lid>\s*T:([+-]?\d+(?:\.\d+)?)\*C;")


def update_plot(frame):
    global time_step

    try:
        if ser1.in_waiting > 0:
            line_data = ser1.read_until().decode("utf-8").strip()
        else:
            return line_peltier, line_lid
    except:
        return line_peltier, line_lid

    match_peltier = peltier_regex.search(line_data)
    match_lid = lid_regex.search(line_data)

    if match_peltier and match_lid:
        try:
            temp_peltier = float(match_peltier.group(1))
            temp_lid = float(match_lid.group(1))

            time_data.append(time_step)
            peltier_data.append(temp_peltier)
            lid_data.append(temp_lid)
            time_step += 1

            line_peltier.set_xdata(time_data)
            line_peltier.set_ydata(peltier_data)

            line_lid.set_xdata(time_data)
            line_lid.set_ydata(lid_data)

            ax.set_xlim(0, time_step + 5)
            min_temp = min(min(peltier_data), min(lid_data)) - 2
            max_temp = max(max(peltier_data), max(lid_data)) + 2
            ax.set_ylim(min_temp, max_temp)

            canvas.draw()

        except ValueError:
            print("Error parsing temperature. Check data format.")

    return line_peltier, line_lid


ani = FuncAnimation(fig, update_plot, interval=100, cache_frame_data=False)

canvas = FigureCanvasTkAgg(fig, master=fig_frame)
canvas.get_tk_widget().pack(fill="both", expand=True)

root.mainloop()
#test Tolis